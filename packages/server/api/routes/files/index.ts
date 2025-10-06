import { Hono } from "hono";
import { respond } from "../../../lib/utils/respond";
import db from "../../../lib/db";
import { authenticated } from "../../middleware/auth";
import { bucket } from "../../../lib/s3/client";
import { getOrCreateUserDataset } from "../../../lib/synapse";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { isHex } from "viem";
import analytics from "../../../lib/analytics/logger";

const {
  files,
  fileSignatures,
  profiles,
  fileRecipients,
  fileAcknowledgements,
  fileKeys,
} = db.schema;
const MAX_FILE_SIZE = 30 * 1024 * 1024;

export default new Hono()
  .post("/upload/start", authenticated, async (ctx) => {
    const { pieceCid } = await ctx.req.json();

    if (!pieceCid || typeof pieceCid !== "string") {
      return respond.err(ctx, "Invalid pieceCid", 400);
    }

    const key = `uploads/${pieceCid}`;

    const presignedUrl = bucket.presign(key, {
      method: "PUT",
      expiresIn: 60,
      type: "application/octet-stream",
      acl: "public-read",
    });

    return respond.ok(
      ctx,
      { uploadUrl: presignedUrl, key },
      "Presigned URL generated",
      200,
    );
  })

  .post("/", authenticated, async (ctx) => {
    const {
      pieceCid,
      recipients,
      metaData,
      ownerEncryptedKey,
      ownerEncryptedKeyIv,
    } = await ctx.req.json();
    if (!pieceCid || typeof pieceCid !== "string") {
      return respond.err(ctx, "Invalid pieceCid", 400);
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return respond.err(ctx, "Recipients must be a non-empty array", 400);
    }

    if (typeof ownerEncryptedKey !== "string" || !isHex(ownerEncryptedKey)) {
      return respond.err(ctx, "Invalid ownerEncryptedKey", 400);
    }
    if (
      typeof ownerEncryptedKeyIv !== "string" ||
      !isHex(ownerEncryptedKeyIv)
    ) {
      return respond.err(ctx, "Invalid ownerEncryptedKeyIv", 400);
    }

    for (const recipient of recipients) {
      if (!recipient.wallet || typeof recipient.wallet !== "string") {
        return respond.err(ctx, "Invalid recipient wallet", 400);
      }
      if (
        !recipient.encryptedKey ||
        typeof recipient.encryptedKey !== "string"
      ) {
        return respond.err(ctx, "Invalid encryptedKey for recipient", 400);
      }
      if (!recipient.iv || typeof recipient.iv !== "string") {
        return respond.err(ctx, "Invalid iv for recipient", 400);
      }
    }

    const fileExists = bucket.exists(`uploads/${pieceCid}`);
    if (!fileExists) {
      return respond.err(ctx, "File not found on storage", 400);
    }

    const file = bucket.file(`uploads/${pieceCid}`);
    if (file.size > MAX_FILE_SIZE) {
      file.delete();
      return respond.err(ctx, "File exceeds maximum allowed size", 413);
    }

    const bytes = await file.arrayBuffer();

    if (bytes.byteLength === 0) {
      file.delete();
      return respond.err(ctx, "Uploaded file is empty", 400);
    }

    const insertResult = db.transaction((tx) => {
      const insertResult = tx
        .insert(files)
        .values({
          pieceCid: pieceCid,
          ownerWallet: ctx.var.userWallet,
          metadata: metaData,
          status: "s3",
          ownerEncryptedKey: ownerEncryptedKey,
          ownerEncryptedKeyIv: ownerEncryptedKeyIv,
        })
        .returning()
        .get();
      for (const recipient of recipients) {
        // TODO : Chcek using db if valid recipient
        tx.insert(fileRecipients)
          .values({
            filePieceCid: pieceCid,
            recipientWallet: recipient.wallet,
          })
          .run();

        tx.insert(fileKeys)
          .values({
            filePieceCid: pieceCid,
            recipientWallet: recipient.wallet,
            encryptedKey: recipient.encryptedKey,
            encryptedKeyIv: recipient.iv,
          })
          .run();
      }

      return insertResult;
    });

    const actualSize = bytes.byteLength;
    console.log("Actual file size:", actualSize);

    const ds = await getOrCreateUserDataset(ctx.var.userWallet);

    console.log("wjjwhjkjfjdsfjsdfkdsf");

    const preflight = await ds.preflightUpload(Math.floor(actualSize));

    console.log("Preflight result:", JSON.stringify(preflight, null, 2));
    console.log(
      "preflight.allowanceCheck.sufficient",
      preflight.allowanceCheck.sufficient,
    );

    if (!preflight.allowanceCheck.sufficient) {
      return respond.err(
        ctx,
        "Insufficient storage allowance, complain to the devs",
        402,
      );
    }

    ds.upload(bytes).then((uploadResult) => {
      file.delete();

      if (uploadResult.pieceCid.toString() !== pieceCid) {
        db.delete(files).where(eq(files.pieceCid, pieceCid)).run();
        analytics.log("Invalid pieceCid claimed", 403);
      }

      try {
        db.update(files)
          .set({ status: "foc" })
          .where(eq(files.pieceCid, pieceCid))
          .run();
      } catch (e) {
        analytics.log("DB update error after upload", { error: e, pieceCid });

        db.delete(files).where(eq(files.pieceCid, pieceCid)).run();
      }
    });

    return respond.ok(
      ctx,
      insertResult,
      "File uploaded to filecoin warmstorage",
      201,
    );
  })

  .get("/download/s3", authenticated, async (ctx) => {
    const { pieceCid } = await ctx.req.json();

    if (!pieceCid || typeof pieceCid !== "string") {
      return respond.err(ctx, "Invalid pieceCid", 400);
    }

    const fileEntry = db
      .select()
      .from(files)
      .where(eq(files.pieceCid, pieceCid))
      .get();

    // ensure this user can read this file

    const key = `uploads/${pieceCid}`;
    const fileExists = bucket.exists(key);
    if (!fileExists) {
      return respond.err(ctx, "File not found on storage", 400);
    }

    const presignedUrl = bucket.presign(key, {
      method: "GET",
      expiresIn: 60,
      type: "application/octet-stream",
      acl: "public-read",
    });

    return respond.ok(
      ctx,
      { downloadUrl: presignedUrl, key },
      "Presigned URL generated",
      200,
    );
  })

  .get("/sent", authenticated, async (ctx) => {
    const wallet = ctx.get("userWallet");
    const page = parseInt(ctx.req.query("page") || "1");
    const limit = Math.min(parseInt(ctx.req.query("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // First, get the unique files sent by this user
    const sentFiles = db
      .select({
        pieceCid: files.pieceCid,
        ownerWallet: files.ownerWallet,
        metadata: files.metadata,
        status: files.status,
        onchainTxHash: files.onchainTxHash,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
      })
      .from(files)
      .where(eq(files.ownerWallet, wallet))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Then, for each file, get its recipients and acknowledgments
    const filesWithRecipientsAndSignatures = await Promise.all(
      sentFiles.map(async (file) => {
        // Get recipients for this file
        const recipients = db
          .select({
            recipientWallet: fileRecipients.recipientWallet,
            acknowledged: sql<number>`CASE WHEN ${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL THEN 1 ELSE 0 END`,
            acknowledgedTxHash: fileAcknowledgements.acknowledgedTxHash,
            recipientProfile: {
              username: profiles.username,
              displayName: profiles.displayName,
              avatarUrl: profiles.avatarUrl,
            },
          })
          .from(fileRecipients)
          .leftJoin(
            profiles,
            eq(fileRecipients.recipientWallet, profiles.walletAddress),
          )
          .leftJoin(
            fileAcknowledgements,
            and(
              eq(
                fileAcknowledgements.filePieceCid,
                fileRecipients.filePieceCid,
              ),
              eq(
                fileAcknowledgements.recipientWallet,
                fileRecipients.recipientWallet,
              ),
            ),
          )
          .where(eq(fileRecipients.filePieceCid, file.pieceCid))
          .all();

        // Get signatures for this file
        const signatures = db
          .select({
            id: fileSignatures.id,
            signerWallet: fileSignatures.signerWallet,
            signatureVisualHash: fileSignatures.signatureVisualHash,
            timestamp: fileSignatures.timestamp,
            compactSignature: fileSignatures.compactSignature,
            onchainTxHash: fileSignatures.onchainTxHash,
            createdAt: fileSignatures.createdAt,
            signerProfile: {
              username: profiles.username,
              displayName: profiles.displayName,
              avatarUrl: profiles.avatarUrl,
            },
          })
          .from(fileSignatures)
          .leftJoin(
            profiles,
            eq(fileSignatures.signerWallet, profiles.walletAddress),
          )
          .where(eq(fileSignatures.filePieceCid, file.pieceCid))
          .orderBy(desc(fileSignatures.timestamp))
          .all();

        // Process recipients to match the expected schema
        const processedRecipients = recipients.map((recipient) => ({
          recipientWallet: recipient.recipientWallet,
          acknowledged: Boolean(recipient.acknowledged),
          acknowledgedTxHash: recipient.acknowledgedTxHash,
          recipientProfile:
            recipient.recipientProfile &&
            (recipient.recipientProfile.username ||
              recipient.recipientProfile.displayName ||
              recipient.recipientProfile.avatarUrl)
              ? recipient.recipientProfile
              : null,
        }));

        // Process signatures
        const processedSignatures = signatures.map((sig) => ({
          ...sig,
          signerProfile:
            sig.signerProfile &&
            (sig.signerProfile.username ||
              sig.signerProfile.displayName ||
              sig.signerProfile.avatarUrl)
              ? sig.signerProfile
              : null,
        }));

        // Return the file with all its recipients and signatures
        return {
          ...file,
          recipients: processedRecipients,
          signatures: processedSignatures,
        };
      }),
    );

    return respond.ok(
      ctx,
      {
        files: filesWithRecipientsAndSignatures,
        pagination: {
          page,
          limit,
          hasMore: sentFiles.length === limit,
        },
      },
      "Sent files retrieved successfully",
      200,
    );
  })

  .get("/received", authenticated, async (ctx) => {
    const wallet = ctx.get("userWallet");
    const page = parseInt(ctx.req.query("page") || "1");
    const limit = Math.min(parseInt(ctx.req.query("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    const receivedFiles = db
      .select({
        pieceCid: files.pieceCid,
        ownerWallet: files.ownerWallet,
        recipientWallet: fileRecipients.recipientWallet,
        metadata: files.metadata,
        status: files.status, // Add this missing field
        acknowledged: sql<number>`CASE WHEN ${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL THEN 1 ELSE 0 END`,
        onchainTxHash: files.onchainTxHash,
        acknowledgedTxHash: fileAcknowledgements.acknowledgedTxHash,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
        senderProfile: {
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(files)
      .innerJoin(
        fileRecipients,
        eq(files.pieceCid, fileRecipients.filePieceCid),
      )
      .leftJoin(profiles, eq(files.ownerWallet, profiles.walletAddress))
      .leftJoin(
        fileAcknowledgements,
        and(
          eq(fileAcknowledgements.filePieceCid, files.pieceCid),
          eq(
            fileAcknowledgements.recipientWallet,
            fileRecipients.recipientWallet,
          ),
        ),
      )
      .where(eq(fileRecipients.recipientWallet, wallet))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const filesWithSignatures = await Promise.all(
      receivedFiles.map(async (file) => {
        const signatures = db
          .select({
            id: fileSignatures.id,
            signerWallet: fileSignatures.signerWallet,
            signatureVisualHash: fileSignatures.signatureVisualHash,
            timestamp: fileSignatures.timestamp,
            compactSignature: fileSignatures.compactSignature,
            onchainTxHash: fileSignatures.onchainTxHash,
            createdAt: fileSignatures.createdAt,
            signerProfile: {
              username: profiles.username,
              displayName: profiles.displayName,
              avatarUrl: profiles.avatarUrl,
            },
          })
          .from(fileSignatures)
          .leftJoin(
            profiles,
            eq(fileSignatures.signerWallet, profiles.walletAddress),
          )
          .where(eq(fileSignatures.filePieceCid, file.pieceCid))
          .orderBy(desc(fileSignatures.timestamp))
          .all();

        // Process signatures to handle null profiles properly
        const processedSignatures = signatures.map((sig) => ({
          ...sig,
          signerProfile:
            sig.signerProfile &&
            (sig.signerProfile.username ||
              sig.signerProfile.displayName ||
              sig.signerProfile.avatarUrl)
              ? sig.signerProfile
              : null,
        }));

        // Process sender profile
        const processedSenderProfile =
          file.senderProfile &&
          (file.senderProfile.username ||
            file.senderProfile.displayName ||
            file.senderProfile.avatarUrl)
            ? file.senderProfile
            : null;

        return {
          ...file,
          acknowledged: Boolean(file.acknowledged), // Convert number to boolean
          senderProfile: processedSenderProfile,
          signatures: processedSignatures,
        };
      }),
    );

    return respond.ok(
      ctx,
      {
        files: filesWithSignatures,
        pagination: {
          page,
          limit,
          hasMore: receivedFiles.length === limit,
        },
      },
      "Received files retrieved successfully",
      200,
    );
  })

  .get("/:pieceCid/key", authenticated, async (ctx) => {
    const { pieceCid } = ctx.req.param();
    const userWallet = ctx.var.userWallet;

    const file = db
      .select()
      .from(files)
      .where(eq(files.pieceCid, pieceCid))
      .get();

    if (!file) {
      return respond.err(ctx, "File not found", 404);
    }

    if (file.ownerWallet === userWallet) {
      return respond.ok(
        ctx,
        {
          encryptedKey: file.ownerEncryptedKey,
          encryptedKeyIv: file.ownerEncryptedKeyIv,
          role: "owner",
        },
        "Owner key retrieved successfully",
        200,
      );
    }

    const recipient = db
      .select()
      .from(fileRecipients)
      .where(
        and(
          eq(fileRecipients.filePieceCid, pieceCid),
          eq(fileRecipients.recipientWallet, userWallet),
        ),
      )
      .get();

    if (!recipient) {
      return respond.err(
        ctx,
        "Access denied: You are not a recipient of this file",
        403,
      );
    }

    const acknowledgement = db
      .select()
      .from(fileAcknowledgements)
      .where(
        and(
          eq(fileAcknowledgements.filePieceCid, pieceCid),
          eq(fileAcknowledgements.recipientWallet, userWallet),
        ),
      )
      .get();

    if (!acknowledgement) {
      return respond.err(
        ctx,
        "Access denied: File must be acknowledged before viewing",
        403,
      );
    }

    const recipientKey = db
      .select()
      .from(fileKeys)
      .where(
        and(
          eq(fileKeys.filePieceCid, pieceCid),
          eq(fileKeys.recipientWallet, userWallet),
        ),
      )
      .get();

    if (!recipientKey) {
      return respond.err(ctx, "Decryption key not found", 404);
    }

    return respond.ok(
      ctx,
      {
        encryptedKey: recipientKey.encryptedKey,
        encryptedKeyIv: recipientKey.encryptedKeyIv,
        role: "recipient",
      },
      "Recipient key retrieved successfully",
      200,
    );
  })

  .get("/:pieceCid", authenticated, async (ctx) => {
    const { pieceCid } = ctx.req.param();
    const userWallet = ctx.var.userWallet;

    const file = db
      .select({
        pieceCid: files.pieceCid,
        ownerWallet: files.ownerWallet,
        metadata: files.metadata,
        status: files.status,
        onchainTxHash: files.onchainTxHash,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
        ownerProfile: {
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(files)
      .leftJoin(profiles, eq(files.ownerWallet, profiles.walletAddress))
      .where(eq(files.pieceCid, pieceCid))
      .get();

    if (!file) {
      return respond.err(ctx, "File not found", 404);
    }

    const isOwner = file.ownerWallet === userWallet;

    const recipient = db
      .select({
        recipientWallet: fileRecipients.recipientWallet,
      })
      .from(fileRecipients)
      .where(
        and(
          eq(fileRecipients.filePieceCid, pieceCid),
          eq(fileRecipients.recipientWallet, userWallet),
        ),
      )
      .get();

    const isRecipient = !!recipient;

    if (!isOwner && !isRecipient) {
      return respond.err(
        ctx,
        "Access denied: You are not authorized to view this file",
        403,
      );
    }

    let userAcknowledged = false;
    let userAcknowledgedTxHash = null;

    if (isRecipient) {
      const userAcknowledgement = db
        .select({
          acknowledgedTxHash: fileAcknowledgements.acknowledgedTxHash,
          createdAt: fileAcknowledgements.createdAt,
        })
        .from(fileAcknowledgements)
        .where(
          and(
            eq(fileAcknowledgements.filePieceCid, pieceCid),
            eq(fileAcknowledgements.recipientWallet, userWallet),
          ),
        )
        .get();

      userAcknowledged = !!userAcknowledgement;
      userAcknowledgedTxHash = userAcknowledgement?.acknowledgedTxHash || null;
    }

    // Get all recipients with proper boolean conversion and null handling
    const allRecipients = db
      .select({
        recipientWallet: fileRecipients.recipientWallet,
        acknowledged: sql<number>`CASE WHEN ${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL THEN 1 ELSE 0 END`,
        acknowledgedTxHash: fileAcknowledgements.acknowledgedTxHash,
        acknowledgedAt: fileAcknowledgements.createdAt,
        recipientProfile: {
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(fileRecipients)
      .leftJoin(
        profiles,
        eq(fileRecipients.recipientWallet, profiles.walletAddress),
      )
      .leftJoin(
        fileAcknowledgements,
        and(
          eq(fileAcknowledgements.filePieceCid, fileRecipients.filePieceCid),
          eq(
            fileAcknowledgements.recipientWallet,
            fileRecipients.recipientWallet,
          ),
        ),
      )
      .where(eq(fileRecipients.filePieceCid, pieceCid))
      .orderBy(fileAcknowledgements.createdAt)
      .all();

    // Convert the data to match expected schema
    const processedRecipients = allRecipients.map((recipient) => ({
      recipientWallet: recipient.recipientWallet,
      acknowledged: Boolean(recipient.acknowledged), // Convert number to boolean
      acknowledgedTxHash: recipient.acknowledgedTxHash,
      acknowledgedAt: recipient.acknowledgedAt,
      recipientProfile:
        recipient.recipientProfile &&
        (recipient.recipientProfile.username ||
          recipient.recipientProfile.displayName ||
          recipient.recipientProfile.avatarUrl)
          ? recipient.recipientProfile // Has profile data
          : null, // Explicitly null if no profile data
    }));

    // Get signatures for the file
    const signatures = db
      .select({
        id: fileSignatures.id,
        signerWallet: fileSignatures.signerWallet,
        signatureVisualHash: fileSignatures.signatureVisualHash,
        timestamp: fileSignatures.timestamp,
        compactSignature: fileSignatures.compactSignature,
        onchainTxHash: fileSignatures.onchainTxHash,
        createdAt: fileSignatures.createdAt,
        signerProfile: {
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(fileSignatures)
      .leftJoin(
        profiles,
        eq(fileSignatures.signerWallet, profiles.walletAddress),
      )
      .where(eq(fileSignatures.filePieceCid, pieceCid))
      .orderBy(desc(fileSignatures.timestamp))
      .all();

    const processedSignatures = signatures.map((sig) => ({
      ...sig,
      signerProfile:
        sig.signerProfile &&
        (sig.signerProfile.username ||
          sig.signerProfile.displayName ||
          sig.signerProfile.avatarUrl)
          ? sig.signerProfile
          : null,
    }));

    const totalRecipients = processedRecipients.length;
    const acknowledgedCount = processedRecipients.filter(
      (r) => r.acknowledged,
    ).length;
    const pendingCount = totalRecipients - acknowledgedCount;

    // Process owner profile
    const processedOwnerProfile =
      file.ownerProfile &&
      (file.ownerProfile.username ||
        file.ownerProfile.displayName ||
        file.ownerProfile.avatarUrl)
        ? file.ownerProfile
        : null;

    return respond.ok(
      ctx,
      {
        ...file,
        userRole: isOwner ? "owner" : "recipient",
        userAcknowledged,
        userAcknowledgedTxHash,
        recipients: processedRecipients,
        acknowledgmentSummary: {
          total: totalRecipients,
          acknowledged: acknowledgedCount,
          pending: pendingCount,
          allAcknowledged: acknowledgedCount === totalRecipients,
        },
        signatures: processedSignatures,
        ownerProfile: processedOwnerProfile,
      },
      "File details retrieved successfully",
      200,
    );
  });

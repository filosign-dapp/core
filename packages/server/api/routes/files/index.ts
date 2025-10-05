import { Hono } from "hono";
import { respond } from "../../../lib/utils/respond";
import db from "../../../lib/db";
import { authenticated } from "../../middleware/auth";
import { bucket } from "../../../lib/s3/client";
import { getOrCreateUserDataset } from "../../../lib/synapse";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { isHex } from "viem";

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

    const ds = await getOrCreateUserDataset(ctx.var.userWallet);

    const preflight = await ds.preflightUpload(file.size);

    if (!preflight.allowanceCheck.sufficient) {
      return respond.err(
        ctx,
        "Insufficient storage allowance, complan to the devs",
        402,
      );
    }

    const uploadResult = await ds.upload(bytes);

    file.delete();

    if (!uploadResult.pieceCid.equals(pieceCid)) {
      return respond.err(ctx, "Invalid pieceCid claimed", 403);
    }

    const insertResult = db
      .insert(files)
      .values({
        pieceCid: pieceCid,
        ownerWallet: ctx.var.userWallet,
        metadata: metaData,
        ownerEncryptedKey: ownerEncryptedKey,
        ownerEncryptedKeyIv: ownerEncryptedKeyIv,
      })
      .returning()
      .get();

    for (const recipient of recipients) {
      db.insert(fileRecipients)
        .values({
          filePieceCid: pieceCid,
          recipientWallet: recipient.wallet,
        })
        .run();

      db.insert(fileKeys)
        .values({
          filePieceCid: pieceCid,
          recipientWallet: recipient.wallet,
          encryptedKey: recipient.encryptedKey,
          encryptedKeyIv: recipient.iv,
        })
        .run();
    }

    return respond.ok(
      ctx,
      insertResult,
      "File uploaded to filecoin warmstorage",
      201,
    );
  })

  .get("/sent", authenticated, async (ctx) => {
    const wallet = ctx.get("userWallet");
    const page = parseInt(ctx.req.query("page") || "1");
    const limit = Math.min(parseInt(ctx.req.query("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    const sentFiles = db
      .select({
        pieceCid: files.pieceCid,
        recipientWallet: fileRecipients.recipientWallet,
        metadata: files.metadata,
        acknowledged: sql<boolean>`${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL`,
        onchainTxHash: files.onchainTxHash,
        acknowledgedTxHash: fileAcknowledgements.acknowledgedTxHash,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
        recipientProfile: {
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
      .leftJoin(
        profiles,
        eq(fileRecipients.recipientWallet, profiles.walletAddress),
      )
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
      .where(and(eq(files.ownerWallet, wallet), isNotNull(files.onchainTxHash)))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const filesWithSignatures = await Promise.all(
      sentFiles.map(async (file) => {
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

        return {
          ...file,
          signatures,
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
        acknowledged: sql<boolean>`${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL`,
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

        return {
          ...file,
          signatures,
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

    const allRecipients = db
      .select({
        recipientWallet: fileRecipients.recipientWallet,
        acknowledged: sql<boolean>`${fileAcknowledgements.acknowledgedTxHash} IS NOT NULL`,
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

    const totalRecipients = allRecipients.length;
    const acknowledgedCount = allRecipients.filter(
      (r) => r.acknowledged,
    ).length;
    const pendingCount = totalRecipients - acknowledgedCount;

    return respond.ok(
      ctx,
      {
        ...file,
        userRole: isOwner ? "owner" : "recipient",
        userAcknowledged,
        userAcknowledgedTxHash,
        recipients: allRecipients,
        acknowledgmentSummary: {
          total: totalRecipients,
          acknowledged: acknowledgedCount,
          pending: pendingCount,
          allAcknowledged: acknowledgedCount === totalRecipients,
        },
        signatures,
      },
      "File details retrieved successfully",
      200,
    );
  });

import { getContracts } from "@filosign/contracts";
import { createDbClient } from "../db/client";
import schema from "../db/schema";
import type { ProviderLogEntry } from "../indexer/engine";
import { getProvider } from "../indexer/provider";
import {
  concatHex,
  serializeCompactSignature,
  signatureToCompactSignature,
  toHex,
} from "viem";
import { and, eq } from "drizzle-orm";
import analytics from "../analytics/logger";
import { rebuildPieceCid } from "../utils/multiformats";

type Job = typeof schema.pendingJobs.$inferSelect;
type Incoming = Job;
type Outgoing = { id: Job["id"] } & (
  | { result: NonNullable<any>; error: null }
  | { result: null; error: Job["lastError"] }
);

export type TypedWorker = Omit<Worker, "postMessage" | "addEventListener"> & {
  postMessage(msg: Incoming): void;
  addEventListener(
    type: "message",
    listener: (ev: MessageEvent<Outgoing>) => void,
  ): void;
};

addEventListener("message", (ev: MessageEvent<Incoming>) => {
  const job = ev.data;
  const db = createDbClient();

  if (job.lockedUntil && job.lockedUntil > Date.now()) {
    setTimeout(() => {
      db.$client.close();
    }, job.lockedUntil - Date.now());
  }

  processJob(job, db)
    .then((result) => {
      const res: Outgoing = {
        id: job.id,
        result: result,
        error: null,
      };
      postMessage(res);
    })
    .catch((error) => {
      const errMsg = error instanceof Error ? error.message : String(error);
      const res: Outgoing = {
        id: job.id,
        result: null,
        error: errMsg,
      };
      postMessage(res);
    });
});

async function processJob(job: Job, dbC: ReturnType<typeof createDbClient>) {
  try {
    await dbC.transaction(async (db) => {
      const contracts = getContracts(getProvider());
      // @ts-ignore This is th best we can do for now
      const log: ProviderLogEntry = job.payload;

      const jobTypeParts = job.type.split(":");

      if (jobTypeParts[0] === "EVENT") {
        const contractName = jobTypeParts[1];

        if (contractName === "FSManager") {
          if (log.eventName === "SenderApproved") {
            db.update(schema.shareRequests)
              .set({ status: "ACCEPTED" })
              .where(
                and(
                  eq(schema.shareRequests.senderWallet, log.args.sender),
                  eq(schema.shareRequests.recipientWallet, log.args.recipient),
                  eq(schema.shareRequests.status, "PENDING"),
                ),
              )
              .run();

            const approval = db
              .insert(schema.shareApprovals)
              .values({
                senderWallet: log.args.sender,
                recipientWallet: log.args.recipient,
                active: true,
              })
              .onConflictDoUpdate({
                target: [
                  schema.shareApprovals.senderWallet,
                  schema.shareApprovals.recipientWallet,
                ],
                set: {
                  active: true,
                },
              })
              .returning()
              .get();

            if (!approval || !approval.id) {
              throw new Error("Fail to create / retrive approval row");
            }

            db.insert(schema.shareApprovalHistory)
              .values({
                approvalId: approval.id,
                action: "ENABLED",
                blockNumber: log.blockNumber,
                txHash: log.transactionHash,
              })
              .run();
          }

          if (log.eventName === "SenderRevoked") {
            const approval = db
              .update(schema.shareApprovals)
              .set({
                active: false,
              })
              .where(
                and(
                  eq(schema.shareApprovals.senderWallet, log.args.sender),
                  eq(schema.shareApprovals.recipientWallet, log.args.recipient),
                ),
              )
              .returning()
              .get();

            if (approval && approval.id) {
              db.insert(schema.shareApprovalHistory)
                .values({
                  approvalId: approval.id,
                  action: "REVOKED",
                  blockNumber: log.blockNumber,
                  txHash: log.transactionHash,
                })
                .run();
            }
          }
        }

        if (contractName === "FSFileRegistry") {
          if (log.eventName === "FileRegistered") {
            const fileData = await contracts.FSFileRegistry.read.getFileData([
              log.args.cidIdentifier,
            ]);

            if (!fileData.pieceCidPrefix) {
              throw new Error(
                "No pieceCidPrefix in file data, invalid event maybe?",
              );
            }

            const cid = rebuildPieceCid({
              codecNumeric: 85,
              multihashCode: 4113,
              digestPrefix: fileData.pieceCidPrefix,
              digestTail: fileData.pieceCidTail,
              pieceCidParity: fileData.pieceCidParity,
              missingByte: fileData.missingByte,
            }).toString();

            analytics.log("file regsrtereded", cid, fileData, log.args);

            db.update(schema.files)
              .set({
                onchainTxHash: log.transactionHash,
              })
              .where(eq(schema.files.pieceCid, cid))
              .run();

            db.insert(schema.fileRecipients)
              .values({
                filePieceCid: cid,
                recipientWallet: log.args.recipient,
              })
              .run();
          }

          if (log.eventName === "FileAcknowledged") {
            const fileData = await contracts.FSFileRegistry.read.getFileData([
              log.args.cidIdentifier,
            ]);

            if (!fileData.pieceCidPrefix) {
              throw new Error(
                "No pieceCidPrefix in file data, invalid event maybe?",
              );
            }

            const cid = rebuildPieceCid({
              codecNumeric: 85,
              multihashCode: 4113,
              digestPrefix: fileData.pieceCidPrefix,
              digestTail: fileData.pieceCidTail,
              pieceCidParity: fileData.pieceCidParity,
              missingByte: fileData.missingByte,
            }).toString();

            analytics.log("file ack", cid, fileData, log.args);

            db.insert(schema.fileAcknowledgements)
              .values({
                filePieceCid: cid,
                recipientWallet: log.args.recipient,
                acknowledgedTxHash: log.transactionHash,
              })
              .run();
          }

          if (log.eventName === "SignatureSubmitted") {
            const signatureData =
              await contracts.FSFileRegistry.read.getSignatureData([
                log.args.cidIdentifier,
              ]);

            const fileData = await contracts.FSFileRegistry.read.getFileData([
              log.args.cidIdentifier,
            ]);

            const cid = concatHex([
              fileData.pieceCidPrefix,
              toHex(fileData.pieceCidTail),
            ]);

            const signatureExists = db
              .select()
              .from(schema.fileSignatures)
              .where(
                eq(schema.fileSignatures.onchainTxHash, log.transactionHash),
              )
              .get();

            if (signatureExists) {
              return;
            }

            db.insert(schema.fileSignatures)
              .values({
                filePieceCid: cid,
                signerWallet: log.args.signer,
                signatureVisualHash: signatureData.signatureVisualHash,
                timestamp: signatureData.timestamp,
                compactSignature: serializeCompactSignature(
                  signatureToCompactSignature({
                    v: BigInt(signatureData.v),
                    r: signatureData.r,
                    s: signatureData.s,
                  }),
                ),
                onchainTxHash: log.transactionHash,
              })
              .run();
          }
        }

        if (contractName === "FSKeyRegistry") {
          if (log.eventName === "KeygenDataRegistered") {
            const keyData = await contracts.FSKeyRegistry.read.keygenData([
              log.args.user,
            ]);
            const publicKey = await contracts.FSKeyRegistry.read.publicKeys([
              log.args.user,
            ]);

            db.insert(schema.users)
              .values({
                walletAddress: log.args.user,
                encryptionPublicKey: publicKey,
                lastActiveAt: Date.now(),

                keygenDataJson: {
                  salt_auth: keyData[0],
                  salt_wrap: keyData[1],
                  salt_pin: keyData[2],
                  nonce: keyData[3],
                  seed_head: keyData[4],
                  seed_word: keyData[5],
                  seed_tail: keyData[6],
                  commitment_pin: keyData[7],
                },
              })
              .run();
          }
        }
      }
    });
    return true;
  } catch (e) {
    analytics.log("Error in job processing", job.id, job.type, e);
  } finally {
    dbC.$client.close();
  }
}

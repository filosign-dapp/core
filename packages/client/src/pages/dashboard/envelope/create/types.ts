export type Recipient = {
	name: string;
	email: string;
	walletAddress: string;
	role: "signer" | "cc" | "approver";
};

export type UploadedFile = {
	id: string;
	file: File;
	name: string;
	size: number;
	type: string;
};

export type EnvelopeForm = {
	recipient: Recipient;
	emailMessage: string;
	documents: UploadedFile[];
};

// Single source of truth for allowed file types
export const ALLOWED_FILE_TYPES = [
	{ mime: "application/pdf", extensions: [".pdf"] },
	{ mime: "image/jpeg", extensions: [".jpg", ".jpeg"] },
	{ mime: "image/png", extensions: [".png"] },
	{ mime: "image/gif", extensions: [".gif"] },
	{ mime: "image/webp", extensions: [".webp"] },
] as const;

export type AllowedFileMime = (typeof ALLOWED_FILE_TYPES)[number]["mime"];

export const ACCEPTED_FILE_MIME_SET = new Set<AllowedFileMime>(
	ALLOWED_FILE_TYPES.map((t) => t.mime),
);

export const ACCEPTED_FILE_EXTENSIONS = Array.from(
	new Set(ALLOWED_FILE_TYPES.flatMap((t) => t.extensions)),
);

// Uploaded file type
export type StoredDocument = {
	id: string;
	pieceCid?: string; // SDK piece CID for the uploaded file
	name: string;
	size: number;
	type: string;
	dataUrl?: string;
};

// Create form
export type CreateForm = {
	recipient: Recipient;
	emailMessage: string;
	documents: StoredDocument[];
};

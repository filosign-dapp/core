export type Recipient = {
    name: string
    email: string
    walletAddress: string
    role: "signer" | "cc" | "approver"
}

export type UploadedFile = {
    id: string
    file: File
    name: string
    size: number
    type: string
}

export type EnvelopeForm = {
    isOnlySigner: boolean
    recipients: Recipient[]
    emailSubject: string
    emailMessage: string
    documents: UploadedFile[]
}

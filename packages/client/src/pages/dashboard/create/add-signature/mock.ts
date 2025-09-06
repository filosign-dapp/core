export type SignatureField = {
    id: string
    type: "signature" | "initial" | "date" | "name" | "email" | "text" | "checkbox"
    x: number
    y: number
    width: number
    height: number
    page: number
    required: boolean
    label?: string
}

export type Document = {
    id: string
    name: string
    url: string
    pages: number
}

// Mock document data
export const mockDocuments: Document[] = [
    {
        id: "1",
        name: "Contract Agreement.pdf",
        url: "/mock-document.pdf",
        pages: 3
    }
]

// Mock signature fields for testing
export const mockSignatureFields: SignatureField[] = [
    {
        id: "field-1",
        type: "signature",
        x: 100,
        y: 200,
        width: 150,
        height: 50,
        page: 1,
        required: true,
        label: "Client Signature"
    },
    {
        id: "field-2",
        type: "date",
        x: 300,
        y: 200,
        width: 120,
        height: 40,
        page: 1,
        required: true,
        label: "Date Signed"
    },
    {
        id: "field-3",
        type: "name",
        x: 100,
        y: 300,
        width: 200,
        height: 40,
        page: 1,
        required: false,
        label: "Print Name"
    }
]

// Field type configurations
export const fieldTypeConfigs = [
    {
        type: "signature" as const,
        label: "Signature",
        description: "Digital signature field",
        defaultWidth: 150,
        defaultHeight: 50
    },
    {
        type: "initial" as const,
        label: "Initial",
        description: "Initial field",
        defaultWidth: 80,
        defaultHeight: 40
    },
    {
        type: "date" as const,
        label: "Date Signed",
        description: "Date field",
        defaultWidth: 120,
        defaultHeight: 40
    },
    {
        type: "name" as const,
        label: "Name",
        description: "Name field",
        defaultWidth: 200,
        defaultHeight: 40
    },
    {
        type: "email" as const,
        label: "Email",
        description: "Email field",
        defaultWidth: 250,
        defaultHeight: 40
    },
    {
        type: "text" as const,
        label: "Text",
        description: "Text input field",
        defaultWidth: 200,
        defaultHeight: 40
    },
    {
        type: "checkbox" as const,
        label: "Checkbox",
        description: "Checkbox field",
        defaultWidth: 20,
        defaultHeight: 20
    }
]

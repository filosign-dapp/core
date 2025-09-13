// Mock data for documents and folders
export interface MockFolder {
  id: string
  name: string
  createdAt: Date
  documentCount: number
}

export interface MockFile {
  id: string
  name: string
  size: number
  type: string
  createdAt: Date
  folderId?: string
  dataUrl?: string // For image previews
}

// Mock folders
export const mockFolders: MockFolder[] = [
  {
    id: "1",
    name: "Contracts",
    createdAt: new Date("2024-09-01"),
    documentCount: 12
  },
  {
    id: "2",
    name: "Legal Documents",
    createdAt: new Date("2024-08-15"),
    documentCount: 8
  },
  {
    id: "3",
    name: "Invoices",
    createdAt: new Date("2024-08-20"),
    documentCount: 15
  },
  {
    id: "4",
    name: "Reports",
    createdAt: new Date("2024-09-05"),
    documentCount: 6
  }
]

// Mock files (some in folders, some in root)
export const mockFiles: MockFile[] = [
  // Files in root
  {
    id: "file-1",
    name: "NDA_Agreement.pdf",
    size: 245760, // 240KB
    type: "application/pdf",
    createdAt: new Date("2024-09-10"),
  },
  {
    id: "file-2",
    name: "Company_Logo.png",
    size: 512000, // 500KB
    type: "image/png",
    createdAt: new Date("2024-09-08"),
    dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  },
  {
    id: "file-3",
    name: "Project_Plan.pdf",
    size: 1875000, // 1.8MB
    type: "application/pdf",
    createdAt: new Date("2024-09-05"),
  },
  {
    id: "file-4",
    name: "Meeting_Notes.txt",
    size: 15360, // 15KB
    type: "text/plain",
    createdAt: new Date("2024-09-12"),
  },
  {
    id: "file-5",
    name: "Screenshot_2024.jpg",
    size: 2048000, // 2MB
    type: "image/jpeg",
    createdAt: new Date("2024-09-11"),
    dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0RXRhU0hWjGqc5Q5v0a7QZaNrZ3nP5+zfbbhfBvv8AgX9V6SrWDrJ2fXbHf8AKS7V7rO7p6nJcXWaV7W3P5+zfbbhfBv+Qf//Z"
  },

  // Files in folders
  {
    id: "file-6",
    name: "Service_Contract.pdf",
    size: 1024000, // 1MB
    type: "application/pdf",
    createdAt: new Date("2024-08-25"),
    folderId: "1"
  },
  {
    id: "file-7",
    name: "Partnership_Agreement.pdf",
    size: 768000, // 750KB
    type: "application/pdf",
    createdAt: new Date("2024-08-18"),
    folderId: "1"
  },
  {
    id: "file-8",
    name: "Privacy_Policy.pdf",
    size: 512000, // 500KB
    type: "application/pdf",
    createdAt: new Date("2024-08-10"),
    folderId: "2"
  },
  {
    id: "file-9",
    name: "Invoice_September.pdf",
    size: 256000, // 250KB
    type: "application/pdf",
    createdAt: new Date("2024-09-01"),
    folderId: "3"
  },
  {
    id: "file-10",
    name: "Quarterly_Report.pdf",
    size: 1536000, // 1.5MB
    type: "application/pdf",
    createdAt: new Date("2024-09-03"),
    folderId: "4"
  }
]

// Combined data - root items (folders + files without folderId)
export const getRootItems = () => {
  const rootFiles = mockFiles.filter(file => !file.folderId)
  return [...mockFolders, ...rootFiles]
}

// Get files in a specific folder
export const getFilesInFolder = (folderId: string) => {
  return mockFiles.filter(file => file.folderId === folderId)
}

// Get folder by ID
export const getFolderById = (folderId: string) => {
  return mockFolders.find(folder => folder.id === folderId)
}

import { useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import { cn } from "@/src/lib/utils/utils";
import DocumentViewer from "./_components/DocumentViewer";
import Header from "./_components/Header";
import MobileSignatureToolbar from "./_components/MobileSignatureToolbar";
import SignatureFieldsSidebar from "./_components/SignatureFieldsSidebar";
import {
	type Document,
	fieldTypeConfigs,
	mockDocuments,
	type SignatureField,
} from "./mock";

export default function AddSignaturePage() {
	const navigate = useNavigate();
	const { createForm } = useStorePersist();
	const [currentDocumentId, setCurrentDocumentId] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [zoom, setZoom] = useState(100);
	const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
	const [selectedField, setSelectedField] = useState<string | null>(null);
	const [isPlacingField, setIsPlacingField] = useState(false);
	const [pendingFieldType, setPendingFieldType] = useState<
		SignatureField["type"] | null
	>(null);

	// Convert createForm documents to Document format
	const documents: Document[] = createForm?.documents?.length
		? createForm.documents.map((doc) => ({
				id: doc.id,
				name: doc.name,
				url: doc.dataUrl || "",
				pages: 1, // For now, assume 1 page per document
			}))
		: mockDocuments;

	// Set initial document if not set
	React.useEffect(() => {
		if (documents.length > 0 && !currentDocumentId) {
			setCurrentDocumentId(documents[0].id);
		}
	}, [documents, currentDocumentId]);

	const currentDocument: Document | undefined = documents.find(
		(doc) => doc.id === currentDocumentId,
	);

	// Local utility function for generating unique IDs
	const generateFieldId = () => Math.random().toString(36).substr(2, 9);

	const handleAddField = (fieldType: SignatureField["type"]) => {
		setPendingFieldType(fieldType);
		setIsPlacingField(true);
		setSelectedField(null); // Clear any selected field when starting to place a new one
	};

	const handleFieldPlaced = (x: number, y: number) => {
		if (!pendingFieldType || !currentDocumentId) return;

		const fieldConfig = fieldTypeConfigs.find(
			(config) => config.type === pendingFieldType,
		);
		if (!fieldConfig) return;

		const newField: SignatureField = {
			id: generateFieldId(),
			type: pendingFieldType,
			x,
			y,
			page: currentPage,
			documentId: currentDocumentId,
			required: true,
			label: fieldConfig.label,
		};

		setSignatureFields((prev) => [...prev, newField]);
		setIsPlacingField(false);
		setPendingFieldType(null);
	};

	const handleFieldSelect = (fieldId: string) => {
		setSelectedField(fieldId);
	};

	const handleFieldRemove = (fieldId: string) => {
		setSignatureFields((prev) => prev.filter((field) => field.id !== fieldId));
		if (selectedField === fieldId) {
			setSelectedField(null);
		}
	};

	const handleFieldUpdate = (
		fieldId: string,
		updates: Partial<SignatureField>,
	) => {
		setSignatureFields((prev) =>
			prev.map((field) =>
				field.id === fieldId ? { ...field, ...updates } : field,
			),
		);
	};

	const handleBack = () => {
		navigate({ to: "/dashboard/envelope/create" });
	};

	const handleSend = () => {
		// Handle sending the envelope with signatures
		console.log("Sending envelope with fields:", signatureFields);
		navigate({ to: "/dashboard" });
	};

	const currentPageFields = signatureFields.filter(
		(field) =>
			field.documentId === currentDocumentId && field.page === currentPage,
	);

	const handleDocumentSelect = (documentId: string) => {
		setCurrentDocumentId(documentId);
		setCurrentPage(1);
		setSelectedField(null);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header onSend={handleSend} />

			{/* Main Content */}
			<div className="flex flex-1">
				{/* Left Sidebar - Signature Fields */}
				<aside className="hidden lg:block w-64 border-r border-border bg-muted/5">
					<SignatureFieldsSidebar
						onAddField={handleAddField}
						isPlacingField={isPlacingField}
						pendingFieldType={pendingFieldType}
					/>
				</aside>

				{/* Document Viewer */}
				<main className="flex-1 flex flex-col bg-background">
					{currentDocument ? (
						<DocumentViewer
							document={currentDocument || null}
							zoom={zoom}
							signatureFields={currentPageFields}
							selectedField={selectedField}
							isPlacingField={isPlacingField}
							pendingFieldType={pendingFieldType}
							onFieldPlaced={handleFieldPlaced}
							onFieldSelect={handleFieldSelect}
							onFieldRemove={handleFieldRemove}
							onFieldUpdate={handleFieldUpdate}
							onZoomChange={setZoom}
							onBack={handleBack}
						/>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<p className="text-muted-foreground">No documents available</p>
							</div>
						</div>
					)}
				</main>

				{/* Right Sidebar - Document Thumbnails */}
				<aside className="hidden lg:block w-48 border-l border-border p-4 z-20 bg-background">
					<div className="space-y-4">
						<p className="font-medium text-muted-foreground">Documents</p>
						<div className="space-y-2">
							{documents.map((doc) => (
								<div
									key={doc.id}
									className={cn(
										"aspect-[3/4] bg-muted rounded border-2 cursor-pointer transition-colors relative",
										currentDocumentId === doc.id
											? "border-primary bg-primary/5"
											: "border-border hover:border-muted-foreground/50",
									)}
									onClick={() => handleDocumentSelect(doc.id)}
								>
									{/* Document preview */}
									{doc.url ? (
										doc.url.startsWith("data:application/pdf") ||
										doc.name?.toLowerCase().endsWith(".pdf") ? (
											<div className="absolute inset-0 flex items-center justify-center bg-red-50">
												<div className="text-xs text-destructive font-medium">
													PDF
												</div>
											</div>
										) : (
											<img
												src={doc.url}
												alt={doc.name}
												className="absolute inset-0 w-full h-full object-cover rounded"
											/>
										)
									) : (
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-xs text-muted-foreground">
												No preview
											</div>
										</div>
									)}

									{/* Document name overlay */}
									<div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b">
										<div className="text-xs truncate" title={doc.name}>
											{doc.name}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>

			{/* Mobile Signature Toolbar */}
			<MobileSignatureToolbar
				onAddField={handleAddField}
				isPlacingField={isPlacingField}
				pendingFieldType={pendingFieldType}
			/>
		</div>
	);
}

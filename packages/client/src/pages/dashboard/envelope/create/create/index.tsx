import { useForm, useFieldArray } from "react-hook-form";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Button } from "@/src/lib/components/ui/button";
import { Form } from "@/src/lib/components/ui/form";
import Logo from "@/src/lib/components/custom/Logo";
import DocumentsSection from "./_components/DocumentUpload";
import RecipientsSection from "./_components/RecipientsSection";
import { Link, useNavigate } from "@tanstack/react-router";
import type { EnvelopeForm } from "../types";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import { motion } from "motion/react";

export default function CreateEnvelopePage() {
  const navigate = useNavigate();
  const { setCreateForm } = useStorePersist();
  const form = useForm<EnvelopeForm>({
    defaultValues: {
      recipients: [{ name: "", email: "", walletAddress: "", role: "signer" }],
      emailMessage: "",
      documents: [],
    },
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const onSubmit = async (data: EnvelopeForm) => {
    const toDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    const documents = await Promise.all(
      (data.documents || []).map(async (d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        // Store data URLs for images and PDFs to enable preview in step 2
        dataUrl:
          d.type.includes("image") || d.type.includes("pdf")
            ? await toDataUrl(d.file)
            : undefined,
      })),
    );

    setCreateForm({
      recipients: data.recipients,
      emailMessage: data.emailMessage,
      documents,
    });

    // TODO: Implement envelope creation API call here
    // For now, navigate back to dashboard to bypass signature placement
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
        <div className="flex gap-4 items-center">
          <Logo
            className="px-0"
            textClassName="text-foreground font-bold"
            iconOnly
          />
          <h3>Create New Envelope</h3>
        </div>
      </header>

      {/* Main Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <main className="p-8 mx-auto space-y-8 max-w-4xl">
            <DocumentsSection
              control={form.control}
              fields={documentFields}
              append={appendDocument}
              remove={removeDocument}
            />
            <RecipientsSection control={form.control} />
          </main>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 230,
              damping: 25,
              delay: 0.7,
            }}
            className="flex justify-end p-8 pt-0 mx-auto max-w-4xl gap-4"
          >
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="gap-2"
              asChild
            >
              <Link to="/dashboard">Back</Link>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="gap-2 group transition-all duration-200"
            >
              Next Step
              <CaretLeftIcon className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}

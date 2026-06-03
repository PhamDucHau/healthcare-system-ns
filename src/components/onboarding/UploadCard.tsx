import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  id: string;
  title: string;
  hint: string;
  fileName?: string;
  file?: File | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
};

const UploadCard = ({
  id,
  title,
  hint,
  fileName,
  file,
  onFileSelect,
  className,
}: UploadCardProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const isImageFile = useMemo(() => Boolean(file?.type.startsWith("image/")), [file]);

  useEffect(() => {
    if (!file || !isImageFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImageFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    onFileSelect(selectedFile);
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-accent/20 focus-within:ring-2 focus-within:ring-primary/30",
        className,
      )}
    >
      <input
        id={id}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="sr-only"
        onChange={handleFileChange}
      />
      {previewUrl ? (
        <div className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
          <img
            src={previewUrl}
            alt={fileName ? `Preview of ${fileName}` : "Selected file preview"}
            className="max-h-full w-auto max-w-full object-contain"
          />
        </div>
      ) : (
        <span className="mb-4 rounded-xl bg-primary/10 p-3 text-primary">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <p className="mt-3 text-xs text-muted-foreground">PNG, JPG, JPEG, PDF (tối đa 10MB)</p>
      {fileName ? (
        <p className="mt-3 rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Đã chọn: {fileName}
        </p>
      ) : null}
    </label>
  );
};

export default UploadCard;

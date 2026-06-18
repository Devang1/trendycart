"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  folder?: string;
  multiple?: boolean;
};

type CloudinarySignature = {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
};

type CloudinaryUpload = {
  secure_url: string;
};

export function ImageUploadField({ label, name, folder = "trendycart", multiple = false }: ImageUploadFieldProps) {
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function removeUrl(url: string) {
    setUrls((current) => current.filter((item) => item !== url));
  }

  function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    startTransition(async () => {
      try {
        const signatureResponse = await fetch("/api/cloudinary/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder })
        });
        if (!signatureResponse.ok) throw new Error("Could not prepare upload");

        const signature = (await signatureResponse.json()) as CloudinarySignature;
        const uploaded = await Promise.all(
          Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signature.apiKey);
            formData.append("timestamp", String(signature.timestamp));
            formData.append("signature", signature.signature);
            formData.append("folder", signature.folder);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
              method: "POST",
              body: formData
            });
            if (!uploadResponse.ok) throw new Error("Image upload failed");
            const result = (await uploadResponse.json()) as CloudinaryUpload;
            return result.secure_url;
          })
        );

        setUrls((current) => multiple ? [...current, ...uploaded] : uploaded.slice(0, 1));
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Image upload failed");
      }
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted">
          <UploadCloud className="h-4 w-4" />
          {isPending ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(event) => uploadFiles(event.target.files)} />
        </label>
      </div>
      <input type="hidden" name={name} value={urls.join(",")} />
      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {urls.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
              <Image src={url} alt="Uploaded product image" fill sizes="120px" className="object-cover" />
              <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => removeUrl(url)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

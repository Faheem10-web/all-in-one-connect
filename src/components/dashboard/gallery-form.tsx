"use client";

import React, { useState, useTransition, useRef } from "react";
import { deleteGalleryItem } from "@/features/gallery/actions";
import { uploadBusinessImage } from "@/features/cloudinary/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface GalleryItemType {
  _id: string;
  imageUrl: string;
  title?: string;
  order: number;
}

interface GalleryFormProps {
  businessId: string;
  initialItems: GalleryItemType[];
}

export function GalleryForm({ businessId, initialItems }: GalleryFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItemType[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size client-side (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Selected file exceeds the maximum 5MB size limit.");
      return;
    }

    const title = prompt("Enter an optional label/title for this photo:") || "Gallery Image";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploading(true);

      startTransition(async () => {
        const result = await uploadBusinessImage(businessId, base64, "gallery", title);
        setUploading(false);

        if (result.success && result.data) {
          setItems([
            ...items,
            {
              _id: result.data.itemId || "",
              imageUrl: result.data.secureUrl,
              title,
              order: items.length,
            },
          ]);
          router.refresh();
        } else {
          alert(result.message || "Failed to upload image to gallery.");
        }
      });
    };
  };

  const handleDeleteImage = (id: string) => {
    if (!confirm("Are you sure you want to remove this photo?")) return;

    startTransition(async () => {
      const result = await deleteGalleryItem(id);
      if (result.success) {
        setItems(items.filter((item) => item._id !== id));
        router.refresh();
      } else {
        alert(result.message || "Failed to delete.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Photo Gallery</h2>
          <button
            type="button"
            onClick={handleTriggerUpload}
            disabled={isPending || uploading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add Photo</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-secondary/5 flex flex-col items-center justify-center space-y-3">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Your gallery is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload images to display on your public profile
              </p>
            </div>
            <button
              onClick={handleTriggerUpload}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Upload First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="aspect-square border border-border rounded-lg overflow-hidden bg-secondary/10 relative group shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title || "Gallery"}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Actions overlay panel */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(item._id)}
                        className="p-1.5 rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.title && (
                      <p className="text-[10px] font-bold text-white truncate text-left">
                        {item.title}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
export default GalleryForm;

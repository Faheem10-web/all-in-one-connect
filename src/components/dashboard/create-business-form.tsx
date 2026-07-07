"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBusinessFormSchema } from "@/features/business/validation";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof CreateBusinessFormSchema>;

export function CreateBusinessForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateBusinessFormSchema),
    defaultValues: {
      name: "",
      category: "",
      tagline: "",
      description: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/v1/owner/businesses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          // Profile created successfully! Refresh the page to reload the Server Component dashboard view.
          router.refresh();
        } else {
          if (result.error?.details) {
            Object.entries(result.error.details).forEach(([key, value]) => {
              setError(key as "name" | "category" | "tagline" | "description", {
                type: "server",
                message: (value as string[])[0],
              });
            });
          } else {
            alert(result.error?.message || "Something went wrong.");
          }
        }
      } catch (err) {
        console.error("Submit error:", err);
        alert("Failed to submit business details. Please check connection.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          htmlFor="name"
        >
          Business Name
        </label>
        <input
          id="name"
          type="text"
          className="input-minimal text-sm"
          placeholder="Acme Cafe Inc."
          {...register("name")}
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-xs font-semibold text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          htmlFor="category"
        >
          Category
        </label>
        <input
          id="category"
          type="text"
          className="input-minimal text-sm"
          placeholder="Food & Beverage, Retail, Tech"
          {...register("category")}
          disabled={isPending}
        />
        {errors.category && (
          <p className="text-xs font-semibold text-destructive mt-1">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          htmlFor="tagline"
        >
          Tagline (Optional)
        </label>
        <input
          id="tagline"
          type="text"
          className="input-minimal text-sm"
          placeholder="The best beans in the city"
          {...register("tagline")}
          disabled={isPending}
        />
        {errors.tagline && (
          <p className="text-xs font-semibold text-destructive mt-1">{errors.tagline.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          htmlFor="description"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          className="input-minimal text-sm"
          placeholder="Tell visitors about your products, team, or services..."
          {...register("description")}
          disabled={isPending}
        />
        {errors.description && (
          <p className="text-xs font-semibold text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Profile"}
      </button>
    </form>
  );
}
export default CreateBusinessForm;

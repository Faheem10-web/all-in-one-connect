"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBusinessValidationSchema } from "@/features/business/validation";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof CreateBusinessValidationSchema>;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface EditProfileFormProps {
  business: {
    _id: string;
    name: string;
    category: string;
    tagline?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: Array<{ day: string; open: string; close: string; closed: boolean }>;
  };
}

export function EditProfileForm({ business }: EditProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Populate schedules array dynamically if empty
  const defaultHours = DAYS.map((day) => {
    const existing = business.hours?.find((h) => h.day === day);
    return {
      day,
      open: existing?.open || "09:00",
      close: existing?.close || "17:00",
      closed: existing?.closed ?? false,
    };
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateBusinessValidationSchema),
    defaultValues: {
      name: business.name,
      category: business.category,
      tagline: business.tagline || "",
      description: business.description || "",
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      hours: defaultHours,
    },
  });

  const watchedHours = watch("hours") || [];

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/owner/businesses/${business._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          alert("Profile updated successfully!");
          router.refresh();
        } else {
          alert(result.error?.message || "Failed to update profile.");
        }
      } catch (err) {
        console.error("Submit error:", err);
        alert("Failed to submit business details. Please check connection.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core details column */}
        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">General Info</h2>

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
                {...register("category")}
                disabled={isPending}
              />
              {errors.category && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.category.message}
                </p>
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
                {...register("tagline")}
                disabled={isPending}
              />
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
                rows={4}
                className="input-minimal text-sm"
                {...register("description")}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">Contact & Location</h2>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                className="input-minimal text-sm"
                {...register("phone")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                htmlFor="email"
              >
                Contact Email
              </label>
              <input
                id="email"
                type="email"
                className="input-minimal text-sm"
                {...register("email")}
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                htmlFor="website"
              >
                Website URL
              </label>
              <input
                id="website"
                type="text"
                className="input-minimal text-sm"
                {...register("website")}
                disabled={isPending}
              />
              {errors.website && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                htmlFor="address"
              >
                Street Address
              </label>
              <input
                id="address"
                type="text"
                className="input-minimal text-sm"
                {...register("address")}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Operating Hours Scheduler */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground">Operating Hours</h2>
          <div className="space-y-4">
            {DAYS.map((day, idx) => {
              const isClosed = watchedHours[idx]?.closed;
              return (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-foreground w-24">{day}</span>

                  <div className="flex items-center gap-2">
                    <input
                      id={`hours.${idx}.closed`}
                      type="checkbox"
                      className="rounded border-border text-primary outline-none focus:ring-1"
                      {...register(`hours.${idx}.closed` as const)}
                      disabled={isPending}
                    />
                    <label
                      htmlFor={`hours.${idx}.closed`}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Closed
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      className="w-16 h-8 text-center text-xs border border-border rounded-md bg-secondary/20 outline-none focus:border-ring"
                      placeholder="09:00"
                      {...register(`hours.${idx}.open` as const)}
                      disabled={isClosed || isPending}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <input
                      type="text"
                      maxLength={5}
                      className="w-16 h-8 text-center text-xs border border-border rounded-md bg-secondary/20 outline-none focus:border-ring"
                      placeholder="17:00"
                      {...register(`hours.${idx}.close` as const)}
                      disabled={isClosed || isPending}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </button>
      </div>
    </form>
  );
}
export default EditProfileForm;

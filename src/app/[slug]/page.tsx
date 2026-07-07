import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import GalleryItem from "@/lib/models/gallery";
import { ProfileView } from "@/components/public/profile-view";
import { Metadata } from "next";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  await connectToDatabase();
  const business = await Business.findOne({
    businessSlug: slug.toLowerCase(),
    isDeleted: { $ne: true },
  });

  if (!business || business.status !== "APPROVED") {
    return {
      title: "Profile Not Found | All In One Connect",
      description: "This business profile is not available or is pending verification.",
    };
  }

  const title = `${business.name} | All In One Connect`;
  const description =
    business.tagline ||
    business.description ||
    `Connect with ${business.name} on All In One Connect.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: business.coverUrl ? [{ url: business.coverUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: business.coverUrl ? [business.coverUrl] : [],
    },
    alternates: {
      canonical: `/${business.businessSlug}`,
    },
  };
}

// 2. Main Page Render
export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;

  await connectToDatabase();

  const business = await Business.findOne({
    businessSlug: slug.toLowerCase(),
    isDeleted: { $ne: true },
  });

  // Verify status is approved for public views
  if (!business || business.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm space-y-6">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Profile Not Available</h1>
            <p className="text-sm text-slate-500">
              The business profile is currently pending verification approval or has been suspended.
            </p>
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-slate-900 text-white font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Connect
          </Link>
        </div>
      </div>
    );
  }

  // Fetch linked gallery photos
  const gallery = await GalleryItem.find({ businessId: business._id }).sort({ order: 1 });

  // Serialize models
  const serializedBusiness = {
    _id: business._id.toString(),
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    description: business.description,
    logoUrl: business.logoUrl,
    coverUrl: business.coverUrl,
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website,
    hours: business.hours
      ? business.hours.map((h) => ({
          day: h.day,
          open: h.open,
          close: h.close,
          closed: h.closed,
        }))
      : [],
    branding: {
      primaryColor: business.branding?.primaryColor || "#2563eb",
      textColor: business.branding?.textColor || "#0f172a",
      theme: business.branding?.theme || "LIGHT",
      buttonRadius: business.branding?.buttonRadius ?? 8,
      fontFamily: business.branding?.fontFamily || "Inter",
    },
    socialLinks: business.socialLinks
      ? business.socialLinks.map((s) => ({
          platform: socialPlatformAlias(s.platform),
          url: s.url,
          isActive: s.isActive,
        }))
      : [],
  };

  const serializedGallery = gallery.map((item) => ({
    _id: item._id.toString(),
    imageUrl: item.imageUrl,
    title: item.title,
  }));

  // JSON-LD Structured Data Schema
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description || business.tagline,
    image: business.logoUrl,
    telephone: business.phone,
    email: business.email,
    url: business.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
    },
  };

  return (
    <>
      {/* Schema Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <ProfileView business={serializedBusiness} gallery={serializedGallery} />
    </>
  );
}

// Basic formatter ensuring standard visual platforms display tags
function socialPlatformAlias(platform: string) {
  const clean = platform.trim().toLowerCase();
  if (clean.includes("instagram")) return "Instagram";
  if (clean.includes("facebook")) return "Facebook";
  if (clean.includes("linkedin")) return "LinkedIn";
  if (clean.includes("youtube")) return "YouTube";
  return platform;
}

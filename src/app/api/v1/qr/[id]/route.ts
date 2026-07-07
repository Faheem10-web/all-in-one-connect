import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import QRCode from "@/lib/models/qrcode";
import Business from "@/lib/models/business";
import Analytics from "@/lib/models/analytics";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    await connectToDatabase();

    // 1. Look up active QR Code registry
    const qrCode = await QRCode.findOne({ shortUrl: id, isActive: true });
    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Invalid or suspended QR connection link.",
          },
        },
        { status: 404 },
      );
    }

    // 2. Fetch associated approved business profile
    const business = await Business.findOne({ _id: qrCode.businessId, status: "APPROVED" });
    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Target business profile is not available.",
          },
        },
        { status: 404 },
      );
    }

    // 3. Extract client metrics headers
    const userAgent = request.headers.get("user-agent") || "";
    const country = request.headers.get("x-vercel-ip-country") || "Unknown";
    const city = request.headers.get("x-vercel-ip-city") || "Unknown";
    const language = request.headers.get("accept-language")?.split(",")[0] || "en";

    // 4. Parse basic user agent rules
    let deviceType: "MOBILE" | "TABLET" | "DESKTOP" = "DESKTOP";
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = "TABLET";
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(userAgent)) {
      deviceType = "MOBILE";
    }

    let browser = "Unknown";
    if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/edg/i.test(userAgent)) browser = "Edge";

    let os = "Unknown";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

    // 5. Gather marketing tracking values
    const utmSource = searchParams.get("utm_source") || undefined;
    const utmMedium = searchParams.get("utm_medium") || undefined;
    const utmCampaign = searchParams.get("utm_campaign") || undefined;

    // 6. Log Scan event asynchronously
    const recordScan = async () => {
      try {
        await Analytics.create({
          businessId: business._id,
          deviceType,
          browser,
          os,
          referrer: request.headers.get("referer") || "Direct",
          country,
          city,
          language,
          utmSource,
          utmMedium,
          utmCampaign,
        });

        // Increment total scans in the QR record
        await QRCode.updateOne({ _id: qrCode._id }, { $inc: { scanCount: 1 } });
      } catch (logError) {
        console.error("Async scan logging failed:", logError);
      }
    };

    // Trigger asynchronously (non-blocking for faster redirect times)
    recordScan();

    // 7. Execute dynamic redirect to the public profile slug page
    const targetRedirectUrl = new URL(`/${business.businessSlug}`, request.url);
    return NextResponse.redirect(targetRedirectUrl, 307);
  } catch (error) {
    console.error("QR redirect error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected redirect error occurred.",
        },
      },
      { status: 500 },
    );
  }
}

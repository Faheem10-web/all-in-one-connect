import { businessService } from "@/features/business/service";
import { NextResponse } from "next/server";

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const business = await businessService.getPublicProfileBySlug(slug);

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Public business profile not found or pending verification.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Public profile fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}

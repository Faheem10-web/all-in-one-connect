import { auth } from "@/auth";
import { businessService } from "@/features/business/service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrative privileges are required to view this resource.",
          },
        },
        { status: 403 },
      );
    }

    const list = await businessService.adminGetBusinesses();

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Admin businesses lookup error:", error);
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

import { auth } from "@/auth";
import { businessService } from "@/features/business/service";
import { UpdateBusinessValidationSchema } from "@/features/business/validation";
import { businessRepository } from "@/features/business/repository";
import { NextResponse } from "next/server";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to view this business.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const business = await businessRepository.findById(id);

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Business profile not found.",
          },
        },
        { status: 404 },
      );
    }

    // Verify ownership permissions
    if (business.userId.toString() !== session.user.id.toString()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to view this business profile.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Owner business detail fetch error:", error);
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

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to edit this business profile.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedFields = UpdateBusinessValidationSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Input validation checks failed.",
            details: validatedFields.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const updatedBusiness = await businessService.updateBusiness(
      session.user.id,
      id,
      validatedFields.data,
    );

    return NextResponse.json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error: unknown) {
    console.error("Owner business update error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    const isForbidden = message === "Unauthorized to edit this business";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message,
        },
      },
      { status: isForbidden ? 403 : 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to delete this business profile.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    await businessService.deleteBusiness(session.user.id, id);

    return NextResponse.json({
      success: true,
      message: "Business profile soft-deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Owner business delete error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    const isForbidden = message === "Unauthorized to delete this business";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message,
        },
      },
      { status: isForbidden ? 403 : 500 },
    );
  }
}

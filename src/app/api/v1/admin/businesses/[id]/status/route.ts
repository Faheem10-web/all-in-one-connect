import { auth } from "@/auth";
import { businessService } from "@/features/business/service";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const UpdateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
});

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Administrative privileges are required to update profile verification status.",
          },
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedFields = UpdateStatusSchema.safeParse(body);

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

    const updatedBusiness = await businessService.adminUpdateStatus(
      session.user.id,
      id,
      validatedFields.data.status,
    );

    return NextResponse.json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error: unknown) {
    console.error("Admin status modification error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message,
        },
      },
      { status: 500 },
    );
  }
}

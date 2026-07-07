import { auth } from "@/auth";
import { businessService } from "@/features/business/service";
import { CreateBusinessValidationSchema } from "@/features/business/validation";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to view your businesses.",
          },
        },
        { status: 401 },
      );
    }

    const list = await businessService.getMyBusinesses(session.user.id);

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Owner business list query error:", error);
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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required to create a business profile.",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedFields = CreateBusinessValidationSchema.safeParse(body);

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

    const { name, category, tagline, description } = validatedFields.data;

    const business = await businessService.createBusiness(session.user.id, {
      name,
      category,
      tagline,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        data: business,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner business create error:", error);
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

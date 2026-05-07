import { NextResponse } from "next/server";
import { getModels } from "../../lib/models";

export async function GET() {
  try {
    const result = await getModels();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch models" },
      { status: 500 }
    );
  }
}

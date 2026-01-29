import { NextResponse } from "next/server";
import connectDB from "@/backend/db";
import Branch from "@/backend/models/Branch";

export async function GET() {
  try {
    await connectDB();

    const branches = await Branch.find({ isActive: true })
      .select("_id name branchCode")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

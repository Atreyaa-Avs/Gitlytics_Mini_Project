import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return auth.handler(req as unknown as Request) as unknown as NextResponse;
}

export async function POST(req: NextRequest) {
  return auth.handler(req as unknown as Request) as unknown as NextResponse;
}

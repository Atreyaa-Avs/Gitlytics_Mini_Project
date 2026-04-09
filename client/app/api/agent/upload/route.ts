import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attachment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const MAX_FILE_SIZES = {
  "image/png": 5 * 1024 * 1024, // 5MB
  "image/jpeg": 5 * 1024 * 1024,
  "image/jpg": 5 * 1024 * 1024,
  "application/pdf": 10 * 1024 * 1024, // 10MB
  "text/plain": 2 * 1024 * 1024, // 2MB
  "text/markdown": 2 * 1024 * 1024,
};

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const threadId = formData.get("threadId") as string;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!threadId) {
    return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
  }

  // Validate file type
  const maxSize = MAX_FILE_SIZES[file.type as keyof typeof MAX_FILE_SIZES];
  if (!maxSize) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: PNG, JPEG, PDF, TXT, MD" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
      { status: 400 }
    );
  }

  // Save file locally
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Save to database
  const [newAttachment] = await db
    .insert(attachment)
    .values({
      threadId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: `/uploads/${fileName}`,
    })
    .returning();

  return NextResponse.json({
    id: newAttachment.id,
    url: newAttachment.filePath,
    fileName: newAttachment.fileName,
    fileType: newAttachment.fileType,
  });
}

// GET attachments for a thread
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
  }

  const attachments = await db.query.attachment.findMany({
    where: eq(attachment.threadId, threadId),
    orderBy: (attachment, { desc }) => [desc(attachment.createdAt)],
  });

  return NextResponse.json(attachments);
}

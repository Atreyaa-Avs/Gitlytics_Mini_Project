import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { thread } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET all threads for the current user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const threads = await db.query.thread.findMany({
    where: and(
      eq(thread.userId, session.user.id),
      search ? like(thread.title, `%${search}%`) : undefined
    ),
    orderBy: [desc(thread.updatedAt)],
    limit: 50,
  });

  return NextResponse.json(threads);
}

// POST create a new thread
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = body.title || "New Thread";

  const [newThread] = await db
    .insert(thread)
    .values({
      userId: session.user.id,
      title,
    })
    .returning();

  return NextResponse.json(newThread, { status: 201 });
}

// PATCH update a thread
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, title } = body;

  if (!id) {
    return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(thread)
    .set({ title: title || undefined, updatedAt: new Date() })
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE a thread
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
  }

  const deleted = await db
    .delete(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .returning();

  if (!deleted.length) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

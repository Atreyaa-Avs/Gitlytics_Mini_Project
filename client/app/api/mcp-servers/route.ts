import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mcpServer } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET all MCP servers for current user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const servers = await db.query.mcpServer.findMany({
    where: eq(mcpServer.userId, session.user.id),
    orderBy: (mcpServer, { desc }) => [desc(mcpServer.createdAt)],
  });

  return NextResponse.json(servers);
}

// POST create a new MCP server
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, command, args, env, url, headers, enabled } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  try {
    const [newServer] = await db
      .insert(mcpServer)
      .values({
        userId: session.user.id,
        name,
        type,
        command: type === "stdio" ? command : null,
        args: type === "stdio" ? args : null,
        env: type === "stdio" ? env : null,
        url: type === "http" ? url : null,
        headers: type === "http" ? headers : null,
        enabled: enabled ?? true,
      })
      .returning();

    return NextResponse.json(newServer, { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A server with this name already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
}

// PATCH update an MCP server
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(mcpServer)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(mcpServer.id, id), eq(mcpServer.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE an MCP server
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
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
  }

  const deleted = await db
    .delete(mcpServer)
    .where(and(eq(mcpServer.id, id), eq(mcpServer.userId, session.user.id)))
    .returning();

  if (!deleted.length) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

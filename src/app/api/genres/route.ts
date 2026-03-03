import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = searchParams.get("page");
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const name = searchParams.get("name") ?? "";

  if (!page) {
    const genres = await prisma.genre.findMany({
      where: name ? { name: { contains: name, mode: "insensitive" } } : {},
      orderBy: { name: "asc" },
    });
    return NextResponse.json(genres);
  }

  const where = name
    ? { name: { contains: name, mode: "insensitive" as const } }
    : {};

  const [genres, total] = await Promise.all([
    prisma.genre.findMany({
      where,
      skip: (Number(page) - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.genre.count({ where }),
  ]);

  return NextResponse.json({ genres, total, page: Number(page), pageSize });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Genre name is required" }, { status: 400 });
  }

  const existing = await prisma.genre.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "This genre already exists" }, { status: 409 });
  }

  const genre = await prisma.genre.create({ data: { name } });
  return NextResponse.json(genre, { status: 201 });
}



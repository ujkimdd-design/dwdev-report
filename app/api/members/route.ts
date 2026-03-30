import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  const members = await prisma.member.findMany({
    where: name
      ? { name: { contains: name, mode: "insensitive" } }
      : undefined,
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, birth_date, gender, first_visit_date } = body;

    if (!name || !birth_date || !gender || !first_visit_date) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        name,
        birth_date: new Date(birth_date),
        gender,
        first_visit_date: new Date(first_visit_date),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "회원 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

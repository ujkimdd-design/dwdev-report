import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: { reports: { orderBy: [{ year: "desc" }, { month: "desc" }] } },
  });

  if (!member) {
    return NextResponse.json(
      { error: "회원을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(member);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { name, birth_date, gender, first_visit_date } = body;

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(birth_date && { birth_date: new Date(birth_date) }),
        ...(gender && { gender }),
        ...(first_visit_date && {
          first_visit_date: new Date(first_visit_date),
        }),
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "회원 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "회원 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

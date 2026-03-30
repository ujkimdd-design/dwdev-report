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
  const member_id = searchParams.get("member_id");
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const member_name = searchParams.get("member_name");

  const reports = await prisma.report.findMany({
    where: {
      ...(member_id && { member_id }),
      ...(year && { year: parseInt(year) }),
      ...(month && { month: parseInt(month) }),
      ...(member_name && {
        member: { name: { contains: member_name, mode: "insensitive" } },
      }),
    },
    include: { member: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { member_id, year, month, status } = body;

    if (!member_id || !year || !month) {
      return NextResponse.json(
        { error: "회원, 연도, 월은 필수입니다." },
        { status: 400 }
      );
    }

    const report = await prisma.report.upsert({
      where: { member_id_year_month: { member_id, year, month } },
      create: { member_id, year, month, status: status ?? "draft" },
      update: { status: status ?? "draft" },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

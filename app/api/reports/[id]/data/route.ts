import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id: report_id } = await params;
  try {
    const body = await req.json();
    const { type, data } = body;

    // Verify report exists
    const report = await prisma.report.findUnique({ where: { id: report_id } });
    if (!report) {
      return NextResponse.json(
        { error: "리포트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let result;

    switch (type) {
      case "balance": {
        // Delete existing and create new
        await prisma.ronficBalanceRecord.deleteMany({
          where: { report_id },
        });
        result = await prisma.ronficBalanceRecord.create({
          data: { report_id, ...data },
        });
        break;
      }
      case "vo2": {
        await prisma.ronficVo2Record.deleteMany({
          where: { report_id },
        });
        result = await prisma.ronficVo2Record.create({
          data: { report_id, ...data },
        });
        break;
      }
      case "fra": {
        await prisma.inbodyFraRecord.deleteMany({
          where: { report_id },
        });
        result = await prisma.inbodyFraRecord.create({
          data: { report_id, ...data },
        });
        break;
      }
      case "body": {
        await prisma.inbodyBodyRecord.deleteMany({
          where: { report_id },
        });
        result = await prisma.inbodyBodyRecord.create({
          data: { report_id, ...data },
        });
        break;
      }
      case "comment": {
        // For comments, upsert by section_type
        const { section_type, comment_text, expert_name } = data;
        result = await prisma.expertComment.upsert({
          where: {
            id: data.id ?? "new",
          },
          create: { report_id, section_type, comment_text, expert_name },
          update: { comment_text, expert_name },
        });
        break;
      }
      case "comment_replace": {
        // Replace all comments for a section
        const { section_type, comment_text, expert_name } = data;
        await prisma.expertComment.deleteMany({
          where: { report_id, section_type },
        });
        result = await prisma.expertComment.create({
          data: { report_id, section_type, comment_text, expert_name },
        });
        break;
      }
      default:
        return NextResponse.json(
          { error: "알 수 없는 데이터 타입입니다." },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "데이터 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(req, { params });
}

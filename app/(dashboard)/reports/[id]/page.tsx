import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportPrintView from "@/components/report/ReportPrintView";

async function getReport(id: string) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      member: true,
      balance_records: true,
      vo2_records: true,
      fra_records: true,
      body_records: true,
      comments: { orderBy: { created_at: "asc" } },
    },
  });
  if (!report) return null;

  // Serialize Date objects to strings for client component
  return {
    ...report,
    created_at: report.created_at.toISOString(),
    updated_at: report.updated_at.toISOString(),
    member: {
      ...report.member,
      birth_date: report.member.birth_date.toISOString(),
      first_visit_date: report.member.first_visit_date.toISOString(),
      created_at: report.member.created_at.toISOString(),
    },
    balance_records: report.balance_records.map((r) => ({
      ...r,
      measured_at: r.measured_at.toISOString(),
    })),
    vo2_records: report.vo2_records.map((r) => ({
      ...r,
      measured_at: r.measured_at.toISOString(),
    })),
    fra_records: report.fra_records.map((r) => ({
      ...r,
      measured_at: r.measured_at.toISOString(),
    })),
    body_records: report.body_records.map((r) => ({
      ...r,
      measured_at: r.measured_at.toISOString(),
    })),
    comments: report.comments.map((c) => ({
      ...c,
      created_at: c.created_at.toISOString(),
    })),
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return <ReportPrintView report={report} />;
}

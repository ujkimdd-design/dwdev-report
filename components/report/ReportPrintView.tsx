"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import { Printer, Pencil, ArrowLeft } from "lucide-react";
import DonutChart from "./DonutChart";
import BalanceBar from "./BalanceBar";
import GradeGauge from "./GradeGauge";

// Types
interface Member {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  first_visit_date: string;
}

interface RonficBalanceRecord {
  balance_total_score: number | null;
  balance_grade: string | null;
  upper_push_left: number | null;
  upper_push_right: number | null;
  upper_pull_left: number | null;
  upper_pull_right: number | null;
  trunk_rotation_left: number | null;
  trunk_rotation_right: number | null;
  lower_squat: number | null;
  lower_deadlift: number | null;
}

interface RonficVo2Record {
  vo2peak: number | null;
  body_age_aerobic: string | null;
  fitness_grade: string | null;
  disease_mortality_risk: string | null;
  cardiovascular_risk: string | null;
  cancer_risk: string | null;
  cancer_mortality_risk: string | null;
  hypertension_risk: string | null;
  metabolic_syndrome_risk: string | null;
  stroke_risk: string | null;
}

interface InbodyFraRecord {
  sensory_total_score: number | null;
  sensory_basic_balance: number | null;
  sensory_somatosensory: number | null;
  sensory_visual: number | null;
  sensory_vestibular: number | null;
  sensory_basic_grade: string | null;
  sensory_somatosensory_grade: string | null;
  sensory_visual_grade: string | null;
  sensory_vestibular_grade: string | null;
  balance_total_score: number | null;
  balance_fast_shift_speed: number | null;
  balance_target_follow_pct: number | null;
  balance_fast_grade: string | null;
  balance_target_grade: string | null;
  neuro_total_score: number | null;
  neuro_reaction_time: number | null;
  neuro_posture_hold_time: number | null;
  neuro_reaction_grade: string | null;
  neuro_posture_grade: string | null;
}

interface InbodyBodyRecord {
  inbody_score: number | null;
  weight: number | null;
  skeletal_muscle_mass: number | null;
  body_fat_mass: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  smi: number | null;
  phase_angle: number | null;
  ecw_ratio: number | null;
  lean_right_arm: number | null;
  lean_left_arm: number | null;
  lean_trunk: number | null;
  lean_right_leg: number | null;
  lean_left_leg: number | null;
  nutrition_protein: string | null;
  nutrition_minerals: string | null;
  nutrition_fat: string | null;
  obesity_bmi: string | null;
  obesity_fat_pct: string | null;
  balance_upper_lr: string | null;
  balance_lower_lr: string | null;
  balance_upper_lower: string | null;
}

interface ExpertComment {
  id: string;
  section_type: string;
  comment_text: string;
  expert_name: string;
}

interface Report {
  id: string;
  year: number;
  month: number;
  status: string;
  member: Member;
  balance_records: RonficBalanceRecord[];
  vo2_records: RonficVo2Record[];
  fra_records: InbodyFraRecord[];
  body_records: InbodyBodyRecord[];
  comments: ExpertComment[];
}

// Helpers
function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function gradeColor(grade: string | null): string {
  if (!grade) return "#6b7280";
  if (["매우우수", "균형", "높음", "빠름"].includes(grade)) return "#16a34a";
  if (["우수", "중간"].includes(grade)) return "#2563eb";
  if (["보통", "중간"].includes(grade)) return "#ca8a04";
  if (["다소부족", "약함", "낮음", "느림"].includes(grade)) return "#ea580c";
  if (["매우부족", "매우약함"].includes(grade)) return "#dc2626";
  return "#6b7280";
}

function riskColor(risk: string | null): { bg: string; text: string; label: string } {
  if (!risk) return { bg: "bg-gray-100", text: "text-gray-500", label: "-" };
  if (risk === "해당없음") return { bg: "bg-green-100", text: "text-green-700", label: "해당없음" };
  if (risk === "주의") return { bg: "bg-yellow-100", text: "text-yellow-700", label: "주의" };
  if (risk === "위험") return { bg: "bg-red-100", text: "text-red-700", label: "위험" };
  return { bg: "bg-gray-100", text: "text-gray-500", label: risk };
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-gray-400 text-sm">-</span>;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: gradeColor(grade) + "20", color: gradeColor(grade) }}
    >
      {grade}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1.5 h-8 bg-blue-700 rounded-full" />
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function SubSectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-blue-700 text-white px-4 py-2 rounded-t-xl">
      <p className="text-sm font-semibold">{title}</p>
    </div>
  );
}

function DataCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function NoDataCard({ title }: { title: string }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
      <p className="text-gray-400 font-medium text-sm">{title}</p>
      <p className="text-gray-300 text-xs mt-1">데이터 연동 준비 중</p>
    </div>
  );
}

// VO2 disease risk table
const diseaseRiskItems = [
  { key: "disease_mortality_risk" as keyof RonficVo2Record, label: "사망위험" },
  { key: "cardiovascular_risk" as keyof RonficVo2Record, label: "심혈관질환" },
  { key: "cancer_risk" as keyof RonficVo2Record, label: "암 위험" },
  { key: "cancer_mortality_risk" as keyof RonficVo2Record, label: "암 사망위험" },
  { key: "hypertension_risk" as keyof RonficVo2Record, label: "고혈압" },
  { key: "metabolic_syndrome_risk" as keyof RonficVo2Record, label: "대사증후군" },
  { key: "stroke_risk" as keyof RonficVo2Record, label: "뇌졸중" },
];

export default function ReportPrintView({ report }: { report: Report }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `케어허브 통합리포트_${report.member.name}_${report.year}년${report.month}월`,
  });

  const balance = report.balance_records[0] ?? null;
  const vo2 = report.vo2_records[0] ?? null;
  const fra = report.fra_records[0] ?? null;
  const body = report.body_records[0] ?? null;

  const age = calcAge(report.member.birth_date);
  const movementComment = report.comments.find((c) => c.section_type === "movement");
  const cognitiveComment = report.comments.find((c) => c.section_type === "cognitive");
  const metabolicComment = report.comments.find((c) => c.section_type === "metabolic");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="no-print bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-sm font-semibold text-gray-700">
            {report.member.name} — {report.year}년 {report.month}월 통합리포트
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            report.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {report.status === "published" ? "발행됨" : "초안"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/reports/${report.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} />
            데이터 수정
          </Link>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Printer size={14} />
            PDF 인쇄
          </button>
        </div>
      </div>

      {/* Print content */}
      <div ref={printRef} className="max-w-4xl mx-auto p-6 space-y-6">

        {/* ======== COVER / HEADER ======== */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">케어허브 통합리포트</p>
              <h1 className="text-4xl font-bold mb-2">{report.member.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {age}세
                </span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {report.member.gender}
                </span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  최초내원일: {formatDate(report.member.first_visit_date)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">측정 기간</p>
              <p className="text-2xl font-bold mt-1">{report.year}년 {report.month}월</p>
              {vo2?.body_age_aerobic && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-blue-200 text-xs">실제 나이</span>
                    <span className="bg-white/25 text-white font-bold px-3 py-0.5 rounded-full text-sm">
                      {age}세
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-blue-200 text-xs">유산소 체력 나이</span>
                    <span className="bg-yellow-400 text-yellow-900 font-bold px-3 py-0.5 rounded-full text-sm">
                      {vo2.body_age_aerobic}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== 움직임 관리 SECTION ======== */}
        <div>
          <SectionHeader title="움직임 관리 리포트" subtitle="론픽 MiniPlus · 론픽 Climit VO2 · 인바디 FRA · 인바디 580" />

          {/* --- 론픽 밸런스 --- */}
          <div className="mb-5">
            <SubSectionHeader title="힐리언스 코어센터 | 론픽 MiniPlus Balance" />
            <div className="rounded-b-xl border border-t-0 border-gray-100 shadow-sm overflow-hidden">
              {balance ? (
                <div className="p-5 bg-white">
                  <div className="flex gap-6">
                    {/* Left: donut + grade */}
                    <div className="flex flex-col items-center gap-3 min-w-[140px]">
                      <DonutChart
                        score={Math.round(balance.balance_total_score ?? 0)}
                        color="#1d4ed8"
                        label="밸런스 점수"
                        size="medium"
                      />
                      <GradeBadge grade={balance.balance_grade} />
                      {balance.balance_grade && (
                        <div className="w-full">
                          <GradeGauge grade={balance.balance_grade} variant="balance" />
                        </div>
                      )}
                    </div>
                    {/* Right: balance bars */}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">좌/우 근력 비교</p>
                      <BalanceBar label="상체 밀기" leftValue={balance.upper_push_left} rightValue={balance.upper_push_right} maxValue={60} />
                      <BalanceBar label="상체 당기기" leftValue={balance.upper_pull_left} rightValue={balance.upper_pull_right} maxValue={60} />
                      <BalanceBar label="체간 회전" leftValue={balance.trunk_rotation_left} rightValue={balance.trunk_rotation_right} maxValue={50} />
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">하체 근력</p>
                        <div className="flex gap-4">
                          <div className="bg-blue-50 rounded-lg px-4 py-3 text-center flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">스쿼트</p>
                            <p className="text-xl font-bold text-blue-700">
                              {balance.lower_squat?.toFixed(1) ?? "-"}
                              <span className="text-xs font-normal text-gray-400 ml-1">kgf</span>
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg px-4 py-3 text-center flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">데드리프트</p>
                            <p className="text-xl font-bold text-blue-700">
                              {balance.lower_deadlift?.toFixed(1) ?? "-"}
                              <span className="text-xs font-normal text-gray-400 ml-1">kgf</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white">
                  <NoDataCard title="론픽 MiniPlus 측정 데이터 없음" />
                </div>
              )}
            </div>
          </div>

          {/* --- 론픽 VO2 --- */}
          <div className="mb-5">
            <SubSectionHeader title="힐리언스 코어센터 | 론픽 Climit VO2 (심폐지구력)" />
            <div className="rounded-b-xl border border-t-0 border-gray-100 shadow-sm overflow-hidden">
              {vo2 ? (
                <div className="p-5 bg-white">
                  <div className="flex gap-6">
                    {/* Left: VO2 donut + grade */}
                    <div className="flex flex-col items-center gap-3 min-w-[180px]">
                      <DonutChart
                        score={vo2.vo2peak ? Math.round(vo2.vo2peak) : 0}
                        maxScore={60}
                        color="#7c3aed"
                        label="최대산소섭취량"
                        unit="ml/kg/min"
                        size="medium"
                      />
                      {vo2.fitness_grade && (
                        <>
                          <GradeBadge grade={vo2.fitness_grade} />
                          <div className="w-full">
                            <GradeGauge grade={vo2.fitness_grade} variant="fitness" />
                          </div>
                        </>
                      )}
                      {vo2.body_age_aerobic && (
                        <div className="bg-purple-50 rounded-xl px-4 py-3 text-center w-full">
                          <p className="text-xs text-gray-500 mb-0.5">유산소 체력 나이</p>
                          <p className="text-2xl font-bold text-purple-700">{vo2.body_age_aerobic}</p>
                        </div>
                      )}
                    </div>
                    {/* Right: Disease risks */}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">질병 위험도</p>
                      <div className="grid grid-cols-1 gap-2">
                        {diseaseRiskItems.map((item) => {
                          const val = vo2[item.key] as string | null;
                          const rc = riskColor(val);
                          return (
                            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50">
                              <span className="text-sm text-gray-700">{item.label}</span>
                              <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${rc.bg} ${rc.text}`}>
                                {rc.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white">
                  <NoDataCard title="론픽 VO2 측정 데이터 없음" />
                </div>
              )}
            </div>
          </div>

          {/* --- 인바디 FRA --- */}
          <div className="mb-5">
            <SubSectionHeader title="인바디 FRA (기능적 균형 평가)" />
            <div className="rounded-b-xl border border-t-0 border-gray-100 shadow-sm overflow-hidden">
              {fra ? (
                <div className="p-5 bg-white">
                  {/* Top 4 donuts */}
                  <div className="grid grid-cols-4 gap-4 mb-5">
                    <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center gap-2">
                      <DonutChart
                        score={Math.round(fra.sensory_total_score ?? 0)}
                        color="#1d4ed8"
                        label="감각계 점수"
                        size="small"
                      />
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center gap-2">
                      <DonutChart
                        score={Math.round(fra.balance_total_score ?? 0)}
                        color="#16a34a"
                        label="통합균형 점수"
                        size="small"
                      />
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center gap-2">
                      <DonutChart
                        score={Math.round(fra.neuro_total_score ?? 0)}
                        color="#7c3aed"
                        label="신경계 점수"
                        size="small"
                      />
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 flex flex-col items-center gap-2">
                      <DonutChart
                        score={body ? Math.round(body.inbody_score ?? 0) : 0}
                        color="#ea580c"
                        label="인바디 점수"
                        size="small"
                      />
                    </div>
                  </div>

                  {/* 3-column detail */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* 감각계 */}
                    <DataCard>
                      <p className="text-xs font-bold text-blue-700 mb-3 uppercase">감각계 세부</p>
                      {[
                        { label: "기본 균형", val: fra.sensory_basic_balance, grade: fra.sensory_basic_grade },
                        { label: "체성감각", val: fra.sensory_somatosensory, grade: fra.sensory_somatosensory_grade },
                        { label: "시각", val: fra.sensory_visual, grade: fra.sensory_visual_grade },
                        { label: "전정감각", val: fra.sensory_vestibular, grade: fra.sensory_vestibular_grade },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-600">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700">{item.val?.toFixed(1) ?? "-"}</span>
                            <GradeBadge grade={item.grade ?? null} />
                          </div>
                        </div>
                      ))}
                    </DataCard>

                    {/* 균형 */}
                    <DataCard>
                      <p className="text-xs font-bold text-green-700 mb-3 uppercase">균형 세부</p>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <span className="text-xs text-gray-600">빠른 이동 속도</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{fra.balance_fast_shift_speed?.toFixed(1) ?? "-"} <span className="text-gray-400 font-normal">cm/s</span></span>
                            <GradeBadge grade={fra.balance_fast_grade ?? null} />
                          </div>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-xs text-gray-600">목표 추적</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{fra.balance_target_follow_pct?.toFixed(1) ?? "-"} <span className="text-gray-400 font-normal">%</span></span>
                            <GradeBadge grade={fra.balance_target_grade ?? null} />
                          </div>
                        </div>
                      </div>
                    </DataCard>

                    {/* 신경계 */}
                    <DataCard>
                      <p className="text-xs font-bold text-purple-700 mb-3 uppercase">신경계 세부</p>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <span className="text-xs text-gray-600">반응 시간</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{fra.neuro_reaction_time?.toFixed(2) ?? "-"} <span className="text-gray-400 font-normal">s</span></span>
                            <GradeBadge grade={fra.neuro_reaction_grade ?? null} />
                          </div>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-xs text-gray-600">자세 유지 시간</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{fra.neuro_posture_hold_time?.toFixed(1) ?? "-"} <span className="text-gray-400 font-normal">s</span></span>
                            <GradeBadge grade={fra.neuro_posture_grade ?? null} />
                          </div>
                        </div>
                      </div>
                    </DataCard>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white">
                  <NoDataCard title="인바디 FRA 측정 데이터 없음" />
                </div>
              )}
            </div>
          </div>

          {/* --- 인바디 580 --- */}
          <div className="mb-5">
            <SubSectionHeader title="인바디 580 (체성분 분석)" />
            <div className="rounded-b-xl border border-t-0 border-gray-100 shadow-sm overflow-hidden">
              {body ? (
                <div className="p-5 bg-white">
                  <div className="grid grid-cols-3 gap-5">
                    {/* InBody Score */}
                    <div className="flex flex-col items-center gap-3">
                      <DonutChart
                        score={Math.round(body.inbody_score ?? 0)}
                        color="#ea580c"
                        label="체성분균형점수"
                        size="large"
                      />
                      <div className="w-full space-y-1.5">
                        {body.obesity_bmi && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">BMI 판정</span>
                            <GradeBadge grade={body.obesity_bmi} />
                          </div>
                        )}
                        {body.obesity_fat_pct && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">체지방 판정</span>
                            <GradeBadge grade={body.obesity_fat_pct} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body composition */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase">체성분 측정치</p>
                      {[
                        { label: "체중", val: body.weight, unit: "kg" },
                        { label: "골격근량", val: body.skeletal_muscle_mass, unit: "kg" },
                        { label: "체지방량", val: body.body_fat_mass, unit: "kg" },
                        { label: "BMI", val: body.bmi, unit: "" },
                        { label: "체지방률", val: body.body_fat_pct, unit: "%" },
                        { label: "SMI", val: body.smi, unit: "" },
                        { label: "위상각", val: body.phase_angle, unit: "°" },
                        { label: "ECW 비율", val: body.ecw_ratio, unit: "" },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-600">{item.label}</span>
                          <span className="text-xs font-bold text-gray-900">
                            {item.val?.toFixed(1) ?? "-"}{item.unit && <span className="text-gray-400 font-normal ml-0.5">{item.unit}</span>}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Segmental */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase">부위별 근육량</p>
                      {[
                        { label: "우측 팔", val: body.lean_right_arm },
                        { label: "좌측 팔", val: body.lean_left_arm },
                        { label: "체간", val: body.lean_trunk },
                        { label: "우측 다리", val: body.lean_right_leg },
                        { label: "좌측 다리", val: body.lean_left_leg },
                      ].map((item) => (
                        <div key={item.label} className="mb-2">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs text-gray-600">{item.label}</span>
                            <span className="text-xs font-bold text-orange-700">
                              {item.val?.toFixed(1) ?? "-"} <span className="text-gray-400 font-normal">kg</span>
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-400"
                              style={{ width: `${Math.min(((item.val ?? 0) / 15) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Balance badges */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">균형 평가</p>
                        {[
                          { label: "상체 좌/우", val: body.balance_upper_lr },
                          { label: "하체 좌/우", val: body.balance_lower_lr },
                          { label: "상/하체", val: body.balance_upper_lower },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">{item.label}</span>
                            <GradeBadge grade={item.val ?? null} />
                          </div>
                        ))}
                      </div>

                      {/* Nutrition */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">영양 평가</p>
                        {[
                          { label: "단백질", val: body.nutrition_protein },
                          { label: "무기질", val: body.nutrition_minerals },
                          { label: "지방", val: body.nutrition_fat },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">{item.label}</span>
                            <GradeBadge grade={item.val ?? null} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white">
                  <NoDataCard title="인바디 580 측정 데이터 없음" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== 인지 관리 SECTION (placeholder) ======== */}
        <div>
          <SectionHeader title="인지 관리 리포트" subtitle="실비아 메모리 캠퍼스" />
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center bg-blue-50/30">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🧠</span>
            </div>
            <p className="text-blue-700 font-semibold text-base">인지 관리 리포트</p>
            <p className="text-blue-400 text-sm mt-1">실비아 메모리 캠퍼스 — 데이터 연동 준비 중</p>
          </div>
        </div>

        {/* ======== 대사 관리 SECTION (placeholder) ======== */}
        <div>
          <SectionHeader title="대사(생활) 관리 리포트" subtitle="쥬비스 · 벤자민 AI" />
          <div className="border-2 border-dashed border-green-200 rounded-2xl p-10 text-center bg-green-50/30">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🌿</span>
            </div>
            <p className="text-green-700 font-semibold text-base">대사(생활) 관리 리포트</p>
            <p className="text-green-400 text-sm mt-1">쥬비스, 벤자민 AI — 데이터 연동 준비 중</p>
          </div>
        </div>

        {/* ======== 전문가 코멘트 ======== */}
        <div>
          <SectionHeader title="전문가 코멘트" />
          <div className="grid gap-4">
            {[
              { type: "movement", label: "움직임 관리", color: "blue", comment: movementComment },
              { type: "cognitive", label: "인지 관리", color: "purple", comment: cognitiveComment },
              { type: "metabolic", label: "대사 관리", color: "green", comment: metabolicComment },
            ].map(({ type, label, color, comment }) => (
              <div
                key={type}
                className={`bg-white rounded-xl border shadow-sm p-5 border-${color}-100`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-bold text-${color}-700`}>{label} 전문가 코멘트</p>
                  {comment?.expert_name && (
                    <span className="text-xs text-gray-500">작성: {comment.expert_name}</span>
                  )}
                </div>
                {comment ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">코멘트가 없습니다.</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 pb-2 flex items-center justify-between text-xs text-gray-400">
          <span>케어허브 통합리포트 플랫폼</span>
          <span>{report.year}년 {report.month}월 | {report.member.name} 회원</span>
        </div>
      </div>
    </div>
  );
}

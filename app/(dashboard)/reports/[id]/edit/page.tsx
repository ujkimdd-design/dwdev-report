"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";

interface Report {
  id: string;
  year: number;
  month: number;
  status: string;
  member: {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
  };
  balance_records: BalanceData[];
  vo2_records: Vo2Data[];
  fra_records: FraData[];
  body_records: BodyData[];
  comments: CommentData[];
}

interface BalanceData {
  balance_total_score?: number | null;
  balance_grade?: string | null;
  upper_push_left?: number | null;
  upper_push_right?: number | null;
  upper_pull_left?: number | null;
  upper_pull_right?: number | null;
  trunk_rotation_left?: number | null;
  trunk_rotation_right?: number | null;
  lower_squat?: number | null;
  lower_deadlift?: number | null;
}

interface Vo2Data {
  vo2peak?: number | null;
  body_age_aerobic?: string | null;
  fitness_grade?: string | null;
  disease_mortality_risk?: string | null;
  cardiovascular_risk?: string | null;
  cancer_risk?: string | null;
  cancer_mortality_risk?: string | null;
  hypertension_risk?: string | null;
  metabolic_syndrome_risk?: string | null;
  stroke_risk?: string | null;
}

interface FraData {
  sensory_total_score?: number | null;
  sensory_basic_balance?: number | null;
  sensory_somatosensory?: number | null;
  sensory_visual?: number | null;
  sensory_vestibular?: number | null;
  sensory_basic_grade?: string | null;
  sensory_somatosensory_grade?: string | null;
  sensory_visual_grade?: string | null;
  sensory_vestibular_grade?: string | null;
  balance_total_score?: number | null;
  balance_fast_shift_speed?: number | null;
  balance_target_follow_pct?: number | null;
  balance_fast_grade?: string | null;
  balance_target_grade?: string | null;
  neuro_total_score?: number | null;
  neuro_reaction_time?: number | null;
  neuro_posture_hold_time?: number | null;
  neuro_reaction_grade?: string | null;
  neuro_posture_grade?: string | null;
}

interface BodyData {
  inbody_score?: number | null;
  weight?: number | null;
  skeletal_muscle_mass?: number | null;
  body_fat_mass?: number | null;
  bmi?: number | null;
  body_fat_pct?: number | null;
  smi?: number | null;
  phase_angle?: number | null;
  ecw_ratio?: number | null;
  lean_right_arm?: number | null;
  lean_left_arm?: number | null;
  lean_trunk?: number | null;
  lean_right_leg?: number | null;
  lean_left_leg?: number | null;
  nutrition_protein?: string | null;
  nutrition_minerals?: string | null;
  nutrition_fat?: string | null;
  obesity_bmi?: string | null;
  obesity_fat_pct?: string | null;
  balance_upper_lr?: string | null;
  balance_lower_lr?: string | null;
  balance_upper_lower?: string | null;
}

interface CommentData {
  id?: string;
  section_type: string;
  comment_text: string;
  expert_name: string;
}

type TabKey = "balance" | "vo2" | "fra" | "body" | "comments";

const tabs: { key: TabKey; label: string }[] = [
  { key: "balance", label: "론픽 밸런스" },
  { key: "vo2", label: "론픽 심폐지구력" },
  { key: "fra", label: "인바디 FRA" },
  { key: "body", label: "인바디 체성분" },
  { key: "comments", label: "전문가 코멘트" },
];

const balanceGrades = ["매우약함", "약함", "보통", "균형"];
const fitnessGrades = ["매우부족", "다소부족", "보통", "우수", "매우우수"];
const riskLevels = ["해당없음", "주의", "위험"];
const threeGrades = ["낮음", "중간", "높음"];
const speedGrades = ["느림", "중간", "빠름"];
const nutritionGrades2 = ["양호", "부족"];
const fatGrades = ["양호", "과다"];
const obesityBmiGrades = ["표준", "저체중", "과체중", "심한과체중"];
const obesityFatGrades = ["표준", "경도비만", "비만"];
const balanceGrades3 = ["균형", "약한불균형", "심한불균형"];

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <label className="w-36 text-xs font-medium text-gray-600 pt-2.5 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  step = "0.1",
  placeholder = "",
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">선택 안함</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

export default function ReportEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("balance");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Form states
  const [balance, setBalance] = useState<BalanceData>({});
  const [vo2, setVo2] = useState<Vo2Data>({});
  const [fra, setFra] = useState<FraData>({});
  const [body, setBody] = useState<BodyData>({});
  const [movComment, setMovComment] = useState<CommentData>({ section_type: "movement", comment_text: "", expert_name: "" });
  const [cogComment, setCogComment] = useState<CommentData>({ section_type: "cognitive", comment_text: "", expert_name: "" });
  const [metComment, setMetComment] = useState<CommentData>({ section_type: "metabolic", comment_text: "", expert_name: "" });

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) { router.push("/reports"); return; }
      const data: Report = await res.json();
      setReport(data);
      if (data.balance_records[0]) setBalance(data.balance_records[0]);
      if (data.vo2_records[0]) setVo2(data.vo2_records[0]);
      if (data.fra_records[0]) setFra(data.fra_records[0]);
      if (data.body_records[0]) setBody(data.body_records[0]);
      const mc = data.comments.find((c) => c.section_type === "movement");
      const cc = data.comments.find((c) => c.section_type === "cognitive");
      const met = data.comments.find((c) => c.section_type === "metabolic");
      if (mc) setMovComment(mc);
      if (cc) setCogComment(cc);
      if (met) setMetComment(met);
      setLoading(false);
    };
    fetchReport();
  }, [id, router]);

  const saveTab = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      let type = activeTab as string;
      let data: Record<string, unknown> = {};

      if (activeTab === "balance") { type = "balance"; data = balance as unknown as Record<string, unknown>; }
      else if (activeTab === "vo2") { type = "vo2"; data = vo2 as unknown as Record<string, unknown>; }
      else if (activeTab === "fra") { type = "fra"; data = fra as unknown as Record<string, unknown>; }
      else if (activeTab === "body") { type = "body"; data = body as unknown as Record<string, unknown>; }
      else if (activeTab === "comments") {
        // Save all 3 comments
        await Promise.all([
          fetch(`/api/reports/${id}/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "comment_replace", data: movComment }),
          }),
          fetch(`/api/reports/${id}/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "comment_replace", data: cogComment }),
          }),
          fetch(`/api/reports/${id}/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "comment_replace", data: metComment }),
          }),
        ]);
        setSaveMsg("저장되었습니다.");
        return;
      }

      const res = await fetch(`/api/reports/${id}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (res.ok) {
        setSaveMsg("저장되었습니다.");
      } else {
        setSaveMsg("저장 실패. 다시 시도해주세요.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">불러오는 중...</div>;
  }

  if (!report) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/reports/${id}`} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {report.member.name} — {report.year}년 {report.month}월 데이터 입력
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">각 탭에서 측정 데이터를 입력하고 저장하세요.</p>
          </div>
        </div>
        <Link
          href={`/reports/${id}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <Eye size={14} />
          리포트 보기
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ---- Tab: Balance ---- */}
          {activeTab === "balance" && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">론픽 MiniPlus Balance</h3>
              <div className="max-w-xl">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">종합 평가</p>
                  <FormRow label="밸런스 총점 (0-100)">
                    <NumInput value={balance.balance_total_score} onChange={(v) => setBalance({ ...balance, balance_total_score: v })} step="1" />
                  </FormRow>
                  <FormRow label="밸런스 등급">
                    <SelectInput value={balance.balance_grade} onChange={(v) => setBalance({ ...balance, balance_grade: v })} options={balanceGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">상체 밀기 (kgf)</p>
                  <FormRow label="좌측">
                    <NumInput value={balance.upper_push_left} onChange={(v) => setBalance({ ...balance, upper_push_left: v })} />
                  </FormRow>
                  <FormRow label="우측">
                    <NumInput value={balance.upper_push_right} onChange={(v) => setBalance({ ...balance, upper_push_right: v })} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">상체 당기기 (kgf)</p>
                  <FormRow label="좌측">
                    <NumInput value={balance.upper_pull_left} onChange={(v) => setBalance({ ...balance, upper_pull_left: v })} />
                  </FormRow>
                  <FormRow label="우측">
                    <NumInput value={balance.upper_pull_right} onChange={(v) => setBalance({ ...balance, upper_pull_right: v })} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">체간 회전 (kgf)</p>
                  <FormRow label="좌측">
                    <NumInput value={balance.trunk_rotation_left} onChange={(v) => setBalance({ ...balance, trunk_rotation_left: v })} />
                  </FormRow>
                  <FormRow label="우측">
                    <NumInput value={balance.trunk_rotation_right} onChange={(v) => setBalance({ ...balance, trunk_rotation_right: v })} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">하체 근력 (kgf)</p>
                  <FormRow label="스쿼트">
                    <NumInput value={balance.lower_squat} onChange={(v) => setBalance({ ...balance, lower_squat: v })} />
                  </FormRow>
                  <FormRow label="데드리프트">
                    <NumInput value={balance.lower_deadlift} onChange={(v) => setBalance({ ...balance, lower_deadlift: v })} />
                  </FormRow>
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: VO2 ---- */}
          {activeTab === "vo2" && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">론픽 Climit VO2 (심폐지구력)</h3>
              <div className="max-w-xl">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">심폐지구력 지표</p>
                  <FormRow label="VO2peak (ml/kg/min)">
                    <NumInput value={vo2.vo2peak} onChange={(v) => setVo2({ ...vo2, vo2peak: v })} step="0.1" />
                  </FormRow>
                  <FormRow label="유산소 체력 나이">
                    <input
                      type="text"
                      value={vo2.body_age_aerobic ?? ""}
                      onChange={(e) => setVo2({ ...vo2, body_age_aerobic: e.target.value })}
                      placeholder="예: 20대, 30대"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormRow>
                  <FormRow label="체력 등급">
                    <SelectInput value={vo2.fitness_grade} onChange={(v) => setVo2({ ...vo2, fitness_grade: v })} options={fitnessGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">질병 위험도</p>
                  {[
                    { label: "사망위험", key: "disease_mortality_risk" as keyof Vo2Data },
                    { label: "심혈관질환", key: "cardiovascular_risk" as keyof Vo2Data },
                    { label: "암 위험", key: "cancer_risk" as keyof Vo2Data },
                    { label: "암 사망위험", key: "cancer_mortality_risk" as keyof Vo2Data },
                    { label: "고혈압", key: "hypertension_risk" as keyof Vo2Data },
                    { label: "대사증후군", key: "metabolic_syndrome_risk" as keyof Vo2Data },
                    { label: "뇌졸중", key: "stroke_risk" as keyof Vo2Data },
                  ].map((item) => (
                    <FormRow key={item.key} label={item.label}>
                      <SelectInput
                        value={vo2[item.key] as string | null}
                        onChange={(v) => setVo2({ ...vo2, [item.key]: v })}
                        options={riskLevels}
                      />
                    </FormRow>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: FRA ---- */}
          {activeTab === "fra" && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">인바디 FRA (기능적 균형 평가)</h3>
              <div className="max-w-xl space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">감각계</p>
                  <FormRow label="감각계 총점">
                    <NumInput value={fra.sensory_total_score} onChange={(v) => setFra({ ...fra, sensory_total_score: v })} />
                  </FormRow>
                  <FormRow label="기본 균형 점수">
                    <NumInput value={fra.sensory_basic_balance} onChange={(v) => setFra({ ...fra, sensory_basic_balance: v })} />
                  </FormRow>
                  <FormRow label="기본 균형 등급">
                    <SelectInput value={fra.sensory_basic_grade} onChange={(v) => setFra({ ...fra, sensory_basic_grade: v })} options={threeGrades} />
                  </FormRow>
                  <FormRow label="체성감각 점수">
                    <NumInput value={fra.sensory_somatosensory} onChange={(v) => setFra({ ...fra, sensory_somatosensory: v })} />
                  </FormRow>
                  <FormRow label="체성감각 등급">
                    <SelectInput value={fra.sensory_somatosensory_grade} onChange={(v) => setFra({ ...fra, sensory_somatosensory_grade: v })} options={threeGrades} />
                  </FormRow>
                  <FormRow label="시각 점수">
                    <NumInput value={fra.sensory_visual} onChange={(v) => setFra({ ...fra, sensory_visual: v })} />
                  </FormRow>
                  <FormRow label="시각 등급">
                    <SelectInput value={fra.sensory_visual_grade} onChange={(v) => setFra({ ...fra, sensory_visual_grade: v })} options={threeGrades} />
                  </FormRow>
                  <FormRow label="전정감각 점수">
                    <NumInput value={fra.sensory_vestibular} onChange={(v) => setFra({ ...fra, sensory_vestibular: v })} />
                  </FormRow>
                  <FormRow label="전정감각 등급">
                    <SelectInput value={fra.sensory_vestibular_grade} onChange={(v) => setFra({ ...fra, sensory_vestibular_grade: v })} options={threeGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">통합균형능력</p>
                  <FormRow label="균형 총점">
                    <NumInput value={fra.balance_total_score} onChange={(v) => setFra({ ...fra, balance_total_score: v })} />
                  </FormRow>
                  <FormRow label="빠른 이동 속도 (cm/s)">
                    <NumInput value={fra.balance_fast_shift_speed} onChange={(v) => setFra({ ...fra, balance_fast_shift_speed: v })} />
                  </FormRow>
                  <FormRow label="빠른 이동 등급">
                    <SelectInput value={fra.balance_fast_grade} onChange={(v) => setFra({ ...fra, balance_fast_grade: v })} options={threeGrades} />
                  </FormRow>
                  <FormRow label="목표 추적 (%)">
                    <NumInput value={fra.balance_target_follow_pct} onChange={(v) => setFra({ ...fra, balance_target_follow_pct: v })} />
                  </FormRow>
                  <FormRow label="목표 추적 등급">
                    <SelectInput value={fra.balance_target_grade} onChange={(v) => setFra({ ...fra, balance_target_grade: v })} options={threeGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">신경계</p>
                  <FormRow label="신경계 총점">
                    <NumInput value={fra.neuro_total_score} onChange={(v) => setFra({ ...fra, neuro_total_score: v })} />
                  </FormRow>
                  <FormRow label="반응 시간 (s)">
                    <NumInput value={fra.neuro_reaction_time} onChange={(v) => setFra({ ...fra, neuro_reaction_time: v })} step="0.01" />
                  </FormRow>
                  <FormRow label="반응 등급">
                    <SelectInput value={fra.neuro_reaction_grade} onChange={(v) => setFra({ ...fra, neuro_reaction_grade: v })} options={speedGrades} />
                  </FormRow>
                  <FormRow label="자세 유지 시간 (s)">
                    <NumInput value={fra.neuro_posture_hold_time} onChange={(v) => setFra({ ...fra, neuro_posture_hold_time: v })} step="0.1" />
                  </FormRow>
                  <FormRow label="자세 유지 등급">
                    <SelectInput value={fra.neuro_posture_grade} onChange={(v) => setFra({ ...fra, neuro_posture_grade: v })} options={speedGrades} />
                  </FormRow>
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: Body ---- */}
          {activeTab === "body" && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">인바디 580 (체성분 분석)</h3>
              <div className="max-w-xl space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">종합 점수</p>
                  <FormRow label="인바디 점수 (0-100+)">
                    <NumInput value={body.inbody_score} onChange={(v) => setBody({ ...body, inbody_score: v })} step="1" />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">체성분 측정치</p>
                  <FormRow label="체중 (kg)"><NumInput value={body.weight} onChange={(v) => setBody({ ...body, weight: v })} /></FormRow>
                  <FormRow label="골격근량 (kg)"><NumInput value={body.skeletal_muscle_mass} onChange={(v) => setBody({ ...body, skeletal_muscle_mass: v })} /></FormRow>
                  <FormRow label="체지방량 (kg)"><NumInput value={body.body_fat_mass} onChange={(v) => setBody({ ...body, body_fat_mass: v })} /></FormRow>
                  <FormRow label="BMI"><NumInput value={body.bmi} onChange={(v) => setBody({ ...body, bmi: v })} step="0.01" /></FormRow>
                  <FormRow label="체지방률 (%)"><NumInput value={body.body_fat_pct} onChange={(v) => setBody({ ...body, body_fat_pct: v })} /></FormRow>
                  <FormRow label="SMI"><NumInput value={body.smi} onChange={(v) => setBody({ ...body, smi: v })} step="0.01" /></FormRow>
                  <FormRow label="위상각 (°)"><NumInput value={body.phase_angle} onChange={(v) => setBody({ ...body, phase_angle: v })} step="0.1" /></FormRow>
                  <FormRow label="ECW 비율"><NumInput value={body.ecw_ratio} onChange={(v) => setBody({ ...body, ecw_ratio: v })} step="0.001" /></FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">부위별 근육량 (kg)</p>
                  <FormRow label="우측 팔"><NumInput value={body.lean_right_arm} onChange={(v) => setBody({ ...body, lean_right_arm: v })} /></FormRow>
                  <FormRow label="좌측 팔"><NumInput value={body.lean_left_arm} onChange={(v) => setBody({ ...body, lean_left_arm: v })} /></FormRow>
                  <FormRow label="체간"><NumInput value={body.lean_trunk} onChange={(v) => setBody({ ...body, lean_trunk: v })} /></FormRow>
                  <FormRow label="우측 다리"><NumInput value={body.lean_right_leg} onChange={(v) => setBody({ ...body, lean_right_leg: v })} /></FormRow>
                  <FormRow label="좌측 다리"><NumInput value={body.lean_left_leg} onChange={(v) => setBody({ ...body, lean_left_leg: v })} /></FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">영양 평가</p>
                  <FormRow label="단백질">
                    <SelectInput value={body.nutrition_protein} onChange={(v) => setBody({ ...body, nutrition_protein: v })} options={nutritionGrades2} />
                  </FormRow>
                  <FormRow label="무기질">
                    <SelectInput value={body.nutrition_minerals} onChange={(v) => setBody({ ...body, nutrition_minerals: v })} options={nutritionGrades2} />
                  </FormRow>
                  <FormRow label="지방">
                    <SelectInput value={body.nutrition_fat} onChange={(v) => setBody({ ...body, nutrition_fat: v })} options={fatGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">비만 평가</p>
                  <FormRow label="BMI 판정">
                    <SelectInput value={body.obesity_bmi} onChange={(v) => setBody({ ...body, obesity_bmi: v })} options={obesityBmiGrades} />
                  </FormRow>
                  <FormRow label="체지방률 판정">
                    <SelectInput value={body.obesity_fat_pct} onChange={(v) => setBody({ ...body, obesity_fat_pct: v })} options={obesityFatGrades} />
                  </FormRow>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase">균형 평가</p>
                  <FormRow label="상체 좌/우 균형">
                    <SelectInput value={body.balance_upper_lr} onChange={(v) => setBody({ ...body, balance_upper_lr: v })} options={balanceGrades3} />
                  </FormRow>
                  <FormRow label="하체 좌/우 균형">
                    <SelectInput value={body.balance_lower_lr} onChange={(v) => setBody({ ...body, balance_lower_lr: v })} options={balanceGrades3} />
                  </FormRow>
                  <FormRow label="상/하체 균형">
                    <SelectInput value={body.balance_upper_lower} onChange={(v) => setBody({ ...body, balance_upper_lower: v })} options={balanceGrades3} />
                  </FormRow>
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: Comments ---- */}
          {activeTab === "comments" && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">전문가 코멘트</h3>
              <div className="max-w-2xl space-y-5">
                {[
                  { label: "움직임 관리 코멘트", state: movComment, setState: setMovComment, color: "blue" },
                  { label: "인지 관리 코멘트", state: cogComment, setState: setCogComment, color: "purple" },
                  { label: "대사 관리 코멘트", state: metComment, setState: setMetComment, color: "green" },
                ].map(({ label, state, setState }) => (
                  <div key={state.section_type} className="bg-gray-50 rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-600 mb-3 uppercase">{label}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">전문가 이름</label>
                        <input
                          type="text"
                          value={state.expert_name}
                          onChange={(e) => setState({ ...state, expert_name: e.target.value })}
                          placeholder="작성자 이름"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">코멘트 내용</label>
                        <textarea
                          value={state.comment_text}
                          onChange={(e) => setState({ ...state, comment_text: e.target.value })}
                          placeholder="전문가 소견을 입력하세요..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={saveTab}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "저장 중..." : "저장"}
            </button>
            {saveMsg && (
              <span className={`text-sm font-medium ${saveMsg.includes("실패") ? "text-red-500" : "text-green-600"}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, FileText, Pencil } from "lucide-react";

interface Member {
  id: string;
  name: string;
}

interface Report {
  id: string;
  year: number;
  month: number;
  status: string;
  member: Member;
  created_at: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [memberName, setMemberName] = useState(searchParams.get("name") ?? "");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reports, setReports] = useState<Report[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(searchParams.get("member_id") ?? "");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    };
    fetchMembers();
  }, []);

  // Auto-search if member_id is in URL
  useEffect(() => {
    const mid = searchParams.get("member_id");
    if (mid) {
      handleSearch(mid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (memberId?: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (memberId) {
        params.set("member_id", memberId);
      } else if (memberName) {
        params.set("member_name", memberName);
      }
      params.set("year", selectedYear.toString());
      params.set("month", selectedMonth.toString());

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!selectedMemberId) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMemberId,
          year: selectedYear,
          month: selectedMonth,
          status: "draft",
        }),
      });
      if (res.ok) {
        const report = await res.json();
        setShowCreateDialog(false);
        router.push(`/reports/${report.id}/edit`);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리포트 조회</h1>
          <p className="text-sm text-gray-500 mt-0.5">회원별 통합 건강 리포트를 조회합니다.</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow"
        >
          <Plus size={16} />
          리포트 생성
        </button>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">회원 이름</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="이름을 입력하세요"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">연도</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">월</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleSearch()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Search size={14} />
            조회
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">조회 중...</div>
      )}

      {!loading && searched && reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">데이터 없음</p>
          <p className="text-sm text-gray-400 mt-1">해당 조건의 리포트가 없습니다.</p>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="text-blue-600" size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {r.member.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.year}년 {r.month}월 통합리포트
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    r.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {r.status === "published" ? "발행됨" : "초안"}
                </span>
                <button
                  onClick={() => router.push(`/reports/${r.id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Pencil size={12} />
                  데이터 입력
                </button>
                <button
                  onClick={() => router.push(`/reports/${r.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FileText size={12} />
                  리포트 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Report Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">새 리포트 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">회원 선택</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">회원을 선택하세요</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">연도</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">월</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>{m}월</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={!selectedMemberId || createLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
                >
                  {createLoading ? "생성 중..." : "생성"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">불러오는 중...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

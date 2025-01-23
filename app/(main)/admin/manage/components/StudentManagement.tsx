"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiEdit2, FiCalendar } from "react-icons/fi";
import EditStudentModal from "./EditStudentModal";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  price: number;
  paymentDate: number | null;
  isActive: boolean;
  Payment: {
    status: string;
    amount: number;
    createdAt: string;
  }[];
  teacherId: string | null;
}

interface Teacher {
  id: string;
  name: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, [searchQuery, statusFilter]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/students?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");

      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handleEditStudent = async (data: Partial<Student>) => {
    if (!data.id) return;

    try {
      const response = await fetch(`/api/students/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          price: data.price,
          paymentDate: data.paymentDate,
          isActive: data.isActive,
          teacherId: data.teacherId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      await fetchStudents();
      setIsEditModalOpen(false);
      setSelectedStudent(null);

      toast.success("학생 정보가 수정되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
    } catch (error) {
      console.error("Failed to update student:", error);
      toast.error("학생 정보 수정에 실패했습니다.", {
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FiUsers className="text-blue-500" />
          학생 관리
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="active">수강중</option>
            <option value="inactive">휴식중</option>
          </select>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 검색"
              className="pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-sm w-60"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid gap-3">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg">{student.name}</h3>
                      <span
                        className={`text-sm px-2 py-0.5 rounded ${
                          student.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {student.isActive ? "수강중" : "휴식중"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {student.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        수강료: {formatPrice(student.price)}원
                      </span>
                      <span className="text-sm text-gray-600">
                        결제일: {student.paymentDate || "-"}일
                      </span>
                      {student.teacherId && (
                        <span className="text-sm text-gray-600">
                          담당:{" "}
                          {teachers.find((t) => t.id === student.teacherId)
                            ?.name || "-"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
                      title="정보 편집하기"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => {
                        /* TODO: 스케줄 관리 모달 열기 */
                      }}
                      className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
                      title="스케줄 관리"
                    >
                      <FiCalendar />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              학생이 없습니다.
            </div>
          )}
        </div>
      </div>

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={handleEditStudent}
      />
    </div>
  );
}

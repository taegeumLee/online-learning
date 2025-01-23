"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  IoCalendarOutline,
  IoRefreshOutline,
  IoChatboxOutline,
} from "react-icons/io5";

import { useState, useEffect } from "react";
import Calendar from "./components/calendar";
import { AdminTextbookModal } from "./components/admin-textbook-modal";
import { AdminMessageModal } from "./components/admin-message-modal";

type Student = {
  id: string;
  name: string;
  course: string;
  isActive: boolean;
  lastAccess: string;
  textbookTitle: string;
  courseSubject: string;
  nextSchedule: string;
  startAt: Date;
  endAt: Date;
  currentTextbookId: string | null;
};

async function fetchStudents() {
  const res = await fetch("/api/students");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch students");
  }
  return res.json();
}

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isTextbookModalOpen, setIsTextbookModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const {
    data: students = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    refetchInterval: 2000,
    staleTime: 200,
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const res = await fetch("/api/messages/unread");
      if (!res.ok) throw new Error("Failed to fetch unread messages");
      return res.json();
    },
    refetchInterval: 3000,
  });

  // students 데이터가 업데이트될 때마다 selectedStudent도 업데이트
  useEffect(() => {
    if (selectedStudent) {
      const updatedStudent = students.find(
        (student: Student) => student.id === selectedStudent.id
      );
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
    }
  }, [students, selectedStudent]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          로딩 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <p className="text-accent-red">오류가 발생했습니다.</p>
      </div>
    );
  }
  const sortedStudents = [...students].sort((a, b) => {
    return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
  });

  const onlineCount = students.filter((s: Student) => s.isActive).length;

  return (
    <div className="flex w-full h-[calc(100vh-5rem)] p-4 gap-4">
      {/* 왼쪽 학생 목록 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/5 bg-background-light rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-border-light overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-border-light bg-surface-light">
          <div>
            <h2 className="text-lg font-bold text-text-primary-light">
              학생 목록
            </h2>
            <p className="text-sm text-text-secondary-light mt-1">
              온라인: {onlineCount}명
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 relative"
              title="메시지 보내기"
            >
              <IoChatboxOutline className="w-5 h-5" />
              {unreadMessages?.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedStudent(null)}
              className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
              title="전체 캘린더 보기"
            >
              <IoCalendarOutline className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 ${
                isRefreshing ? "opacity-50" : ""
              }`}
              title="새로고침"
            >
              <IoRefreshOutline
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="divide-y divide-border-light overflow-y-auto h-[calc(100%-4rem)]">
          {sortedStudents.map((student) => (
            <motion.button
              key={student.id}
              onClick={() =>
                student.isActive ? setSelectedStudent(student) : null
              }
              className={`w-full p-4 text-left transition-all ${
                selectedStudent?.id === student.id
                  ? "bg-blue-50"
                  : student.isActive
                  ? "hover:bg-gray-50"
                  : "opacity-50 cursor-not-allowed"
              }`}
              whileHover={student.isActive ? { scale: 1.01 } : undefined}
              whileTap={student.isActive ? { scale: 0.99 } : undefined}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.name}</span>
                    {student.isActive && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {student.courseSubject} - {student.textbookTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">다음 수업</p>
                  <p className="text-sm text-blue-500">
                    {student.nextSchedule}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 오른쪽 메인 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-background-light rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-border-light overflow-hidden"
      >
        {selectedStudent ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-light">
              <div>
                <h1 className="text-xl font-bold">{selectedStudent.name}</h1>
                <p className="text-sm text-gray-600">
                  {selectedStudent.courseSubject} -{" "}
                  {selectedStudent.textbookTitle}
                </p>
              </div>
              <button
                onClick={() => setIsTextbookModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                교재 전달하기
              </button>
            </div>

            <div className="flex-1 p-4">
              {selectedStudent.isActive ? (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">수업 화면이 표시됩니다.</p>
                </div>
              ) : (
                <Calendar />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full p-4">
            <Calendar />
          </div>
        )}
      </motion.div>

      {/* 교재 모달 */}
      <AdminTextbookModal
        isOpen={isTextbookModalOpen && !!selectedStudent?.id}
        onClose={() => setIsTextbookModalOpen(false)}
        studentId={selectedStudent?.id ?? ""}
        currentTextbookId={selectedStudent?.currentTextbookId}
      />

      <AdminMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </div>
  );
}

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
    <div className="flex h-[calc(100vh-5rem)] bg-background-light dark:bg-background-dark">
      {/* 왼쪽 학생 목록 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/5 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-y-auto"
      >
        <div className=" flex justify-between items-center p-4 border-b  border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <div>
            <h2 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
              학생 목록
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              온라인: {onlineCount}명
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="p-2 rounded-full hover:bg-primary-bg transition-colors relative"
              title="메시지 보내기"
            >
              <IoChatboxOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary" />
              {unreadMessages?.count > 0 && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-accent-red justify-center items-center text-[10px] text-white">
                      {unreadMessages.count}
                    </span>
                  </span>
                </div>
              )}
            </button>
            <button
              onClick={() => {
                setSelectedStudent(null);
              }}
              className="p-2 rounded-full hover:bg-primary-bg transition-colors"
              title="전체 캘린더 보기"
            >
              <IoCalendarOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full hover:bg-primary-bg transition-colors ${
                isRefreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="학생 목록 새로고침"
            >
              <IoRefreshOutline
                className={`w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-transform duration-75 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {sortedStudents.map((student) => (
            <motion.button
              key={student.id}
              onClick={() =>
                student.isActive ? setSelectedStudent(student) : null
              }
              className={`w-full p-4 text-left transition-all duration-200
                ${
                  selectedStudent?.id === student.id
                    ? "bg-surface-hover-light dark:bg-surface-hover-dark"
                    : student.isActive
                    ? "hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:shadow-md"
                    : "opacity-50 cursor-not-allowed"
                }`}
              whileHover={
                student.isActive
                  ? {
                      scale: 1.01,
                      transition: { duration: 0.2 },
                    }
                  : undefined
              }
              whileTap={student.isActive ? { scale: 0.99 } : undefined}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      {student.name}
                    </span>
                    {student.isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-status-online"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    {student.courseSubject} - {student.textbookTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    다음 수업
                  </p>
                  <p className="text-xs text-primary">{student.nextSchedule}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-6 bg-background-light dark:bg-background-dark"
      >
        {selectedStudent ? (
          <div className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {selectedStudent.name}
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  {selectedStudent.courseSubject} -{" "}
                  {selectedStudent.textbookTitle}
                </p>
              </div>
              <button
                onClick={() => setIsTextbookModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                교재 전달하기
              </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-md dark:shadow-lg h-[calc(100%-6rem)]">
              {selectedStudent.isActive ? (
                <div className="h-full flex items-center justify-center bg-surface-hover-light dark:bg-surface-hover-dark rounded-lg">
                  <p className="text-text-primary-light dark:text-text-primary-dark">
                    수업 화면이 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="h-full p-6">
                  <Calendar />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full">
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

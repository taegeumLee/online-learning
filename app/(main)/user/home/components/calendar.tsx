"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Schedule {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  user?: {
    id: string;
    name: string;
  };
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [mounted, setMounted] = useState(false);

  // 모달이 열릴 때 body에 overflow: hidden 추가
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 내 수업 일정 조회
  const { data: schedules = [] } = useQuery({
    queryKey: ["my-schedules"],
    queryFn: async () => {
      const res = await fetch("/api/my-schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();

      return data.map((schedule: Schedule) => ({
        id: schedule.id,
        title: "수업",
        start: schedule.startAt,
        end: schedule.endAt,
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        textColor: "#FFFFFF",
      }));
    },
  });

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            onClick={onClose}
          >
            <div
              className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 h-full">
                <style jsx global>{`
                  .fc {
                    --fc-border-color: var(--border-color);
                    --fc-page-bg-color: transparent;
                    height: 100%;
                    color: #111827 !important;
                  }

                  /* 헤더 영역 개선 */
                  .fc .fc-toolbar {
                    margin-bottom: 0.5rem !important;
                    padding: 0 !important;
                  }

                  .fc .fc-toolbar-title {
                    font-size: 1.25rem !important;
                    font-weight: 700 !important;
                    color: #111827 !important;
                  }

                  /* 버튼 스타일 */
                  .fc .fc-button {
                    background: #9ca3af !important;
                    border: none !important;
                    border-radius: 0.5rem !important;
                    padding: 0.375rem 0.75rem !important;
                    font-weight: 500 !important;
                    font-size: 0.75rem !important;
                    transition: all 0.15s ease !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                    color: white !important;
                  }

                  .fc .fc-button:hover {
                    background: #60a5fa !important;
                    transform: translateY(-1px) !important;
                  }

                  /* 활성화된 버튼 스타일 */
                  .fc .fc-button-active {
                    background: #3b82f6 !important;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                  }

                  /* today 버튼 스타일 */
                  .fc .fc-today-button {
                    background: #9ca3af !important;
                  }

                  .fc .fc-today-button:hover {
                    background: #60a5fa !important;
                  }

                  .fc .fc-today-button:disabled {
                    background: #9ca3af !important;
                    opacity: 0.7 !important;
                  }

                  /* 버튼 그룹 간격 조정 */
                  .fc .fc-button-group {
                    gap: 0.125rem !important;
                    border-radius: 0.5rem !important;
                  }

                  /* 버튼 그룹 내 첫 번째/마지막 버튼 */
                  .fc .fc-button-group > .fc-button:first-child {
                    border-top-left-radius: 0.5rem !important;
                    border-bottom-left-radius: 0.5rem !important;
                  }

                  .fc .fc-button-group > .fc-button:last-child {
                    border-top-right-radius: 0.5rem !important;
                    border-bottom-right-radius: 0.5rem !important;
                  }

                  /* 시간 레이블과 그리드 스타일 */
                  .fc .fc-timegrid-slot-label {
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    color: #374151 !important;
                    padding: 0.25rem !important;
                  }

                  .fc .fc-timegrid-slot {
                    border-top: 1px solid #e5e7eb !important;
                    height: 2rem !important;
                  }

                  /* 주말 색상 */
                  .fc .fc-day-sun .fc-col-header-cell-cushion {
                    color: #ef4444 !important;
                  }

                  .fc .fc-day-sat .fc-col-header-cell-cushion {
                    color: #3b82f6 !important;
                  }

                  /* 현재 시간 표시선 */
                  .fc .fc-timegrid-now-indicator-line {
                    border-color: #ef4444 !important;
                    border-width: 2px !important;
                    z-index: 10 !important;
                  }

                  /* 오늘 날짜 배경색 */
                  .fc .fc-timegrid-col.fc-day-today {
                    background: var(--primary-bg) !important;
                  }

                  /* 기타 그리드 스타일링 */
                  .fc .fc-timegrid-col {
                    border-left: 1px solid #e5e7eb !important;
                  }

                  .fc .fc-timegrid-axis {
                    border-right: 1px solid #e5e7eb !important;
                  }

                  .fc .fc-col-header-cell {
                    border-bottom: 2px solid #e5e7eb !important;
                    padding: 0.5rem 0 !important;
                  }

                  .fc .fc-timegrid {
                    border: 1px solid #e5e7eb !important;
                  }
                `}</style>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={schedules}
                  slotMinTime="09:00:00"
                  slotMaxTime="22:00:00"
                  allDaySlot={false}
                  locale="ko"
                  height="100%"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

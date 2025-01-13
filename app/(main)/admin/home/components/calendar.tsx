"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const colors = {
  primary: {
    DEFAULT: "#3B82F6",
    hover: "#2563EB",
    light: "#60A5FA",
  },
  surface: {
    light: "#F9FAFB",
    dark: "#1F2937",
    hover: {
      light: "#F3F4F6",
      dark: "#374151",
    },
  },
  text: {
    primary: {
      light: "#111827",
      dark: "#F9FAFB",
    },
    secondary: {
      light: "#4B5563",
      dark: "#9CA3AF",
    },
  },
  border: {
    light: "#E5E7EB",
    dark: "#374151",
  },
  event: {
    pending: {
      bg: "#3B82F6", // primary blue
      border: "#2563EB",
    },
    active: {
      bg: "#10B981", // green
      border: "#059669",
    },
    completed: {
      bg: "#6B7280", // gray
      border: "#4B5563",
    },
    student1: {
      bg: "#F59E0B", // amber
      border: "#D97706",
    },
    student2: {
      bg: "#EC4899", // pink
      border: "#DB2777",
    },
    student3: {
      bg: "#8B5CF6", // violet
      border: "#7C3AED",
    },
    student4: {
      bg: "#06B6D4", // cyan
      border: "#0891B2",
    },
  },
};

interface Schedule {
  id: string;
  startAt: string;
  endAt: string;
  userId?: string;
  status: string;
  user?: {
    id: string;
    name: string;
  };
}

interface EventModalProps {
  event: Schedule | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSave: (start: string, end: string) => void;
}

function EventModal({
  event,
  isOpen,
  onClose,
  onDelete,
  onSave,
}: EventModalProps) {
  const [startTime, setStartTime] = useState(event?.startAt || "");
  const [endTime, setEndTime] = useState(event?.endAt || "");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl"
        >
          <h2 className="text-lg font-semibold mb-4">수업 관리</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                시작 시간
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                종료 시간
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-accent-red text-white rounded hover:bg-accent-red/90"
              >
                삭제
              </button>
              <button
                onClick={() => onSave(startTime, endTime)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
              >
                저장
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-surface-hover-light dark:bg-surface-hover-dark rounded"
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  startTime: string;
  endTime: string;
  onSave: (studentId: string, start: string, end: string) => void;
}

function CreateEventModal({
  isOpen,
  onClose,
  startTime,
  endTime,
  onSave,
}: CreateEventModalProps) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  // props로 받은 시간이 변경될 때 state 업데이트
  useEffect(() => {
    setStart(startTime);
    setEnd(endTime);
  }, [startTime, endTime]);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", search],
    queryFn: async () => {
      const res = await fetch(
        `/api/students/search?q=${encodeURIComponent(search)}`
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl w-[400px]"
        >
          <h2 className="text-lg font-semibold mb-4">새 수업 생성</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                학생 검색
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="학생 이름을 입력하세요"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border rounded">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">검색 중...</div>
              ) : students.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {search ? "검색 결과가 없습니다" : "학생을 검색해주세요"}
                </div>
              ) : (
                students.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedStudent === student.id
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.textbooks[0]?.title || "교재 없음"}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                시작 시간
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                종료 시간
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => onSave(selectedStudent, start, end)}
                disabled={!selectedStudent}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
              >
                저장
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-surface-hover-light dark:bg-surface-hover-dark rounded"
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Calendar() {
  const [mounted, setMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>("timeGridWeek");
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventTimes, setNewEventTimes] = useState({ start: "", end: "" });

  // 컴포넌트가 마운트된 후에만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  // 수업 일정 조회
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();

      // 학생별 색상 매핑을 위한 Map
      const studentColors = new Map();
      let colorIndex = 1;

      return data.map((schedule: Schedule) => {
        // 학생별로 고유한 색상 할당
        if (schedule.user?.id && !studentColors.has(schedule.user.id)) {
          studentColors.set(schedule.user.id, `student${(colorIndex % 4) + 1}`);
          colorIndex++;
        }

        const colorKey = studentColors.get(schedule.user?.id) || "pending";
        const statusColor =
          colors.event[schedule.status as keyof typeof colors.event] ||
          colors.event.pending;
        const studentColor =
          colors.event[colorKey as keyof typeof colors.event];

        return {
          id: schedule.id,
          title: schedule.user?.name || "수업",
          start: schedule.startAt,
          end: schedule.endAt,
          backgroundColor: studentColor.bg,
          borderColor: studentColor.border,
          textColor: "#FFFFFF",
          extendedProps: {
            status: schedule.status,
            userId: schedule.user?.id,
          },
        };
      });
    },
  });

  // 수업 일정 생성
  const createMutation = useMutation({
    mutationFn: async (newSchedule: Omit<Schedule, "id">) => {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  // 수업 일정 수정
  const updateMutation = useMutation({
    mutationFn: async (schedule: Schedule) => {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: schedule.startAt,
          endAt: schedule.endAt,
          status: schedule.status,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update schedule");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  // 수업 일정 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setIsModalOpen(false);
    },
  });

  const handleEventClick = (info: any) => {
    if (currentView !== "timeGridWeek") return;

    setSelectedEvent({
      id: info.event.id,
      startAt: info.event.startStr,
      endAt: info.event.endStr,
      status: info.event.status,
    });
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    if (currentView !== "timeGridWeek") {
      selectInfo.view.unselect();
      return;
    }

    setNewEventTimes({
      start: selectInfo.startStr.slice(0, 16), // 'YYYY-MM-DDTHH:mm' 형식으로 자르기
      end: selectInfo.endStr.slice(0, 16),
    });
    setIsCreateModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    if (currentView !== "timeGridWeek") {
      dropInfo.revert();
      return;
    }

    const { event } = dropInfo;
    await updateMutation.mutateAsync({
      id: event.id,
      startAt: event.startStr,
      endAt: event.endStr,
      status: event.status,
    });
  };

  const handleSave = async (start: string, end: string) => {
    if (selectedEvent) {
      await updateMutation.mutateAsync({
        ...selectedEvent,
        startAt: start,
        endAt: end,
        status: "pending",
      });
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteMutation.mutateAsync(selectedEvent.id);
    }
  };

  const handleCreateSave = async (
    studentId: string,
    start: string,
    end: string
  ) => {
    await createMutation.mutateAsync({
      startAt: new Date(start).toISOString(),
      endAt: new Date(end).toISOString(),
      userId: studentId,
      status: "pending",
    });
    setIsCreateModalOpen(false);
  };

  // 마운트되기 전에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <style jsx global>{`
        .fc {
          --fc-border-color: var(--border-color);
          --fc-page-bg-color: transparent;
          height: 100%;
          color: #111827 !important;
        }

        /* 헤더 영역 개선 */
        .fc .fc-toolbar {
          margin-bottom: 1.5rem !important;
          padding: 1rem !important;
          background: var(--surface-light) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem !important;
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

        /* 버튼 그룹 내 첫 번째 버튼 */
        .fc .fc-button-group > .fc-button:first-child {
          border-top-left-radius: 0.5rem !important;
          border-bottom-left-radius: 0.5rem !important;
        }

        /* 버튼 그룹 내 마지막 버튼 */
        .fc .fc-button-group > .fc-button:last-child {
          border-top-right-radius: 0.5rem !important;
          border-bottom-right-radius: 0.5rem !important;
        }

        /* 시간 레이블 색상 */
        .fc .fc-timegrid-slot-label {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: #374151 !important;
          padding: 0.25rem !important;
        }

        /* 헤더 셀 텍스트 색상 */
        .fc .fc-col-header-cell-cushion {
          color: #111827 !important;
        }

        /* 주말 색상 유지 */
        .fc .fc-day-sun .fc-col-header-cell-cushion {
          color: #ef4444 !important;
        }

        .fc .fc-day-sat .fc-col-header-cell-cushion {
          color: #3b82f6 !important;
        }

        /* 그리드 라인 스타일 */
        .fc .fc-timegrid-slot {
          border-top: 1px solid #e5e7eb !important;
        }

        .fc .fc-timegrid-col.fc-day-today {
          background: var(--primary-bg) !important;
        }

        /* 시간 슬롯 높이 조정 */
        .fc td.fc-timegrid-slot {
          height: 2rem !important;
        }

        /* 세로 구분선 */
        .fc .fc-timegrid-col {
          border-left: 1px solid #e5e7eb !important;
        }

        /* 시간 레이블 구분선 */
        .fc .fc-timegrid-axis {
          border-right: 1px solid #e5e7eb !important;
        }

        /* 시간 구분선 */
        .fc .fc-timegrid-divider {
          border-bottom: 1px solid #e5e7eb !important;
        }

        /* 헤더 구분선 */
        .fc .fc-col-header-cell {
          border-bottom: 2px solid #e5e7eb !important;
          padding: 0.5rem 0 !important;
        }

        /* 전체 테두리 */
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
        editable={currentView === "timeGridWeek"}
        selectable={currentView === "timeGridWeek"}
        selectMirror={true}
        dayMaxEvents={true}
        events={schedules}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        slotMinTime="09:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        locale="ko"
        nowIndicator={true}
        slotEventOverlap={false}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        viewDidMount={(info) => setCurrentView(info.view.type)}
        height="100%"
      />
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        startTime={newEventTimes.start}
        endTime={newEventTimes.end}
        onSave={handleCreateSave}
      />
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { FiX, FiClock } from "react-icons/fi";
import { toast } from "sonner";

interface FixedSchedule {
  id: string;
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface FixedScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  currentTeacherId?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "일요일" },
  { value: 1, label: "월요일" },
  { value: 2, label: "화요일" },
  { value: 3, label: "수요일" },
  { value: 4, label: "목요일" },
  { value: 5, label: "금요일" },
  { value: 6, label: "토요일" },
];

export default function FixedScheduleModal({
  isOpen,
  onClose,
  studentId,
  currentTeacherId,
}: FixedScheduleModalProps) {
  const [schedules, setSchedules] = useState<FixedSchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 0,
    startAt: "09:00",
    endAt: "10:00",
    teacherId: currentTeacherId || "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen, studentId]);

  useEffect(() => {
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

    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `/api/students/${studentId}/fixed-schedules`
      );
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("스케줄을 불러오는데 실패했습니다.");
    }
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [startHour, startMinute] = newSchedule.startAt
        .split(":")
        .map(Number);
      const [endHour, endMinute] = newSchedule.endAt.split(":").map(Number);

      const response = await fetch(
        `/api/students/${studentId}/fixed-schedules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayOfWeek: newSchedule.dayOfWeek,
            startHour,
            startMinute,
            endHour,
            endMinute,
            teacherId: newSchedule.teacherId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error("이미 동일한 시간에 고정 스케줄이 있습니다.", {
            style: {
              background: "#ef4444",
              color: "white",
            },
          });
          return;
        }
        throw new Error("Failed to create schedule");
      }

      toast.success("고정 스케줄이 등록되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
      fetchSchedules();
      setNewSchedule({
        dayOfWeek: 0,
        startAt: "09:00",
        endAt: "10:00",
        teacherId: currentTeacherId || "",
      });
    } catch (error) {
      console.error("Failed to create schedule:", error);
      toast.error("스케줄 등록에 실패했습니다.");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/students/${studentId}/fixed-schedules/${scheduleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete schedule");

      toast.success("고정 스케줄이 삭제되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
      fetchSchedules();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toast.error("스케줄 삭제에 실패했습니다.", {
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiClock className="text-blue-500" />
            고정 스케줄 관리
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              요일
            </label>
            <select
              value={newSchedule.dayOfWeek}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  dayOfWeek: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={newSchedule.startAt}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, startAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={newSchedule.endAt}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, endAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당 선생님
            </label>
            <select
              value={newSchedule.teacherId}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, teacherId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            스케줄 추가
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 mb-2">현재 고정 스케줄</h3>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {DAYS_OF_WEEK[schedule.dayOfWeek].label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(schedule.startHour, schedule.startMinute)} ~{" "}
                    {formatTime(schedule.endHour, schedule.endMinute)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              등록된 고정 스케줄이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

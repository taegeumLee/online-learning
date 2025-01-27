"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiUser,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Schedule {
  id: string;
  startAt: Date;
  endAt: Date;
  status: "pending" | "active" | "completed";
  teacherId: string;
  teacher?: {
    name: string;
    email: string;
  };
}

interface ScheduleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export default function ScheduleManagementModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: ScheduleManagementModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen, studentId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}/schedules`);
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("스케줄을 불러오는데 실패했습니다.", {
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/students/${studentId}/schedules/${scheduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update schedule status");

      toast.success("스케줄 상태가 변경되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
      fetchSchedules();
    } catch (error) {
      console.error("Failed to update schedule status:", error);
      toast.error("상태 변경에 실패했습니다.", {
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    }
  };

  const handleTimeChange = async (
    scheduleId: string,
    startAt: Date | string,
    endAt: Date | string
  ) => {
    try {
      const response = await fetch(
        `/api/students/${studentId}/schedules/${scheduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startAt,
            endAt,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update schedule time");

      toast.success("스케줄 시간이 변경되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error("Failed to update schedule time:", error);
      toast.error("시간 변경에 실패했습니다.", {
        style: {
          background: "#ef4444",
          color: "white",
        },
      });
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("정말 이 스케줄을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/students/${studentId}/schedules?scheduleId=${scheduleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete schedule");

      toast.success("스케줄이 삭제되었습니다.", {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "active":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "수업 대기";
      case "active":
        return "진행중";
      case "completed":
        return "수업 완료";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiCalendar className="text-blue-500" />
            {studentName}님의 스케줄 관리
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-medium">
                      {format(new Date(schedule.startAt), "M월 d일 (E)", {
                        locale: ko,
                      })}
                    </div>
                    {editingSchedule?.id === schedule.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="time"
                          defaultValue={format(
                            new Date(schedule.startAt),
                            "HH:mm"
                          )}
                          className="px-2 py-1 border rounded"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const newStartAt = new Date(schedule.startAt);
                            newStartAt.setHours(hours, minutes);
                            handleTimeChange(
                              schedule.id,
                              newStartAt,
                              schedule.endAt
                            );
                          }}
                        />
                        <span>~</span>
                        <input
                          type="time"
                          defaultValue={format(
                            new Date(schedule.endAt),
                            "HH:mm"
                          )}
                          className="px-2 py-1 border rounded"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const newEndAt = new Date(schedule.endAt);
                            newEndAt.setHours(hours, minutes);
                            handleTimeChange(
                              schedule.id,
                              schedule.startAt,
                              newEndAt
                            );
                          }}
                        />
                        <button
                          onClick={() => setEditingSchedule(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-600 flex items-center gap-2 mt-1">
                        <FiClock className="text-gray-400" />
                        {format(new Date(schedule.startAt), "HH:mm")} ~{" "}
                        {format(new Date(schedule.endAt), "HH:mm")}
                        <button
                          onClick={() => setEditingSchedule(schedule)}
                          className="text-gray-500 hover:text-blue-500 ml-2"
                          title="시간 수정"
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    )}
                    {schedule.teacher && (
                      <div className="text-gray-600 flex items-center gap-2 mt-1">
                        <FiUser className="text-gray-400" />
                        {schedule.teacher.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={schedule.status}
                      onChange={(e) =>
                        handleStatusChange(schedule.id, e.target.value)
                      }
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColor(
                        schedule.status
                      )}`}
                    >
                      <option value="pending">수업 대기</option>
                      <option value="active">진행중</option>
                      <option value="completed">수업 완료</option>
                    </select>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-500 hover:text-red-600 p-1.5"
                      title="스케줄 삭제"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

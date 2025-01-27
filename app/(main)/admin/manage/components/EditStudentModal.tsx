"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  price: number;
  paymentDate: number | null;
  isActive: boolean;
  teacherId: string | null;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (data: Partial<Student>) => void;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSubmit,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    email: "",
    price: 0,
    paymentDate: null,
    isActive: true,
    teacherId: null,
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);

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

  useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        name: student.name,
        email: student.email,
        price: student.price,
        paymentDate: student.paymentDate,
        isActive: student.isActive,
        teacherId: student.teacherId,
      });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen || !student) return null;

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
          <h2 className="text-xl font-bold">학생 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수강료
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="10000"
                required
              />
              <span className="text-gray-500">원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결제일
            </label>
            <input
              type="number"
              value={formData.paymentDate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentDate: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              max="31"
              placeholder="1-31 사이의 날짜"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당 선생님
            </label>
            <select
              value={formData.teacherId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teacherId: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선생님 선택</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              수강중
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

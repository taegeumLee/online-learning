"use client";

import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

interface Course {
  id: string;
  name: string;
  subject: string;
}

interface AddTextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  courses: Course[];
  currentUser: string;
}

export default function AddTextbookModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
  currentUser,
}: AddTextbookModalProps) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<number>(1);
  const [url, setUrl] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [sequence, setSequence] = useState<number>(1);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseSubject, setNewCourseSubject] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let courseId = selectedCourse;

    // 새로운 코스 생성이 필요한 경우
    if (isNewCourse) {
      try {
        const response = await fetch("/api/admin/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newCourseName,
            subject: newCourseSubject,
          }),
        });

        if (!response.ok) throw new Error("Failed to create course");

        const newCourse = await response.json();
        courseId = newCourse.id;
      } catch (error) {
        console.error("Failed to create course:", error);
        return;
      }
    }

    onSubmit({
      title,
      author: currentUser,
      level,
      url,
      courseId,
      sequence,
    });
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setLevel(1);
    setUrl("");
    setSelectedCourse("");
    setSequence(1);
    setIsNewCourse(false);
    setNewCourseName("");
    setNewCourseSubject("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">교재 추가</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              코스
            </label>
            <div className="space-y-3">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setIsNewCourse(e.target.value === "new");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">코스 선택</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.subject})
                  </option>
                ))}
                <option value="new">+ 새 코스 만들기</option>
              </select>

              {isNewCourse && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      코스명
                    </label>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required={isNewCourse}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      과목
                    </label>
                    <input
                      type="text"
                      value={newCourseSubject}
                      onChange={(e) => setNewCourseSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required={isNewCourse}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              교재명
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                레벨
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                순서
              </label>
              <input
                type="number"
                min="1"
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              placeholder="https://example.com/book.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              파일 다운로드 링크나 웹사이트 주소를 입력하세요
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

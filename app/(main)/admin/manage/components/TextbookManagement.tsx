"use client";

import { useState, useEffect } from "react";
import { FiBook, FiPlus, FiFilter, FiEye } from "react-icons/fi";
import AddTextbookModal from "./AddTextbookModal";
import ViewTextbookModal from "./ViewTextbookModal";
import { useSession } from "next-auth/react";

interface Course {
  id: string;
  name: string;
  subject: string;
}

interface Textbook {
  id: string;
  level: number;
  title: string;
  author: string;
  url: string;
  sequence?: number;
  courseId?: string;
  course?: Course;
}

interface CourseData {
  courses: Course[];
  subjects: string[];
  levels: number[];
}

export default function TextbookManagement() {
  const { data: session } = useSession();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [courseData, setCourseData] = useState<CourseData>({
    courses: [],
    subjects: [],
    levels: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 코스 데이터 가져오기
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch("/api/admin/courses");
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };
    fetchCourseData();
  }, []);

  useEffect(() => {
    fetchTextbooks();
  }, [filterCourse, filterSubject, filterLevel, searchQuery]);

  const fetchTextbooks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCourse !== "all") params.append("courseId", filterCourse);
      if (filterSubject !== "all") params.append("subject", filterSubject);
      if (filterLevel !== "all") params.append("level", filterLevel.toString());
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/textbooks?${params.toString()}`);
      const data = await response.json();
      setTextbooks(data);
    } catch (error) {
      console.error("Failed to fetch textbooks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 현재 선택된 코스의 과목 가져오기
  const getFilteredSubjects = () => {
    if (filterCourse === "all") {
      return courseData.subjects;
    }
    const selectedCourse = courseData.courses.find(
      (course) => course.id === filterCourse
    );
    return selectedCourse ? [selectedCourse.subject] : [];
  };

  const handleAddTextbook = async (data: any) => {
    try {
      const response = await fetch("/api/admin/textbooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add textbook");

      fetchTextbooks();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add textbook:", error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FiBook className="text-blue-500" />
              교재 관리
            </h2>

            <div className="flex items-center gap-3">
              <select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setFilterSubject("all");
                }}
                className="w-30 px-3 py-1.5 rounded-md border border-gray-300 text-sm"
              >
                <option value="all">전체 코스</option>
                {courseData.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-30 px-3 py-1.5 rounded-md border border-gray-300 text-sm"
              >
                <option value="all">전체 과목</option>
                {getFilteredSubjects().map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <select
                value={filterLevel}
                onChange={(e) =>
                  setFilterLevel(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-30 px-3 py-1.5 rounded-md border border-gray-300 text-sm"
              >
                <option value="all">전체 레벨</option>
                {courseData.levels.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="교재명 검색"
              className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm"
            />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm flex items-center gap-1.5 hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              <FiPlus />
              교재 추가
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {textbooks.length > 0 ? (
              textbooks.map((textbook) => (
                <div
                  key={textbook.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {textbook.course && (
                        <>
                          <span
                            className={`text-sm font-medium bg-blue-100 ${
                              textbook.course.name === "숙련자"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-blue-100 text-blue-700"
                            } px-2 py-1 rounded whitespace-nowrap`}
                          >
                            {textbook.course.name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {textbook.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {textbook.author}
                        </p>
                        <span className="text-gray-300 flex-shrink-0">|</span>
                        <span className="text-sm text-gray-600 flex-shrink-0">
                          Level {textbook.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTextbook(textbook);
                        setIsViewModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
                      title="교재 보기"
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-8">
                교재가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewTextbookModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTextbook(null);
        }}
        textbook={selectedTextbook}
      />

      <AddTextbookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTextbook}
        courses={courseData.courses}
        currentUser={session?.user?.name || ""}
      />
    </>
  );
}

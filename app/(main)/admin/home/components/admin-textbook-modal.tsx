import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IoBookOutline,
  IoCloseOutline,
  IoChevronForward,
  IoArrowForward,
} from "react-icons/io5";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  subject: string;
  Textbook: {
    id: string;
    title: string;
    level: number;
    sequence: number | null;
    author: string;
    url: string;
    isOwned: boolean;
  }[];
}

interface AdminTextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  currentTextbookId: string | null | undefined;
}

export function AdminTextbookModal({
  isOpen,
  onClose,
  studentId,
  currentTextbookId,
}: AdminTextbookModalProps) {
  const queryClient = useQueryClient();
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["textbooks"],
    queryFn: async () => {
      const res = await fetch("/api/textbooks");
      if (!res.ok) throw new Error("Failed to fetch textbooks");
      return res.json();
    },
  });

  const toastStyle = {
    success: {
      style: {
        background: "#22c55e",
        color: "white",
      },
    },
    error: {
      style: {
        background: "#ef4444",
        color: "white",
      },
    },
  };

  const handleAssignTextbook = async (textbookId: string) => {
    try {
      const response = await fetch(`/api/users/${studentId}/assign-textbook`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textbookId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign textbook");
      }

      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("교재를 전달했습니다.", toastStyle.success);
      onClose();
    } catch (error) {
      console.error("Error assigning textbook:", error);
      toast.error("교재 전달에 실패했습니다.", toastStyle.error);
    }
  };

  const handleAssignNextTextbook = async () => {
    if (!currentTextbookId) return;

    try {
      const response = await fetch(
        `/api/users/${studentId}/assign-next-textbook`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentTextbookId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign next textbook");
      }

      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("다음 교재를 전달했습니다.", toastStyle.success);
      onClose();
    } catch (error) {
      console.error("Error assigning next textbook:", error);
      toast.error("다음 교재 전달에 실패했습니다.", toastStyle.error);
    }
  };

  const courseGroups = {
    초보자: courses.filter((course: Course) => course.name === "초보자"),
    개척자: courses.filter((course: Course) => course.name === "개척자"),
    숙련자: courses.filter((course: Course) => course.name === "숙련자"),
  };

  const groupBySubject = (courseList: Course[]) => {
    const subjects = [...new Set(courseList.map((course) => course.subject))];
    return subjects.sort().map((subject) => ({
      subject,
      textbooks: courseList
        .filter((course) => course.subject === subject)
        .flatMap((course) => course.Textbook),
    }));
  };

  const groupTextbooksByLevel = (textbooks: Course["Textbook"]) => {
    const grouped = textbooks.reduce((acc, textbook) => {
      if (!acc[textbook.level]) {
        acc[textbook.level] = [];
      }
      acc[textbook.level].push(textbook);
      return acc;
    }, {} as Record<number, typeof textbooks>);

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, books]) => ({
        level: Number(level),
        books: books.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
      }));
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
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IoBookOutline className="w-6 h-6" />
            교재 선택
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-full"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {Object.entries(courseGroups).map(([courseName, courseList]) => (
            <div key={courseName}>
              <motion.button
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === courseName ? null : courseName
                  )
                }
                className="w-full flex items-center justify-between p-3 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{courseName}</span>
                </div>
                <motion.div
                  animate={{
                    rotate: expandedCourse === courseName ? 90 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <IoChevronForward className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {expandedCourse === courseName && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-2">
                      {groupBySubject(courseList).map(
                        ({ subject, textbooks }) => (
                          <div key={subject}>
                            <motion.button
                              onClick={() =>
                                setExpandedSubject(
                                  expandedSubject === subject ? null : subject
                                )
                              }
                              className="w-full flex items-center justify-between p-3 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{subject}</span>
                              </div>
                              <motion.div
                                animate={{
                                  rotate: expandedSubject === subject ? 90 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <IoChevronForward className="w-5 h-5" />
                              </motion.div>
                            </motion.button>

                            <AnimatePresence>
                              {expandedSubject === subject && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{
                                    height: "auto",
                                    opacity: 1,
                                  }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 space-y-2">
                                    {groupTextbooksByLevel(textbooks).map(
                                      ({ level, books }) => (
                                        <div key={level}>
                                          <motion.button
                                            onClick={() =>
                                              setExpandedLevel(level)
                                            }
                                            className="w-full flex items-center justify-between p-3 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                Level {level}
                                              </span>
                                            </div>
                                            <motion.div
                                              animate={{
                                                rotate:
                                                  expandedLevel === level
                                                    ? 90
                                                    : 0,
                                              }}
                                              transition={{
                                                duration: 0.2,
                                              }}
                                            >
                                              <IoChevronForward className="w-5 h-5" />
                                            </motion.div>
                                          </motion.button>

                                          <AnimatePresence>
                                            {expandedLevel === level && (
                                              <motion.div
                                                initial={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                                animate={{
                                                  height: "auto",
                                                  opacity: 1,
                                                }}
                                                exit={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                                className="overflow-hidden"
                                              >
                                                <div className="pl-8 pr-4 py-2 space-y-2">
                                                  {books.map((textbook) => (
                                                    <motion.button
                                                      key={textbook.id}
                                                      onClick={() =>
                                                        handleAssignTextbook(
                                                          textbook.id
                                                        )
                                                      }
                                                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark"
                                                      whileHover={{
                                                        x: 4,
                                                      }}
                                                    >
                                                      <div className="text-left flex items-center gap-4">
                                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark w-8">
                                                          {textbook.sequence ||
                                                            "-"}
                                                          .
                                                        </span>
                                                        <div>
                                                          <h4 className="font-medium">
                                                            {textbook.title}
                                                          </h4>
                                                        </div>
                                                      </div>
                                                    </motion.button>
                                                  ))}
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {currentTextbookId && (
          <div className="p-4 border-t border-border-light dark:border-border-dark">
            <button
              onClick={handleAssignNextTextbook}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <span>다음 교재 전달하기</span>
              <IoArrowForward />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

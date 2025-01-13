import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IoBookOutline,
  IoCloseOutline,
  IoChevronForward,
} from "react-icons/io5";
import Image from "next/image";

interface TextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (textbookId: string) => void;
}

interface Course {
  id: string;
  name: string;
  subject: string;
  Textbook: {
    id: string;
    title: string;
    level: number;
    sequence: number;
    author: string;
    url: string;
    isOwned: boolean;
  }[];
}

export function TextbookModal({
  isOpen,
  onClose,
  onSelect,
}: TextbookModalProps) {
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

  const courseGroups = {
    초보자: courses.filter((course) => course.name === "초보자"),
    개척자: courses.filter((course) => course.name === "개척자"),
    숙련자: courses.filter((course) => course.name === "숙련자"),
  };

  const groupTextbooksByLevel = (textbooks: Course["Textbook"]) => {
    const grouped = textbooks.reduce((acc, textbook) => {
      if (!acc[textbook.level]) {
        acc[textbook.level] = [];
      }
      acc[textbook.level].push(textbook);
      return acc;
    }, {} as Record<number, Course["Textbook"]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, books]) => ({
        level: Number(level),
        books: books.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
      }));
  };

  const handleTextbookSelect = async (textbookId: string) => {
    try {
      const response = await fetch("/api/users/recent-textbook", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textbookId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update recent textbook");
      }

      await queryClient.invalidateQueries({ queryKey: ["recent-textbook"] });
      await queryClient.invalidateQueries({
        queryKey: ["textbook", textbookId],
      });

      onSelect(textbookId);
    } catch (error) {
      console.error("Error updating recent textbook:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-4xl overflow-hidden"
        >
          <div className="p-6">
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

            {/* 교재 목록 */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(courseGroups).map(([courseName, courseList]) => (
                <div key={courseName}>
                  <motion.button
                    onClick={() =>
                      setExpandedCourse(
                        expandedCourse === courseName ? null : courseName
                      )
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg bg-background-light dark:bg-background-dark"
                  >
                    <span className="font-medium text-lg">{courseName}</span>
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
                        <div className="pl-6 pr-4 py-2 space-y-2">
                          {courseList.map((course) => (
                            <div key={course.id}>
                              <motion.button
                                onClick={() =>
                                  setExpandedSubject(
                                    expandedSubject === course.subject
                                      ? null
                                      : course.subject
                                  )
                                }
                                className="w-full flex items-center justify-between p-4 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={`/${course.subject.toLowerCase()}.png`}
                                    alt={course.subject}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                  />
                                  <span className="font-medium">
                                    {course.subject}
                                  </span>
                                </div>
                                <motion.div
                                  animate={{
                                    rotate:
                                      expandedSubject === course.subject
                                        ? 90
                                        : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <IoChevronForward className="w-5 h-5" />
                                </motion.div>
                              </motion.button>

                              <AnimatePresence>
                                {expandedSubject === course.subject && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-12 pr-4 py-2 space-y-2">
                                      {groupTextbooksByLevel(
                                        course.Textbook
                                      ).map(({ level, books }) => (
                                        <div key={level}>
                                          <motion.button
                                            onClick={() =>
                                              setExpandedLevel(
                                                expandedLevel === level
                                                  ? null
                                                  : level
                                              )
                                            }
                                            className="w-full flex items-center justify-between p-3 hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark rounded-lg"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="flex-shrink-0 w-10 h-10 bg-primary-bg rounded-lg flex items-center justify-center">
                                                <span className="text-primary font-medium text-sm">
                                                  LV.{level}
                                                </span>
                                              </div>
                                            </div>
                                            <motion.div
                                              animate={{
                                                rotate:
                                                  expandedLevel === level
                                                    ? 90
                                                    : 0,
                                              }}
                                              transition={{ duration: 0.2 }}
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
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                              >
                                                <div className="pl-12 pr-4 py-2 space-y-2">
                                                  {books.map((textbook) => (
                                                    <motion.button
                                                      key={textbook.id}
                                                      onClick={() =>
                                                        textbook.isOwned &&
                                                        handleTextbookSelect(
                                                          textbook.id
                                                        )
                                                      }
                                                      className={`w-full flex items-center gap-4 p-3 rounded-lg ${
                                                        textbook.isOwned
                                                          ? "hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark"
                                                          : "opacity-50 cursor-not-allowed"
                                                      }`}
                                                      whileHover={
                                                        textbook.isOwned
                                                          ? { x: 4 }
                                                          : {}
                                                      }
                                                    >
                                                      <div className="text-left flex items-center gap-4">
                                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark w-8">
                                                          {textbook.sequence ||
                                                            "-"}
                                                          .
                                                        </span>
                                                        <div>
                                                          <h4
                                                            className={`font-medium ${
                                                              !textbook.isOwned &&
                                                              "text-text-secondary-light dark:text-text-secondary-dark"
                                                            }`}
                                                          >
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
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

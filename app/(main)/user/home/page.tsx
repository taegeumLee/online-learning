"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoCalendarOutline,
  IoCallOutline,
  IoBrushOutline,
  IoBookOutline,
} from "react-icons/io5";
import { CalendarModal } from "./components/calendar";
import { TextbookModal } from "./components/textbook-modal";
import { TextbookViewer } from "./components/textbook-viewer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DrawingModal } from "./components/drawing-modal";

export default function Home() {
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTextbookOpen, setIsTextbookOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [selectedTextbookId, setSelectedTextbookId] = useState<string | null>(
    null
  );

  const { data: userData } = useQuery({
    queryKey: ["recent-textbook"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (userData?.recentTextbookId && !selectedTextbookId) {
      setSelectedTextbookId(userData.recentTextbookId);
    }
  }, [userData, selectedTextbookId]);

  const handleSelectTextbook = async (textbookId: string) => {
    setSelectedTextbookId(textbookId);
    setIsTextbookOpen(false);
    await queryClient.invalidateQueries({ queryKey: ["recent-textbook"] });
    await queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background-light dark:bg-background-dark">
      {/* 메인 콘텐츠 영역 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-6 bg-background-light dark:bg-background-dark"
      >
        <div className="h-full bg-surface-light dark:bg-surface-dark rounded-lg shadow-md overflow-hidden">
          <TextbookViewer textbookId={selectedTextbookId} />
        </div>
      </motion.div>

      {/* 오른쪽 사이드 버튼 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-16 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark"
      >
        <div className="h-full flex flex-col items-center py-6 space-y-6">
          <button
            className="p-3 rounded-full hover:bg-primary-bg transition-all duration-200 group"
            title="화상 통화"
          >
            <IoCallOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
          </button>
          <button
            onClick={() => setIsDrawingOpen(true)}
            className="p-3 rounded-full hover:bg-primary-bg transition-all duration-200 group"
            title="그림판"
          >
            <IoBrushOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
          </button>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="p-3 rounded-full hover:bg-primary-bg transition-all duration-200 group"
            title="캘린더"
          >
            <IoCalendarOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
          </button>
          <button
            onClick={() => setIsTextbookOpen(true)}
            className="p-3 rounded-full hover:bg-primary-bg transition-all duration-200 group"
            title="교재 선택"
          >
            <IoBookOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
          </button>
        </div>
      </motion.div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <TextbookModal
        isOpen={isTextbookOpen}
        onClose={() => setIsTextbookOpen(false)}
        onSelect={handleSelectTextbook}
      />

      <DrawingModal
        isOpen={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
      />
    </div>
  );
}

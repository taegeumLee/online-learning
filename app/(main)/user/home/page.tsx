"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoCalendarOutline,
  IoCallOutline,
  IoBrushOutline,
  IoBookOutline,
  IoChatboxOutline,
} from "react-icons/io5";
import { CalendarModal } from "./components/calendar";
import { TextbookModal } from "./components/textbook-modal";
import { TextbookViewer } from "./components/textbook-viewer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DrawingModal } from "./components/drawing-modal";
import { MessageModal } from "./components/message-modal";

export default function Home() {
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTextbookOpen, setIsTextbookOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [selectedTextbookId, setSelectedTextbookId] = useState<string | null>(
    null
  );
  const [isMessageOpen, setIsMessageOpen] = useState(false);

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

  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const res = await fetch("/api/messages/unread");
      if (!res.ok) throw new Error("Failed to fetch unread messages");
      return res.json();
    },
    refetchInterval: 3000,
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
    <div className="flex h-[calc(100vh-5rem)] bg-background-light dark:bg-background-dark overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-6 bg-background-light dark:bg-background-dark relative z-0"
      >
        <div className="h-full bg-surface-light dark:bg-surface-dark rounded-lg shadow-md overflow-hidden">
          <TextbookViewer textbookId={selectedTextbookId} />
        </div>
      </motion.div>

      {/* 오른쪽 사이드 버튼 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-16 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark relative z-10"
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
          <button
            onClick={() => setIsMessageOpen(true)}
            className="p-3 rounded-full hover:bg-primary-bg transition-all duration-200 group relative"
            title="선생님과 대화하기"
          >
            <IoChatboxOutline className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
            {unreadMessages?.count > 0 && (
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-accent-red justify-center items-center text-[10px] text-white">
                    {unreadMessages.count}
                  </span>
                </span>
              </div>
            )}
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

      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
      />
    </div>
  );
}

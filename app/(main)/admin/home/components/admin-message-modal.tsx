"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoSendOutline } from "react-icons/io5";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  isOnline: boolean;
}

interface AdminMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
  };
}

export function AdminMessageModal({ isOpen, onClose }: AdminMessageModalProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 온라인 학생 목록 가져오기
  const { data: onlineStudents = [] } = useQuery({
    queryKey: ["onlineStudents"],
    queryFn: async () => {
      const res = await fetch("/api/students/online");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: isOpen,
  });

  // 선택된 학생과의 메시지 가져오기
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent?.id) return [];
      const res = await fetch(`/api/messages/${selectedStudent.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedStudent?.id && isOpen,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, receiverId: selectedStudent?.id }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedStudent?.id],
      });
    },
    onError: () => {
      toast.error("메시지 전송에 실패했습니다.");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedStudent, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/messages/read", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
    }
  }, [isOpen, queryClient]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-light dark:bg-surface-dark rounded-lg w-[900px] h-[600px] flex"
        >
          {/* 왼쪽 학생 목록 */}
          <div className="w-1/3 border-r border-border-light dark:border-border-dark">
            <div className="p-4 border-b border-border-light dark:border-border-dark">
              <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                온라인 학생 목록
              </h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {onlineStudents.map((student: Student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-4 text-left hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark transition-colors
                    ${
                      selectedStudent?.id === student.id
                        ? "bg-surface-hover-light dark:bg-surface-hover-dark"
                        : ""
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{student.name}</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-online"></span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽 메시지 영역 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border-light dark:border-border-dark">
              <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                {selectedStudent
                  ? `${selectedStudent.name}님과의 대화`
                  : "학생을 선택해주세요"}
              </h2>
            </div>

            {selectedStudent ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex items-end space-x-2 ${
                        msg.senderId === selectedStudent?.id
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      {msg.senderId !== selectedStudent?.id && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                      )}
                      <div
                        className={`max-w-[70%] p-2 rounded-lg ${
                          msg.senderId === selectedStudent?.id
                            ? "bg-surface-hover-light dark:bg-surface-hover-dark"
                            : "bg-primary text-white"
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                      </div>
                      {msg.senderId === selectedStudent?.id && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-border-light dark:border-border-dark"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="메시지를 입력하세요..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                      disabled={!message.trim()}
                    >
                      <IoSendOutline className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
                왼쪽에서 대화할 학생을 선택해주세요
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

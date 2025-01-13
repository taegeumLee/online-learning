"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoSendOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessageModal({ isOpen, onClose }: MessageModalProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지 목록 가져오기
  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch(`/api/messages/teacher`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: isOpen,
    refetchInterval: 3000,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/messages/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
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
          className="bg-surface-light dark:bg-surface-dark rounded-lg w-[500px] h-[600px] flex flex-col"
        >
          <div className="p-4 border-b border-border-light dark:border-border-dark">
            <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              선생님과의 대화
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${
                  msg.senderId === session?.user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.senderId === session?.user?.id && (
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
                    msg.senderId === session?.user?.id
                      ? "bg-primary text-white"
                      : "bg-surface-hover-light dark:bg-surface-hover-dark"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                </div>
                {msg.senderId !== session?.user?.id && (
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark ">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

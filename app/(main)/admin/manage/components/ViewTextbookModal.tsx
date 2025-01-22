"use client";

import { FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { NotionRenderer } from "react-notion-x";
import dynamic from "next/dynamic";
import "react-notion-x/src/styles.css";
import { useEffect } from "react";

// 동적으로 컴포넌트 불러오기
const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then((m) => m.Code)
);
const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);
const Modal = dynamic(() =>
  import("react-notion-x/build/third-party/modal").then((m) => m.Modal)
);
const Pdf = dynamic(() =>
  import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf)
);

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
  course?: Course;
}

interface ViewTextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  textbook: Textbook | null;
}

export default function ViewTextbookModal({
  isOpen,
  onClose,
  textbook,
}: ViewTextbookModalProps) {
  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const { data: notionData } = useQuery({
    queryKey: ["notion-page", textbook?.url],
    queryFn: async () => {
      const pageId = textbook!.url.split("/").pop()?.split("?")[0];
      const response = await fetch(`/api/notion/${pageId}`);
      if (!response.ok) throw new Error("Failed to fetch notion page");
      return response.json();
    },
    enabled: !!textbook?.url && isOpen,
  });

  if (!isOpen || !textbook) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[70vw] h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-500">
              Lv.{textbook.level}
            </span>
            <h2 className="text-lg font-bold">{textbook.title}</h2>
            {textbook.course && (
              <span className="text-sm text-gray-500">
                {textbook.course.name} ({textbook.course.subject})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-auto notion-app notion-frame">
          {notionData ? (
            <NotionRenderer
              recordMap={notionData}
              components={{
                Code,
                Collection,
                Equation,
                Modal,
                Pdf,
              }}
              fullPage={true}
              darkMode={false}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

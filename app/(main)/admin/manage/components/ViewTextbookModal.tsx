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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-[1200px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">교재 정보</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notionData ? (
            <div
              className="notion-app notion-frame"
              style={{
                height: "auto",
                maxHeight: "calc(90vh - 100px)",
                width: "100%",
                maxWidth: "100%",
              }}
            >
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
                className="notion-page-no-cover notion-page-no-padding"
                pageHeader={false}
                pageFooter={false}
                showTableOfContents={true}
                minTableOfContentsItems={1}
                disableHeader={true}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          )}
        </div>

        <style jsx global>{`
          .notion-page {
            padding: 0 !important;
            width: 100% !important;
          }
          .notion-page-content {
            padding: 0 !important;
            width: 100% !important;
            margin-top: 0 !important;
          }
          .notion-page-content-inner {
            max-width: none !important;
            padding: 0 1rem !important;
            margin-top: 0 !important;
          }
          .notion-table {
            max-width: 100% !important;
            font-size: 0.9em !important;
          }
          .notion-text {
            font-size: 0.95em !important;
          }
          .notion-asset-wrapper {
            max-width: 90% !important;
            margin: 0 auto !important;
          }
          /* 목차 스타일 수정 */
          .notion-table-of-contents {
            max-width: 200px !important;
            font-size: 0.85em !important;
            padding: 0.5rem !important;
            margin-top: 0 !important;
          }
          .notion-table-of-contents-item {
            padding: 3px 0 !important;
          }
          /* 추가: 상단 여백 관련 스타일 */
          .notion-header {
            display: none !important;
          }
          .notion-page-scroller {
            margin-top: 0 !important;
          }
        `}</style>
      </div>
    </div>
  );
}

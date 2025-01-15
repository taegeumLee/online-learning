"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { NotionRenderer } from "react-notion-x";
import { NotionAPI } from "notion-client";
import dynamic from "next/dynamic";
import "react-notion-x/src/styles.css";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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

const _notion = new NotionAPI();

interface TextbookViewerProps {
  textbookId: string | null;
}

interface Textbook {
  id: string;
  title: string;
  url: string;
  level: number;
  sequence: number;
}

// sonner import를 dynamic import로 변경
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
});

export function TextbookViewer({ textbookId }: TextbookViewerProps) {
  const queryClient = useQueryClient();

  // 사용자의 최근 교재 ID 조회
  const { data: recentTextbook } = useQuery({
    queryKey: ["recent-textbook"],
    queryFn: async () => {
      if (textbookId) return null;
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      const userData = await res.json();
      return userData.recentTextbookId;
    },
    enabled: !textbookId,
    staleTime: 0,
    refetchInterval: 500, // 0.5초마다 체크
  });

  // 실제 사용할 교재 ID (props로 받은 것 또는 최근 교재)
  const activeTextbookId = textbookId || recentTextbook;

  const { data: textbook } = useQuery<Textbook>({
    queryKey: ["textbook", activeTextbookId],
    queryFn: async () => {
      if (!activeTextbookId) return null;
      const res = await fetch(`/api/textbooks/${activeTextbookId}`);
      if (!res.ok) throw new Error("Failed to fetch textbook");
      return res.json();
    },
    enabled: !!activeTextbookId,
  });

  // activeTextbookId가 변경될 때마다 캐시 무효화
  useEffect(() => {
    if (activeTextbookId) {
      queryClient.invalidateQueries({
        queryKey: ["textbook", activeTextbookId],
      });
    }
  }, [activeTextbookId, queryClient]);

  const { data: notionData } = useQuery({
    queryKey: ["notion-page", textbook?.url],
    queryFn: async () => {
      const pageId = textbook!.url.split("/").pop()?.split("?")[0];
      const response = await fetch(`/api/notion/${pageId}`);
      if (!response.ok) throw new Error("Failed to fetch notion page");
      return response.json();
    },
    enabled: !!textbook?.url,
  });

  // 이전 recentTextbook 값을 저장하기 위한 ref 추가
  const prevRecentTextbookRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  const hasShownToast = useRef(false); // toast 표시 여부를 추적하는 ref 추가

  // recentTextbook이 변경될 때마다 알림 표시 (실제 변경이 있을 때만)
  useEffect(() => {
    // 초기 마운트 시 이전 값 설정
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevRecentTextbookRef.current = recentTextbook;
      return;
    }

    // 실제 변경이 있고, 이전에 toast를 표시하지 않았을 때만 표시
    if (
      recentTextbook &&
      prevRecentTextbookRef.current &&
      prevRecentTextbookRef.current !== recentTextbook &&
      !hasShownToast.current
    ) {
      toast.success("새로운 교재가 전달되었습니다.", {
        style: {
          background: "#22c55e",
          color: "white",
        },
      });
      hasShownToast.current = true;
    }

    prevRecentTextbookRef.current = recentTextbook;
  }, [recentTextbook]);

  // 교재 ID가 변경될 때 toast 표시 가능 상태로 초기화
  useEffect(() => {
    hasShownToast.current = false;
  }, [activeTextbookId]);

  if (!activeTextbookId || !textbook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          교재를 선택해주세요
        </p>
      </div>
    );
  }

  if (!notionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          로딩 중...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <div className="absolute top-8 left-8 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">
            Lv.{textbook.level}
          </span>
          <h1 className="text-sm font-medium">{textbook.title}</h1>
        </div>
      </div>
      <div
        className="h-full overflow-auto notion-app notion-frame"
        style={
          {
            "--notion-header-height": "0px",
          } as React.CSSProperties
        }
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
        />
      </div>
    </motion.div>
  );
}

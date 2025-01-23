"use client";

import { useEffect, useState } from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import { FiTrendingUp } from "react-icons/fi";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RevenueData {
  totalRevenue: number;
  courseRevenue: {
    초보자: number;
    개척자: number;
    숙련자: number;
  };
  paymentCount: number;
  lastMonthRevenue: number;
  revenueChange: number;
  revenueChangePercentage: string | null;
}

export default function RevenueStats() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  const fetchRevenue = async () => {
    try {
      const response = await fetch("/api/admin/revenue");
      const data = await response.json();
      setRevenueData(data);
      setCurrentMonth(format(new Date(), "M월", { locale: ko }));
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  useEffect(() => {
    window.addEventListener("paymentCompleted", fetchRevenue);
    return () => {
      window.removeEventListener("paymentCompleted", fetchRevenue);
    };
  }, []);

  if (loading || !revenueData) {
    return <div>로딩 중...</div>;
  }

  const courseColors = {
    초보자: { text: "text-blue-500", bg: "#3B82F6" },
    개척자: { text: "text-yellow-500", bg: "#F59E0B" },
    숙련자: { text: "text-red-500", bg: "#EF4444" },
  };

  const chartData = {
    labels: Object.keys(revenueData.courseRevenue),
    datasets: [
      {
        data: Object.values(revenueData.courseRevenue),
        backgroundColor: Object.values(courseColors).map((color) => color.bg),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
    cutout: "60%",
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FiTrendingUp className="text-blue-500" />
        {currentMonth} 매출 현황
      </h2>

      {/* 총 매출 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4 ">
        <div className="flex gap-1 items-center mb-3">
          <span className="text-xl font-bold text-blue-600">총 매출</span>
          {/* 지난달 대비 변화 */}
          <span className="text-xs text-gray-600">지난달 대비</span>
          <span
            className={`text-xs ${
              revenueData.revenueChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {revenueData.revenueChange >= 0 ? "+" : ""}
            {revenueData.revenueChange.toLocaleString()}원
            {revenueData.revenueChangePercentage && (
              <span className="text-xs">
                ({revenueData.revenueChange >= 0 ? "+" : ""}
                {revenueData.revenueChangePercentage}%)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-700 flex items-center gap-1">
            <HiCurrencyDollar className="text-3xl" />
            {revenueData.totalRevenue.toLocaleString()}원
          </div>
          <div className="text-sm text-blue-600">
            총 {revenueData.paymentCount}건
          </div>
        </div>
      </div>

      {/* 도넛 차트 */}
      <div className="aspect-square max-w-[300px] mx-auto mb-6">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

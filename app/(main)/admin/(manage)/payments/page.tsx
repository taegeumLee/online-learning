"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { FiFilter, FiChevronLeft, FiSearch } from "react-icons/fi";
import { HiCurrencyDollar } from "react-icons/hi";

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    price: number;
    paymentDate: number | null;
  };
}

type PaymentStatus = "all" | "pending" | "paid" | "overdue";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        const params = new URLSearchParams();
        if (showAllPayments) params.append("all", "true");
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (debouncedQuery) params.append("search", debouncedQuery);

        const response = await fetch(
          `/api/admin/payments?${params.toString()}`
        );
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsData();
  }, [showAllPayments, statusFilter, debouncedQuery]);

  const statusOptions: {
    value: PaymentStatus;
    label: string;
    color: string;
  }[] = [
    { value: "all", label: "전체", color: "gray" },
    { value: "pending", label: "대기", color: "yellow" },
    { value: "paid", label: "완료", color: "green" },
    { value: "overdue", label: "연체", color: "red" },
  ];

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update payment status");

      // 상태 업데이트 후 목록 새로고침
      const fetchPaymentsData = async () => {
        const params = new URLSearchParams();
        if (showAllPayments) params.append("all", "true");
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (debouncedQuery) params.append("search", debouncedQuery);

        const response = await fetch(
          `/api/admin/payments?${params.toString()}`
        );
        const data = await response.json();
        setPayments(data);
      };

      await fetchPaymentsData();
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HiCurrencyDollar className="text-blue-500" />
            결제 내역
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름으로 검색"
              className="pl-9 pr-4 py-1.5 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  statusFilter === option.value
                    ? `bg-${option.color}-100 text-${option.color}-700 border border-${option.color}-300`
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAllPayments(!showAllPayments)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 border transition-colors ${
              showAllPayments
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-blue-500"
            }`}
          >
            <FiFilter />
            {showAllPayments ? "최근 한 달" : "전체 내역"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-border-light">
        <div className="grid grid-cols-4 gap-4 p-4 font-medium text-gray-600 border-b">
          <div>학생</div>
          <div>금액</div>
          <div>상태</div>
          <div>결제일자</div>
        </div>
        <div className="divide-y">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50"
            >
              <div>{payment.user.name}</div>
              <div className="font-medium">
                {payment.amount.toLocaleString()}원
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={payment.status}
                  onChange={(e) =>
                    handleStatusChange(payment.id, e.target.value)
                  }
                  className={`px-2 py-1 rounded-full text-sm border ${
                    payment.status === "paid"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : payment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  <option value="paid">완료</option>
                  <option value="pending">대기</option>
                  <option value="overdue">연체</option>
                </select>
              </div>
              <div className="text-gray-600">
                {format(
                  new Date(
                    payment.status === "paid"
                      ? payment.updatedAt
                      : payment.createdAt
                  ),
                  "yyyy년 M월 d일",
                  { locale: ko }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

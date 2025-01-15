"use client";

import { useEffect, useState } from "react";
import {
  FiUsers,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiList,
} from "react-icons/fi";
import { HiCurrencyDollar } from "react-icons/hi";
import { format, parseISO, getDate } from "date-fns";
import { ko } from "date-fns/locale";

interface Payment {
  status: "pending" | "paid" | "overdue";
  amount: number;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  price: number;
  paymentDate: string | null;
  Payment: Payment[];
}

export default function PaymentManagement() {
  const [unpaidStudents, setUnpaidStudents] = useState<User[]>([]);
  const [overdueStudents, setOverdueStudents] = useState<User[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students/payment-status");
        const data = await response.json();

        const unpaid: User[] = [];
        const overdue: User[] = [];

        data.forEach((student: User) => {
          const latestPayment = student.Payment[0];
          if (!latestPayment || latestPayment.status === "pending") {
            unpaid.push(student);
          } else if (latestPayment.status === "overdue") {
            overdue.push(student);
          }
        });

        setUnpaidStudents(unpaid);
        setOverdueStudents(overdue);
        setTotalStudents(data.length);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);

  const getStatusIcon = (status: "paid" | "overdue") => {
    switch (status) {
      case "paid":
        return <FiCheckCircle className="text-green-500" />;
      case "overdue":
        return <FiAlertCircle className="text-red-500" />;
    }
  };

  const handlePaymentComplete = async (userId: string) => {
    try {
      setRemovingId(userId);
      const response = await fetch("/api/students/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to update payment");

      const studentsResponse = await fetch("/api/students/payment-status");
      const data = await studentsResponse.json();

      const unpaid: User[] = [];
      const overdue: User[] = [];

      data.forEach((student: User) => {
        const latestPayment = student.Payment[0];
        if (!latestPayment || latestPayment.status === "pending") {
          unpaid.push(student);
        } else if (latestPayment.status === "overdue") {
          overdue.push(student);
        }
      });

      setUnpaidStudents(unpaid);
      setOverdueStudents(overdue);
      setTotalStudents(data.length);
      setRemovingId(null);
    } catch (error) {
      console.error("Failed to complete payment:", error);
      setRemovingId(null);
    }
  };

  const PaymentCard = ({
    student,
    status,
  }: {
    student: User;
    status: "unpaid" | "overdue";
  }) => {
    const latestPayment = student.Payment[0];
    const paymentDay = student.paymentDate
      ? getDate(parseISO(student.paymentDate))
      : null;

    const displayAmount = latestPayment?.amount ?? student.price;

    return (
      <div
        className={`p-3 rounded-lg shadow transition-all payment-card ${
          removingId === student.id ? "hidden" : ""
        }`}
        style={{
          backgroundColor: status === "unpaid" ? "#FEE2E2" : "#FEF3C7",
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <FiUser
              className={`transition-colors ${
                status === "unpaid" ? "text-red-500" : "text-yellow-500"
              }`}
            />
            <span className="font-medium">
              {student.name}
              {paymentDay && (
                <span className="ml-2 text-sm text-gray-500">
                  (매월 {paymentDay}일)
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <HiCurrencyDollar
              className={`transition-colors ${
                status === "unpaid" ? "text-red-400" : "text-yellow-400"
              }`}
            />
            <span
              className={`transition-colors ${
                status === "unpaid" ? "text-red-600" : "text-yellow-600"
              }`}
            >
              {displayAmount.toLocaleString()}원
            </span>
          </div>
          <button
            onClick={() => handlePaymentComplete(student.id)}
            className="px-3 py-1.5 rounded-md text-sm border border-green-500 text-green-600 bg-white hover:bg-green-500 hover:text-white transition-all duration-200 flex items-center gap-1.5 group"
            onMouseEnter={(e) => {
              const card = e.currentTarget.closest(
                ".payment-card"
              ) as HTMLElement;
              if (card) {
                card.style.backgroundColor = "#DCFCE7";
                // 아이콘과 텍스트 색상 변경
                const icons = card.querySelectorAll("svg");
                const texts = card.querySelectorAll("span:not(.text-gray-500)");
                icons.forEach((icon) => {
                  if (
                    icon.classList.contains("text-red-400") ||
                    icon.classList.contains("text-red-500")
                  ) {
                    icon.classList.remove("text-red-400", "text-red-500");
                    icon.classList.add("text-green-500");
                  }
                });
                texts.forEach((text) => {
                  if (text.classList.contains("text-red-600")) {
                    text.classList.remove("text-red-600");
                    text.classList.add("text-green-600");
                  }
                });
              }
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget.closest(
                ".payment-card"
              ) as HTMLElement;
              if (card) {
                card.style.backgroundColor =
                  status === "unpaid" ? "#FEE2E2" : "#FEF3C7";
                // 원래 색상으로 복구
                const icons = card.querySelectorAll("svg");
                const texts = card.querySelectorAll("span:not(.text-gray-500)");
                icons.forEach((icon) => {
                  if (icon.classList.contains("text-green-500")) {
                    icon.classList.remove("text-green-500");
                    icon.classList.add(
                      status === "unpaid" ? "text-red-500" : "text-yellow-500"
                    );
                  }
                });
                texts.forEach((text) => {
                  if (text.classList.contains("text-green-600")) {
                    text.classList.remove("text-green-600");
                    text.classList.add(
                      status === "unpaid" ? "text-red-600" : "text-yellow-600"
                    );
                  }
                });
              }
            }}
          >
            <FiCheckCircle className="group-hover:scale-110 transition-transform duration-200" />
            결제 완료
          </button>
        </div>
        {latestPayment && latestPayment.status !== "pending" && (
          <div className="flex items-center gap-2 mt-1.5">
            {getStatusIcon(latestPayment.status as "paid" | "overdue")}
            <span className="text-sm text-gray-500">
              마지막 결제일:{" "}
              {new Date(latestPayment.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HiCurrencyDollar className="text-blue-500" />
          결제 관리
        </h2>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-3 py-1.5 rounded-md flex items-center gap-2 text-blue-600 text-sm">
            <FiUsers className="text-lg" />
            <span>총 {totalStudents}명</span>
          </div>
          <button
            onClick={() => (window.location.href = "/admin/payments")}
            className="w-8 h-8 rounded-md flex items-center justify-center border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 relative group"
            title="전체 결제내역"
          >
            <FiList className="text-lg" />
            <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              전체 결제내역
            </span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-2">
          {/* 모든 학생 리스트 */}
          {(unpaidStudents.length > 0 || overdueStudents.length > 0) && (
            <div className="flex flex-col gap-3">
              {[...unpaidStudents, ...overdueStudents].map((student) => (
                <PaymentCard
                  key={student.id}
                  student={student}
                  status={
                    unpaidStudents.includes(student) ? "unpaid" : "overdue"
                  }
                />
              ))}
            </div>
          )}

          {/* 모든 학생이 결제한 경우 */}
          {unpaidStudents.length === 0 && overdueStudents.length === 0 && (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-3">
              <FiCheckCircle className="text-5xl text-green-500" />
              <div>
                <p className="text-xl font-medium">
                  모든 학생의 결제가 완료되었습니다.
                </p>
                <p className="text-sm mt-1">총 {totalStudents}명</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

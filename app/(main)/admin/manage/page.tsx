"use client";

import { motion } from "framer-motion";
import PaymentManagement from "./components/PaymentManagement";
import RevenueStats from "./components/RevenueStats";
import TextbookManagement from "./components/TextbookManagement";
import StudentManagement from "./components/StudentManagement";

export default function Manage() {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <div className="flex w-full h-[calc(100vh-6rem)] p-4 gap-4">
      {/* 왼쪽 섹션 */}
      <motion.div
        className="w-1/4 bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow h-full overflow-auto scrollbar-hide border border-border-light"
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        {...hoverVariants}
      >
        <RevenueStats />
      </motion.div>

      {/* 오른쪽 섹션들 */}
      <div className="w-3/4 grid grid-cols-5 grid-rows-3 gap-4 h-full">
        {/* 학생 관리 섹션을 먼저 배치 */}
        <motion.div
          className="col-span-3 row-span-2 bg-background-light rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-border-light h-full"
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          {...hoverVariants}
        >
          <StudentManagement />
        </motion.div>

        {/* 결제관리 */}
        <motion.div
          className="col-span-2 bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow overflow-auto scrollbar-hide border border-border-light"
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          {...hoverVariants}
        >
          <PaymentManagement />
        </motion.div>

        {/* 교재관리를 아래로 이동 */}
        <motion.div
          className="col-span-3 bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow overflow-auto scrollbar-hide border border-border-light"
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          {...hoverVariants}
        >
          <TextbookManagement />
        </motion.div>

        {/* 나머지 섹션 */}
        {[6].map((section) => (
          <motion.div
            key={section}
            className="col-span-2 row-span-2 bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow overflow-auto scrollbar-hide border border-border-light"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            {...hoverVariants}
          >
            섹션 {section}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import PaymentManagement from "./components/PaymentManagement";
import RevenueStats from "./components/RevenueStats";

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
    <div className="flex w-full h-screen p-4 gap-4">
      {/* 왼쪽 섹션 */}
      <motion.div
        className="w-1/3 bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow h-full overflow-auto scrollbar-hide border border-border-light"
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        {...hoverVariants}
      >
        <RevenueStats />
      </motion.div>

      {/* 오른쪽 섹션들 */}
      <div className="w-2/3 grid grid-cols-2 grid-rows-3 gap-4 h-full">
        <motion.div
          className="bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow overflow-auto scrollbar-hide border border-border-light"
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          {...hoverVariants}
        >
          <PaymentManagement />
        </motion.div>
        {[2, 3, 4, 5, 6].map((section) => (
          <motion.div
            key={section}
            className="bg-background-light rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow overflow-auto scrollbar-hide border border-border-light"
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

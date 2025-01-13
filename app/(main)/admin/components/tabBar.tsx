"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/public/vercel.svg";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoLogOutOutline } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react";

export default function TabBar() {
  const session = useSession();
  const pathname = usePathname();

  const tabs = [
    { name: "홈", href: "/admin/home" },
    { name: "관리", href: "/admin/manage" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="w-full border-b border-border-dark bg-secondary-default">
      <div className="flex w-full h-20 mx-auto px-4">
        <nav className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-8">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={Logo}
                alt="Logo"
                width={50}
                height={50}
                className="invert"
              />
            </motion.div>
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="relative flex items-center px-3 py-2 text-sm font-medium"
                  >
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? "text-primary"
                          : "text-text-dark hover:text-primary-light"
                      }`}
                    >
                      {tab.name}
                    </span>

                    {/* 밑줄 애니메이션 */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="flex items-center space-x-4">
            <h1 className="text-sm font-medium">
              {session?.data?.user?.name}
              {session?.data?.user?.role === "admin" ? "선생님" : "학생"}
            </h1>
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-accent-red hover:bg-accent-red/10 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2">
                <IoLogOutOutline className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
                <span className="text-sm font-medium">로그아웃</span>
              </div>
            </motion.button>
          </div>
        </nav>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "회원가입에 실패했습니다.");
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("자동 로그인에 실패했습니다.");
      }

      router.replace("/admin/home");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">
            회원가입
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
              >
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 rounded-md border border-border-light dark:border-border-dark
                  bg-background-light dark:bg-background-dark
                  text-text-primary-light dark:text-text-primary-dark
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 rounded-md border border-border-light dark:border-border-dark
                  bg-background-light dark:bg-background-dark
                  text-text-primary-light dark:text-text-primary-dark
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-md border border-border-light dark:border-border-dark
                  bg-background-light dark:bg-background-dark
                  text-text-primary-light dark:text-text-primary-dark
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && <p className="text-sm text-accent-red mt-2">{error}</p>}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 mt-4 bg-primary hover:bg-primary-hover text-white rounded-md
                transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </motion.button>
          </form>
          <p className="mt-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-hover font-medium"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { IconBrandGithub } from "@tabler/icons-react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn.social({
        provider: "github",
        callbackURL: "/",
      });
      if (error) {
        console.error("Login Error:", error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gitlytics AI</h1>
          <p className="text-gray-400">
            AI-powered analytics for your GitHub workflow
          </p>
        </div>

        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconBrandGithub className="w-5 h-5" />
          {isLoading ? "Redirecting..." : "Continue with GitHub"}
        </button>

        <p className="mt-6 text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

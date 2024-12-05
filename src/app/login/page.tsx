"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { Github, Twitter } from "lucide-react";
import Image from "next/image";


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [initializeDatabase, setInitializeDatabase] = useState(true);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        switch (result.error) {
          case "Please enter email and password":
            setError("Please enter email and password");
            break;
          case "User does not exist":
            setError("用户不存在");
            break;
          case "Incorrect password":
            setError("密码错误");
            break;
          default:
            setError("登录失败,请重试");
        }
      } else {
        if (initializeDatabase) {
          try {
            const initResponse = await fetch("/api/settings/initSettings");
            const result = await initResponse.json();
            
            if (result.status !== 'success') {
              // 处理初始化失败的情况
              setError(result.message || "数据库初始化失败");
              return;
            }
          } catch (error) {
            // 处理网络错误或解析错误
            setError("数据库初始化失败");
            return;
          }
        }
        router.push("/admin/collections");
        router.refresh();
      }
    } catch (error) {
      setError("登录失败,请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 左侧品牌区域 */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-blue-100 p-12 text-black">
        <div className="max-w-xl mx-auto flex flex-col justify-center">
          <Image 
            src="/logo.svg"
            alt="Pintree Logo"
            width={40}
            height={40}
            className="mb-8"
          />
          <h1 className="text-4xl font-bold mb-6">
            Welcome to Pintree
          </h1>
          <p className="text-xl opacity-90 leading-relaxed">
            A powerful bookmark management platform to help you better organize and share web resources.
          </p>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* 移动端 Logo */}
          <div className="md:hidden text-center mb-8">
            <Image 
              src="/logo.svg"
              alt="Pintree Logo"
              width={60}
              height={60}
              className="mx-auto"
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Login to Admin</h2>
            <p className="mt-2 text-gray-600">Manage your bookmark collections</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email Address"
                required
                autoComplete="email"
                className="h-12"
              />
              <Input
                name="password"
                type="password"
                label="Password"
                required
                autoComplete="current-password"
                className="h-12"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label> */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={initializeDatabase}
                  onChange={(e) => setInitializeDatabase(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">Initialize Database</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}

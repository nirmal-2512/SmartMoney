import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", data);

      setAuth(
        res.data.user,
        res.data.accessToken,
        res.data.refreshToken
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10101d] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/smartMoney_logo_purple.png"
              alt="SmartMoney"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <span className="text-2xl font-semibold tracking-tight text-white">
              Smart<span className="text-indigo-400">Money</span>
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-[#16161f] border border-white/[0.07] shadow-2xl shadow-black/30 rounded-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-semibold text-white">
              Welcome back
            </CardTitle>

            <CardDescription className="text-gray-400">
              Sign in to continue to your SmartMoney account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm text-gray-300"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  className={`h-11 bg-[#10101d] border-white/[0.09] text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                    errors.email ? "border-red-500/70" : ""
                  }`}
                />

                {errors.email && (
                  <p className="text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm text-gray-300"
                  >
                    Password
                  </Label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={`h-11 bg-[#10101d] border-white/[0.09] text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                    errors.password ? "border-red-500/70" : ""
                  }`}
                />

                {errors.password && (
                  <p className="text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign in */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-1 border-t border-white/[0.07]" />

                <span className="px-3 text-xs text-gray-600 uppercase tracking-wider">
                  or
                </span>

                <div className="flex-1 border-t border-white/[0.07]" />
              </div>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-transparent border-white/[0.09] text-gray-200 hover:bg-white/[0.04] hover:text-white rounded-lg"
                onClick={() =>
                  (window.location.href = `${
                    import.meta.env.VITE_API_URL ||
                    "http://localhost:3000"
                  }/auth/google`)
                }
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>

                Continue with Google
              </Button>
            </form>

            {/* Register */}
            <div className="mt-7 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Your finances. One clear picture.
        </p>
      </div>
    </div>
  );
}
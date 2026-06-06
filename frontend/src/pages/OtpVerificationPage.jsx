import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  const { email } = location.state || {};

  const [digits, setDigits] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const otp = digits.join("");

  const verifyMutation = useMutation({
    mutationFn: (data) => api.post("/auth/verify-otp", data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      api.post("/categories/seed").catch(() => {});
      toast({
        title: "Email verified",
        description: "Welcome to SmartMoney!",
      });
      navigate("/dashboard");
    },
    onError: (err) => {
      toast({
        title: "Verification failed",
        description: err.response?.data?.error?.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => api.post("/auth/forgot-password", { email }),
    onSuccess: () => {
      toast({
        title: "OTP resent",
        description: `A new code was sent to ${email}`,
      });
    },
    onError: () => {
      toast({ title: "Failed to resend", variant: "destructive" });
    },
  });

  function handleChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const updated = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(updated);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) return;
    verifyMutation.mutate({ email, otp });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border rounded-lg bg-background
                            border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify email"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Did not receive a code?{" "}
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50"
              >
                {resendMutation.isPending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
//this is to check the rename for this file

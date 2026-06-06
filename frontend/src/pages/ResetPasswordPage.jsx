import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { userId, email } = location.state || {};

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const inputRefs = useRef([]);

  const otp = digits.join("");

  // Step 1: verify OTP — returns resetToken
  const verifyMutation = useMutation({
    mutationFn: (data) => api.post("/auth/verify-reset-otp", data),
    onSuccess: (res) => {
      resetMutation.mutate({ resetToken: res.data.resetToken, newPassword });
    },
    onError: (err) => {
      toast({
        title: "Invalid code",
        description:
          err.response?.data?.error?.message || "OTP incorrect or expired",
        variant: "destructive",
      });
    },
  });

  // Step 2: submit new password with resetToken
  const resetMutation = useMutation({
    mutationFn: (data) => api.post("/auth/reset-password", data),
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    },
    onError: (err) => {
      toast({
        title: "Reset failed",
        description:
          err.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  function handleDigitChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({ userId, otp });
  }

  const isPending = verifyMutation.isPending || resetMutation.isPending;

  if (!userId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">No reset session found.</p>
            <Link
              to="/forgot-password"
              className="text-primary underline underline-offset-4"
            >
              Start over
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter the code sent to{" "}
            <span className="font-medium text-foreground">{email}</span> and
            choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-2 block">Verification code</Label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border rounded-lg bg-background
                              border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || !newPassword || isPending}
            >
              {isPending ? "Resetting..." : "Reset password"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link
                to="/forgot-password"
                className="text-primary underline underline-offset-4 hover:no-underline"
              >
                Resend code
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
//this is to check the renname for this file

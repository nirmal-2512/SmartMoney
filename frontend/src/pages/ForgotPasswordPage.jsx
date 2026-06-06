import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => api.post("/auth/forgot-password", data),
    onSuccess: (res) => {
      const userId = res.data.userId;
      toast({
        title: "OTP sent",
        description: `Check ${email} for your reset code.`,
      });
      if (userId) {
        navigate("/reset-password", { state: { userId, email } });
      }
    },
    onError: () => {
      toast({ title: "Something went wrong", variant: "destructive" });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ email });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a reset code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send reset code"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-primary underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, 
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: (data) =>
      api.post("/auth/forgot-password", data),

    onSuccess: (res) => {
      const userId = res.data.userId;

      toast({
        title: "Reset code sent",
        description: `Check ${email} for your reset code.`,
      });

      if (userId) {
        navigate("/reset-password", {
          state: {
            userId,
            email,
          },
        });
      }
    },

    onError: () => {
      toast({
        title: "Something went wrong",
        description:
          "We couldn't send your reset code. Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description:
          "Please enter the email associated with your account.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      email: email.trim(),
    });
  }

  return (
    <div className="auth-page">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="auth-background">
        <div className="background-glow background-glow-one" />
        <div className="background-glow background-glow-two" />
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="auth-container">
        {/* ===================================================
            BRAND
        ==================================================== */}

        <Link
          to="/login"
          className="auth-brand"
          aria-label="Back to SmartMoney sign in"
        >
          <div className="brand-logo">
            <img
              src="/smartMoney_logo_purple.png"
              alt="SmartMoney"
            />
          </div>

          <span>SmartMoney</span>
        </Link>

        {/* ===================================================
            FORM PANEL
        ==================================================== */}

        <section className="auth-panel">
          {/* Icon */}
          <div className="auth-icon">
            <Mail className="h-5 w-5" />
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1>Forgot your password?</h1>

            <p>
              Enter the email associated with your SmartMoney
              account and we'll send you a reset code.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="field-group">
              <Label
                htmlFor="email"
                className="field-label"
              >
                Email address
              </Label>

              <div className="input-wrapper">
                <Mail className="input-icon h-4 w-4" />

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoFocus
                  autoComplete="email"
                  className="auth-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="submit-button"
            >
              {mutation.isPending ? (
                <>
                  <span className="loading-spinner" />
                  Sending code...
                </>
              ) : (
                <>
                  Send reset code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Back to login */}
          <Link
            to="/login"
            className="back-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </section>

        {/* ===================================================
            SECURITY NOTE
        ==================================================== */}

        <div className="security-note">
          <div className="security-icon">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <span className="security-title">
              Secure account recovery
            </span>

            <span className="security-text">
              Your reset code will be sent securely to your
              registered email.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <Sparkles className="h-3 w-3" />
          <span>SmartMoney</span>
          <span className="footer-dot">•</span>
          <span>Personal finance, simplified.</span>
        </div>
      </main>

      <style>{`
        /* =====================================================
           PAGE
        ====================================================== */

        .auth-page {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          overflow: hidden;
          background: #0c0c12;
          color: #f4f4f7;
        }

        /* =====================================================
           BACKGROUND
        ====================================================== */

        .auth-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .background-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.08;
        }

        .background-glow-one {
          top: -220px;
          left: -180px;
          background: #8b5cf6;
        }

        .background-glow-two {
          right: -220px;
          bottom: -220px;
          background: #6366f1;
        }

        /* Very subtle grid */
        .auth-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 25%,
              black 75%,
              transparent
            );
        }

        /* =====================================================
           CONTAINER
        ====================================================== */

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* =====================================================
           BRAND
        ====================================================== */

        .auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          color: #f1f1f5;
          text-decoration: none;
          outline: none;
        }

        .auth-brand:focus-visible {
          border-radius: 10px;
          box-shadow:
            0 0 0 2px rgba(139, 92, 246, 0.4);
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          overflow: hidden;
          border-radius: 11px;
          background: #181820;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 6px 18px rgba(0,0,0,0.25);
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .auth-brand span {
          font-size: 17px;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        /* =====================================================
           PANEL
        ====================================================== */

        .auth-panel {
          width: 100%;
          padding: 34px;
          border-radius: 18px;
          background:
            rgba(18, 18, 26, 0.92);
          border: 1px solid rgba(255,255,255,0.075);
          box-shadow:
            0 24px 70px rgba(0,0,0,0.34),
            0 2px 8px rgba(0,0,0,0.18);
          backdrop-filter: blur(18px);
        }

        /* =====================================================
           ICON
        ====================================================== */

        .auth-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border-radius: 12px;
          color: #b9a7ff;
          background: rgba(139,92,246,0.10);
          border: 1px solid rgba(139,92,246,0.14);
        }

        /* =====================================================
           HEADING
        ====================================================== */

        .auth-heading {
          margin-bottom: 28px;
        }

        .auth-heading h1 {
          margin: 0 0 9px;
          color: #f5f5f7;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 650;
          letter-spacing: -0.035em;
        }

        .auth-heading p {
          margin: 0;
          max-width: 350px;
          color: #858594;
          font-size: 13px;
          line-height: 1.65;
        }

        /* =====================================================
           FORM
        ====================================================== */

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          color: #b7b7c3;
          font-size: 11px;
          font-weight: 550;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 13px;
          transform: translateY(-50%);
          color: #5f5f70;
          pointer-events: none;
          transition: color 150ms ease;
        }

        .input-wrapper:focus-within .input-icon {
          color: #9f88ed;
        }

        .auth-input {
          width: 100%;
          height: 46px;
          padding-left: 40px;
          border-radius: 10px;
          color: #ededf2;
          background: #0f0f16;
          border: 1px solid rgba(255,255,255,0.085);
          font-size: 13px;
          box-shadow: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .auth-input::placeholder {
          color: #555565;
        }

        .auth-input:hover {
          border-color: rgba(255,255,255,0.12);
        }

        .auth-input:focus {
          background: #101019;
          border-color: rgba(139,92,246,0.55);
          box-shadow:
            0 0 0 3px rgba(139,92,246,0.09);
        }

        /* =====================================================
           SUBMIT
        ====================================================== */

        .submit-button {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 10px;
          color: #fff;
          background: #7c5ce6;
          font-size: 12.5px;
          font-weight: 600;
          box-shadow:
            0 8px 20px rgba(124,92,230,0.18);
          transition:
            background 150ms ease,
            transform 150ms ease,
            box-shadow 150ms ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #8869ed;
          box-shadow:
            0 10px 25px rgba(124,92,230,0.25);
        }

        .submit-button:active:not(:disabled) {
          transform: scale(0.985);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: auth-spin 700ms linear infinite;
        }

        @keyframes auth-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           BACK LINK
        ====================================================== */

        .back-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 22px;
          color: #777787;
          font-size: 11.5px;
          font-weight: 500;
          text-decoration: none;
          transition: color 150ms ease;
        }

        .back-link:hover {
          color: #b9a7ff;
        }

        /* =====================================================
           SECURITY
        ====================================================== */

        .security-note {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 16px;
          padding: 12px 13px;
          border-radius: 11px;
          background: rgba(255,255,255,0.018);
          border: 1px solid rgba(255,255,255,0.045);
        }

        .security-icon {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          color: #8f84ad;
          background: rgba(139,92,246,0.065);
        }

        .security-note > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-top: 1px;
        }

        .security-title {
          color: #898997;
          font-size: 9.5px;
          font-weight: 600;
        }

        .security-text {
          color: #575766;
          font-size: 9px;
          line-height: 1.45;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .auth-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 22px;
          color: #454552;
          font-size: 9px;
          font-weight: 500;
        }

        .auth-footer svg {
          color: #6e5aa5;
        }

        .footer-dot {
          color: #383844;
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 480px) {
          .auth-page {
            padding: 24px 16px;
            align-items: center;
          }

          .auth-brand {
            margin-bottom: 22px;
          }

          .auth-panel {
            padding: 25px 21px;
            border-radius: 15px;
          }

          .auth-heading h1 {
            font-size: 23px;
          }

          .auth-heading p {
            font-size: 12.5px;
          }

          .security-note {
            margin-top: 12px;
          }

          .auth-footer {
            margin-top: 18px;
          }
        }

        @media (max-height: 650px) {
          .auth-page {
            padding-top: 16px;
            padding-bottom: 16px;
          }

          .auth-brand {
            margin-bottom: 16px;
          }

          .auth-panel {
            padding-top: 22px;
            padding-bottom: 22px;
          }

          .auth-icon {
            margin-bottom: 14px;
          }

          .auth-heading {
            margin-bottom: 20px;
          }

          .security-note,
          .auth-footer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
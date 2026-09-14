import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  User,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";


/* =========================================================
   CURRENCIES
========================================================= */

const currencies = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "AUD",
  "CAD",
  "JPY",
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  /* =======================================================
     PROFILE FORM
  ======================================================= */

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    setValue,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      defaultCurrency:
        user?.defaultCurrency || "INR",
    },
  });


  /* =======================================================
     PASSWORD FORM
  ======================================================= */

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset,
  } = useForm();


  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);

    try {
      const res = await api.patch(
        "/users/me",
        data
      );

      updateUser(res.data.user);

      toast({
        title: "Profile updated",
        description:
          "Your account details have been saved.",
      });
    } catch (err) {
      toast({
        title: "Unable to update profile",
        description:
          err.response?.data?.error?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };


  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);

    try {
      await api.patch(
        "/users/me/password",
        data
      );

      toast({
        title: "Password changed",
        description:
          "Your password has been updated successfully.",
      });

      reset();
    } catch (err) {
      toast({
        title: "Unable to change password",
        description:
          err.response?.data?.error?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };


  /* =======================================================
     INITIALS
  ======================================================= */

  const initials =
    user?.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";


  const isLocalAccount =
    user?.authProvider === "local";


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="sm-profile-page">

      <style>{`

        /* =====================================================
           BASE
        ===================================================== */

        .sm-profile-page {
          --bg: #08080D;
          --surface: #111119;
          --surface-2: #15151F;
          --surface-3: #1A1A25;

          --text: #F7F7FB;
          --muted: #9292A5;
          --muted-2: #686879;

          --green: #00D6A0;
          --blue: #5B8CFF;
          --purple: #9B6CFF;
          --red: #FF7070;

          width: 100%;
          min-height: 100vh;

          color: var(--text);

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(155,108,255,0.055),
              transparent 28%
            ),
            radial-gradient(
              circle at 100% 15%,
              rgba(0,214,160,0.045),
              transparent 28%
            ),
            var(--bg);

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          overflow-x: hidden;
        }


        /* =====================================================
           LAYOUT
        ===================================================== */

        .sm-profile-container {
          width: min(
            1180px,
            calc(100% - 40px)
          );

          margin: 0 auto;

          padding:
            30px
            0
            70px;
        }


        .sm-profile-layout {
          display: grid;

          grid-template-columns:
            250px
            minmax(0, 1fr);

          gap: 18px;

          align-items: start;
        }


        /* =====================================================
           BUBBLE
        ===================================================== */

        .sm-bubble {
          background:
            radial-gradient(
              circle at 100% 0,
              rgba(255,255,255,0.025),
              transparent 35%
            ),
            var(--surface);

          border:
            1px solid
            rgba(255,255,255,0.065);

          border-radius: 28px;

          box-shadow:
            0 20px 60px
            rgba(0,0,0,0.16),

            inset 0 1px 0
            rgba(255,255,255,0.025);
        }


        /* =====================================================
           LEFT PROFILE
        ===================================================== */

        .sm-profile-sidebar {
          padding: 18px;

          position: sticky;
          top: 84px;
        }


        .sm-profile-identity {
          padding: 8px 4px 20px;
        }


        .sm-profile-avatar-wrap {
          position: relative;

          width: fit-content;

          margin-bottom: 15px;
        }


        .sm-profile-avatar {
          width: 72px;
          height: 72px;

          border:
            1px solid
            rgba(255,255,255,0.1);

          background:
            linear-gradient(
              145deg,
              rgba(155,108,255,0.2),
              rgba(91,140,255,0.1)
            );

          color: #B9A8FF;

          font-size: 22px;
          font-weight: 800;
        }


        .sm-online-dot {
          position: absolute;

          right: 2px;
          bottom: 3px;

          width: 13px;
          height: 13px;

          border-radius: 50%;

          background: var(--green);

          border:
            3px solid
            var(--surface);

          box-shadow:
            0 0 12px
            rgba(0,214,160,0.6);
        }


        .sm-profile-name {
          margin: 0;

          color: var(--text);

          font-size: 16px;
          font-weight: 800;

          letter-spacing: -0.02em;

          word-break: break-word;
        }


        .sm-profile-email {
          margin: 5px 0 0;

          color: var(--muted);

          font-size: 11px;

          line-height: 1.5;

          word-break: break-word;
        }


        .sm-profile-provider {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          margin-top: 11px;

          padding:
            5px
            8px;

          border-radius: 9px;

          color: var(--muted);

          background:
            rgba(255,255,255,0.04);

          border:
            1px solid
            rgba(255,255,255,0.05);

          font-size: 9px;
          font-weight: 700;

          text-transform: capitalize;
        }


        /* =====================================================
           SIDEBAR NAV
        ===================================================== */

        .sm-profile-nav {
          display: flex;

          flex-direction: column;

          gap: 4px;

          padding-top: 16px;
        }


        .sm-profile-nav-item {
          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            10px
            11px;

          border-radius: 12px;

          color: var(--muted);

          font-size: 11px;
          font-weight: 600;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .sm-profile-nav-item.active {
          color: var(--green);

          background:
            rgba(0,214,160,0.08);
        }


        .sm-profile-nav-icon {
          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(255,255,255,0.035);
        }


        .sm-profile-nav-item.active
        .sm-profile-nav-icon {
          background:
            rgba(0,214,160,0.11);
        }


        /* =====================================================
           MAIN AREA
        ===================================================== */

        .sm-profile-main {
          min-width: 0;
        }


        .sm-profile-header {
          margin-bottom: 18px;
        }


        .sm-profile-eyebrow {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          margin-bottom: 7px;

          color: #B5A5FF;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }


        .sm-profile-eyebrow-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: var(--purple);

          box-shadow:
            0 0 12px
            rgba(155,108,255,0.7);
        }


        .sm-profile-title {
          margin: 0;

          color: var(--text);

          font-size: clamp(
            27px,
            4vw,
            36px
          );

          line-height: 1.05;

          font-weight: 900;

          letter-spacing: -0.05em;
        }


        .sm-profile-subtitle {
          margin: 8px 0 0;

          color: var(--muted);

          font-size: 13px;

          line-height: 1.6;
        }


        /* =====================================================
           QUICK BUBBLES
        ===================================================== */

        .sm-quick-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 12px;

          margin-bottom: 18px;
        }


        .sm-quick-card {
          position: relative;

          min-height: 116px;

          padding: 17px;

          overflow: hidden;

          border-radius: 22px;

          background: var(--surface-2);

          border:
            1px solid
            rgba(255,255,255,0.055);

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }


        .sm-quick-card:hover {
          transform: translateY(-2px);

          background: var(--surface-3);
        }


        .sm-quick-card::after {
          content: "";

          position: absolute;

          width: 130px;
          height: 130px;

          right: -70px;
          bottom: -75px;

          border-radius: 50%;

          background: var(--quick-glow);

          opacity: 0.12;

          filter: blur(28px);

          pointer-events: none;
        }


        .sm-quick-icon {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: var(--quick-bg);

          margin-bottom: 12px;
        }


        .sm-quick-title {
          margin: 0;

          color: var(--text);

          font-size: 12px;
          font-weight: 800;
        }


        .sm-quick-description {
          margin: 4px 0 0;

          color: var(--muted);

          font-size: 10px;

          line-height: 1.45;
        }


        .sm-quick-arrow {
          position: absolute;

          right: 15px;
          top: 15px;

          color: var(--muted-2);
        }


        /* =====================================================
           CONTENT BUBBLE
        ===================================================== */

        .sm-content-bubble {
          padding: 23px;

          margin-bottom: 18px;
        }


        .sm-content-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 21px;
        }


        .sm-content-title {
          margin: 0;

          color: var(--text);

          font-size: 17px;
          font-weight: 800;

          letter-spacing: -0.02em;
        }


        .sm-content-description {
          margin: 5px 0 0;

          color: var(--muted);

          font-size: 11px;

          line-height: 1.6;
        }


        .sm-heading-icon {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          background:
            rgba(91,140,255,0.09);

          color: var(--blue);
        }


        /* =====================================================
           IDENTITY ROW
        ===================================================== */

        .sm-account-row {
          display: flex;
          align-items: center;

          gap: 12px;

          padding: 14px;

          margin-bottom: 20px;

          border-radius: 17px;

          background: var(--surface-2);

          border:
            1px solid
            rgba(255,255,255,0.05);
        }


        .sm-small-avatar {
          width: 43px;
          height: 43px;

          border-radius: 14px;

          background:
            rgba(155,108,255,0.12);

          color: #B8A8FF;

          font-size: 13px;
          font-weight: 800;
        }


        .sm-account-info {
          min-width: 0;
        }


        .sm-account-name {
          margin: 0;

          color: var(--text);

          font-size: 12px;
          font-weight: 700;
        }


        .sm-account-email {
          margin: 3px 0 0;

          color: var(--muted);

          font-size: 10px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        .sm-verified {
          margin-left: auto;

          display: inline-flex;
          align-items: center;

          gap: 5px;

          color: var(--green);

          font-size: 9px;
          font-weight: 700;

          white-space: nowrap;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .sm-form-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 15px;
        }


        .sm-form-field {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .sm-form-field.full {
          grid-column:
            1 / -1;
        }


        .sm-form-label {
          color: #B6B6C5;

          font-size: 10px;
          font-weight: 700;
        }


        .sm-form-input {
          height: 43px;

          background: var(--surface-2) !important;

          border:
            1px solid
            rgba(255,255,255,0.07) !important;

          border-radius: 13px !important;

          color: var(--text) !important;

          font-size: 11px !important;
        }


        .sm-form-input::placeholder {
          color: #5F5F70 !important;
        }


        .sm-form-input:focus {
          border-color:
            rgba(91,140,255,0.45) !important;

          box-shadow:
            0 0 0 3px
            rgba(91,140,255,0.07) !important;
        }


        .sm-select-trigger {
          height: 43px;

          background: var(--surface-2) !important;

          border:
            1px solid
            rgba(255,255,255,0.07) !important;

          border-radius: 13px !important;

          color: var(--text) !important;

          font-size: 11px !important;
        }


        .sm-form-footer {
          display: flex;

          justify-content: flex-end;

          padding-top: 18px;

          margin-top: 18px;

          border-top:
            1px solid
            rgba(255,255,255,0.055);
        }


        .sm-save-button {
          height: 40px;

          padding:
            0
            17px;

          border-radius: 12px !important;

          background: var(--blue) !important;

          color: white !important;

          font-size: 11px !important;
          font-weight: 700 !important;

          box-shadow:
            0 8px 24px
            rgba(91,140,255,0.16);
        }


        .sm-save-button:hover {
          background: #709AFF !important;
        }


        /* =====================================================
           SECURITY
        ===================================================== */

        .sm-security-grid {
          display: grid;

          grid-template-columns:
            0.75fr
            1.25fr;

          gap: 18px;
        }


        .sm-security-intro {
          padding: 17px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(155,108,255,0.075),
              rgba(91,140,255,0.035)
            );

          border:
            1px solid
            rgba(155,108,255,0.1);
        }


        .sm-security-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 13px;

          border-radius: 14px;

          color: var(--purple);

          background:
            rgba(155,108,255,0.1);
        }


        .sm-security-title {
          margin: 0;

          color: var(--text);

          font-size: 12px;
          font-weight: 800;
        }


        .sm-security-text {
          margin: 6px 0 0;

          color: var(--muted);

          font-size: 10px;

          line-height: 1.55;
        }


        .sm-security-form {
          display: flex;

          flex-direction: column;

          gap: 14px;
        }


        .sm-security-button {
          align-self: flex-end;

          height: 39px;

          padding:
            0
            16px;

          border-radius: 11px !important;

          background:
            transparent !important;

          border:
            1px solid
            rgba(255,255,255,0.08) !important;

          color: #D7D7E2 !important;

          font-size: 10px !important;
          font-weight: 700 !important;
        }


        .sm-security-button:hover {
          background:
            rgba(255,255,255,0.045) !important;

          color: white !important;
        }


        /* =====================================================
           ACCOUNT DETAILS
        ===================================================== */

        .sm-details-list {
          border-radius: 19px;

          overflow: hidden;

          background: var(--surface-2);

          border:
            1px solid
            rgba(255,255,255,0.05);
        }


        .sm-detail-row {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding:
            13px
            15px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.045);
        }


        .sm-detail-row:last-child {
          border-bottom: none;
        }


        .sm-detail-label {
          color: var(--muted);

          font-size: 10px;
        }


        .sm-detail-value {
          color: #DCDCE5;

          font-size: 10px;
          font-weight: 600;

          text-align: right;

          word-break: break-word;
        }


        .sm-detail-value.green {
          color: var(--green);
        }


        .sm-detail-value.amber {
          color: #F5A623;
        }


        .sm-detail-value.mono {
          color: #858597;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size: 9px;
        }


        /* =====================================================
           SPINNER
        ===================================================== */

        .sm-spinner {
          width: 14px;
          height: 14px;

          border:
            2px solid
            rgba(255,255,255,0.3);

          border-top-color: white;

          border-radius: 50%;

          animation:
            sm-spin 0.7s linear infinite;
        }


        @keyframes sm-spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .sm-profile-layout {
            grid-template-columns:
              210px
              minmax(0, 1fr);
          }

          .sm-security-grid {
            grid-template-columns: 1fr;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .sm-profile-container {
            width: calc(100% - 24px);

            padding:
              20px
              0
              50px;
          }


          .sm-profile-layout {
            display: flex;

            flex-direction: column;

            gap: 12px;
          }


          .sm-profile-sidebar {
            position: static;

            width: 100%;

            padding: 15px;
          }


          .sm-profile-identity {
            display: flex;
            align-items: center;

            gap: 13px;

            padding: 3px;
          }


          .sm-profile-avatar-wrap {
            margin: 0;
          }


          .sm-profile-avatar {
            width: 58px;
            height: 58px;

            font-size: 18px;
          }


          .sm-profile-info-mobile {
            min-width: 0;
          }


          .sm-profile-provider {
            margin-top: 7px;
          }


          .sm-profile-nav {
            display: none;
          }


          .sm-profile-title {
            font-size: 29px;
          }


          .sm-profile-subtitle {
            font-size: 12px;
          }


          .sm-quick-grid {
            grid-template-columns: 1fr 1fr;

            gap: 8px;
          }


          .sm-quick-card {
            min-height: 105px;

            padding: 13px;

            border-radius: 19px;
          }


          .sm-quick-title {
            font-size: 10px;
          }


          .sm-quick-description {
            font-size: 9px;
          }


          .sm-content-bubble {
            padding: 17px;

            border-radius: 23px;
          }


          .sm-form-grid {
            grid-template-columns: 1fr;

            gap: 13px;
          }


          .sm-form-field.full {
            grid-column: auto;
          }


          .sm-account-row {
            padding: 11px;

            border-radius: 15px;
          }


          .sm-verified {
            display: none;
          }


          .sm-security-grid {
            grid-template-columns: 1fr;
          }


          .sm-security-intro {
            padding: 14px;

            border-radius: 17px;
          }


          .sm-security-button {
            width: 100%;

            align-self: stretch;
          }


          .sm-form-footer {
            justify-content: stretch;
          }


          .sm-save-button {
            width: 100%;
          }


          .sm-detail-row {
            align-items: flex-start;

            flex-direction: column;

            gap: 4px;
          }


          .sm-detail-value {
            text-align: left;
          }

        }


        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

          .sm-profile-container {
            width: calc(100% - 18px);
          }


          .sm-quick-card {
            min-height: 98px;
          }


          .sm-quick-description {
            max-width: 90px;
          }


          .sm-content-title {
            font-size: 15px;
          }

        }

      `}</style>


      <main className="sm-profile-container">

        {/* ===================================================
            LAYOUT
        =================================================== */}

        <div className="sm-profile-layout">


          {/* =================================================
              LEFT PROFILE PANEL
          ================================================= */}

          <aside className="sm-bubble sm-profile-sidebar">

            <div className="sm-profile-identity">

              <div className="sm-profile-avatar-wrap">

                <Avatar className="sm-profile-avatar">
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className="sm-online-dot" />

              </div>


              <div className="sm-profile-info-mobile">

                <h2 className="sm-profile-name">
                  {user?.fullName || "User"}
                </h2>

                <p className="sm-profile-email">
                  {user?.email ||
                    "No email available"}
                </p>

                <span className="sm-profile-provider">

                  <ShieldCheck
                    size={11}
                  />

                  {user?.authProvider ||
                    "local"}{" "}
                  account

                </span>

              </div>

            </div>


            <Separator
              className="bg-white/[0.055]"
            />


            {/* PROFILE NAV */}

            <nav className="sm-profile-nav">

              <div
                className="
                  sm-profile-nav-item
                  active
                "
              >

                <span className="sm-profile-nav-icon">
                  <User size={13} />
                </span>

                My account

              </div>


              <div className="sm-profile-nav-item">

                <span className="sm-profile-nav-icon">
                  <Globe2 size={13} />
                </span>

                Preferences

              </div>


              {isLocalAccount && (
                <div className="sm-profile-nav-item">

                  <span className="sm-profile-nav-icon">
                    <LockKeyhole size={13} />
                  </span>

                  Security

                </div>
              )}

            </nav>


            {/* SIDEBAR FOOTER */}

            <div
              className="hidden sm:block mt-6 pt-4"
              style={{
                borderTop:
                  "1px solid rgba(255,255,255,0.055)",
              }}
            >

              <div
                className="flex items-center gap-2"
                style={{
                  color: "#686879",
                  fontSize: "9px",
                  lineHeight: 1.5,
                }}
              >

                <Sparkles
                  size={12}
                  color="#9B6CFF"
                />

                SmartMoney account

              </div>

              <p
                className="mt-2"
                style={{
                  color: "#555566",
                  fontSize: "9px",
                  lineHeight: 1.5,
                }}
              >
                Keep your account details
                up to date for a better
                experience.
              </p>

            </div>

          </aside>


          {/* =================================================
              MAIN
          ================================================= */}

          <section className="sm-profile-main">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="sm-profile-header">

              <div className="sm-profile-eyebrow">

                <span className="sm-profile-eyebrow-dot" />

                Account center

              </div>

              <h1 className="sm-profile-title">
                Profile
              </h1>

              <p className="sm-profile-subtitle">
                Manage your SmartMoney identity,
                preferences and account security.
              </p>

            </header>


            {/* =================================================
                QUICK BUBBLES
            ================================================= */}

            <div className="sm-quick-grid">


              {/* ACCOUNT */}

              <div
                className="sm-quick-card"
                style={{
                  "--quick-bg":
                    "rgba(91,140,255,0.1)",
                  "--quick-glow":
                    "#5B8CFF",
                }}
              >

                <div className="sm-quick-icon">

                  <User
                    size={17}
                    color="#5B8CFF"
                  />

                </div>

                <h3 className="sm-quick-title">
                  My Account
                </h3>

                <p className="sm-quick-description">
                  Your personal identity
                  and account information.
                </p>

                <ArrowRight
                  className="sm-quick-arrow"
                  size={14}
                />

              </div>


              {/* PREFERENCES */}

              <div
                className="sm-quick-card"
                style={{
                  "--quick-bg":
                    "rgba(0,214,160,0.09)",
                  "--quick-glow":
                    "#00D6A0",
                }}
              >

                <div className="sm-quick-icon">

                  <Globe2
                    size={17}
                    color="#00D6A0"
                  />

                </div>

                <h3 className="sm-quick-title">
                  Preferences
                </h3>

                <p className="sm-quick-description">
                  Set your default currency
                  for SmartMoney.
                </p>

                <ArrowRight
                  className="sm-quick-arrow"
                  size={14}
                />

              </div>

            </div>


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="sm-bubble sm-content-bubble">

              <div className="sm-content-heading">

                <div>

                  <h2 className="sm-content-title">
                    Personal information
                  </h2>

                  <p className="sm-content-description">
                    Update the details associated
                    with your SmartMoney account.
                  </p>

                </div>


                <div className="sm-heading-icon">

                  <User size={16} />

                </div>

              </div>


              {/* ACCOUNT IDENTITY */}

              <div className="sm-account-row">

                <Avatar className="sm-small-avatar">

                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>

                </Avatar>


                <div className="sm-account-info">

                  <p className="sm-account-name">
                    {user?.fullName ||
                      "User"}
                  </p>

                  <p className="sm-account-email">
                    {user?.email ||
                      "No email available"}
                  </p>

                </div>


                <div className="sm-verified">

                  <CheckCircle2
                    size={12}
                  />

                  {user?.isEmailVerified
                    ? "Verified"
                    : "Unverified"}

                </div>

              </div>


              {/* PROFILE FORM */}

              <form
                onSubmit={handleProfile(
                  onProfileSubmit
                )}
              >

                <div className="sm-form-grid">


                  {/* FULL NAME */}

                  <div className="sm-form-field">

                    <Label
                      htmlFor="fullName"
                      className="sm-form-label"
                    >
                      Full name
                    </Label>

                    <Input
                      id="fullName"
                      {...regProfile(
                        "fullName",
                        {
                          required:
                            "Full name is required",
                        }
                      )}
                      className="sm-form-input"
                      placeholder="Your full name"
                    />

                  </div>


                  {/* CURRENCY */}

                  <div className="sm-form-field">

                    <Label
                      htmlFor="defaultCurrency"
                      className="sm-form-label"
                    >
                      Default currency
                    </Label>

                    <Select
                      onValueChange={(value) =>
                        setValue(
                          "defaultCurrency",
                          value
                        )
                      }
                      defaultValue={
                        user?.defaultCurrency ||
                        "INR"
                      }
                    >

                      <SelectTrigger
                        id="defaultCurrency"
                        className="sm-select-trigger"
                      >

                        <SelectValue
                          placeholder="Select currency"
                        />

                      </SelectTrigger>

                      <SelectContent>

                        {currencies.map(
                          (currency) => (
                            <SelectItem
                              key={currency}
                              value={currency}
                            >
                              {currency}
                            </SelectItem>
                          )
                        )}

                      </SelectContent>

                    </Select>

                  </div>


                  {/* EMAIL */}

                  <div className="sm-form-field full">

                    <Label className="sm-form-label">
                      Email address
                    </Label>

                    <div className="relative">

                      <Mail
                        size={14}
                        style={{
                          position:
                            "absolute",
                          left: 13,
                          top: 14,
                          color:
                            "#686879",
                          pointerEvents:
                            "none",
                        }}
                      />

                      <Input
                        value={
                          user?.email || ""
                        }
                        readOnly
                        className="sm-form-input pl-9 opacity-70"
                      />

                    </div>

                  </div>

                </div>


                {/* SAVE */}

                <div className="sm-form-footer">

                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="sm-save-button"
                  >

                    {profileLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="sm-spinner" />
                        Saving...
                      </span>
                    ) : (
                      <>
                        Save changes
                        <ArrowRight
                          size={14}
                        />
                      </>
                    )}

                  </Button>

                </div>

              </form>

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            {isLocalAccount && (

              <section className="sm-bubble sm-content-bubble">

                <div className="sm-content-heading">

                  <div>

                    <h2 className="sm-content-title">
                      Security
                    </h2>

                    <p className="sm-content-description">
                      Keep your SmartMoney
                      account protected.
                    </p>

                  </div>


                  <div
                    className="sm-heading-icon"
                    style={{
                      background:
                        "rgba(155,108,255,0.09)",
                      color: "#9B6CFF",
                    }}
                  >

                    <LockKeyhole size={16} />

                  </div>

                </div>


                <div className="sm-security-grid">


                  {/* SECURITY INTRO */}

                  <div className="sm-security-intro">

                    <div className="sm-security-icon">

                      <KeyRound size={18} />

                    </div>

                    <h3 className="sm-security-title">
                      Change your password
                    </h3>

                    <p className="sm-security-text">
                      Use a strong password
                      that you do not reuse
                      on other websites.
                    </p>

                  </div>


                  {/* PASSWORD FORM */}

                  <form
                    onSubmit={handlePassword(
                      onPasswordSubmit
                    )}
                    className="sm-security-form"
                  >

                    {/* CURRENT */}

                    <div className="sm-form-field">

                      <Label
                        htmlFor="currentPassword"
                        className="sm-form-label"
                      >
                        Current password
                      </Label>

                      <Input
                        id="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        {...regPassword(
                          "currentPassword",
                          {
                            required:
                              "Current password is required",
                          }
                        )}
                        className="sm-form-input"
                      />

                    </div>


                    {/* NEW */}

                    <div className="sm-form-field">

                      <Label
                        htmlFor="newPassword"
                        className="sm-form-label"
                      >
                        New password
                      </Label>

                      <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        {...regPassword(
                          "newPassword",
                          {
                            required:
                              "New password is required",
                            minLength: {
                              value: 8,
                              message:
                                "Password must be at least 8 characters",
                            },
                          }
                        )}
                        className="sm-form-input"
                      />

                    </div>


                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="sm-security-button"
                    >

                      {passwordLoading ? (
                        <span className="flex items-center justify-center gap-2">

                          <span
                            className="sm-spinner"
                            style={{
                              borderTopColor:
                                "#D7D7E2",
                              borderColor:
                                "rgba(215,215,226,0.25)",
                            }}
                          />

                          Changing...

                        </span>
                      ) : (
                        <>
                          Change password
                          <ArrowRight
                            size={13}
                          />
                        </>
                      )}

                    </Button>

                  </form>

                </div>

              </section>

            )}


            {/* =================================================
                ACCOUNT DETAILS
            ================================================= */}

            <section className="sm-bubble sm-content-bubble">

              <div className="sm-content-heading">

                <div>

                  <h2 className="sm-content-title">
                    Account details
                  </h2>

                  <p className="sm-content-description">
                    Information about your
                    SmartMoney account.
                  </p>

                </div>


                <div
                  className="sm-heading-icon"
                  style={{
                    background:
                      "rgba(0,214,160,0.08)",
                    color: "#00D6A0",
                  }}
                >

                  <ShieldCheck size={16} />

                </div>

              </div>


              <div className="sm-details-list">


                {/* USER ID */}

                <div className="sm-detail-row">

                  <span className="sm-detail-label">
                    User ID
                  </span>

                  <span className="sm-detail-value mono">
                    {user?.id || "N/A"}
                  </span>

                </div>


                {/* EMAIL */}

                <div className="sm-detail-row">

                  <span className="sm-detail-label">
                    Email verification
                  </span>

                  <span
                    className={`sm-detail-value ${
                      user?.isEmailVerified
                        ? "green"
                        : "amber"
                    }`}
                  >
                    {user?.isEmailVerified
                      ? "Verified"
                      : "Not verified"}
                  </span>

                </div>


                {/* SIGN IN */}

                <div className="sm-detail-row">

                  <span className="sm-detail-label">
                    Sign-in method
                  </span>

                  <span className="sm-detail-value">
                    {user?.authProvider ||
                      "local"}
                  </span>

                </div>


                {/* CURRENCY */}

                <div className="sm-detail-row">

                  <span className="sm-detail-label">
                    Default currency
                  </span>

                  <span className="sm-detail-value">
                    {user?.defaultCurrency ||
                      "INR"}
                  </span>

                </div>


                {/* MEMBER SINCE */}

                <div className="sm-detail-row">

                  <span className="sm-detail-label">
                    Member since
                  </span>

                  <span className="sm-detail-value">

                    {user?.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "N/A"}

                  </span>

                </div>

              </div>

            </section>


          </section>

        </div>

      </main>

    </div>
  );
}
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import BudgetsPage from "@/pages/BudgetsPage";
import ReportsPage from "@/pages/ReportsPage";
import ImportsPage from "@/pages/ImportsPage";
import AiChatPage from "@/pages/AiChatPage";
import AiReportPage from "@/pages/AiReportPage";
import AnomaliesPage from "@/pages/AnomaliesPage";
import ProfilePage from "@/pages/ProfilePage";
import OtpVerificationPage from "./pages/OtpVerificationPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import LoansPage from "./pages/LoansPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/imports" element={<ImportsPage />} />
                <Route path="/ai/chat" element={<AiChatPage />} />
                <Route path="/ai/report" element={<AiReportPage />} />
                <Route path="/anomalies" element={<AnomaliesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/verify-otp" element={<OtpVerificationPage />} />
                <Route path="/loans" element={<LoansPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

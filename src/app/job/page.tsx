import JobPage from "@/admin-pages/JobPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Job Portal | BolteK Enterprise",
  robots: { index: false, follow: false },
};

export default function JobDashboardPage() {
  return (
    <ProtectedRoute>
      <JobPage />
    </ProtectedRoute>
  );
}

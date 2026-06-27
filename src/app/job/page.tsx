import JobPage from "@/admin-pages/JobPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Job Portal | BolteK Enterprise",
  robots: { index: false, follow: false },
};

export default function JobDashboardPage() {
  return <JobPage />;
}

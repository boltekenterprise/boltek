import Login from "@/admin-pages/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | BolteK Enterprise",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <Login />;
}

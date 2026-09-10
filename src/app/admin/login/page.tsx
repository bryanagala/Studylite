import { Suspense } from "react";
import AdminLoginForm from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AdminLoginForm />
    </Suspense>
  );
}

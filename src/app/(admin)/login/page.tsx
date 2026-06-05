import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Yönetici Girişi — KAF Motors" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </main>
  );
}

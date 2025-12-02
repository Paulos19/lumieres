import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();

  // Lógica de proteção: Se logado, manda para o dashboard
  if (session) {
    redirect("/atelier");
  }

  return (
    <div className="h-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2960&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-deep-900/80 backdrop-blur-sm" />
      <div className="relative z-10">
        <RegisterForm />
      </div>
    </div>
  );
}
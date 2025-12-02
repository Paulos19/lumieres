import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth"; // Importe o auth
import { redirect } from "next/navigation"; // Importe o redirect

export default async function LoginPage() {
  const session = await auth();

  // Se já estiver logado, não deve ver a tela de login
  if (session) {
    redirect("/atelier");
  }

  return (
    <div className="h-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1544025162-d76690b67f11?q=80&w=2960&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-deep-900/80 backdrop-blur-sm" />
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
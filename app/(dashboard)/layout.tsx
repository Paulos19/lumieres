import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/dashboard/user-nav";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteção de Rota: Se não estiver logado, tchau.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-deep-900 text-stone-100 font-sans">
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-deep-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/atelier" className="group">
                <h2 className="font-display text-2xl text-white tracking-widest group-hover:text-gold-500 transition-colors">Lumière</h2>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
                <Link href="/atelier" className="text-sm uppercase tracking-widest text-stone-400 hover:text-gold-400 transition-colors">
                    Atelier
                </Link>
                <Link href="/my-recipes" className="text-sm uppercase tracking-widest text-stone-400 hover:text-gold-400 transition-colors">
                    Minhas Receitas
                </Link>
            </nav>
          </div>

          <UserNav />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";
import { UserNav } from "@/components/dashboard/user-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/routing";
import { getTranslations } from 'next-intl/server';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Captura o locale
  const session = await auth();

  if (!session) {
    redirect({ href: "/login", locale: locale });
  }

  const t = await getTranslations('Dashboard');

  return (
    <div className="min-h-screen bg-deep-900 text-stone-100 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-deep-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/atelier" className="group">
                <h2 className="font-display text-2xl text-white tracking-widest group-hover:text-gold-500 transition-colors">
                  Lumière
                </h2>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/atelier" 
                  className="text-sm uppercase tracking-widest text-stone-400 hover:text-gold-400 transition-colors"
                >
                    {t('atelier')}
                </Link>
                <Link 
                  href="/my-recipes" 
                  className="text-sm uppercase tracking-widest text-stone-400 hover:text-gold-400 transition-colors"
                >
                    {t('my_recipes')}
                </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {/* CORREÇÃO: Passando o locale para o componente */}
            <UserNav locale={locale} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
import { MODULES } from "@/lib/constants";
import { ModuleCard } from "@/components/dashboard/module-card";
import { auth } from "@/auth";

export default async function AtelierPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Chef";

  return (
    <div className="animate-fade-in">
      {/* Hero Section do Dashboard */}
      <div className="mb-16 text-center">
        <span className="text-gold-500 text-xs uppercase tracking-[0.3em] block mb-4">Bem-vindo ao seu Atelier</span>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-6">
          Bonjour, <span className="text-gold-400">{firstName}</span>
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto font-serif italic text-lg">
          Selecione uma inspiração abaixo para começar a criar sua próxima obra-prima gastronômica.
        </p>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
        {MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
      
      <footer className="text-center text-stone-600 text-xs uppercase tracking-widest border-t border-white/5 pt-8 pb-8">
        <p>&copy; 2024 Lumière Festin. Haute Cuisine Digital.</p>
      </footer>
    </div>
  );
}
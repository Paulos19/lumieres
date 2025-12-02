import { MODULES } from "@/lib/constants";
import { ModuleCard } from "@/components/dashboard/module-card";
import { auth } from "@/auth";
import { getTranslations } from 'next-intl/server';

export default async function AtelierPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Chef";

  // 1. Carregamos as traduções necessárias (Dashboard e Modules)
  const t = await getTranslations('Dashboard');
  const tModules = await getTranslations('Modules');

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <span className="text-gold-500 text-xs uppercase tracking-[0.3em] block mb-4">
          Concierge Lumière
        </span>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-6">
          {/* 2. Usamos a tradução com parâmetro dinâmico */}
          {t('welcome', { name: firstName })}
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto font-serif italic text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
        {MODULES.map((module) => {
          // 3. Criamos uma versão traduzida do módulo em tempo de execução
          // O 'id' do módulo no constants.ts (ex: 'tradicao') deve bater com a chave no JSON
          const translatedModule = {
            ...module,
            title: tModules(`${module.id}.title` as any),
            subtitle: tModules(`${module.id}.subtitle` as any),
            description: tModules(`${module.id}.description` as any),
          };

          return <ModuleCard key={module.id} module={translatedModule} />;
        })}
      </div>
      
      <footer className="text-center text-stone-600 text-xs uppercase tracking-widest border-t border-white/5 pt-8 pb-8">
        <p>&copy; 2025 Lumière Festin. Haute Cuisine Digital.</p>
      </footer>
    </div>
  );
}
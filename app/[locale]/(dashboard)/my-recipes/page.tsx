import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/routing"; // Importação correta do i18n
import { MyRecipesList } from "@/components/dashboard/my-recipes-list";
import { getTranslations } from 'next-intl/server';

export const dynamic = "force-dynamic";

export default async function MyRecipesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect({ href: "/login", locale: "pt" });
  }

  // Buscar receitas
  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Carregar traduções
  const t = await getTranslations('Dashboard');

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
          {t('collection_title')}
        </h1>
        <p className="text-stone-500 font-serif italic">
          {t('collection_subtitle')}
        </p>
      </div>

      <MyRecipesList initialRecipes={recipes} />
    </div>
  );
}
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyRecipesList } from "@/components/dashboard/my-recipes-list";

export const dynamic = "force-dynamic"; // Garante que a página sempre busque dados frescos

export default async function MyRecipesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar receitas salvas do usuário logado
  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  });

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
          Minha Coleção Privada
        </h1>
        <p className="text-stone-500 font-serif italic">
          Seus pratos selecionados, salvos e prontos para o serviço.
        </p>
      </div>

      <MyRecipesList initialRecipes={recipes} />
    </div>
  );
}
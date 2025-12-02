"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleSaveRecipe(recipeData: any) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    // Verifica se já existe pelo título (ou ID se tivermos persistindo ids do catalogo)
    // Aqui vamos usar uma lógica simples: se o usuário já tem uma receita com esse título exato
    const existing = await prisma.recipe.findFirst({
        where: {
            userId: session.user.id,
            title: recipeData.title
        }
    });

    if (existing) {
        await prisma.recipe.delete({ where: { id: existing.id } });
        revalidatePath("/my-recipes");
        return { saved: false };
    } else {
        await prisma.recipe.create({
            data: {
                userId: session.user.id,
                title: recipeData.title,
                description: recipeData.description,
                category: recipeData.category,
                imageUrl: recipeData.imageUrl,
                fullContentJson: recipeData, // Salvamos o JSON completo da IA
            }
        });
        revalidatePath("/my-recipes");
        return { saved: true };
    }
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar" };
  }
}

export async function checkIsSaved(title: string) {
    const session = await auth();
    if (!session?.user?.id) return false;

    const count = await prisma.recipe.count({
        where: { userId: session.user.id, title }
    });
    return count > 0;
}
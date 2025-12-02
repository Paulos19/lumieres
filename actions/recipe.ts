"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleSaveRecipe(recipeData: any) {
  const session = await auth();
  
  // CORREÇÃO: Verificação explícita para o TypeScript entender
  if (!session || !session.user || !session.user.id) {
      return { error: "Não autorizado" };
  }

  try {
    const existing = await prisma.recipe.findFirst({
        where: {
            userId: session.user.id, // Agora o TS sabe que isso existe
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
                fullContentJson: recipeData, 
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
    
    // CORREÇÃO: Verificação explícita aqui também
    if (!session || !session.user || !session.user.id) {
        return false;
    }

    const count = await prisma.recipe.count({
        where: { userId: session.user.id, title }
    });
    return count > 0;
}
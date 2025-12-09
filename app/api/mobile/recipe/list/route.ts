import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
  }

  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeamos para retornar o JSON completo fundido com o ID do banco
    const formattedRecipes = recipes.map(r => {
      const fullContent = r.fullContentJson as any;
      return {
        ...fullContent,
        id: r.id, // Importante: ID do banco sobrepõe qualquer ID interno
        savedAt: r.createdAt
      };
    });

    return NextResponse.json(formattedRecipes);

  } catch (error) {
    console.error("[Mobile List] Error:", error);
    return NextResponse.json({ error: "Erro ao buscar receitas" }, { status: 500 });
  }
}
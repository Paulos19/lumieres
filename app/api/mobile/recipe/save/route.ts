import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, recipe } = body;

    if (!userId || !recipe) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verifica se já existe (para fazer o toggle: salvar ou remover)
    const existing = await prisma.recipe.findFirst({
      where: {
        userId,
        title: recipe.title // Usamos título como chave única por enquanto
      }
    });

    if (existing) {
      // Se existe, remove (Toggle OFF)
      await prisma.recipe.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    } else {
      // Se não existe, cria (Toggle ON)
      await prisma.recipe.create({
        data: {
          userId,
          title: recipe.title,
          description: recipe.description,
          category: recipe.category || "Personalizado",
          imageUrl: recipe.imageUrl,
          // Salvamos o objeto completo para recuperar ingredientes, passos, etc.
          fullContentJson: recipe, 
        }
      });
      return NextResponse.json({ saved: true });
    }

  } catch (error) {
    console.error("[Mobile Save] Error:", error);
    return NextResponse.json({ error: "Erro ao processar receita" }, { status: 500 });
  }
}
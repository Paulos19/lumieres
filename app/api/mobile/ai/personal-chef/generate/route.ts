import { NextResponse } from "next/server";
import { generatePersonalizedRecipeAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Recebemos o título escolhido e o contexto original
    // Isso economiza tokens, pois a IA foca em expandir apenas o escolhido
    const { selectedTitle, contextData, locale } = body;

    if (!selectedTitle) {
      return NextResponse.json({ error: "Título não informado" }, { status: 400 });
    }

    const fullRecipe = await generatePersonalizedRecipeAction({
      selectedTitle,
      ...contextData
    }, locale || 'pt');

    return NextResponse.json(fullRecipe);

  } catch (error) {
    console.error("[API Mobile Generate] Error:", error);
    return NextResponse.json({ error: "Erro ao gerar receita completa" }, { status: 500 });
  }
}
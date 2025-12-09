import { NextResponse } from "next/server";
import { generatePersonalizedRecipeAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Recebemos os dados do Mobile
    const { selectedTitle, contextData, locale, userId, userName } = body;

    if (!selectedTitle) {
      return NextResponse.json({ error: "Título não informado" }, { status: 400 });
    }

    console.log(`[API Mobile] Iniciando geração para: ${selectedTitle} (User: ${userId})`);

    // 2. Chamamos a Action
    // CORREÇÃO: Passamos 'contextData' como propriedade aninhada, não espalhada (...contextData)
    // Isso garante que o n8n receba {{ $json.body.contextData }} corretamente.
    const fullRecipe = await generatePersonalizedRecipeAction({
      selectedTitle,
      contextData, // <--- Mantemos aninhado
      userId, 
      userName
    }, locale || 'pt');

    return NextResponse.json(fullRecipe);

  } catch (error) {
    console.error("[API Mobile Generate] Fatal Error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    // Retorna o erro real para facilitar o debug no mobile
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno no servidor." }, 
      { status: 500 }
    );
  }
}
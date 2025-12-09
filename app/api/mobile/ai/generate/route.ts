import { NextResponse } from "next/server";
import { generatePersonalizedRecipeAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extrai dados do Mobile
    const { 
      selectedTitle, 
      contextData, 
      locale, 
      userId, 
      userName,
      // Novos campos enviados pelo app
      ingredients, 
      goal 
    } = body;

    console.log("--- [API Mobile Generate] ---");
    console.log("UserID:", userId);
    console.log("Dados recebidos:", { selectedTitle, ingredients: ingredients?.slice(0, 20), goal });
    
    // [LÓGICA DE FALLBACK]
    // O app envia ingredientes, mas a Action precisa de um título ou contexto.
    // Se não houver título, criamos um genérico baseado no objetivo.
    let titleToUse = selectedTitle;
    let finalContextData = contextData || {};

    // Se veio do formulário "Criar Menu Exclusivo" (ingredientes + goal)
    if (!titleToUse && ingredients) {
        const goalMap: Record<string, string> = {
            loss: "para perda de peso",
            maintain: "saudável e equilibrada",
            gain: "para ganho de massa"
        };
        const goalText = goalMap[goal as string] || "saudável";
        
        titleToUse = `Receita exclusiva ${goalText}`;
        
        // Injetamos os ingredientes no contexto para o N8N/AI usar
        finalContextData = {
            ...finalContextData,
            ingredients: ingredients,
            userGoal: goal,
            isCustomCreation: true // Flag para o prompt saber que é criação livre
        };
    }

    if (!titleToUse) {
      return NextResponse.json({ error: "É necessário informar um título ou ingredientes." }, { status: 400 });
    }

    // Chama a Action passando os dados tratados
    const fullRecipe = await generatePersonalizedRecipeAction({
      selectedTitle: titleToUse,
      contextData: finalContextData, 
      userId, 
      userName
    }, locale || 'pt');

    return NextResponse.json(fullRecipe);

  } catch (error) {
    console.error("[API Mobile Generate] Fatal Error:", error);

    // Tratamento de erro 401
    if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Sessão inválida. Faça login novamente." }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno no servidor." }, 
      { status: 500 }
    );
  }
}
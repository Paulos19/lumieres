import { NextResponse } from "next/server";
import { generatePersonalizedRecipeAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extrai dados do Mobile
    const { selectedTitle, contextData, locale, userId, userName } = body;

    // Logs para Debug no Vercel/Terminal
    console.log("--- [API Mobile Generate] ---");
    console.log("Title:", selectedTitle);
    console.log("UserID:", userId);
    
    if (!selectedTitle) {
      return NextResponse.json({ error: "Título não informado" }, { status: 400 });
    }

    // Chama a Action passando os dados explicitamente
    const fullRecipe = await generatePersonalizedRecipeAction({
      selectedTitle,
      contextData, // Passa o objeto de preferências aninhado
      userId, 
      userName
    }, locale || 'pt');

    return NextResponse.json(fullRecipe);

  } catch (error) {
    console.error("[API Mobile Generate] Fatal Error:", error);

    // Tratamento de erro 401
    if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Não autorizado. Faça login novamente." }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno no servidor." }, 
      { status: 500 }
    );
  }
}
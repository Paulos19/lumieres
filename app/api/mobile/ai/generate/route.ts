import { NextResponse } from "next/server";
import { generatePersonalizedRecipeAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Desestruturamos também o userId e userName, que agora o Mobile envia explicitamente
    const { selectedTitle, contextData, locale, userId, userName } = body;

    // Validação básica
    if (!selectedTitle) {
      return NextResponse.json({ error: "Título do prato não informado." }, { status: 400 });
    }

    // Chama a Server Action passando os dados do utilizador manualmente
    // Isso permite que a Action ignore o auth() (cookies) e use estes dados
    const fullRecipe = await generatePersonalizedRecipeAction({
      selectedTitle,
      ...contextData, // Preferências originais (budget, guests, etc.)
      userId, 
      userName
    }, locale || 'pt');

    return NextResponse.json(fullRecipe);

  } catch (error) {
    console.error("[API Mobile Generate] Error:", error);

    // Tratamento específico para erro de autorização
    if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Sessão inválida ou expirada. Faça login novamente." }, 
          { status: 401 }
        );
    }

    return NextResponse.json(
      { error: "Erro interno ao gerar receita completa." }, 
      { status: 500 }
    );
  }
}
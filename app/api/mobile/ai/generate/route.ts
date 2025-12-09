import { NextResponse } from "next/server";

// Assegure-se de que estas variáveis estão no .env do seu projeto na Vercel
const N8N_WEBHOOK_URL = process.env.N8N_PERSONAL_CHEF_WEBHOOK_URL;
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { weight, height, goal, ingredients, restrictions, locale, userId, userName } = body;

    if (!N8N_WEBHOOK_URL) {
      console.error("N8N Webhook URL não configurada");
      return NextResponse.json({ error: "Serviço de IA indisponível temporariamente." }, { status: 503 });
    }

    console.log(`[Mobile AI] Iniciando geração para ${userName}...`);

    // Chama o N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        weight,
        height,
        goal,
        ingredients,
        restrictions,
        locale: locale || "pt",
        userId,
        userName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Mobile AI] Erro N8N (${response.status}): ${errorText}`);
      throw new Error(`Erro no serviço de IA: ${response.status}`);
    }

    const data = await response.json();
    
    // O N8N deve retornar { recipe: {...}, imageUrl: "..." } ou o JSON da receita com a imagem dentro
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[Mobile AI] Erro:", error);
    return NextResponse.json({ error: "Falha ao criar sua receita. Tente novamente." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

// Pega a URL e Token das variáveis de ambiente (já configuradas no seu actions/ai.ts)
const N8N_WEBHOOK_URL = process.env.N8N_PERSONAL_CHEF_WEBHOOK_URL;
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { weight, height, goal, ingredients, restrictions, locale, userId, userName } = body;

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json({ error: "Serviço de IA indisponível (Webhook não configurado)" }, { status: 503 });
    }

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
      throw new Error(`Erro N8N: ${response.status}`);
    }

    const data = await response.json();
    
    // O N8N retorna { recipe: {...}, imageUrl: "..." }
    return NextResponse.json(data);

  } catch (error) {
    console.error("Mobile AI Error:", error);
    return NextResponse.json({ error: "Falha ao gerar receita" }, { status: 500 });
  }
}
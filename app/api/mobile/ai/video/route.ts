import { NextResponse } from "next/server";

const N8N_VIDEO_WEBHOOK_URL = process.env.N8N_VIDEO_WEBHOOK_URL;
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stepText, recipeTitle, locale, userId } = body;

    if (!N8N_VIDEO_WEBHOOK_URL) {
      return NextResponse.json({ error: "Serviço de vídeo indisponível." }, { status: 503 });
    }

    console.log(`[Mobile Video] Gerando cena para: ${recipeTitle}`);

    const response = await fetch(N8N_VIDEO_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        stepText,
        recipeTitle,
        locale: locale || 'pt',
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`N8N Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("[Mobile Video] Resposta Bruta do N8N:", JSON.stringify(data, null, 2));
    
    // O n8n retorna { base64: "..." } ou { videoUrl: "..." } dependendo do seu fluxo
    // Vamos assumir que seu fluxo mobile já retorna a URL ou tratamos igual ao actions/ai.ts
    // Se o N8N retornar base64, idealmente faríamos upload aqui (blob), mas para MVP mobile 
    // vamos assumir que o N8N ou essa API retorna a URL final.
    
    // Simplificação: Se o seu N8N retorna JSON com 'videoUrl', repassamos.
    return NextResponse.json({ videoUrl: data.videoUrl || data.url });

  } catch (error) {
    console.error("[Mobile Video] Error:", error);
    return NextResponse.json({ error: "Falha ao gerar vídeo" }, { status: 500 });
  }
}
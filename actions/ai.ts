"use server";

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

// --- CONFIGURAÇÃO ---
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Webhooks N8N
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

// 1. Webhooks de Media (Legado/Avulso)
const N8N_VIDEO_WEBHOOK_URL = process.env.N8N_VIDEO_WEBHOOK_URL;
const N8N_IMAGE_WEBHOOK_URL = process.env.N8N_IMAGE_WEBHOOK_URL;

// 2. Webhooks Du Chef (Novos)
// Webhook para LISTAR sugestões (Rápido/Leve)
const N8N_CONSULT_WEBHOOK = process.env.N8N_CONSULT_WEBHOOK_URL; 
// Webhook para GERAR receita completa + foto (Lento/Pesado - Workflow "Lumière - Personal Chef")
const N8N_GENERATE_RECIPE_WEBHOOK = process.env.N8N_GENERATE_RECIPE_WEBHOOK_URL || process.env.N8N_PERSONAL_CHEF_WEBHOOK_URL;

// Mapa de Idiomas
const LANGUAGE_MAP: Record<string, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano"
};

// --- SCHEMAS (GEMINI) ---

const catalogSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          complexityLevel: { type: Type.STRING, enum: ['Simples', 'Elaborada'] }
        },
        required: ["id", "title", "description", "difficulty", "complexityLevel"]
      }
    }
  }
};

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    prepTime: { type: Type.STRING },
    portions: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    complexityRating: { type: Type.STRING, enum: ['Simples', 'Elaborada'] },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    stepPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
    platingTips: { type: Type.STRING },
    visualDescription: { type: Type.STRING },
    dietTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    macros: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING }
      }
    },
    functionalNotes: { type: Type.STRING }
  },
  required: ["title", "description", "ingredients", "instructions", "visualDescription", "dietTags"]
};

// --- ACTIONS DO DU CHEF (NOVAS) ---

/**
 * Passo 1: Consulta o Personal Chef para obter ideias de pratos.
 * Retorna uma lista leve de sugestões (JSON).
 */
export async function consultPersonalChefAction(preferences: any, locale: string) {
  // Para consulta simples, não exigimos auth rigoroso ou usamos mock se falhar
  if (!N8N_CONSULT_WEBHOOK) {
    console.warn("⚠️ Webhook N8N Consult não configurado. Usando Mock.");
    await new Promise(r => setTimeout(r, 1500));
    return [
      { title: "Salmão com Aspargos (Mock)", description: "Opção leve rica em ômega-3.", difficulty: "Médio" },
      { title: "Risoto de Cogumelos (Mock)", description: "Prato vegetariano sofisticado.", difficulty: "Simples" },
      { title: "Moqueca Vegana (Mock)", description: "Sabor tropical intenso.", difficulty: "Elaborada" }
    ];
  }

  try {
    const response = await fetch(N8N_CONSULT_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({ ...preferences, locale })
    });

    if (!response.ok) throw new Error(`N8N Consult Error: ${response.status}`);
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("[AI] Erro Consult:", error);
    return [];
  }
}

/**
 * Passo 2: Geração Completa (Receita + Imagem)
 * Lógica Híbrida: Aceita ID manual (Mobile) ou Sessão (Web)
 */
export async function generatePersonalizedRecipeAction(params: any, locale: string) {
  // 1. Tenta pegar ID dos parâmetros
  let userId = params.userId;
  let userName = params.userName;

  console.log(`[AI Action] Generate iniciado. UserID Params: ${userId}`);

  // 2. Se não veio ID, tenta autenticação via Cookie (Web)
  if (!userId) {
    const session = await auth();
    if (!session || !session.user) {
        console.error("[AI Action] Bloqueio: Sem ID e sem Sessão.");
        throw new Error("Unauthorized");
    }
    userId = session.user.id;
    userName = session.user.name;
  }

  if (!N8N_GENERATE_RECIPE_WEBHOOK) {
    throw new Error("Webhook de Geração Completa não configurado.");
  }

  try {
    console.log(`[AI] Enviando para N8N para user: ${userId}`);

    const response = await fetch(N8N_GENERATE_RECIPE_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        ...params, // selectedTitle, contextData...
        locale,
        userId: userId,     // Usa a variável resolvida
        userName: userName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] N8N Erro ${response.status}:`, errorText);
      throw new Error(`Erro no N8N: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("[AI] Erro Generate Action:", error);
    throw error;
  }
}


// --- ACTIONS GEMINI (LEGADO/PADRÃO) ---

export async function generateMenuAction(moduleModifier: string, category: string, locale: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const targetLanguage = LANGUAGE_MAP[locale] || "Português";

  const prompt = `
    Atue como um Chef Executivo de classe mundial.
    Contexto do Módulo: ${moduleModifier}
    Categoria Solicitada: ${category}
    
    IDIOMA DE RESPOSTA OBRIGATÓRIO: ${targetLanguage}.
    Traduza Título, Descrição e Dificuldade para ${targetLanguage}.
    
    IMPORTANTE:
    Mantenha o campo 'complexityLevel' EXATAMENTE como 'Simples' ou 'Elaborada'.
    
    Gere 20 sugestões de pratos.
    Divida RIGOROSAMENTE: 10 'Simples' e 10 'Elaborada'.
    
    Retorne JSON.
  `;

  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: catalogSchema,
      },
    });
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("AI Menu Error:", error);
    return { recipes: [] };
  }
}

export async function generateRecipeAction(title: string, moduleModifier: string, category: string, locale: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const targetLanguage = LANGUAGE_MAP[locale] || "Português";

  const prompt = `
    Crie a receita completa para: "${title}".
    Contexto: ${moduleModifier}
    Categoria: ${category}
    
    IDIOMA DE RESPOSTA: ${targetLanguage}.
    Todos os campos de texto (ingredientes, instruções, dicas, notas) DEVEM estar em ${targetLanguage}.
    
    ATENÇÃO AS TAGS (dietTags):
    Gere as tags (ex: Sem Glúten, Low Carb, Gourmet) traduzidas para ${targetLanguage}.
    
    Requisitos:
    1. 'visualDescription': Prompt de fotografia detalhado (pode manter em Inglês se preferir).
    2. 'complexityRating': Manter 'Simples' ou 'Elaborada'.
    
    Retorne JSON estrito.
  `;

  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("AI Recipe Error:", error);
    throw new Error("Falha ao gerar receita.");
  }
}


// --- ACTIONS DE MEDIA (AVULSAS) ---

export async function generateMediaAction(recipeTitle: string, visualDescription: string, locale: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!N8N_IMAGE_WEBHOOK_URL) {
    return {
      imageUrl: `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent(recipeTitle)}`,
      videoUrl: null
    };
  }

  try {
    console.log(`[AI] Solicitando mídia avulsa ao n8n em ${locale}...`);
    
    const response = await fetch(N8N_IMAGE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        recipeTitle,
        visualDescription,
        locale: locale,
        userId: session.user.id
      })
    });

    if (!response.ok) {
      throw new Error(`N8N Media Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.base64) throw new Error("No base64 returned");

    // Upload Blob
    const base64Data = data.base64.includes('base64,') ? data.base64.split('base64,')[1] : data.base64;
    const buffer = Buffer.from(base64Data, 'base64');
    const cleanTitle = recipeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
    const filename = `recipes/${session.user.id}/${Date.now()}-${cleanTitle}.png`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return {
      imageUrl: blob.url,
      videoUrl: null
    };

  } catch (error) {
    console.error("Media Pipeline Failed:", error);
    return {
      imageUrl: `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent("Erro")}`,
      videoUrl: null
    };
  }
}

export async function generateStepVideoAction(stepText: string, recipeTitle: string, locale: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!N8N_VIDEO_WEBHOOK_URL) {
    console.warn("N8N Video Webhook URL not configured.");
    return { videoUrl: null };
  }

  try {
    console.log(`[AI Video] Gerando clipe para o passo: "${stepText.slice(0, 20)}..."`);

    const response = await fetch(N8N_VIDEO_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        stepText,
        recipeTitle,
        locale,
        userId: session.user.id
      })
    });

    if (!response.ok) {
      throw new Error(`N8N Video Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.base64) throw new Error("No video base64 returned");

    // Upload Blob (MP4)
    const base64Data = data.base64.includes('base64,') ? data.base64.split('base64,')[1] : data.base64;
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `recipes/${session.user.id}/videos/${Date.now()}-step.mp4`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'video/mp4',
    });

    console.log("[AI Video] Upload concluído:", blob.url);

    return { videoUrl: blob.url };

  } catch (error) {
    console.error("Video Pipeline Failed:", error);
    return { videoUrl: null };
  }
}
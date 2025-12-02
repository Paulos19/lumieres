"use server";

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const N8N_VIDEO_WEBHOOK_URL = process.env.N8N_VIDEO_WEBHOOK_URL;
const N8N_WEBHOOK_URL = process.env.N8N_IMAGE_WEBHOOK_URL;
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

// Mapa de códigos para nomes de idioma (para o Prompt da IA)
const LANGUAGE_MAP: Record<string, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano"
};

// --- SCHEMAS ---

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
          // Mantemos os enums em PT/EN universais ou mapeamos no front. 
          // Para simplificar a lógica do filtro no front, pediremos para a IA manter as chaves de complexidade
          // compatíveis, mas aqui definimos o schema.
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

// --- ACTIONS ---

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
    Mantenha o campo 'complexityLevel' EXATAMENTE como 'Simples' ou 'Elaborada' (não traduza este valor específico pois é usado para filtro no sistema).
    
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
    1. 'visualDescription': Prompt de fotografia detalhado (pode manter em Inglês se preferir para melhor qualidade de imagem, ou no idioma nativo).
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

export async function generateMediaAction(recipeTitle: string, visualDescription: string, locale: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!N8N_WEBHOOK_URL) {
    return {
      imageUrl: `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent(recipeTitle)}`,
      videoUrl: null
    };
  }

  try {
    console.log(`[AI] Solicitando mídia ao n8n em ${locale}...`);
    
    // Enviamos o locale para o n8n caso ele queira gerar textos ou legendas no idioma correto
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        recipeTitle,
        visualDescription,
        locale: locale, // Passando o idioma
        userId: session.user.id
      })
    });

    if (!response.ok) {
      throw new Error(`N8N Error: ${response.status}`);
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
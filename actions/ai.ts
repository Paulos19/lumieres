"use server";

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

// Inicialização do cliente Gemini
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Variáveis de ambiente para o n8n
const N8N_WEBHOOK_URL = process.env.N8N_IMAGE_WEBHOOK_URL;
const N8N_AUTH_TOKEN = process.env.N8N_AUTH_TOKEN;

// --- SCHEMAS ESTRUTURADOS ---

// 1. Schema para o Catálogo de Sugestões (Menu)
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
          difficulty: { type: Type.STRING, enum: ['Fácil', 'Médio', 'Sofisticado'] },
          complexityLevel: { type: Type.STRING, enum: ['Simples', 'Elaborada'] }
        },
        required: ["id", "title", "description", "difficulty", "complexityLevel"]
      }
    }
  }
};

// 2. Schema para a Receita Completa
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
  required: ["title", "description", "ingredients", "instructions", "visualDescription"]
};

// --- SERVER ACTIONS ---

/**
 * Gera um menu com sugestões de pratos baseado no módulo e categoria.
 */
export async function generateMenuAction(moduleModifier: string, category: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const prompt = `
    Atue como um Chef Executivo de classe mundial.
    Contexto do Módulo: ${moduleModifier}
    Categoria Solicitada: ${category}
    
    Gere EXATAMENTE 20 sugestões de pratos exclusivos.
    A lista deve ser dividida RIGOROSAMENTE em:
    - 10 opções estilo 'Simples' (Comfort Food / Tradicional)
    - 10 opções estilo 'Elaborada' (Alta Gastronomia / Michelin)
    
    Retorne apenas o JSON seguindo o schema.
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

/**
 * Gera os detalhes completos de uma receita específica.
 */
export async function generateRecipeAction(title: string, moduleModifier: string, category: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const prompt = `
    Crie a receita completa e detalhada para o prato: "${title}".
    Contexto: ${moduleModifier}
    Categoria: ${category}
    
    Requisitos:
    1. A 'visualDescription' deve ser um prompt de fotografia (em inglês ou português) extremamente detalhado para gerar uma imagem depois.
    2. As instruções devem ser claras e profissionais.
    3. Inclua macros aproximados.
    
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

/**
 * Orquestra a geração de mídia (Imagem) via n8n e faz upload para o Vercel Blob.
 */
export async function generateMediaAction(recipeTitle: string, visualDescription: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Validação de configuração
  if (!N8N_WEBHOOK_URL) {
    console.warn("N8N Webhook URL not configured. Using placeholder.");
    return {
      imageUrl: `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent(recipeTitle)}`,
      videoUrl: null
    };
  }

  try {
    console.log(`[AI] Solicitando imagem para: ${recipeTitle}`);

    // 1. Chamada ao n8n (que vai refinar o prompt e gerar a imagem)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${N8N_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        recipeTitle,
        visualDescription
      })
    });

    if (!response.ok) {
      throw new Error(`N8N Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    // O n8n deve retornar { base64: "data:image/png;base64,..." }
    if (!data.base64) {
      throw new Error("O n8n não retornou a propriedade 'base64' esperada.");
    }

    console.log("[AI] Imagem recebida do n8n. Iniciando upload para Vercel Blob...");

    // 2. Processar o Base64
    // Remove o prefixo "data:image/png;base64," se existir para criar o buffer
    const base64Data = data.base64.includes('base64,') 
      ? data.base64.split('base64,')[1] 
      : data.base64;
      
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 3. Gerar nome de arquivo único e organizado
    // Ex: recipes/user_123/1715620000-titulo-da-receita.png
    const cleanTitle = recipeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
    const filename = `recipes/${session.user.id}/${Date.now()}-${cleanTitle}.png`;

    // 4. Upload para Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png', // Ajuste se o n8n retornar outro formato (ex: jpeg)
    });

    console.log("[AI] Upload concluído:", blob.url);

    return {
      imageUrl: blob.url,
      videoUrl: null // Preparado para expansão futura (vídeo)
    };

  } catch (error) {
    console.error("Media Pipeline Failed:", error);
    // Retorna fallback em caso de erro para não quebrar a UI do usuário
    return {
      imageUrl: `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent("Erro na Geração")}`,
      videoUrl: null
    };
  }
}
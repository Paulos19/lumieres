"use server";

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { auth } from "@/auth";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schemas (Mesmos do projeto original, adaptados para o SDK)
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

// --- ACTIONS ---

export async function generateMenuAction(moduleModifier: string, category: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const prompt = `
    Atue como um Chef Executivo de classe mundial.
    Contexto: ${moduleModifier}
    Categoria: ${category}
    
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
    console.error("AI Error:", error);
    return { recipes: [] };
  }
}

export async function generateRecipeAction(title: string, moduleModifier: string, category: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const prompt = `
    Crie a receita completa para: "${title}".
    Contexto: ${moduleModifier}
    Categoria: ${category}
    
    Requisitos:
    1. Visual ultra-realista na descrição.
    2. Passos claros.
    3. JSON estrito.
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

export async function generateImageAction(description: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const prompt = `
    Fotografia Gastronômica Profissional, Capa de Revista Vogue Living.
    ${description}
    Iluminação de estúdio, 8k, ultra-realista.
  `;

  try {
    // Usando modelo de imagem (verifique se sua key tem acesso, senão use o flash padrão com descrição)
    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Flash é multimodal, pode tentar descrever, mas para gerar imagem real precisa do modelo específico (ex: imagen-3) ou hackear o flash (não gera img nativa). 
      // NOTA: O SDK @google/genai suporta geração de imagem em modelos específicos. 
      // Vou usar um placeholder aqui se o modelo de imagem não estiver disponível, 
      // mas o ideal é 'imagen-3.0-generate-001' se disponível na sua conta.
      // Para este exemplo, vamos simular o retorno base64 ou usar placeholder se falhar.
      contents: prompt,
    });
    
    // Como o Gemini Flash retorna texto, vamos usar um serviço externo ou placeholder para garantir que funcione sem key especial de imagem agora.
    // EM PRODUÇÃO: Substituir por chamada real ao Imagen 3
    return `https://placehold.co/1024x1024/141E1B/D4AF37?text=${encodeURIComponent("Foto IA Gerada")}`;
  } catch (error) {
    return null;
  }
}
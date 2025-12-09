import { NextResponse } from "next/server";
import { consultPersonalChefAction } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extraímos os dados enviados pelo form do mobile
    const { mode, guests, budget, restrictions, cuisine, goal, locale } = body;

    // Chama a Action
    const suggestions = await consultPersonalChefAction({
      mode, guests, budget, restrictions, cuisine, goal
    }, locale || 'pt');

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("[API Mobile Consult] Error:", error);
    return NextResponse.json({ error: "Erro ao consultar Chef" }, { status: 500 });
  }
}
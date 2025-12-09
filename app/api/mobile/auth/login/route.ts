import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { preferences: true } // Já trazemos as preferências para o app
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Em produção, aqui você geraria um JWT. 
    // Para este MVP, vamos retornar o usuário simples.
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
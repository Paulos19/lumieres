"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" };
  }

  const { email, password, name } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email já está em uso!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  
  // Tentar login automático após registro
  try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard", // Redireciona para o dashboard inicial
      });
  } catch (error) {
      if (error instanceof AuthError) {
          return { error: "Conta criada, mas erro ao logar automaticamente." }
      }
      throw error; // Necessário para o redirect do Next funcionar
  }

  return { success: "Conta criada com sucesso!" };
};
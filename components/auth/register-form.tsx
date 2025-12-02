"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "./card-wrapper";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register"; // Server Action
import { useRouter } from "next/navigation";

// Schema de validação igual ao do Server Action
const RegisterSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo de 6 caracteres" }),
});

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
          // O register action já tenta fazer o login, 
          // mas forçamos o refresh/redirect aqui para garantir
          router.push("/atelier");
        }
      });
    });
  };

  return (
    <CardWrapper
      title="Lumière"
      headerLabel="Inicie sua jornada gastronômica"
      backButtonLabel="Já possui uma conta? Entrar"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold-500 uppercase text-xs tracking-widest">Nome</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Jean Pierre"
                      className="bg-deep-900 border-gold-700/50 focus:border-gold-500 text-gold-100 placeholder:text-stone-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold-500 uppercase text-xs tracking-widest">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="chef@exemplo.com"
                      type="email"
                      className="bg-deep-900 border-gold-700/50 focus:border-gold-500 text-gold-100 placeholder:text-stone-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold-500 uppercase text-xs tracking-widest">Senha</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                      className="bg-deep-900 border-gold-700/50 focus:border-gold-500 text-gold-100 placeholder:text-stone-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {error && (
            <div className="p-3 rounded bg-destructive/15 text-destructive text-sm text-center border border-destructive/20">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded bg-emerald-500/15 text-emerald-500 text-sm text-center border border-emerald-500/20">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-500 hover:bg-white text-deep-900 font-bold uppercase tracking-widest transition-all"
          >
            {isPending ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
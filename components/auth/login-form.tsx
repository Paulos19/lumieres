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
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/routing"; // <--- CORREÇÃO IMPORTANTE

const LoginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // Esse router agora sabe o idioma atual

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    
    startTransition(async () => {
        try {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciais inválidas.");
            } else {
                // CORREÇÃO: O router do next-intl vai adicionar o locale (ex: /pt/atelier)
                router.push("/atelier");
                router.refresh();
            }
        } catch (e) {
            setError("Algo deu errado.");
        }
    });
  };

  return (
    <CardWrapper
      title="Lumière"
      headerLabel="Acesse seu Atelier Pessoal"
      backButtonLabel="Ainda não tem um convite? Cadastre-se"
      backButtonHref="/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
              <div className="p-3 rounded bg-red-900/30 border border-red-500/50 text-red-200 text-sm text-center">
                  {error}
              </div>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-500 hover:bg-white text-deep-900 font-bold uppercase tracking-widest transition-all"
          >
            {isPending ? "Entrando..." : "Entrar no Atelier"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
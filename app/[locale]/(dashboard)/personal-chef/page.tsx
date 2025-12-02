"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generatePersonalizedRecipeAction } from "@/actions/ai";
import { RecipeCard } from "@/components/cuisine/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Componente existente
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { useLocale } from "next-intl";

// Schema do Formulário
const PersonalChefSchema = z.object({
  weight: z.string().optional(),
  height: z.string().optional(),
  goal: z.enum(["loss", "gain", "maintain"]).default("maintain"),
  restrictions: z.string().optional(),
  ingredients: z.string().min(3, "Liste pelo menos um ingrediente principal."),
});

export default function PersonalChefPage() {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const locale = useLocale();

  const form = useForm<z.infer<typeof PersonalChefSchema>>({
    resolver: zodResolver(PersonalChefSchema) as any,
    defaultValues: { goal: "maintain", ingredients: "" }
  });

  const onSubmit = async (values: z.infer<typeof PersonalChefSchema>) => {
    setLoading(true);
    try {
      const result = await generatePersonalizedRecipeAction(values, locale);
      setRecipe(result); // Assume que o result já vem no formato compatível com RecipeCard
      toast.success("Receita criada exclusivamente para você!");
    } catch (error) {
      toast.error("Erro ao gerar receita. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (recipe) {
    return <RecipeCard recipe={recipe} onClose={() => setRecipe(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 animate-fade-in">
      <h1 className="font-display text-4xl text-gold-500 mb-2 text-center">Atelier Pessoal</h1>
      <p className="text-stone-400 text-center mb-8 font-serif italic">
        Conte-me seus objetivos e o que tem na despensa.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-deep-800/50 p-8 border border-white/5 rounded-sm">
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold-400">Peso (kg)</FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: 75" className="bg-deep-900 border-white/10" /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold-400">Altura (cm)</FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: 175" className="bg-deep-900 border-white/10" /></FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold-400">Objetivo Atual</FormLabel>
                <div className="flex gap-2">
                  {['loss', 'maintain', 'gain'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => field.onChange(g)}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest border transition-all ${
                        field.value === g 
                        ? "bg-gold-500 text-deep-900 border-gold-500" 
                        : "border-white/10 text-stone-500 hover:border-gold-500/50"
                      }`}
                    >
                      {g === 'loss' ? 'Perder Peso' : g === 'gain' ? 'Ganhar Massa' : 'Manter'}
                    </button>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold-400">O que temos na cozinha?</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Ex: Tenho frango, batata doce, brócolis e ovos..." 
                    className="bg-deep-900 border-white/10 h-32 resize-none" 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-white text-deep-900 font-bold uppercase tracking-widest h-12"
          >
            {loading ? "O Chef está criando..." : "Gerar Menu Exclusivo"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
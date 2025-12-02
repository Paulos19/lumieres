"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Users, ChefHat, Save, Check, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveRecipe, checkIsSaved } from "@/actions/recipe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Tipagem simplificada para o componente
interface RecipeCardProps {
  recipe: any;
  onClose: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClose }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Verificar se já está salvo ao abrir
    checkIsSaved(recipe.title).then(setIsSaved);
  }, [recipe.title]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await toggleSaveRecipe(recipe);
    setIsSaving(false);

    if (result.error) {
      toast.error("Erro ao salvar receita.");
      return;
    }

    setIsSaved(result.saved || false);
    toast.success(result.saved ? "Receita salva no seu caderno!" : "Receita removida.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-card w-full max-w-5xl rounded-lg border border-gold-500/20 shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-gold-500 hover:text-black rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
            {/* Hero */}
            <div className="relative h-64 md:h-96 w-full">
                {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-deep-800 flex items-center justify-center text-stone-600">
                        <span className="italic">Imagem sendo revelada...</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex gap-2 mb-3">
                        <span className="px-3 py-1 bg-gold-500 text-deep-900 text-xs font-bold uppercase tracking-widest rounded-sm">
                            {recipe.category}
                        </span>
                        <span className="px-3 py-1 bg-black/60 text-gold-100 text-xs font-bold uppercase tracking-widest rounded-sm border border-gold-500/30">
                            {recipe.complexityRating}
                        </span>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl text-gold-100 drop-shadow-lg">{recipe.title}</h1>
                </div>
            </div>

            {/* Info Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/5 bg-deep-900/50 backdrop-blur sticky top-0 z-40">
                <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                    <Clock className="text-gold-500 mb-1" size={16} />
                    <span className="text-xs text-stone-400 uppercase tracking-widest">Tempo</span>
                    <span className="font-medium text-gold-100">{recipe.prepTime}</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                    <Users className="text-gold-500 mb-1" size={16} />
                    <span className="text-xs text-stone-400 uppercase tracking-widest">Porções</span>
                    <span className="font-medium text-gold-100">{recipe.portions}</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                    <ChefHat className="text-gold-500 mb-1" size={16} />
                    <span className="text-xs text-stone-400 uppercase tracking-widest">Dificuldade</span>
                    <span className="font-medium text-gold-100">{recipe.difficulty}</span>
                </div>
                <div className="p-2 flex items-center justify-center">
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "w-full h-full uppercase tracking-widest text-xs font-bold transition-all",
                            isSaved 
                                ? "bg-gold-500 text-deep-900 hover:bg-white" 
                                : "bg-transparent border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-deep-900"
                        )}
                    >
                        {isSaved ? <><Check size={16} className="mr-2"/> Salvo</> : <><Save size={16} className="mr-2"/> Salvar</>}
                    </Button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Ingredientes */}
                <div className="md:col-span-4 space-y-8">
                    <div>
                        <h3 className="font-display text-2xl text-gold-400 mb-6 border-b border-gold-500/20 pb-2">Ingredientes</h3>
                        <ul className="space-y-4 font-sans text-stone-300 font-light">
                            {recipe.ingredients?.map((ing: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-600 mt-2 flex-shrink-0"></span>
                                    <span className="leading-relaxed">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Macros */}
                    {recipe.macros && (
                        <div className="p-6 bg-deep-900 rounded border border-white/5">
                            <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-4 text-center">Informação Nutricional</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <span className="block text-xl text-gold-100 font-display">{recipe.macros.calories}</span>
                                    <span className="text-[10px] text-stone-500 uppercase">Calorias</span>
                                </div>
                                <div>
                                    <span className="block text-xl text-gold-100 font-display">{recipe.macros.protein}</span>
                                    <span className="text-[10px] text-stone-500 uppercase">Proteína</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preparo */}
                <div className="md:col-span-8 space-y-10">
                    <div>
                        <h3 className="font-display text-2xl text-gold-400 mb-6 border-b border-gold-500/20 pb-2">Modo de Preparo</h3>
                        <div className="space-y-8">
                            {recipe.instructions?.map((step: string, i: number) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <span className="w-8 h-8 rounded-full border border-gold-500/30 text-gold-400 flex items-center justify-center font-display text-sm group-hover:bg-gold-500 group-hover:text-deep-900 transition-colors">
                                            {i + 1}
                                        </span>
                                        {i !== recipe.instructions.length - 1 && <div className="w-px h-full bg-white/5 my-2 group-hover:bg-gold-500/20 transition-colors"></div>}
                                    </div>
                                    <p className="text-stone-300 font-light leading-relaxed pb-8">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dica do Chef */}
                    <div className="p-6 bg-gradient-to-br from-deep-800 to-deep-900 border border-gold-500/20 rounded relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">👨‍🍳</div>
                        <h4 className="font-display text-gold-300 mb-2 relative z-10">Toque do Chef</h4>
                        <p className="font-serif italic text-stone-400 relative z-10">"{recipe.platingTips}"</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
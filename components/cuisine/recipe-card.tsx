"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, Users, ChefHat, Save, Check, PlayCircle, 
  Image as ImageIcon, ArrowLeft, Share2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveRecipe, checkIsSaved } from "@/actions/recipe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: any;
  onClose: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClose }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaView, setMediaView] = useState<'image' | 'video'>('image');

  useEffect(() => {
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
    <div className="w-full bg-deep-900 min-h-screen animate-fade-in pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-deep-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={16} />
          Voltar ao Menu
        </button>
        
        <div className="flex gap-3">
             <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className={cn(
                    "uppercase tracking-widest text-[10px] font-bold transition-all h-9 px-6",
                    isSaved 
                        ? "bg-gold-500 text-deep-900 hover:bg-white" 
                        : "bg-transparent border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-deep-900"
                )}
            >
                {isSaved ? <><Check size={14} className="mr-2"/> Salvo</> : <><Save size={14} className="mr-2"/> Salvar</>}
            </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4 md:px-8">
        {/* Header & Title */}
        <div className="text-center mb-10">
            <div className="flex justify-center gap-3 mb-6">
                <span className="px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {recipe.category}
                </span>
                <span className="px-3 py-1 bg-deep-800 text-stone-400 border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {recipe.complexityRating}
                </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-gold-100 leading-tight mb-6">
                {recipe.title}
            </h1>
            <p className="font-serif text-lg text-stone-400 italic max-w-3xl mx-auto leading-relaxed">
                {recipe.description}
            </p>
        </div>

        {/* Media Section (Cinematic) */}
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-deep-800 rounded-sm overflow-hidden border border-white/5 mb-12 group shadow-2xl shadow-black">
            {mediaView === 'image' ? (
                recipe.imageUrl ? (
                    <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-600 italic font-serif">
                        Revelando fotografia...
                    </div>
                )
            ) : (
                recipe.videoUrl ? (
                    <video 
                        src={recipe.videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                     <div className="w-full h-full flex items-center justify-center text-stone-600 italic font-serif">
                        Vídeo indisponível
                    </div>
                )
            )}

            {/* Media Switcher */}
            {recipe.videoUrl && (
                <div className="absolute bottom-6 right-6 flex bg-black/60 backdrop-blur rounded-full p-1 border border-white/10 z-40">
                    <button 
                        onClick={() => setMediaView('image')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs uppercase tracking-widest font-bold",
                            mediaView === 'image' ? "bg-gold-500 text-deep-900" : "text-stone-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <ImageIcon size={14} />
                        <span className="hidden md:inline">Foto</span>
                    </button>
                    <button 
                            onClick={() => setMediaView('video')}
                            className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs uppercase tracking-widest font-bold",
                            mediaView === 'video' ? "bg-gold-500 text-deep-900" : "text-stone-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <PlayCircle size={14} />
                        <span className="hidden md:inline">Vídeo</span>
                    </button>
                </div>
            )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 border-y border-white/5 py-6 mb-16">
            <div className="flex flex-col items-center justify-center border-r border-white/5">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <Clock size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">Tempo de Preparo</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.prepTime}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-white/5">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <Users size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">Rendimento</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.portions}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <ChefHat size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">Dificuldade</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.difficulty}</span>
            </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column: Ingredients & Notes */}
            <div className="lg:col-span-4 space-y-12">
                {/* Ingredients List */}
                <div className="bg-deep-800/30 p-8 rounded-sm border border-white/5">
                    <h3 className="font-display text-2xl text-gold-400 mb-8 flex items-center gap-3">
                        <span>📜</span> Ingredientes
                    </h3>
                    <ul className="space-y-4">
                        {recipe.ingredients?.map((ing: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-stone-300 font-light group">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-600 mt-2.5 flex-shrink-0 group-hover:bg-gold-400 transition-colors"></span>
                                <span className="leading-relaxed text-sm">{ing}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Nutrition Facts */}
                {recipe.macros && (
                    <div className="p-6 border border-white/5 rounded-sm">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-6 text-center">Nutrição / Porção</h4>
                        <div className="grid grid-cols-2 gap-y-6">
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.calories}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Kcal</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.protein}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Proteína</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.carbs}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Carbs</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.fat}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Gorduras</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diet Tags */}
                <div className="flex flex-wrap gap-2">
                    {recipe.dietTags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 bg-white/5 text-stone-400 text-[10px] uppercase tracking-widest rounded border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="lg:col-span-8 space-y-12">
                <div>
                    <h3 className="font-display text-3xl text-gold-100 mb-10 pb-4 border-b border-white/5">
                        Mise en Place & Preparo
                    </h3>
                    <div className="space-y-12">
                        {recipe.instructions?.map((step: string, i: number) => (
                            <div key={i} className="group">
                                <div className="flex items-baseline gap-6 mb-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gold-500/30 text-gold-400 flex items-center justify-center font-display text-lg group-hover:bg-gold-500 group-hover:text-deep-900 transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                                        {i + 1}
                                    </span>
                                    <h4 className="text-lg text-gold-200 font-display pt-2">Passo {i + 1}</h4>
                                </div>
                                <p className="text-stone-300 font-sans font-light leading-8 text-lg pl-16 border-l border-white/5 ml-5 group-hover:border-gold-500/30 transition-colors">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chef's Note / Plating */}
                <div className="mt-16 p-8 bg-gradient-to-r from-gold-900/20 to-transparent border-l-4 border-gold-500 rounded-r-sm relative">
                    <div className="absolute -top-6 -left-2 text-6xl opacity-20 select-none">❝</div>
                    <h4 className="text-gold-400 font-display text-xl mb-3 uppercase tracking-widest">O Toque do Chef</h4>
                    <p className="font-serif text-xl italic text-stone-300 leading-relaxed">
                        {recipe.platingTips}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
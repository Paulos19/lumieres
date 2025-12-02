"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, Users, ChefHat, Save, Check, PlayCircle, 
  Image as ImageIcon, ArrowLeft, Film, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveRecipe, checkIsSaved } from "@/actions/recipe";
import { generateStepVideoAction } from "@/actions/ai"; // Nova action
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

interface RecipeCardProps {
  recipe: any;
  onClose: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClose }) => {
  const t = useTranslations('Cuisine');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaView, setMediaView] = useState<'image' | 'video'>('image');
  
  // Estado para vídeos dos passos
  // Ex: { 0: "url_do_video_passo_1", 2: "url_do_video_passo_3" }
  const [stepVideos, setStepVideos] = useState<Record<number, string>>(
    recipe.stepVideos || {} // Carrega vídeos se já existirem no JSON salvo
  );
  const [generatingStep, setGeneratingStep] = useState<number | null>(null);

  useEffect(() => {
    checkIsSaved(recipe.title).then(setIsSaved);
  }, [recipe.title]);

  const handleSave = async () => {
    setIsSaving(true);
    // Injeta os vídeos gerados no objeto da receita antes de salvar
    const recipeToSave = { ...recipe, stepVideos };
    
    const result = await toggleSaveRecipe(recipeToSave);
    setIsSaving(false);

    if (result.error) {
      toast.error(tCommon('error'));
      return;
    }

    setIsSaved(result.saved || false);
    toast.success(result.saved ? tCommon('saved') : "Removido");
  };

  const handleGenerateStepVideo = async (index: number, stepText: string) => {
    setGeneratingStep(index);
    try {
      const result = await generateStepVideoAction(stepText, recipe.title, locale);
      
      if (result.videoUrl) {
        setStepVideos(prev => ({
          ...prev,
          [index]: result.videoUrl!
        }));
        toast.success("Cena gerada com sucesso!");
      } else {
        toast.error("Não foi possível gerar o vídeo agora.");
      }
    } catch (e) {
      toast.error(tCommon('error'));
    } finally {
      setGeneratingStep(null);
    }
  };

  return (
    <div className="w-full bg-deep-900 min-h-screen animate-fade-in pb-20">
      {/* Navbar Fixa */}
      <div className="sticky top-0 z-50 bg-deep-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={16} />
          {tCommon('back')}
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
                {isSaved ? <><Check size={14} className="mr-2"/> {tCommon('saved')}</> : <><Save size={14} className="mr-2"/> {tCommon('save')}</>}
            </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4 md:px-8">
        {/* Header da Receita */}
        <div className="text-center mb-10">
            <div className="flex justify-center gap-3 mb-6">
                <span className="px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {recipe.category}
                </span>
                <span className="px-3 py-1 bg-deep-800 text-stone-400 border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {recipe.complexityRating === 'Simples' ? t('simple') : t('elaborate')}
                </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-gold-100 leading-tight mb-6">
                {recipe.title}
            </h1>
            <p className="font-serif text-lg text-stone-400 italic max-w-3xl mx-auto leading-relaxed">
                {recipe.description}
            </p>
        </div>

        {/* Hero Media (Principal) */}
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
                        ...
                    </div>
                )
            ) : (
                recipe.videoUrl ? (
                    <video 
                        src={recipe.videoUrl} 
                        controls 
                        autoPlay 
                        loop
                        className="w-full h-full object-cover" 
                    />
                ) : (
                     <div className="w-full h-full flex items-center justify-center text-stone-600 italic font-serif">
                        ...
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
                        <span className="hidden md:inline">Cinema</span>
                    </button>
                </div>
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-y border-white/5 py-6 mb-16">
            <div className="flex flex-col items-center justify-center border-r border-white/5">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <Clock size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">{t('time')}</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.prepTime}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-white/5">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <Users size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">{t('portions')}</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.portions}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                    <ChefHat size={18} />
                    <span className="text-[10px] uppercase tracking-widest hidden md:inline">{t('difficulty')}</span>
                </div>
                <span className="font-display text-xl md:text-2xl text-white">{recipe.difficulty}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Esquerda: Ingredientes e Infos */}
            <div className="lg:col-span-4 space-y-12">
                <div className="bg-deep-800/30 p-8 rounded-sm border border-white/5">
                    <h3 className="font-display text-2xl text-gold-400 mb-8 flex items-center gap-3">
                        <span>📜</span> {t('ingredients')}
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

                {recipe.macros && (
                    <div className="p-6 border border-white/5 rounded-sm">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-6 text-center">{t('nutrition')}</h4>
                        <div className="grid grid-cols-2 gap-y-6">
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.calories}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Kcal</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.protein}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Prot</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.carbs}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Carbs</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl text-white font-display">{recipe.macros.fat}</span>
                                <span className="text-[9px] text-gold-500 uppercase tracking-widest">Gord</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Direita: Modo de Preparo com Vídeo */}
            <div className="lg:col-span-8 space-y-16">
                <div>
                    <h3 className="font-display text-3xl text-gold-100 mb-10 pb-4 border-b border-white/5">
                        {t('preparation')}
                    </h3>
                    <div className="space-y-12">
                        {recipe.instructions?.map((step: string, i: number) => (
                            <div key={i} className="group relative">
                                <div className="flex items-baseline gap-6 mb-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gold-500/30 text-gold-400 flex items-center justify-center font-display text-lg group-hover:bg-gold-500 group-hover:text-deep-900 transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                                        {i + 1}
                                    </span>
                                    
                                    {/* Botão para Gerar Vídeo deste passo */}
                                    {!stepVideos[i] && (
                                        <button 
                                            onClick={() => handleGenerateStepVideo(i, step)}
                                            disabled={generatingStep === i}
                                            className="ml-auto text-xs uppercase tracking-widest text-stone-500 hover:text-gold-400 flex items-center gap-2 border border-white/10 px-3 py-1 rounded-full hover:border-gold-500/30 transition-all disabled:opacity-50"
                                        >
                                            {generatingStep === i ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Film size={12} />
                                            )}
                                            {generatingStep === i ? "Gerando..." : "Ver Cena"}
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-stone-300 font-sans font-light leading-8 text-lg pl-16 border-l border-white/5 ml-5 group-hover:border-gold-500/30 transition-colors mb-6">
                                    {step}
                                </p>

                                {/* Player de Vídeo do Passo */}
                                {stepVideos[i] && (
                                    <div className="ml-16 mb-8 rounded-sm overflow-hidden border border-gold-500/20 shadow-lg animate-fade-in relative bg-black aspect-video">
                                        <video 
                                            src={stepVideos[i]} 
                                            controls 
                                            autoPlay
                                            loop
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-[10px] text-gold-400 uppercase tracking-widest border border-gold-500/20">
                                            Veo AI
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 bg-gradient-to-r from-gold-900/20 to-transparent border-l-4 border-gold-500 rounded-r-sm relative">
                    <div className="absolute -top-6 -left-2 text-6xl opacity-20 select-none">❝</div>
                    <h4 className="text-gold-400 font-display text-xl mb-3 uppercase tracking-widest">{t('chefs_note')}</h4>
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
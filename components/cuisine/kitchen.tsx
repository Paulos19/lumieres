"use client";

import React, { useState } from 'react';
import { ModuleConfig } from '@/lib/constants';
import { generateMenuAction, generateRecipeAction, generateImageAction } from '@/actions/ai';
import { RecipeCard } from './recipe-card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Entrada', 'Petisco', 'Prato Principal', 'Sobremesa', 'Bebida Não Alcoólica'
];

interface KitchenProps {
  module: ModuleConfig;
}

export const Kitchen = ({ module }: KitchenProps) => {
  const [view, setView] = useState<'CATEGORIES' | 'MENU_LIST' | 'RECIPE_DETAIL'>('CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menuList, setMenuList] = useState<any[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [activeTab, setActiveTab] = useState<'Simples' | 'Elaborada'>('Simples');

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    setLoadingText(`O Chef está elaborando o menu de ${category}...`);
    
    try {
      const data = await generateMenuAction(module.promptModifier, category);
      if (data?.recipes) {
        setMenuList(data.recipes);
        setView('MENU_LIST');
      } else {
        toast.error("O Chef não conseguiu sugerir pratos no momento.");
      }
    } catch (e) {
      toast.error("Erro de comunicação com a cozinha.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = async (summary: any) => {
    setLoading(true);
    setLoadingText(`Preparando mise en place para "${summary.title}"...`);
    
    try {
      // 1. Gera texto
      const recipe = await generateRecipeAction(summary.title, module.promptModifier, selectedCategory);
      
      // 2. Tenta gerar imagem
      setLoadingText("Finalizando empratamento (Foto)...");
      const imageUrl = await generateImageAction(recipe.visualDescription);
      
      // CORREÇÃO: Injetamos a 'category' aqui para garantir que ela exista ao salvar no banco
      setCurrentRecipe({ 
        ...recipe, 
        id: summary.id, 
        imageUrl, 
        category: selectedCategory 
      });
      
      setView('RECIPE_DETAIL');
    } catch (e) {
      console.error(e);
      toast.error("Erro ao detalhar a receita.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-deep-900/95 backdrop-blur">
            <div className="w-16 h-16 border-4 border-stone-800 border-t-gold-500 rounded-full animate-spin mb-6"></div>
            <p className="font-display text-2xl text-gold-100 animate-pulse text-center px-4">{loadingText}</p>
        </div>
    );
  }

  return (
    <div className="w-full min-h-[600px]">
        {/* Breadcrumb simples */}
        {view !== 'CATEGORIES' && (
            <button 
                onClick={() => setView('CATEGORIES')} 
                className="mb-8 text-gold-500 hover:text-white uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
            >
                ← Voltar para Categorias
            </button>
        )}

        {view === 'CATEGORIES' && (
            <div className="animate-fade-in">
                <h2 className="font-display text-4xl text-white text-center mb-2">O que deseja servir?</h2>
                <p className="text-stone-400 text-center mb-12 font-serif italic">Selecione uma categoria para ver as sugestões do Chef</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className="group relative h-64 border border-white/5 hover:border-gold-500/50 rounded-sm overflow-hidden transition-all hover:-translate-y-2"
                        >
                            <div className="absolute inset-0 bg-deep-800 group-hover:bg-deep-900 transition-colors"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                <span className="font-serif text-4xl text-stone-600 group-hover:text-gold-300 mb-4 transition-colors">
                                    {cat === 'Entrada' ? '🥗' : cat === 'Petisco' ? '🍢' : cat === 'Prato Principal' ? '🥘' : cat === 'Sobremesa' ? '🍰' : '🍹'}
                                </span>
                                <span className="font-sans uppercase tracking-widest text-sm font-bold text-stone-300 group-hover:text-white text-center">
                                    {cat}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {view === 'MENU_LIST' && (
            <div className="animate-slide-up max-w-4xl mx-auto">
                <div className="flex justify-center mb-10">
                    <div className="bg-deep-800 p-1 rounded-full border border-white/10 flex">
                        {(['Simples', 'Elaborada'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                                    activeTab === tab ? "bg-gold-500 text-deep-900" : "text-stone-500 hover:text-gold-400"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    {menuList
                        .filter(item => item.complexityLevel === activeTab)
                        .map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => handleRecipeSelect(item)}
                            className="group p-6 bg-deep-800/30 border border-white/5 hover:border-gold-500/40 cursor-pointer transition-all rounded-sm flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-display text-xl text-stone-200 group-hover:text-gold-300 transition-colors">{item.title}</h3>
                                <p className="font-serif text-stone-500 text-sm italic mt-1">{item.description}</p>
                            </div>
                            <span className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {view === 'RECIPE_DETAIL' && currentRecipe && (
            <RecipeCard 
                recipe={currentRecipe} 
                onClose={() => setView('MENU_LIST')} 
            />
        )}
    </div>
  );
};
"use client";

import { useState } from "react";
import { Recipe } from "@prisma/client";
import { RecipeCard } from "@/components/cuisine/recipe-card";
import { Clock, ChefHat } from "lucide-react";
import { useTranslations } from "next-intl"; // Importar hook

interface MyRecipesListProps {
  initialRecipes: Recipe[];
}

export function MyRecipesList({ initialRecipes }: MyRecipesListProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const t = useTranslations('Dashboard'); // Usar hook de tradução

  const getRecipeData = (recipe: Recipe) => {
    if (typeof recipe.fullContentJson === 'object') {
      return recipe.fullContentJson;
    }
    return JSON.parse(recipe.fullContentJson as string);
  };

  return (
    <>
      {initialRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-lg bg-deep-800/30">
          <p className="text-gold-500 text-4xl mb-4">🍽️</p>
          <h3 className="font-display text-xl text-stone-300 mb-2">{t('empty_collection')}</h3>
          <p className="text-stone-500 font-serif italic">{t('empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {initialRecipes.map((recipe) => {
            const data = getRecipeData(recipe);
            
            return (
              <div 
                key={recipe.id}
                onClick={() => setSelectedRecipe(data)}
                className="group relative bg-card border border-white/5 hover:border-gold-500/50 rounded-sm overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-900/20"
              >
                {/* Image Header */}
                <div className="h-48 w-full relative overflow-hidden">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-deep-800 flex items-center justify-center text-stone-600 text-xs uppercase tracking-widest">
                      Sem Imagem
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-gold-400 border border-gold-500/20 rounded-sm">
                      {recipe.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h3 className="font-display text-lg text-gold-100 mb-2 line-clamp-1 group-hover:text-gold-400 transition-colors">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-wider mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gold-600" />
                      <span>{data.prepTime || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat size={12} className="text-gold-600" />
                      <span>{data.difficulty || "Médio"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Overlay */}
      {selectedRecipe && (
        <RecipeCard 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </>
  );
}
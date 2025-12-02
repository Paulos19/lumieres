// CORREÇÃO: Importar o Link do nosso roteamento i18n, não do next/link
import { Link } from "@/i18n/routing"; 
import { ModuleConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: ModuleConfig;
}

export const ModuleCard = ({ module }: ModuleCardProps) => {
  return (
    <Link 
      href={`/cuisine/${module.id}`}
      className="group relative h-96 overflow-hidden border border-white/5 hover:border-gold-500/50 transition-all duration-500 rounded-sm transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold-500/10 block"
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-500",
        module.color
      )}></div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center z-10">
        <div className="text-6xl mb-6 transform group-hover:-translate-y-4 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {module.icon}
        </div>
        
        <h3 className="font-display text-2xl md:text-3xl text-stone-200 group-hover:text-gold-400 transition-colors duration-300 mb-2 tracking-wide">
          {module.title}
        </h3>
        
        <span className="font-serif italic text-stone-400 text-sm mb-4 block group-hover:text-stone-300">
          {module.subtitle}
        </span>

        <p className="font-sans text-stone-500 text-sm leading-relaxed max-w-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
          {module.description}
        </p>
        
        <div className="mt-6 w-8 h-px bg-gold-500 group-hover:w-24 transition-all duration-500"></div>
      </div>
    </Link>
  );
};
import {
  ChefHat, Utensils, Wine, Coffee, Croissant,
  Wheat, Soup, Flame, Grape, Martini, CakeSlice, Fish
} from "lucide-react";

const icons = [
  ChefHat, Utensils, Wine, Coffee, Croissant,
  Wheat, Soup, Flame, Grape, Martini, CakeSlice, Fish
];

export const IconBackground = () => {
  const placements = [
    { top: '5%', left: '5%', rotate: '12deg' },
    { top: '15%', left: '25%', rotate: '-10deg' },
    { top: '8%', left: '45%', rotate: '45deg' },
    { top: '20%', left: '65%', rotate: '90deg' },
    { top: '10%', left: '85%', rotate: '-15deg' },
    
    { top: '35%', left: '10%', rotate: '20deg' },
    { top: '45%', left: '30%', rotate: '-5deg' },
    { top: '30%', left: '50%', rotate: '30deg' },
    { top: '40%', left: '75%', rotate: '-25deg' },
    { top: '50%', left: '90%', rotate: '10deg' },

    { top: '65%', left: '5%', rotate: '-30deg' },
    { top: '75%', left: '20%', rotate: '15deg' },
    { top: '60%', left: '40%', rotate: '-10deg' },
    { top: '80%', left: '60%', rotate: '5deg' },
    { top: '70%', left: '80%', rotate: '-20deg' },
    
    { top: '90%', left: '15%', rotate: '25deg' },
    { top: '85%', left: '35%', rotate: '-5deg' },
    { top: '95%', left: '55%', rotate: '10deg' },
    { top: '88%', left: '75%', rotate: '-30deg' },
    { top: '92%', left: '95%', rotate: '0deg' },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Fundo base escuro */}
        <div className="absolute inset-0 bg-deep-950"></div>
        
        {/* Gradiente radial para foco central */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-deep-900/80 via-deep-950 to-deep-950"></div>

        {/* Ícones com opacidade aumentada */}
        {placements.map((pos, index) => {
            const IconComponent = icons[index % icons.length];
            // Aumentado: Tamanhos variados para dinamismo
            const size = index % 3 === 0 ? 56 : index % 2 === 0 ? 40 : 32;
            
            // Aumentado: Opacidade agora varia entre 0.08 (8%) e 0.12 (12%)
            // Antes era 0.03 a 0.07. Isso deve tornar a textura bem mais nítida.
            const opacity = (index % 3 === 0 ? 0.08 : 0.12);
            
            return (
                <div
                    key={index}
                    className="absolute text-gold-600 transition-all duration-1000 ease-in-out"
                    style={{
                        top: pos.top,
                        left: pos.left,
                        transform: `rotate(${pos.rotate})`,
                        opacity: opacity,
                    }}
                >
                    <IconComponent size={size} strokeWidth={1.5} />
                </div>
            );
        })}
    </div>
  );
};
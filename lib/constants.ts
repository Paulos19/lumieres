export interface ModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  promptModifier: string;
  isPersonalized?: boolean;
}

export const MODULES: ModuleConfig[] = [
  // --- GRUPO 1: ESTILOS CULINÁRIOS ---
  {
    id: 'tradicao',
    title: 'Festin Royal',
    subtitle: 'A Tradição Clássica Mundial',
    description: 'Receitas opulentas de Natal e Ano Novo ao estilo europeu e americano. Perus, Assados, e acompanhamentos tradicionais globais.',
    icon: '👑',
    color: 'from-amber-900 to-yellow-900',
    promptModifier: 'Cozinha tradicional festiva clássica mundial. Opulenta, rica, uso de carnes nobres, frutas secas, castanhas. Estilo banquete real.'
  },
  {
    id: 'brasileiro',
    title: 'Héritage Tropical',
    subtitle: 'Clássicos Brasileiros',
    description: 'A alma do Natal brasileiro (Farofa, Salpicão, Chester, Rabanada) elevada ao nível de estrela Michelin. O simples feito com perfeição.',
    icon: '🇧🇷',
    color: 'from-green-900 to-yellow-900',
    promptModifier: 'Reinterpretação Gourmet dos clássicos brasileiros de Natal (Farofa rica, Salpicão, Maionese, Tender, Bacalhoada, Rabanada). Mantenha a identidade do prato mas com apresentação e técnicas da alta gastronomia.'
  },
  {
    id: 'gourmet',
    title: "L'Or Noir",
    subtitle: 'Alta Gastronomia Refinada',
    description: 'Para quem busca o extraordinário. Ingredientes raros, técnicas moleculares e empratamentos artísticos.',
    icon: '💎',
    color: 'from-slate-900 to-black',
    promptModifier: 'Alta gastronomia extrema. Ingredientes premium (trufas, caviar, açafrão, vieiras, wagyu). Técnicas avançadas (sous-vide, espumas, esferificação). Foco total em sofisticação e exclusividade.'
  },

  // --- GRUPO 2: DIETAS & SAÚDE ---
  {
    id: 'gluten_free',
    title: 'Liberté (Sem Glúten)',
    subtitle: 'Celíacos & Gluten Free',
    description: 'Segurança total para celíacos. Panificação e massas festivas sem trigo, usando farinhas nobres (amêndoas, arroz, coco).',
    icon: '🌾',
    color: 'from-orange-900 to-amber-800',
    promptModifier: 'Cozinha estritamente SEM GLÚTEN (Gluten-Free). Substitua farinha de trigo por mix de farinhas sem glúten de alta qualidade. Seguro para celíacos. Foco em texturas que imitam perfeitamente as originais.'
  },
  {
    id: 'lactose_free',
    title: 'Légèreté (Sem Lactose)',
    subtitle: 'Intolerantes à Lactose',
    description: 'Cremes, molhos e sobremesas ricas usando leites vegetais premium e queijos curados zero lactose.',
    icon: '🥛',
    color: 'from-blue-900 to-sky-900',
    promptModifier: 'Cozinha estritamente SEM LACTOSE (Dairy-Free ou Lac-Free). Use leites vegetais gordos (castanha, coco) ou produtos enzimados. Garanta a cremosidade e o sabor de queijo/leite sem causar desconforto.'
  },
  {
    id: 'keto',
    title: 'Cétogène Chic',
    subtitle: 'Low Carb & Keto',
    description: 'Baixo carboidrato, gorduras boas e proteínas nobres. Festas sem culpa e sem inchaço.',
    icon: '🥑',
    color: 'from-emerald-900 to-teal-900',
    promptModifier: 'Dieta Cetogênica (Keto) e Low Carb. Altíssimo foco em proteínas e gorduras boas. Zero farinhas brancas, zero açúcar. Use farinha de amêndoas, eritritol, carnes gordas, queijos. Sofisticação sem carboidratos.'
  },
  {
    id: 'sugar_free',
    title: 'Douceur Absolue',
    subtitle: 'Zero Açúcar',
    description: 'Doçura vinda da natureza. Sobremesas e pratos incríveis para quem cortou o açúcar refinado da dieta.',
    icon: '🍯',
    color: 'from-pink-900 to-rose-900',
    promptModifier: 'Cozinha ZERO AÇÚCAR (Sugar-Free). Use adoçantes naturais de baixo índice glicêmico (Xilitol, Eritritol, Stevia, Frutas). Foco em sobremesas que não parecem dietéticas. Apresentação luxuriante.'
  },
  {
    id: 'hipertensos',
    title: 'Coeur Sain',
    subtitle: 'Hipertensos (Baixo Sódio)',
    description: 'Explosão de sabor através de especiarias, ervas frescas e marinadas, sem depender do sal.',
    icon: '❤️',
    color: 'from-red-900 to-red-950',
    promptModifier: 'Cozinha para HIPERTENSOS (Baixo Sódio). Substitua o sal por ervas frescas, especiarias, limão, alho e marinadas complexas. O sabor deve vir dos temperos naturais, não do sal.'
  },

  // --- GRUPO 3: VEGETAL ---
  {
    id: 'vegano',
    title: 'Jardin Pur',
    subtitle: 'Vegano Estrito',
    description: '100% Plant-Based. A celebração dos vegetais sem nenhum derivado animal, com texturas surpreendentes.',
    icon: '🌱',
    color: 'from-green-900 to-emerald-950',
    promptModifier: 'Cozinha VEGANA (Plant-Based). Zero produtos de origem animal (nem mel, nem ovos). Foco em cogumelos, grãos, leguminosas, vegetais assados. Nada de "carne de soja" processada barata, use vegetais inteiros de forma nobre.'
  },
  {
    id: 'vegetariano',
    title: 'Harmonie',
    subtitle: 'Ovolacto-Vegetariano',
    description: 'O melhor dos queijos, ovos e vegetais. Pratos ricos e gratinados que dispensam a carne.',
    icon: '🧀',
    color: 'from-lime-900 to-green-900',
    promptModifier: 'Cozinha OVOLACTO-VEGETARIANA. Sem carnes, mas com uso livre de ovos de qualidade, queijos nobres, manteiga e creme de leite. Pratos ricos, gratinados e suflês.'
  },

  // --- GRUPO 4: PÚBLICOS ESPECIAIS ---
  {
    id: 'kids',
    title: 'Petit Gourmet',
    subtitle: 'Linha Kids',
    description: 'Pratos lúdicos, coloridos e saudáveis que as crianças vão amar comer na noite de festa.',
    icon: '🧸',
    color: 'from-indigo-900 to-purple-900',
    promptModifier: 'Culinária INFANTIL (Kids) Festiva. Pratos coloridos, lúdicos, fáceis de comer (finger food), saudáveis mas atrativos visualmente. Formatos divertidos, sabores suaves que agradam o paladar infantil.'
  },
  {
    id: 'budget',
    title: 'Trésor Économique',
    subtitle: 'Receitas Budget',
    description: 'Luxo acessível. Como transformar ingredientes baratos em banquetes inesquecíveis através da técnica.',
    icon: '💰',
    color: 'from-stone-800 to-stone-900',
    promptModifier: 'Receitas ECONÔMICAS (Budget Friendly). Ingredientes acessíveis e baratos (frango, porco, batata, frutas da estação) transformados em pratos de luxo através de técnicas de chef e apresentação impecável.'
  },
  {
    id: 'express',
    title: 'Temps Précieux',
    subtitle: 'Receitas Express (20min)',
    description: 'Sofisticação instantânea. Pratos impressionantes que ficam prontos em até 20 minutos para salvar sua noite.',
    icon: '⚡',
    color: 'from-cyan-900 to-blue-900',
    promptModifier: 'Receitas EXPRESS (Rápidas). Tempo de preparo total abaixo de 20-30 minutos. Foco em praticidade, pouca louça, mas resultado visualmente impactante e saboroso.'
  }
];
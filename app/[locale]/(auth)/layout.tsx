import { IconBackground } from "@/components/auth/icon-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Usamos flex, items-center e justify-center com min-h-screen para centralizar
    <div className="relative flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Inserimos o componente de fundo texturizado */}
      <IconBackground />
      
      {/* O conteúdo (os cards) fica centralizado acima do fundo */}
      <div className="w-full max-w-[450px] z-10 px-4 animate-fade-in">
        {children}
      </div>
      
      {/* Rodapé sutil opcional */}
      <div className="absolute bottom-4 text-stone-600 text-[10px] uppercase tracking-widest z-10">
        © 2025 Lumière Festin
      </div>
    </div>
  );
}
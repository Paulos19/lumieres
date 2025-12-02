import { MODULES } from "@/lib/constants";
import { Kitchen } from "@/components/cuisine/kitchen";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function CuisinePage({ params }: PageProps) {
  const { moduleId } = await params;
  
  const moduleConfig = MODULES.find(m => m.id === moduleId);

  if (!moduleConfig) {
    redirect("/atelier");
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="text-center mb-12 border-b border-white/5 pb-8">
        <h1 className="font-display text-3xl md:text-4xl text-gold-500 uppercase tracking-widest mb-2">
          {moduleConfig.title}
        </h1>
        <p className="text-stone-500 font-serif italic">{moduleConfig.subtitle}</p>
      </div>

      <Kitchen module={moduleConfig} />
    </div>
  );
}
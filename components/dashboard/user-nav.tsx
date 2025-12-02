import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

interface UserNavProps {
  locale: string;
}

export async function UserNav({ locale }: UserNavProps) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium text-gold-100">{user?.name}</span>
        <span className="text-xs text-stone-500">{user?.email}</span>
      </div>
      
      <form
        action={async () => {
          "use server";
          // CORREÇÃO: Redirecionar para a rota localizada
          await signOut({ redirectTo: `/${locale}/login` });
        }}
      >
        <Button 
            variant="outline" 
            className="border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-deep-900 transition-colors uppercase text-xs tracking-widest"
        >
          Sair
        </Button>
      </form>
    </div>
  );
}
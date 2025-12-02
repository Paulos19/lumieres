import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function UserNav() {
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
          await signOut({ redirectTo: "/login" });
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
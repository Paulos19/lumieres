"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface CardWrapperProps {
  children: React.ReactNode;
  title: string;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
}

export const CardWrapper = ({
  children,
  title,
  headerLabel,
  backButtonLabel,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-full bg-deep-900/90 backdrop-blur-md border border-gold-500/20 shadow-2xl shadow-black/50 overflow-hidden relative group">
      {/* Efeito de brilho sutil no topo do card */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <CardHeader className="space-y-1 pb-4 border-b border-white/5">
        <h1 className="font-display text-3xl text-center text-gold-500 drop-shadow-sm tracking-wider">
          {title}
        </h1>
        <p className="text-stone-400 text-center text-sm font-serif italic">
          {headerLabel}
        </p>
      </CardHeader>
      <CardContent className="pt-8 pb-6 px-8">
        {children}
      </CardContent>
      <CardFooter className="border-t border-white/5 pt-4 pb-4 justify-center bg-deep-950/30">
        <Button
          variant="link"
          className="font-normal text-stone-400 hover:text-gold-400 transition-colors text-xs uppercase tracking-widest"
          asChild
        >
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
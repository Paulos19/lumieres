"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  title: string;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  title
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] border-gold-500/30 bg-deep-800 shadow-2xl shadow-black">
      <CardHeader>
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
          <h1 className="font-display text-3xl text-gold-500">{title}</h1>
          <p className="text-stone-400 font-serif text-sm italic">{headerLabel}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <Link 
            href={backButtonHref} 
            className="w-full text-center text-xs text-gold-400 hover:text-gold-200 hover:underline uppercase tracking-widest transition-colors"
        >
            {backButtonLabel}
        </Link>
      </CardFooter>
    </Card>
  );
};
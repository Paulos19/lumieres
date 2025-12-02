import { redirect } from "@/i18n/routing";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Redireciona imediatamente para a área interna (Atelier)
  // O layout do dashboard cuidará de mandar para o login se não houver sessão.
  redirect({ href: "/atelier", locale: locale });
}
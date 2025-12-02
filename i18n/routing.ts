import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation'; // <-- Atualizado aqui

export const routing = defineRouting({
  // Lista de locais suportados
  locales: ['pt', 'en', 'fr', 'es', 'it'],
  
  // Locale padrão se nenhum for detectado
  defaultLocale: 'pt'
});

// Wrappers leves para navegação que consideram o locale
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
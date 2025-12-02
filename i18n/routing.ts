import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Lista de locais suportados
  locales: ['pt', 'en', 'fr', 'es', 'it'],
  
  // Locale padrão se nenhum for detectado
  defaultLocale: 'pt'
});

// Wrappers leves para navegação que consideram o locale
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
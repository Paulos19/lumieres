import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Matcher para ignorar arquivos internos do Next, imagens, etc.
  matcher: ['/', '/(pt|en|fr|es|it)/:path*']
};
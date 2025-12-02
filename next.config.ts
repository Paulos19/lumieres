import createNextIntlPlugin from 'next-intl/plugin';

// CORREÇÃO: Removido o '/src' do caminho, apontando para a raiz
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default withNextIntl(nextConfig);
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{js,jsx}'],
    exclude: ['node_modules/**', '.next/**', 'extracted_zip/**'],
  },
});

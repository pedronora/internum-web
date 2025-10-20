// eslint.config.js
import eslint from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // Configurações básicas recomendadas do ESLint
  eslint.configs.recommended,

  // Regras recomendadas do Vue 3 (modo Flat)
  ...eslintPluginVue.configs['flat/recommended'],

  // Integração com Prettier (desativa regras conflitantes)
  eslintConfigPrettier,

  // Suporte ao ambiente de navegador e ES2021+
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // APIs globais do navegador
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // Regras personalizadas e relaxamentos
      'vue/multi-word-component-names': 'off',
      'no-console': 'off', // permite console.log
      'no-empty': 'warn', // apenas avisa blocos vazios
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // ignora args não usados começando com "_"
      'vue/no-v-html': 'warn', // alerta, mas não bloqueia v-html
      'no-async-promise-executor': 'error', // mantém essa, pois é um erro real
    },
  },
]

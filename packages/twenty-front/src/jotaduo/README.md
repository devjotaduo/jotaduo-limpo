# Extensões JotaDuo

A configuração padrão do frontend carrega `jotaduoModuleOverridesPlugin`. O mapa em `vite/constants/JotaduoModuleOverrides.ts` substitui nove módulos do Twenty pela home mobile, navegação e onboarding JotaDuo. As implementações ficam nesta pasta e reutilizam os hooks, permissões, estado e componentes da versão atual do Twenty.

Use os comandos habituais do projeto para iniciar e compilar o frontend. Para desenvolvimento contra um backend em outro domínio, execute `yarn start:remote` em `packages/twenty-front`, com `REACT_APP_SERVER_BASE_URL` configurado para esse servidor. Essa configuração adicional traduz URLs e cookies entre o servidor remoto e a origem local.

O onboarding adicional consulta as rotas `/s/jotaduo/session` e `/s/jotaduo/onboarding` do aplicativo instalado no workspace. Sem o aplicativo, a consulta de disponibilidade mantém o onboarding adicional fechado. A entrada Conversas aparece somente quando o objeto do aplicativo existe; agendamentos e lembretes também dependem dos respectivos objetos do workspace. Esta camada não instala o aplicativo no servidor.

Validação da extensão:

```sh
npx jest --config packages/twenty-front/jest.config.mjs --runInBand --testPathPattern src/jotaduo
```

Origem: camada `src/jotaduo` da cópia de trabalho `dev-setup-docker-backend-64dde3`, dentro do projeto `jotaduov1.0` indicado para importação, incluindo as alterações locais da home mobile.

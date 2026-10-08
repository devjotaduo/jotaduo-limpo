# Plugin de marca JotaDuo

Personalização do frontend do Twenty. Um plugin do Vite aplica a marca no build sem
modificar os arquivos de `src/`, `public/` ou `index.html` do Twenty. Não é um app do
marketplace: a marca precisa aparecer antes do login, então ela entra no build do front.

Esta pasta vive no overlay e é copiada para `packages/twenty-front/branding/jotaduo` da
árvore do Twenty por `scripts/prepare.sh`. O único toque na árvore é
`patches/0001-twenty-front-branding-hook.patch`: o `import` e a chamada
`jotaduoBranding({ enabled: env.JOTADUO_BRANDING_ENABLED !== 'false' })` no início de
`plugins` em `packages/twenty-front/vite.config.ts`.

Consequência prática: a marca só existe na imagem gerada pelo overlay. Mudou algo aqui,
é imagem nova (veja `DEPLOY.md`).

## Arquivos

| Arquivo                | Para que serve                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| `brand.mjs`            | Nome, descrição, imagem social e logo padrão do workspace.            |
| `public/`              | Logos e ícones JotaDuo, nos mesmos caminhos públicos do Twenty.       |
| `source-overrides.mjs` | Lista explícita dos arquivos e trechos do Twenty que recebem a marca. |
| `vite-plugin.ts`       | Integração com o Vite e verificação de compatibilidade.               |
| `vite-plugin.test.mjs` | Testes do plugin (rodam sem as dependências do monorepo).             |

## O que o plugin muda

- **`index.html`**: `<title>`, as metatags com `content="Twenty"`, a descrição
  "A modern open-source CRM", a imagem social e o favicon.
- **`manifest.json`**: `name` e `short_name`.
- **Arquivos públicos**: copia `public/` do Twenty e depois `public/` desta pasta por
  cima, numa pasta temporária. Um ícone com o mesmo caminho substitui o original.
- **Textos do produto**: nos arquivos de `productCopyFiles`, troca a palavra `Twenty`
  pelo nome da marca.
- **Pontos específicos**: as entradas de `sourceOverrides` (rodapé do login, links de
  Termos de Serviço e Política de Privacidade, logo padrão do workspace, logo das telas
  de autenticação, favicon, sufixo do título das páginas).

Não muda: nomes de pacotes, identificadores de integrações, textos legais, o link do
Acordo de Processamento de Dados (DPA) do Twenty, logos enviados pelos próprios
workspaces e o servidor.

As mensagens do Lingui mantêm os textos e identificadores originais, e o nome da marca é
aplicado depois da tradução. Por isso os catálogos de português e dos outros idiomas
continuam funcionando sem traduções próprias.

## Mudar valores

Depois de qualquer mudança, rode `scripts/prepare.sh` (ele roda os testes). Para produção,
gere e publique uma imagem nova.

### Nome, idioma, descrição, imagem social, logo, favicon e links legais

`language` vai no `<html lang>` do HTML inicial. Sem ele o navegador vê `en` antes de o
Twenty carregar o idioma e oferece tradução. Depois de entrar, o Twenty troca para o idioma
da pessoa.

Edite `brand.mjs`:

```js
export const brand = {
  name: 'JotaDuo',
  language: 'pt-BR',
  description: 'WhatsApp, CRM, agenda e cobranças, com IA e sua equipe trabalhando juntas.',
  socialImage: 'https://jotaduo.com/social-preview.png',
  workspaceLogo: '/images/brand/jotaduo-app-icon.png',
  logo: {
    light: '/images/brand/jotaduo-app-icon.png',
    dark: '/images/brand/jotaduo-app-icon.png',
  },
  favicon: {
    light: '/images/brand/jotaduo-app-icon.png',
    dark: '/images/brand/jotaduo-app-icon.png',
  },
  legal: {
    termsOfService: 'https://jotaduo.com/termos',
    privacyPolicy: 'https://jotaduo.com/politica',
  },
  // ...
};
```

- `name` só aceita letras, números, espaço, `.`, `_` e `-`. Ele é inserido em código
  gerado, e o plugin recusa qualquer outro caractere.
- `workspaceLogo` precisa ser um caminho começando com `/`, que exista em `public/`.
  É o logo mostrado quando o workspace não enviou um próprio.
- `logo` define o ícone das telas de autenticação, no mesmo formato do Twenty: quadrado
  de 48px com o logo do workspace no canto. `favicon` define o ícone usado na aba.
  Ambos aceitam variantes claras e escuras; o plugin acompanha a classe de tema do
  Twenty em tempo real. Um logo enviado por um workspace continua sendo usado
  como favicon daquele workspace.
- `socialImage` é uma URL completa, usada na prévia de links (WhatsApp, redes sociais).
- `legal` define para onde vão os links "Termos de Serviço" e "Política de Privacidade"
  do rodapé do login e do cadastro, em todos os idiomas. Precisam ser URLs `https://`
  sem query string.

### Logos e ícones

Substitua os arquivos em `public/` mantendo **os mesmos nomes e tamanhos**: variantes
para Android, iOS, Windows 11 e um de integrações. Ao trocar a identidade visual,
atualize todas as variantes, senão o celular ou o Windows continuam mostrando o ícone
antigo.

Os ícones atuais seguem o desenho dos originais do Twenty: quadrado preto com cantos
arredondados (raio de 12,5% do lado) e o JD branco centralizado, com 62,5% da largura.
Em cada arquivo, o quadrado ocupa a mesma área que o "20" ocupa no original do Twenty.
Nos tiles largos e no splash do Windows, por exemplo, ele fica centralizado com margem.
`twenty-logo.svg` embute o mesmo ícone em PNG.

`jotaduo-monogram-*.png` e `jotaduo-wordmark-*.png` não são mais usados pela marca, mas
continuam publicados: o `DEPLOY.md` usa o monograma para conferir o deploy.

Para substituir outro arquivo público do Twenty, crie o arquivo aqui com o mesmo
caminho relativo que ele tem em `packages/twenty-front/public/`.

### Textos com "Twenty"

- **Trocar todas as ocorrências de `Twenty` num arquivo**: adicione o caminho (relativo a
  `packages/twenty-front/`) em `productCopyFiles`. O arquivo precisa conter a palavra
  `Twenty`, senão o plugin acusa incompatibilidade.
- **Trocar um trecho específico**: adicione uma entrada em `sourceOverrides`:

  ```js
  {
    file: 'src/caminho/do/Arquivo.tsx',
    search: 'trecho exato do código original',
    replacement: 'novo trecho, com {name} ou {workspaceLogo}',
  }
  ```

  `{name}` e `{workspaceLogo}` são trocados pelos valores de `brand.mjs`. O `search`
  precisa existir exatamente no arquivo original.

Prefira sempre essas listas a editar o arquivo do Twenty. É isso que evita conflitos nas
atualizações.

### Desativar

Defina `JOTADUO_BRANDING_ENABLED=false` no ambiente do build do Vite. O front sai com a
marca original do Twenty.

## Testar

O teste lê os arquivos do Twenty em `../../` a partir desta pasta, então só roda dentro
de uma árvore do Twenty. O caminho normal é:

```bash
scripts/prepare.sh
```

Ele monta `build/twenty` e roda
`node --test packages/twenty-front/branding/jotaduo/vite-plugin.test.mjs` lá dentro.
Os testes conferem os pontos de personalização, o manifesto, os arquivos públicos, os
títulos, que os textos legais e identificadores técnicos continuam intactos, que o Lingui
não ganha IDs novos e que a desativação funciona.

## Desenvolver a marca com o Vite

O Vite precisa de `node_modules`, que só o espelho `../jotaduo-limpo` tem. Aplique o
patch e copie a pasta na árvore de trabalho do espelho, sem commit:

```bash
git -C ../jotaduo-limpo apply patches/0001-twenty-front-branding-hook.patch && cp -R branding/jotaduo ../jotaduo-limpo/packages/twenty-front/branding/
```

Suba o Vite no espelho como de costume, com `packages/twenty-front/.env` apontando
`REACT_APP_SERVER_BASE_URL` para o backend local. Edite sempre a cópia daqui e copie de
novo; o reload automático não cobre a pasta do plugin. Ao terminar, limpe o espelho:

```bash
git -C ../jotaduo-limpo checkout -- packages/twenty-front/vite.config.ts && rm -rf ../jotaduo-limpo/packages/twenty-front/branding
```

Pegadinhas no Windows: o nx pode travar com o daemon ligado (`NX_DAEMON=false`); alguns
targets chamam `yarn`, que só existe via `corepack`; se o Vite mostrar
`504 (Outdated Optimize Dep)` ou `EPERM` em `node_modules/.vite`, pare o Vite, apague
`node_modules/.vite/packages/twenty-front` e suba de novo.

## Evitar conflitos ao atualizar o Twenty

- O plugin não edita arquivos do Twenty, só transforma o código na hora do build. O patch
  de 3 linhas no `vite.config.ts` é o único ponto que pode conflitar; como regenerá-lo
  está no `README.md` do overlay.
- `scripts/check-upstream.sh` roda estes testes contra a última release. Se um arquivo
  listado sumiu ou um `search` mudou, o teste (e o próprio Vite, ao iniciar) aponta qual.
  Atualize a entrada em `source-overrides.mjs` e rode de novo.
- Se o Twenty trocou um ícone em `packages/twenty-front/public/` que também temos aqui, o
  nosso vence; se o dele mudou de nome, o nosso deixa de substituí-lo.
- Não faça commit dos catálogos de tradução. O plugin não precisa deles.

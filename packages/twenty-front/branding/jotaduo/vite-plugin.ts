import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

import { brand } from './brand.mjs';
import { productCopyFiles, sourceOverrides } from './source-overrides.mjs';

const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });

const themeBrandMarkup = () => `
    <style id="jotaduo-theme-brand">
      :root {
        --jotaduo-auth-logo: url('${brand.logo.light}');
      }

      :root.dark {
        --jotaduo-auth-logo: url('${brand.logo.dark}');
      }

      .jotaduo-auth-logo a > div {
        background-image: var(--jotaduo-auth-logo) !important;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
      }
    </style>
    <script>
      (() => {
        const lightFavicon = '${brand.favicon.light}';
        const darkFavicon = '${brand.favicon.dark}';
        const syncFavicon = () => {
          const favicon = document.querySelector('link[data-jotaduo-favicon="true"]');
          if (favicon) {
            favicon.setAttribute(
              'href',
              document.documentElement.classList.contains('dark')
                ? darkFavicon
                : lightFavicon,
            );
          }
        };

        new MutationObserver(syncFavicon).observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });
        new MutationObserver(syncFavicon).observe(document.head, {
          childList: true,
          subtree: true,
        });
        syncFavicon();
      })();
    </script>`;

export const transformBrandSource = (source: string, relativeFile: string) => {
  let transformed = source;

  if (productCopyFiles.includes(relativeFile)) {
    const translatedMessages: string[] = [];

    // Preserve Lingui message IDs, then brand the translated result.
    transformed = source.replace(/\bt`(?:\\[\s\S]|[^`\\])*`/g, (message) => {
      const index = translatedMessages.push(message) - 1;

      return `__JOTADUO_TRANSLATED_MESSAGE_${index}__`;
    });
    transformed = transformed.replace(/\bTwenty\b/g, brand.name);
    transformed = transformed.replace(
      /__JOTADUO_TRANSLATED_MESSAGE_(\d+)__/g,
      (_match, index: string) => {
        const message = translatedMessages[Number(index)];

        return /\bTwenty\b/.test(message)
          ? `${message}.replace(/\\bTwenty\\b/g, ${JSON.stringify(brand.name)})`
          : message;
      },
    );
  }

  for (const override of sourceOverrides) {
    if (override.file !== relativeFile) {
      continue;
    }

    const replacement = override.replacement
      .replaceAll('{name}', brand.name)
      .replaceAll('{workspaceLogo}', brand.workspaceLogo)
      .replaceAll('{termsOfServiceUrl}', brand.legal.termsOfService)
      .replaceAll('{privacyPolicyUrl}', brand.legal.privacyPolicy);

    transformed = transformed.replace(override.search, replacement);
  }

  return transformed;
};

export const validateBrandingTargets = (root: string): string[] => {
  const targets = [
    ...productCopyFiles.map((file) => ({ file, search: 'Twenty' })),
    ...sourceOverrides,
  ];

  return targets
    .filter(({ file, search }) => {
      const filename = path.join(root, file);

      return (
        !existsSync(filename) ||
        !readFileSync(filename, 'utf8').includes(search)
      );
    })
    .map(({ file }) => file);
};

export const jotaduoBranding = ({
  enabled = true,
}: { enabled?: boolean } = {}): Plugin | false => {
  if (!enabled) {
    return false;
  }

  // These values are interpolated into source literals as well as HTML.
  if (
    !/^[\p{L}\p{N} ._-]+$/u.test(brand.name) ||
    !/^[a-z]{2}(-[A-Z]{2})?$/.test(brand.language) ||
    ![
      brand.workspaceLogo,
      ...Object.values(brand.logo),
      ...Object.values(brand.favicon),
    ].every((assetPath) => /^\/[a-zA-Z0-9/_.-]+$/.test(assetPath)) ||
    !Object.values(brand.legal).every((url) =>
      /^https:\/\/[a-z0-9.-]+(\/[a-zA-Z0-9/_.-]*)?$/.test(url),
    )
  ) {
    throw new Error('Invalid JotaDuo brand name, asset path or legal URL');
  }

  let root = '';
  let temporaryPublicDirectory: string | undefined;

  const cleanup = () => {
    if (temporaryPublicDirectory) {
      rmSync(temporaryPublicDirectory, { recursive: true, force: true });
      temporaryPublicDirectory = undefined;
    }
  };

  return {
    name: 'jotaduo-branding',
    enforce: 'pre',

    config(config) {
      root = path.resolve(config.root ?? process.cwd());
      const changedTargets = validateBrandingTargets(root);

      if (changedTargets.length > 0) {
        throw new Error(
          `JotaDuo branding needs an upstream compatibility update:\n${changedTargets.join('\n')}`,
        );
      }

      if (config.publicDir === false) {
        throw new Error('JotaDuo branding requires Vite publicDir');
      }

      const upstreamPublic = path.resolve(root, config.publicDir ?? 'public');
      temporaryPublicDirectory = mkdtempSync(
        path.join(tmpdir(), 'jotaduo-branding-'),
      );

      try {
        cpSync(upstreamPublic, temporaryPublicDirectory, { recursive: true });
        cpSync(path.join(pluginDirectory, 'public'), temporaryPublicDirectory, {
          recursive: true,
        });

        const manifestPath = path.join(
          temporaryPublicDirectory,
          'manifest.json',
        );
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

        manifest.name = brand.name;
        manifest.short_name = brand.name;
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      } catch (error) {
        cleanup();
        throw error;
      }

      return { publicDir: temporaryPublicDirectory };
    },

    transform(source, id) {
      const filename = id.split('?')[0];
      const relativeFile = path
        .relative(root, filename)
        .split(path.sep)
        .join('/');
      const transformed = transformBrandSource(source, relativeFile);

      return transformed === source ? null : { code: transformed, map: null };
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<html lang="en"', `<html lang="${brand.language}"`)
          .replaceAll('content="Twenty"', `content="${escapeHtml(brand.name)}"`)
          .replace(
            '<title>Twenty</title>',
            `<title>${escapeHtml(brand.name)}</title>`,
          )
          .replaceAll('A modern open-source CRM', escapeHtml(brand.description))
          .replaceAll(
            'https://raw.githubusercontent.com/twentyhq/twenty/main/docs/static/img/social-card.png',
            escapeHtml(brand.socialImage),
          )
          .replace(
            'href="/images/icons/android/android-launchericon-48-48.png"\n      data-rh="true"',
            `href="${brand.favicon.light}"\n      data-jotaduo-favicon="true"\n      data-rh="true"`,
          )
          .replace('</head>', `${themeBrandMarkup()}\n  </head>`);
      },
    },

    closeBundle() {
      cleanup();
    },
  };
};

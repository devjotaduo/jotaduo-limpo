import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { brand } from './brand.mjs';
import { productCopyFiles, sourceOverrides } from './source-overrides.mjs';
import {
  jotaduoBranding,
  transformBrandSource,
  validateBrandingTargets,
} from './vite-plugin.ts';

const frontendRoot = fileURLToPath(new URL('../../', import.meta.url));

const createFixture = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'jotaduo-branding-test-'));
  const files = [
    ...productCopyFiles,
    ...sourceOverrides.map(({ file }) => file),
    'public/manifest.json',
  ];

  for (const file of files) {
    const target = path.join(root, file);

    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(path.join(frontendRoot, file)));
  }

  writeFileSync(path.join(root, 'public/keep.txt'), 'upstream asset');

  return root;
};

test('branding can be disabled without touching the frontend', () => {
  assert.equal(jotaduoBranding({ enabled: false }), false);
});

test('the current upstream source is compatible with the plugin', () => {
  assert.deepEqual(validateBrandingTargets(frontendRoot), []);

  for (const file of productCopyFiles) {
    const source = readFileSync(path.join(frontendRoot, file), 'utf8');
    const result = transformBrandSource(source, file);

    assert.ok(result.includes(brand.name), file);
  }
});

test('unrelated code, legal copy and technical identifiers stay intact', () => {
  const source = 'import { Twenty } from "twenty-sdk"; const name = "Twenty";';

  assert.equal(transformBrandSource(source, 'src/unrelated.ts'), source);

  const mcpFile = 'src/modules/settings/mcp-and-apis/constants/McpSetup.ts';
  const mcpSource = readFileSync(path.join(frontendRoot, mcpFile), 'utf8');
  const result = transformBrandSource(mcpSource, mcpFile);

  assert.ok(result.includes("name: 'twenty'"));
  assert.ok(result.includes(`displayName: '${brand.name}'`));
  assert.ok(result.includes('https://chatgpt.com/apps/twenty/'));
});

test('branding preserves translated messages instead of creating new Lingui IDs', () => {
  const source = 't`Welcome to Twenty`';
  const result = transformBrandSource(source, 'src/pages/auth/SignInUp.tsx');

  assert.ok(result.startsWith(source));
  assert.equal(
    runInNewContext(result, {
      t: ([message]) => {
        assert.equal(message, 'Welcome to Twenty');

        return 'Bem-vindo ao Twenty';
      },
    }),
    `Bem-vindo ao ${brand.name}`,
  );
});

test('logos and page titles are branded without rewriting their source files', () => {
  for (const override of sourceOverrides) {
    const source = readFileSync(path.join(frontendRoot, override.file), 'utf8');
    const result = transformBrandSource(source, override.file);

    assert.notEqual(result, source);
    assert.equal(result.includes(override.search), false);
    assert.equal(
      readFileSync(path.join(frontendRoot, override.file), 'utf8'),
      source,
    );
  }

  const logoSource = readFileSync(
    path.join(frontendRoot, 'src/modules/auth/components/Logo.tsx'),
    'utf8',
  );
  assert.ok(
    transformBrandSource(
      logoSource,
      'src/modules/auth/components/Logo.tsx',
    ).includes('jotaduo-auth-logo'),
  );

  const faviconSource = readFileSync(
    path.join(
      frontendRoot,
      'src/modules/app/components/PageFavicon.tsx',
    ),
    'utf8',
  );
  const brandedFavicon = transformBrandSource(
    faviconSource,
    'src/modules/app/components/PageFavicon.tsx',
  );
  assert.ok(brandedFavicon.includes('const faviconUrl'));
  assert.ok(brandedFavicon.includes('data-jotaduo-favicon'));
});

test('terms and privacy links point to the brand legal pages', () => {
  const file = 'src/modules/auth/utils/getTwentyWebsiteUrl.ts';
  const result = transformBrandSource(
    readFileSync(path.join(frontendRoot, file), 'utf8'),
    file,
  );

  assert.ok(
    result.includes(
      `return page === 'terms' ? '${brand.legal.termsOfService}' : '${brand.legal.privacyPolicy}';`,
    ),
  );
  assert.equal(result.includes('return url.toString();'), false);
});

test('development and build use a merged public directory and clean it up', () => {
  const root = createFixture();
  const plugin = jotaduoBranding();
  const originalManifest = readFileSync(
    path.join(root, 'public/manifest.json'),
    'utf8',
  );
  let publicDir;

  try {
    ({ publicDir } = plugin.config({ root }));
    const manifest = JSON.parse(
      readFileSync(path.join(publicDir, 'manifest.json'), 'utf8'),
    );

    assert.equal(manifest.name, brand.name);
    assert.equal(manifest.short_name, brand.name);
    assert.equal(
      readFileSync(path.join(publicDir, 'keep.txt'), 'utf8'),
      'upstream asset',
    );
    assert.equal(
      readFileSync(path.join(root, 'public/manifest.json'), 'utf8'),
      originalManifest,
    );

    for (const icon of manifest.icons) {
      assert.ok(existsSync(path.join(publicDir, icon.src)), icon.src);
    }

    const logo = brand.workspaceLogo.slice(1);
    assert.deepEqual(
      readFileSync(path.join(publicDir, logo)),
      readFileSync(new URL(`./public/${logo}`, import.meta.url)),
    );

    const file = 'src/pages/auth/SignInUp.tsx';
    const source = readFileSync(path.join(root, file), 'utf8');
    const result = plugin.transform(source, `${path.join(root, file)}?v=1`);

    assert.ok(result.code.includes('t`Welcome to Twenty`.replace('));
    assert.ok(result.code.includes(brand.name));
    assert.equal(
      plugin.transform('const value = 1;', path.join(root, 'src/other.ts')),
      null,
    );
  } finally {
    plugin.closeBundle();
    rmSync(root, { recursive: true, force: true });
  }

  assert.equal(existsSync(publicDir), false);
});

test('HTML branding preserves the server runtime configuration markers', () => {
  const source = readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');
  const result = jotaduoBranding().transformIndexHtml.handler(source);

  assert.ok(result.includes(`<title>${brand.name}</title>`));
  assert.ok(result.includes(`<html lang="${brand.language}"`));
  assert.ok(result.includes(brand.socialImage));
  assert.ok(result.includes(brand.description));
  assert.ok(result.includes('<!-- BEGIN: Twenty Config -->'));
  assert.ok(result.includes('id="twenty-env-config"'));
  assert.ok(result.includes(brand.logo.light));
  assert.ok(result.includes(brand.logo.dark));
  assert.ok(result.includes(brand.favicon.light));
  assert.ok(result.includes(brand.favicon.dark));
  assert.ok(
    result.includes("document.documentElement.classList.contains('dark')"),
  );
  assert.equal(result.includes('githubusercontent.com/twentyhq/twenty'), false);
});

test('an incompatible upstream update fails with the file needing maintenance', () => {
  const root = createFixture();

  try {
    const changedFile = productCopyFiles[0];

    writeFileSync(path.join(root, changedFile), 'export const changed = true;');
    assert.deepEqual(validateBrandingTargets(root), [changedFile]);
    assert.throws(() => jotaduoBranding().config({ root }), {
      message: `JotaDuo branding needs an upstream compatibility update:\n${changedFile}`,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

import path from 'path';

import { jotaduoModuleOverridesPlugin } from '~/jotaduo/vite/jotaduoModuleOverridesPlugin';

// Vite hands plugins absolute, forward-slashed ids (with the drive letter on
// Windows), so the fixtures are built the same way.
const SOURCE_ROOT = path
  .resolve('/repo/packages/twenty-front/src')
  .replace(/\\/g, '/');

const UPSTREAM_HOME_PAGE_PATH = `${SOURCE_ROOT}/pages/mobile-home/MobileHomePage.tsx`;
const JOTADUO_HOME_PAGE_PATH = `${SOURCE_ROOT}/jotaduo/mobile-home/pages/MobileHomePage.tsx`;

type ResolveIdHook = (
  this: { resolve: jest.Mock },
  source: string,
  importer: string | undefined,
  options: Record<string, unknown>,
) => Promise<string | null>;

const runResolveId = async ({
  source,
  importer,
  resolvedId,
}: {
  source: string;
  importer: string | undefined;
  resolvedId: string | null;
}) => {
  const plugin = jotaduoModuleOverridesPlugin({ sourceRoot: SOURCE_ROOT });
  const resolve = jest.fn(async () =>
    resolvedId === null ? null : { id: resolvedId },
  );

  // The hook is called with a stub context, which vite's PluginContext type
  // cannot describe.
  const result = await (plugin.resolveId as unknown as ResolveIdHook).call(
    { resolve },
    source,
    importer,
    {},
  );

  return { result, resolve };
};

describe('jotaduoModuleOverridesPlugin', () => {
  it('should swap an upstream module for its JotaDuo override', async () => {
    const { result } = await runResolveId({
      source: '~/pages/mobile-home/MobileHomePage',
      importer: `${SOURCE_ROOT}/modules/app/routing/utils/createWorkspaceRouteObjects.tsx`,
      resolvedId: UPSTREAM_HOME_PAGE_PATH,
    });

    expect(result).toBe(JOTADUO_HOME_PAGE_PATH);
  });

  it('should match a resolved id that carries a query string', async () => {
    const { result } = await runResolveId({
      source: './MobileHomePage',
      importer: `${SOURCE_ROOT}/pages/mobile-home/index.ts`,
      resolvedId: `${UPSTREAM_HOME_PAGE_PATH}?import`,
    });

    expect(result).toBe(JOTADUO_HOME_PAGE_PATH);
  });

  it('should let the override import the module it replaces', async () => {
    const { result } = await runResolveId({
      source: '~/pages/mobile-home/MobileHomePage',
      importer: JOTADUO_HOME_PAGE_PATH,
      resolvedId: UPSTREAM_HOME_PAGE_PATH,
    });

    expect(result).toBeNull();
  });

  it('should skip resolution for specifiers that cannot be overridden', async () => {
    const { result, resolve } = await runResolveId({
      source: '@/ui/utilities/responsive/hooks/useIsMobile',
      importer: UPSTREAM_HOME_PAGE_PATH,
      resolvedId: `${SOURCE_ROOT}/modules/ui/utilities/responsive/hooks/useIsMobile.ts`,
    });

    expect(result).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it('should leave a same-named module from elsewhere untouched', async () => {
    const { result } = await runResolveId({
      source: './MobileHomePage',
      importer: `${SOURCE_ROOT}/modules/other/index.ts`,
      resolvedId: `${SOURCE_ROOT}/modules/other/MobileHomePage.tsx`,
    });

    expect(result).toBeNull();
  });
});

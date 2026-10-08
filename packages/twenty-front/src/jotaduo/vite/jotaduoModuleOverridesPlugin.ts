import path from 'path';
import { type Plugin } from 'vite';

import { JOTADUO_MODULE_OVERRIDES } from './constants/JotaduoModuleOverrides';

// Same result as vite's normalizePath, kept local because vite is ESM-only and
// jest loads this file as CommonJS.
const normalizePath = (filePath: string) =>
  path.posix.normalize(filePath.replace(/\\/g, '/'));

const stripQuery = (id: string) => id.split('?')[0];

const getFileNameWithoutExtension = (filePath: string) =>
  path.basename(filePath, path.extname(filePath));

// Swaps upstream Twenty modules for JotaDuo ones at resolve time, so the fork
// never edits upstream files and upstream merges stay conflict-free.
export const jotaduoModuleOverridesPlugin = ({
  sourceRoot,
}: {
  sourceRoot: string;
}): Plugin => {
  const overridePathByUpstreamPath = new Map(
    Object.entries(JOTADUO_MODULE_OVERRIDES).map(
      ([upstreamPath, overridePath]) => [
        normalizePath(path.resolve(sourceRoot, upstreamPath)),
        normalizePath(path.resolve(sourceRoot, overridePath)),
      ],
    ),
  );

  // Resolving every import twice would slow the dev server down, so only
  // specifiers that can point at an overridden file get the full resolution.
  const overriddenFileNames = new Set(
    [...overridePathByUpstreamPath.keys()].map(getFileNameWithoutExtension),
  );

  return {
    name: 'jotaduo-module-overrides',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (
        importer === undefined ||
        !overriddenFileNames.has(getFileNameWithoutExtension(source))
      ) {
        return null;
      }

      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });

      if (resolved === null) {
        return null;
      }

      const overridePath = overridePathByUpstreamPath.get(
        normalizePath(stripQuery(resolved.id)),
      );

      // The override itself may import the module it replaces.
      if (
        overridePath === undefined ||
        normalizePath(stripQuery(importer)) === overridePath
      ) {
        return null;
      }

      return overridePath;
    },
  };
};

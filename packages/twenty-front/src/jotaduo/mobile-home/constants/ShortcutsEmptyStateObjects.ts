import { type ThemeColor } from 'twenty-ui/theme';

// Rounds out the icon stack of the empty Shortcuts card after the My work
// icons, as drawn in the design. Objects missing from a workspace are skipped.
export const SHORTCUTS_EMPTY_STATE_OBJECTS: {
  objectNamePlural: string;
  color: ThemeColor;
}[] = [
  { objectNamePlural: 'people', color: 'blue' },
  { objectNamePlural: 'jdCobrancas', color: 'green' },
  { objectNamePlural: 'jdPaginas', color: 'purple' },
];

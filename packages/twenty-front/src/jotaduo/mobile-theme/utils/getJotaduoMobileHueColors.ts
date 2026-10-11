import { type ThemeColor } from 'twenty-ui/theme';

type JotaduoMobileHueColors = {
  backgroundColor: string;
  iconColor: string;
};

// Twenty colour names the design draws with its own hue. Twenty calls the
// design's teal "turquoise".
const DESIGN_HUE_BY_THEME_COLOR: Partial<Record<ThemeColor, string>> = {
  blue: 'blue',
  orange: 'orange',
  amber: 'amber',
  turquoise: 'teal',
  red: 'red',
  violet: 'violet',
  green: 'green',
  purple: 'purple',
  gray: 'gray',
};

export const getJotaduoMobileHueColors = (
  color: ThemeColor,
): JotaduoMobileHueColors => {
  const designHue = DESIGN_HUE_BY_THEME_COLOR[color];

  if (designHue !== undefined) {
    return {
      backgroundColor: `var(--jd-mobile-hue-${designHue}-background)`,
      iconColor: `var(--jd-mobile-hue-${designHue}-icon)`,
    };
  }

  // Colours the design does not draw keep its recipe, from Twenty's own
  // scale: tint 3 under shade 11.
  return {
    backgroundColor: `var(--t-color-${color}3)`,
    iconColor: `var(--t-color-${color}11)`,
  };
};

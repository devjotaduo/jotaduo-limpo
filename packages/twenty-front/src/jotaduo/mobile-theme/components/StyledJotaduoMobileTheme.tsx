/* oxlint-disable twenty/no-hardcoded-colors --
   This file is the design's palette: the one place the mobile surfaces'
   colours are written down, for both colour schemes. */
import { styled } from '@linaria/react';

// Declares the design's colours for everything rendered inside. Twenty puts
// the colour scheme class on <html>, hence the ancestor selector.
//
// Twenty also squircles every corner and zooms the whole app by 14/13 on
// phones. The design is drawn with plain radii at device pixels, so the scope
// turns the squircle off and keeps only the user's own UI scale.
export const StyledJotaduoMobileTheme = styled.div`
  --jd-mobile-accent: #0d74ce;
  --jd-mobile-border: #ebebeb;
  --jd-mobile-card: #ffffff;
  --jd-mobile-control: #f7f7f7;
  --jd-mobile-control-border: #ebebeb;
  --jd-mobile-floating-control: #ffffff;
  --jd-mobile-floating-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --jd-mobile-hue-amber-background: #fff7c2;
  --jd-mobile-hue-amber-icon: #ab6400;
  --jd-mobile-hue-blue-background: #e6f4fe;
  --jd-mobile-hue-blue-icon: #0d74ce;
  --jd-mobile-hue-gray-background: #f0f0f0;
  --jd-mobile-hue-gray-icon: #646464;
  --jd-mobile-hue-green-background: #e6f6eb;
  --jd-mobile-hue-green-icon: #218358;
  --jd-mobile-hue-orange-background: #ffefd6;
  --jd-mobile-hue-orange-icon: #cc4e00;
  --jd-mobile-hue-purple-background: #f7edfe;
  --jd-mobile-hue-purple-icon: #8145b5;
  --jd-mobile-hue-red-background: #feebec;
  --jd-mobile-hue-red-icon: #ce2c31;
  --jd-mobile-hue-teal-background: #e0f8f3;
  --jd-mobile-hue-teal-icon: #008573;
  --jd-mobile-hue-violet-background: #efe9ff;
  --jd-mobile-hue-violet-icon: #6550b9;
  --jd-mobile-inverse: #333333;
  --jd-mobile-inverse-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  --jd-mobile-inverse-text: #ffffff;
  --jd-mobile-navigation-bar: rgba(255, 255, 255, 0.95);
  --jd-mobile-navigation-bar-active: #ededed;
  --jd-mobile-navigation-bar-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
  --jd-mobile-page: #f1f1f1;
  --jd-mobile-text: #333333;
  --jd-mobile-text-secondary: #666666;
  --jd-mobile-text-tertiary: #999999;
  --jd-mobile-workspace-logo: #12a594;
  --jd-mobile-workspace-logo-text: #ffffff;
  --t-corner-shape: round;
  font-family:
    -apple-system, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui,
    sans-serif;
  zoom: calc(var(--t-scale-user, 1) / var(--t-zoom, 1));

  .dark & {
    --jd-mobile-accent: #70b8ff;
    --jd-mobile-border: #2b2b2b;
    --jd-mobile-card: #1f1f1f;
    --jd-mobile-control: #292929;
    --jd-mobile-control-border: #333333;
    --jd-mobile-floating-control: #222222;
    --jd-mobile-floating-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    --jd-mobile-hue-amber-background: #302008;
    --jd-mobile-hue-amber-icon: #ffca16;
    --jd-mobile-hue-blue-background: #0d2847;
    --jd-mobile-hue-blue-icon: #70b8ff;
    --jd-mobile-hue-gray-background: #292929;
    --jd-mobile-hue-gray-icon: #b4b4b4;
    --jd-mobile-hue-green-background: #132d21;
    --jd-mobile-hue-green-icon: #3dd68c;
    --jd-mobile-hue-orange-background: #331e0b;
    --jd-mobile-hue-orange-icon: #ff801f;
    --jd-mobile-hue-purple-background: #301c3b;
    --jd-mobile-hue-purple-icon: #d19dff;
    --jd-mobile-hue-red-background: #3b1219;
    --jd-mobile-hue-red-icon: #ff9592;
    --jd-mobile-hue-teal-background: #0d2d2a;
    --jd-mobile-hue-teal-icon: #0bd8b6;
    --jd-mobile-hue-violet-background: #2b2150;
    --jd-mobile-hue-violet-icon: #baa7ff;
    --jd-mobile-inverse: #ebebeb;
    --jd-mobile-inverse-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    --jd-mobile-inverse-text: #171717;
    --jd-mobile-navigation-bar: rgba(31, 31, 31, 0.95);
    --jd-mobile-navigation-bar-active: #333333;
    --jd-mobile-navigation-bar-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
    --jd-mobile-page: #171717;
    --jd-mobile-text: #ebebeb;
    --jd-mobile-text-secondary: #b3b3b3;
    --jd-mobile-text-tertiary: #6b6b6b;
  }
`;

import { i18n, type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';

import { JOTADUO_CATALOGS } from '~/jotaduo/i18n/constants/JotaduoCatalogs';

// i18n.load merges into whatever catalog is already there, so loading once at
// import time survives the upstream catalog being loaded later on activation.
i18n.load(JOTADUO_CATALOGS);

export type JotaduoTextValues = Record<string, string | number>;

export const useJotaduoText = () => {
  const { i18n: activeI18n } = useLingui();

  // Fills the %name% marks the fork's messages use for values.
  const getText = (
    messageDescriptor: MessageDescriptor,
    values: JotaduoTextValues = {},
  ) =>
    Object.entries(values).reduce(
      (text, [name, value]) => text.replaceAll(`%${name}%`, String(value)),
      activeI18n._(messageDescriptor),
    );

  return { getText };
};

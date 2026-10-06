import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import {
  StyledMobileHomeCard,
  StyledMobileHomeSecondaryButton,
} from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { SHORTCUTS_EMPTY_STATE_OBJECTS } from '~/jotaduo/mobile-home/constants/ShortcutsEmptyStateObjects';
import { useMyWorkItems } from '~/jotaduo/mobile-home/hooks/useMyWorkItems';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledEmptyStateCard = styled(StyledMobileHomeCard)`
  align-items: center;
  padding: 20px 16px 16px;
  text-align: center;
`;

const StyledIconStack = styled.div`
  display: flex;
  justify-content: center;
`;

// The ring in the card's colour is what separates the overlapping discs.
const StyledStackedIconTile = styled(MobileHomeIconTile)`
  border: 2px solid ${JOTADUO_MOBILE_THEME_VARIABLES.card};

  & + & {
    margin-left: -6px;
  }
`;

const StyledTitle = styled.p`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  margin: 14px 0 0;
  max-width: 300px;
`;

const StyledDescription = styled.p`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 15px;
  line-height: 1.4;
  margin: 6px 0 0;
  max-width: 310px;
`;

const StyledActionContainer = styled.div`
  margin-top: 16px;
  width: 100%;
`;

type ShortcutsEmptyStateProps = {
  onStart: () => void;
};

export const ShortcutsEmptyState = ({ onStart }: ShortcutsEmptyStateProps) => {
  const myWorkItems = useMyWorkItems();
  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const { getIcon } = useIcons();
  const { getText } = useJotaduoText();

  const stackedIcons = [
    ...myWorkItems.map(({ key, Icon, color }) => ({ key, Icon, color })),
    ...SHORTCUTS_EMPTY_STATE_OBJECTS.flatMap(({ objectNamePlural, color }) => {
      const objectMetadataItem =
        findActiveObjectMetadataItemByNamePlural(objectNamePlural);

      return isDefined(objectMetadataItem)
        ? [
            {
              key: objectNamePlural,
              Icon: getIcon(objectMetadataItem.icon),
              color,
            },
          ]
        : [];
    }),
  ];

  return (
    <StyledEmptyStateCard>
      <StyledIconStack aria-hidden>
        {stackedIcons.map(({ key, Icon, color }) => (
          <StyledStackedIconTile
            key={key}
            Icon={Icon}
            color={color}
            shape="circle"
            sizeInPx={38}
            iconSizeInPx={16}
          />
        ))}
      </StyledIconStack>
      <StyledTitle>{getText(JOTADUO_MESSAGES.shortcutsEmptyTitle)}</StyledTitle>
      <StyledDescription>
        {getText(JOTADUO_MESSAGES.shortcutsEmptyDescription)}
      </StyledDescription>
      <StyledActionContainer>
        <StyledMobileHomeSecondaryButton type="button" onClick={onStart}>
          {getText(JOTADUO_MESSAGES.shortcutsEmptyAction)}
        </StyledMobileHomeSecondaryButton>
      </StyledActionContainer>
    </StyledEmptyStateCard>
  );
};

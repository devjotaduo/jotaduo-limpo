import { useState } from 'react';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeOrganizeButton } from '~/jotaduo/mobile-home/components/MobileHomeOrganizeButton';
import {
  MobileHomeSection,
  StyledMobileHomeCard,
} from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { MyWorkEditor } from '~/jotaduo/mobile-home/components/MyWorkEditor';
import { MyWorkRow } from '~/jotaduo/mobile-home/components/MyWorkRow';
import { useMyWorkItems } from '~/jotaduo/mobile-home/hooks/useMyWorkItems';

export const MyWorkSection = () => {
  const myWorkItems = useMyWorkItems();
  const [isEditing, setIsEditing] = useState(false);
  const { getText } = useJotaduoText();

  if (myWorkItems.length === 0) {
    return null;
  }

  const visibleMyWorkItems = myWorkItems.filter(
    (myWorkItem) => !myWorkItem.isHidden,
  );

  // The title and its button stay when everything is hidden: they are the
  // only way back to the editor.
  return (
    <MobileHomeSection
      title={getText(JOTADUO_MESSAGES.myWork)}
      action={
        <MobileHomeOrganizeButton
          label={getText(JOTADUO_MESSAGES.editMyWork)}
          onClick={() => setIsEditing(true)}
        />
      }
    >
      {visibleMyWorkItems.length > 0 && (
        <StyledMobileHomeCard>
          {visibleMyWorkItems.map((myWorkItem) => (
            <MyWorkRow key={myWorkItem.key} myWorkItem={myWorkItem} />
          ))}
        </StyledMobileHomeCard>
      )}
      {isEditing && <MyWorkEditor onClose={() => setIsEditing(false)} />}
    </MobileHomeSection>
  );
};

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  isGeneratedUiPageDraft,
  type GeneratedUiPageDraft,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { GeneratedUiRenderer } from '@/page-layout/widgets/generated-ui/components/GeneratedUiRenderer';
import { useCreateGeneratedUiPage } from '@/ai/hooks/useCreateGeneratedUiPage';

const StyledCard = styled.section`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledTabs = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledTab = styled.button<{ isSelected: boolean }>`
  background: transparent;
  border: 0;
  border-bottom: 2px solid
    ${({ isSelected }) =>
      isSelected ? themeCssVariables.color.blue : 'transparent'};
  color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 36px;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledPreview = styled.div`
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledMessage = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const extractDraft = (output: unknown): GeneratedUiPageDraft | undefined => {
  if (!isDefined(output) || typeof output !== 'object') {
    return undefined;
  }

  const result = (output as { result?: unknown }).result;

  if (!isDefined(result) || typeof result !== 'object') {
    return undefined;
  }

  const draft = (result as { draft?: unknown }).draft;

  return isGeneratedUiPageDraft(draft) ? draft : undefined;
};

type AiChatGeneratedUiPagePreviewProps = {
  output: unknown;
};

export const AiChatGeneratedUiPagePreview = ({
  output,
}: AiChatGeneratedUiPagePreviewProps) => {
  const { t } = useLingui();
  const draft = extractDraft(output);
  const { createGeneratedUiPage } = useCreateGeneratedUiPage();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPageLayoutId, setSavedPageLayoutId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  if (!draft) {
    return null;
  }

  const savePage = async () => {
    setIsSaving(true);
    setErrorMessage(undefined);

    try {
      const pageLayoutId = await createGeneratedUiPage(draft);

      setSavedPageLayoutId(pageLayoutId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`The page could not be saved.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitle>{draft.title}</StyledTitle>
        <StyledSubtitle>{t`Page preview`}</StyledSubtitle>
      </StyledHeader>
      {draft.tabs.length > 1 && (
        <StyledTabs role="tablist" aria-label={t`Page sections`}>
          {draft.tabs.map((tab, index) => (
            <StyledTab
              key={`${tab.title}-${index}`}
              aria-selected={activeTabIndex === index}
              isSelected={activeTabIndex === index}
              onClick={() => setActiveTabIndex(index)}
              role="tab"
              type="button"
            >
              {tab.title}
            </StyledTab>
          ))}
        </StyledTabs>
      )}
      <StyledPreview>
        <GeneratedUiRenderer blocks={draft.tabs[activeTabIndex].blocks} />
      </StyledPreview>
      <StyledActions>
        <StyledMessage aria-live="polite">
          {savedPageLayoutId
            ? t`Page saved and added to navigation.`
            : (errorMessage ?? t`Review the preview, then save it to Twenty.`)}
        </StyledMessage>
        <Button
          color="accent"
          disabled={isSaving || isDefined(savedPageLayoutId)}
          loading={isSaving}
          onClick={() => void savePage()}
          size="sm"
          variant="solid"
        >
          {savedPageLayoutId ? t`Saved` : t`Save page`}
        </Button>
      </StyledActions>
    </StyledCard>
  );
};

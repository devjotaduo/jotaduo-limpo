// Limit replacements to product copy; package names and legal identities stay upstream.
export const productCopyFiles = [
  'src/modules/activities/timeline-activities/utils/getTimelineActivityAuthorFullName.ts',
  'src/modules/onboarding/components/OnboardingInviteTeamSkipDialog.tsx',
  'src/modules/settings/billing/components/AddPaymentMethodForm.tsx',
  'src/modules/settings/billing/hooks/useBillingPortalSession.ts',
  'src/modules/settings/billing/hooks/useEndSubscriptionTrialPeriod.ts',
  'src/modules/settings/billing/hooks/useHandleCheckoutSession.ts',
  'src/modules/settings/billing/hooks/useSubmitSubscriptionPayment.ts',
  'src/modules/settings/mcp-and-apis/constants/McpSetup.ts',
  'src/modules/settings/mcp-and-apis/utils/mcpSetup.ts',
  'src/modules/spreadsheet-import/steps/components/MatchColumnsStep/components/ColumnGrid.tsx',
  'src/pages/auth/SignInUp.tsx',
  'src/pages/not-found/NotFound.tsx',
  'src/pages/onboarding/SyncEmails.tsx',
  'src/pages/settings/ai/components/SettingsAiModelTiersPreview.tsx',
  'src/pages/settings/ai/components/SettingsAiModelsTab.tsx',
  'src/pages/settings/communications/SettingsWorkspaceCommunicationGroupChannelDetail.tsx',
  'src/pages/settings/enterprise/SettingsEnterprise.tsx',
  'src/utils/title-utils.ts',
];

export const sourceOverrides = [
  {
    file: 'src/modules/auth/sign-in-up/components/FooterNote.tsx',
    search: 'const { i18n } = useLingui();',
    replacement: 'const { i18n, t } = useLingui();',
  },
  {
    file: 'src/modules/auth/sign-in-up/components/FooterNote.tsx',
    search: '<Trans>By using Twenty, you agree to the</Trans>',
    replacement:
      '{t`By using Twenty, you agree to the`.replace(/\\bTwenty\\b/g, "{name}")}',
  },
  {
    file: 'src/modules/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo.ts',
    search:
      "'https://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png'",
    replacement: '`' + '${window.location.origin}{workspaceLogo}' + '`',
  },
  {
    file: 'src/modules/auth/utils/getTwentyWebsiteUrl.ts',
    search:
      '  const url = new URL(\n    isLocalizedWebsitePath ? `/${language}/${page}` : `/${page}`,\n    TWENTY_WEBSITE_HREF,\n  );\n\n  return url.toString();',
    replacement:
      "  return page === 'terms' ? '{termsOfServiceUrl}' : '{privacyPolicyUrl}';",
  },
  {
    file: 'src/modules/auth/components/Logo.tsx',
    search: '<StyledContainer onClick={() => onClick?.()}>',
    replacement:
      '<StyledContainer className={isUsingDefaultLogo ? "jotaduo-auth-logo" : undefined} onClick={() => onClick?.()}>',
  },
  {
    file: 'src/modules/app/components/PageFavicon.tsx',
    search:
      '  const workspacePublicData = useAtomStateValue(workspacePublicDataState);\n  return (',
    replacement:
      '  const workspacePublicData = useAtomStateValue(workspacePublicDataState);\n  const faviconUrl = workspacePublicData?.logo\n    ? (getImageAbsoluteURI({\n        imageUrl: workspacePublicData.logo,\n        baseUrl: REACT_APP_SERVER_BASE_URL,\n      }) ?? DEFAULT_WORKSPACE_LOGO)\n    : DEFAULT_WORKSPACE_LOGO;\n\n  return (',
  },
  {
    file: 'src/modules/app/components/PageFavicon.tsx',
    search:
      '      <link\n        rel="icon"\n        type="image/x-icon"\n        href={\n          workspacePublicData?.logo\n            ? (getImageAbsoluteURI({\n                imageUrl: workspacePublicData.logo,\n                baseUrl: REACT_APP_SERVER_BASE_URL,\n              }) ?? DEFAULT_WORKSPACE_LOGO)\n            : DEFAULT_WORKSPACE_LOGO\n        }\n      />',
    replacement:
      '      <link\n        data-jotaduo-favicon={workspacePublicData?.logo ? undefined : "true"}\n        rel="icon"\n        type="image/png"\n        href={faviconUrl}\n      />',
  },
  {
    file: 'src/modules/ui/utilities/page-title/components/PageTitle.tsx',
    search: '<title>{props.title}</title>',
    replacement:
      '<title>{props.title === "{name}" || props.title.endsWith(" | {name}") ? props.title : `${props.title} | {name}`}</title>',
  },
];

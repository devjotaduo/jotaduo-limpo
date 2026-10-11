import { type MessageDescriptor } from '@lingui/core';

// %name% marks a value filled in by useJotaduoText. Lingui's own {name}
// placeholders need compiled catalogs, which the fork's catalog is not.
export const JOTADUO_ONBOARDING_MESSAGES = {
  stepCount: {
    id: 'jotaduo.onboarding.stepCount',
    message: 'Question %current% of %total%',
  },
  areaTitle: {
    id: 'jotaduo.onboarding.areaTitle',
    message: "What is the company's line of business?",
  },
  areaSubtitle: {
    id: 'jotaduo.onboarding.areaSubtitle',
    message:
      'It suggests the features and the topics the virtual assistant needs to know.',
  },
  areaChangeNotice: {
    id: 'jotaduo.onboarding.areaChangeNotice',
    message:
      'Changing it restarts the features, sources and texts of the next steps. What already serves customers stays the same until you release it again.',
  },
  companyTitle: {
    id: 'jotaduo.onboarding.companyTitle',
    message: 'What is the company called?',
  },
  companySubtitle: {
    id: 'jotaduo.onboarding.companySubtitle',
    message:
      'The name customers read in messages and pages. CNPJ, website and Instagram are optional.',
  },
  companyName: {
    id: 'jotaduo.onboarding.companyName',
    message: 'Company name',
  },
  cnpj: { id: 'jotaduo.onboarding.cnpj', message: 'CNPJ' },
  website: { id: 'jotaduo.onboarding.website', message: 'Website' },
  instagram: { id: 'jotaduo.onboarding.instagram', message: 'Instagram' },
  goalsTitle: {
    id: 'jotaduo.onboarding.goalsTitle',
    message: 'What is the goal with JotaDuo?',
  },
  goalsSubtitle: {
    id: 'jotaduo.onboarding.goalsSubtitle',
    message:
      'Pick everything the company wants to solve with WhatsApp customer service.',
  },
  goalSales: { id: 'jotaduo.onboarding.goalSales', message: 'Sales' },
  goalService: {
    id: 'jotaduo.onboarding.goalService',
    message: 'Customer service',
  },
  goalScheduling: {
    id: 'jotaduo.onboarding.goalScheduling',
    message: 'Scheduling',
  },
  goalSupport: { id: 'jotaduo.onboarding.goalSupport', message: 'Support' },
  goalAutomation: {
    id: 'jotaduo.onboarding.goalAutomation',
    message: 'Automation',
  },
  goalMarketing: {
    id: 'jotaduo.onboarding.goalMarketing',
    message: 'Marketing',
  },
  goalOther: { id: 'jotaduo.onboarding.goalOther', message: 'Other' },
  systemTitle: {
    id: 'jotaduo.onboarding.systemTitle',
    message: 'Which system does the company use today?',
  },
  systemSubtitle: {
    id: 'jotaduo.onboarding.systemSubtitle',
    message:
      'The most common ones in your line of business are listed. If yours is missing, pick Other.',
  },
  noSystem: {
    id: 'jotaduo.onboarding.noSystem',
    message: 'I do not use a system',
  },
  otherSystem: { id: 'jotaduo.onboarding.otherSystem', message: 'Other' },
  systemName: {
    id: 'jotaduo.onboarding.systemName',
    message: 'System name',
  },
  assistantTitle: {
    id: 'jotaduo.onboarding.assistantTitle',
    message: 'What will the virtual assistant be called?',
  },
  assistantSubtitle: {
    id: 'jotaduo.onboarding.assistantSubtitle',
    message:
      'Customers see the name on WhatsApp. It only starts answering after you turn the features on.',
  },
  assistantName: {
    id: 'jotaduo.onboarding.assistantName',
    message: 'Virtual assistant name',
  },
  companyWhatsapp: {
    id: 'jotaduo.onboarding.companyWhatsapp',
    message: 'Company WhatsApp for customer service',
  },
  ownerWhatsapp: {
    id: 'jotaduo.onboarding.ownerWhatsapp',
    message: 'WhatsApp of the person in charge',
  },
  back: { id: 'jotaduo.onboarding.back', message: 'Back' },
  progress: {
    id: 'jotaduo.onboarding.progress',
    message: 'Progress of the questions',
  },
  dialogLabel: {
    id: 'jotaduo.onboarding.dialogLabel',
    message: 'First setup of JotaDuo',
  },
  setupProgress: {
    id: 'jotaduo.onboarding.setupProgress',
    message: 'Progress of the account setup',
  },
  setupStepCount: {
    id: 'jotaduo.onboarding.setupStepCount',
    message: 'Step %current% of %total%',
  },
  loading: {
    id: 'jotaduo.onboarding.loading',
    message: 'Loading the company setup…',
  },
  previewGoals: { id: 'jotaduo.onboarding.previewGoals', message: 'Goals' },
  previewSystem: {
    id: 'jotaduo.onboarding.previewSystem',
    message: 'Company system',
  },
  previewAssistantName: {
    id: 'jotaduo.onboarding.previewAssistantName',
    message: 'Assistant name',
  },
  previewAssistantRole: {
    id: 'jotaduo.onboarding.previewAssistantRole',
    message: 'Virtual assistant',
  },
  previewCompany: {
    id: 'jotaduo.onboarding.previewCompany',
    message: 'Company',
  },
  previewOwner: {
    id: 'jotaduo.onboarding.previewOwner',
    message: 'Person in charge',
  },
  continue: { id: 'jotaduo.onboarding.continue', message: 'Continue' },
  finish: { id: 'jotaduo.onboarding.finish', message: 'Finish' },
  changeAndSave: {
    id: 'jotaduo.onboarding.changeAndSave',
    message: 'Change and save',
  },
  close: { id: 'jotaduo.onboarding.close', message: 'Close' },
  finished: {
    id: 'jotaduo.onboarding.finished',
    message: 'Initial setup completed.',
  },
  loadErrorTitle: {
    id: 'jotaduo.onboarding.loadErrorTitle',
    message: 'The setup could not be loaded',
  },
  retry: { id: 'jotaduo.onboarding.retry', message: 'Try again' },
  requestFailed: {
    id: 'jotaduo.onboarding.requestFailed',
    message: 'JotaDuo could not be reached. Try again.',
  },
  accessDenied: {
    id: 'jotaduo.onboarding.accessDenied',
    message: 'Access denied. Check your session and your JotaDuo role.',
  },
  errorEmptyArea: {
    id: 'jotaduo.onboarding.errorEmptyArea',
    message: 'Pick the line of business to continue.',
  },
  errorEmptyGoals: {
    id: 'jotaduo.onboarding.errorEmptyGoals',
    message: 'Pick at least one goal to continue.',
  },
  errorEmptySystem: {
    id: 'jotaduo.onboarding.errorEmptySystem',
    message: 'Pick the system, or "I do not use a system", to continue.',
  },
  errorEmptyText: {
    id: 'jotaduo.onboarding.errorEmptyText',
    message: 'Write the answer to continue.',
  },
  errorEmptyPhone: {
    id: 'jotaduo.onboarding.errorEmptyPhone',
    message: 'Enter the phone number with area code to continue.',
  },
  errorSystemName: {
    id: 'jotaduo.onboarding.errorSystemName',
    message: 'Write the system name to continue.',
  },
  errorTooLong: {
    id: 'jotaduo.onboarding.errorTooLong',
    message: 'Use up to %limit% characters (%typed% typed).',
  },
  errorCnpj: {
    id: 'jotaduo.onboarding.errorCnpj',
    message: 'Check the CNPJ: it has 14 digits, like 12.345.678/0001-95.',
  },
  errorPhone: {
    id: 'jotaduo.onboarding.errorPhone',
    message: 'Enter the phone number with area code, like 87 99999-0000.',
  },
  errorAssistantName: {
    id: 'jotaduo.onboarding.errorAssistantName',
    message: 'Use 2 to 20 letters, without numbers.',
  },
  errorInstagram: {
    id: 'jotaduo.onboarding.errorInstagram',
    message: 'Use the account handle, like @yourcompany.',
  },
  errorWebsite: {
    id: 'jotaduo.onboarding.errorWebsite',
    message: 'Check the address, like https://yourcompany.com.',
  },
  errorWebsiteScheme: {
    id: 'jotaduo.onboarding.errorWebsiteScheme',
    message: 'Start with https://, like https://yourcompany.com.',
  },
} as const satisfies Record<string, MessageDescriptor & { message: string }>;

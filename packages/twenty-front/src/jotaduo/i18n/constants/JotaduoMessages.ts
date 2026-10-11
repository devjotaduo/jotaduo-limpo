import { type MessageDescriptor } from '@lingui/core';

// Fork strings carry explicit ids and live outside the upstream .po catalogs,
// which the upstream i18n pipeline regenerates on every merge.
export const JOTADUO_MESSAGES = {
  home: { id: 'jotaduo.navigation.home', message: 'Home' },
  conversations: {
    id: 'jotaduo.navigation.conversations',
    message: 'Conversations',
  },
  search: { id: 'jotaduo.navigation.search', message: 'Search' },
  ai: { id: 'jotaduo.navigation.ai', message: 'AI' },
  mainNavigation: {
    id: 'jotaduo.navigation.mainNavigation',
    message: 'Main navigation',
  },
  switchWorkspace: {
    id: 'jotaduo.mobileHome.switchWorkspace',
    message: 'Switch workspace',
  },
  create: { id: 'jotaduo.mobileHome.create', message: 'Create' },
  organize: { id: 'jotaduo.mobileHome.organize', message: 'Organize' },
  myWork: { id: 'jotaduo.mobileHome.myWork', message: 'My work' },
  today: {
    id: 'jotaduo.mobileHome.today',
    message: 'Today',
  },
  todayItemCountOne: {
    id: 'jotaduo.mobileHome.todayItemCountOne',
    message: '1 item',
  },
  todayItemCountOther: {
    id: 'jotaduo.mobileHome.todayItemCountOther',
    message: '%count% items',
  },
  todayEmptyTitle: {
    id: 'jotaduo.mobileHome.todayEmptyTitle',
    message: 'Nothing set for today',
  },
  todayEmptyDescription: {
    id: 'jotaduo.mobileHome.todayEmptyDescription',
    message: 'Appointments, reminders and tasks of the day show up here.',
  },
  createTask: {
    id: 'jotaduo.mobileHome.createTask',
    message: 'Create task',
  },
  seeDayAgenda: {
    id: 'jotaduo.mobileHome.seeDayAgenda',
    message: 'See the day agenda',
  },
  overdueTaskCountOne: {
    id: 'jotaduo.mobileHome.overdueTaskCountOne',
    message: '1 overdue task',
  },
  overdueTaskCountOther: {
    id: 'jotaduo.mobileHome.overdueTaskCountOther',
    message: '%count% overdue tasks',
  },
  completeTask: {
    id: 'jotaduo.mobileHome.completeTask',
    message: 'Complete task: %title%',
  },
  reopenTask: {
    id: 'jotaduo.mobileHome.reopenTask',
    message: 'Reopen task: %title%',
  },
  greetingMorning: {
    id: 'jotaduo.mobileHome.greetingMorning',
    message: 'Good morning',
  },
  greetingAfternoon: {
    id: 'jotaduo.mobileHome.greetingAfternoon',
    message: 'Good afternoon',
  },
  greetingEvening: {
    id: 'jotaduo.mobileHome.greetingEvening',
    message: 'Good evening',
  },
  assistant: {
    id: 'jotaduo.mobileHome.assistant',
    message: 'Assistant',
  },
  favoritesHint: {
    id: 'jotaduo.mobileHome.favoritesHint',
    message:
      'Pin people, companies and other records to open them with one tap.',
  },
  dayAgenda: { id: 'jotaduo.mobileHome.dayAgenda', message: 'Day agenda' },
  favorites: { id: 'jotaduo.mobileHome.favorites', message: 'Favorites' },
  organizeFavorites: {
    id: 'jotaduo.mobileHome.organizeFavorites',
    message: 'Organize Favorites',
  },
  addFavorite: {
    id: 'jotaduo.mobileHome.addFavorite',
    message: 'Add favorite',
  },
  removeFavorite: {
    id: 'jotaduo.mobileHome.removeFavorite',
    message: 'Remove from favorites',
  },
  shortcuts: { id: 'jotaduo.mobileHome.shortcuts', message: 'Shortcuts' },
  organizeShortcuts: {
    id: 'jotaduo.mobileHome.organizeShortcuts',
    message: 'Organize Shortcuts',
  },
  removeShortcut: {
    id: 'jotaduo.mobileHome.removeShortcut',
    message: 'Remove from shortcuts',
  },
  shortcutsEmptyTitle: {
    id: 'jotaduo.mobileHome.shortcutsEmptyTitle',
    message: 'What you open most, one tap away',
  },
  shortcutsEmptyDescription: {
    id: 'jotaduo.mobileHome.shortcutsEmptyDescription',
    message:
      'Pin your everyday lists here, like unanswered conversations, tomorrow’s agenda or open charges.',
  },
  shortcutsEmptyAction: {
    id: 'jotaduo.mobileHome.shortcutsEmptyAction',
    message: 'Get started',
  },
  editMyWork: {
    id: 'jotaduo.mobileHome.editMyWork',
    message: 'Edit my work',
  },
  showOnHome: {
    id: 'jotaduo.mobileHome.showOnHome',
    message: 'Show on Home',
  },
  done: { id: 'jotaduo.mobileHome.done', message: 'Done' },
  add: { id: 'jotaduo.mobileHome.add', message: 'Add' },
  remove: { id: 'jotaduo.mobileHome.remove', message: 'Remove' },
  holdToReorder: {
    id: 'jotaduo.mobileHome.holdToReorder',
    message: 'Hold and drag to reorder',
  },
  selected: { id: 'jotaduo.mobileHome.selected', message: 'Selected' },
  selectRecords: {
    id: 'jotaduo.mobileHome.selectRecords',
    message: 'Select records',
  },
  suggestedLists: {
    id: 'jotaduo.mobileHome.suggestedLists',
    message: 'Lists',
  },
  suggestedViews: {
    id: 'jotaduo.mobileHome.suggestedViews',
    message: 'Views',
  },
  suggestedPages: {
    id: 'jotaduo.mobileHome.suggestedPages',
    message: 'Pages',
  },
  loading: { id: 'jotaduo.mobileHome.loading', message: 'Loading...' },
  noResults: {
    id: 'jotaduo.mobileHome.noResults',
    message: 'No results found',
  },
} as const satisfies Record<string, MessageDescriptor & { message: string }>;

import { type ReportCategory } from '@character-tech/client-common/src/types/moderation';
import { t } from 'i18next';

// A leaf node in the report flow, the category to report
interface ReportCategoryValue {
  type: 'CATEGORY';
  category: ReportCategory;
}

// A selection in the report flow, the list of categories to choose from
interface ReportCategoryListValue {
  type: 'CATEGORY_LIST';
  categories: ReportCategoryListItem[];
}

interface ReportCategoryCustomAction {
  type: 'CUSTOM_ACTION';
  action: () => void;
}

// Either a list of subcategories, the category itself to report, or a custom action
type ReportValue =
  | ReportCategoryValue
  | ReportCategoryListValue
  | ReportCategoryCustomAction;

// Used to display of options to the user
export interface ReportCategoryListItem {
  label: string;
  value: ReportValue;
}

export const ReportCategories: ReportCategoryListItem[] = [
  {
    label: t('Moderation.report-categories.spam').toString(),
    value: {
      type: 'CATEGORY_LIST',
      categories: [
        {
          label: t('Moderation.report-categories.impersonation'),
          value: { type: 'CATEGORY', category: 'IMPERSONATE' },
        },
        {
          label: t('Moderation.report-categories.commercial-spam'),
          value: { type: 'CATEGORY', category: 'SPAM' },
        },
      ],
    },
  },
  {
    label: t('Moderation.report-categories.abuse'),
    value: {
      type: 'CATEGORY_LIST',
      categories: [
        {
          label: t('Moderation.report-categories.threats-and-harassment'),
          value: { type: 'CATEGORY', category: 'ABUSE' },
        },
        {
          label: t('Moderation.report-categories.false-statements'),
          value: { type: 'CATEGORY', category: 'FALSITY' },
        },
        {
          label: t('Moderation.report-categories.hate-speech'),
          value: { type: 'CATEGORY', category: 'HATE' },
        },
        {
          label: t('Moderation.report-categories.nsfw'),
          value: { type: 'CATEGORY', category: 'NSFW' },
        },
        {
          label: t('Moderation.report-categories.sexual-harassment'),
          value: { type: 'CATEGORY', category: 'SEX_HARASS' },
        },
        {
          label: t('Moderation.report-categories.child-exploitation'),
          value: { type: 'CATEGORY', category: 'MINOR' },
        },
        {
          label: t('Moderation.report-categories.impersonation'),
          value: { type: 'CATEGORY', category: 'IMPERSONATE' },
        },
      ],
    },
  },
  {
    label: t('Moderation.report-categories.harm'),
    value: {
      type: 'CATEGORY_LIST',
      categories: [
        {
          label: t('Moderation.report-categories.excessive-violence'),
          value: { type: 'CATEGORY', category: 'VIOLENCE' },
        },
        {
          label: t('Moderation.report-categories.self-harm'),
          value: { type: 'CATEGORY', category: 'SELF_HARM' },
        },
        {
          label: t('Moderation.report-categories.terrorism-and-extremism'),
          value: { type: 'CATEGORY', category: 'TERROR' },
        },
      ],
    },
  },
  {
    label: t('Moderation.report-categories.pii'),
    value: { type: 'CATEGORY', category: 'PII' },
  },
  {
    label: t('Moderation.report-categories.other'),
    value: {
      type: 'CATEGORY_LIST',
      categories: [
        {
          label: t('Moderation.report-categories.threats-and-harassment'),
          value: { type: 'CATEGORY', category: 'ABUSE' },
        },
        {
          label: t('Moderation.report-categories.excessive-violence'),
          value: { type: 'CATEGORY', category: 'VIOLENCE' },
        },
        {
          label: t('Moderation.report-categories.false-statements'),
          value: { type: 'CATEGORY', category: 'FALSITY' },
        },
        {
          label: t('Moderation.report-categories.hate-speech'),
          value: { type: 'CATEGORY', category: 'HATE' },
        },
        {
          label: t('Moderation.report-categories.nsfw'),
          value: { type: 'CATEGORY', category: 'NSFW' },
        },
        {
          label: t('Moderation.report-categories.sexual-harassment'),
          value: { type: 'CATEGORY', category: 'SEX_HARASS' },
        },
        {
          label: t('Moderation.report-categories.child-exploitation'),
          value: { type: 'CATEGORY', category: 'MINOR' },
        },
        {
          label: t('Moderation.report-categories.self-harm'),
          value: { type: 'CATEGORY', category: 'SELF_HARM' },
        },
        {
          label: t('Moderation.report-categories.terrorism-and-extremism'),
          value: { type: 'CATEGORY', category: 'TERROR' },
        },
        {
          label: t('Moderation.report-categories.illegal-activities'),
          value: { type: 'CATEGORY', category: 'ILLEGAL' },
        },
        {
          label: t('Moderation.report-categories.drug-transactions'),
          value: { type: 'CATEGORY', category: 'DRUGS' },
        },
        {
          label: t('Moderation.report-categories.pii'),
          value: { type: 'CATEGORY', category: 'PII' },
        },
        {
          label: t('Moderation.report-categories.impersonation'),
          value: { type: 'CATEGORY', category: 'IMPERSONATE' },
        },
        {
          label: t('Moderation.report-categories.commercial-spam'),
          value: { type: 'CATEGORY', category: 'SPAM' },
        },
      ],
    },
  },
];

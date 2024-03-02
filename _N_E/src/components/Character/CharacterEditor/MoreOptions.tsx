import { FormCheckboxField } from '@/components/ui/FormCheckboxField';
import { FormTextareaField } from '@/components/ui/FormTextareaField';
import { ChevronDownSmIcon, ChevronTopSmIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { getSchemaChecks } from '@/components/ui/form';
import { ExternalLinks } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { FiExternalLink } from 'react-icons/fi';
import { CharacterEditorFormSchema, characterTooltipProps } from './types';

export const MoreOptions = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => (
  <>
    {!!open && (
      <div className="transition ease-in-out">
        <FormTextareaField
          name="definition"
          checks={getSchemaChecks(CharacterEditorFormSchema, 'definition')}
          label={t('CharacterEditor.Form.character-definition')}
          placeholder={t(
            'CharacterEditor.Form.character-definition-placeholder',
          )}
          tooltipProps={{
            ...characterTooltipProps,
            content: t('CharacterEditor.Form.character-definition-tooltip'),
          }}
          className="h-56 bg-background"
          labelPosition="top"
          labelEndContent={
            <LinkWithAnalytics
              className="text-blue flex flex-row gap-1 items-center text-sm"
              href={ExternalLinks.characterBookCreateCharacterDefinition}
              analyticsProps={{
                eventName: AnalyticsEvents.Links.Opened,
                properties: {
                  referrer: 'CharacterEditor',
                  link: ExternalLinks.characterBookCreateCharacterDefinition,
                },
              }}
              target="_blank"
            >
              <FiExternalLink size={14} />
              {t('CharacterEditor.best-practices')}
            </LinkWithAnalytics>
          }
        />
        <FormCheckboxField
          name="copyable"
          label={t('CharacterEditor.Form.keep-character-definition-private')}
          isReversed
        />
      </div>
    )}
    <Button
      className="rounded-spacing-xs p-2 h-fit w-fit"
      onPress={() => setOpen(!open)}
      endContent={
        open ? (
          <ChevronTopSmIcon height="16px" />
        ) : (
          <ChevronDownSmIcon height="16px" />
        )
      }
      variant="ghost"
    >
      {t('CharacterEditor.Form.more-options')}
    </Button>
  </>
);

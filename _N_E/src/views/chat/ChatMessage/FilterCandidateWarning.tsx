import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { useState } from 'react';
import { BiSolidConfused } from 'react-icons/bi';

export function FilterCandidateWarning() {
  const [reported, setReported] = useState(false);
  return (
    <div className="bg-opacity/30 mt-4 flex flex-col items-center gap-5 rounded-md border-2 border-error p-4 text-center">
      <BiSolidConfused size={48} />
      {t(
        'Chat.Filter.sometimes-the-ai-generates-a-reply-that-doesnt-meet-our-guidelines',
      )}
      <p className="text-sm">
        {t(
          'Chat.Filter.you-can-continue-the-conversation-or-generate-a-new-response-by-swiping',
        )}
      </p>
      <div>
        <Button
          isDisabled={reported}
          variant={reported ? 'ghost' : 'primary'}
          color={reported ? 'primary' : 'secondary'}
          onPress={() => {
            logAnalyticsEvent(AnalyticsEvents.Message.FilteredAction, {
              referrer: 'FilteredMessage',
              type: 'report',
            });
            setReported(true);
          }}
        >
          {reported ? t('Chat.Filter.reported') : t('Chat.report')}
        </Button>
      </div>
    </div>
  );
}

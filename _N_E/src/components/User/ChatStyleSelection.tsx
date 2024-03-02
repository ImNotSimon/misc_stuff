import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import { logAnalyticsEvent } from '@/analytics/analytics';
import { ChatIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { chatStyleSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { COOKIE_CHAT_STYLE, ChatStyle } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import Cookies from 'js-cookie';
import { ImParagraphLeft } from 'react-icons/im';
import { useSignalValue } from 'signals-react-safe';

const ModeIcon = ({ mode }: { mode: ChatStyle }) => {
  switch (mode) {
    case ChatStyle.classic:
      return <ImParagraphLeft height="16px" />;
    default:
      return <ChatIcon height="16px" />;
  }
};

export const ChatStyleSelection = () => {
  const currentChatStyleValue = useSignalValue(chatStyleSignal);

  const hasAccess = AmplitudeExperimentationFactory.checkAmplitudeVariantValue(
    AmplitudeVariants.AlternateChatStyles,
    'treatment',
  );

  if (!hasAccess) {
    return null;
  }

  const renderChatStyleOption = (chatStyle: ChatStyle) => (
    <Button
      key={chatStyle}
      className={cn('rounded-spacing-s px-5 w-32', {
        'border-accent': currentChatStyleValue === chatStyle,
      })}
      variant={currentChatStyleValue === chatStyle ? 'primary' : 'outline'}
      onPress={() => {
        Cookies.set(COOKIE_CHAT_STYLE, chatStyle);
        chatStyleSignal.value = chatStyle;
        logAnalyticsEvent(AnalyticsEvents.Settings.Changed, {
          referrer: 'AlternateChatStyleSelection',
          setting: 'chat_style',
          value: chatStyle,
        });
      }}
    >
      <ModeIcon mode={chatStyle} /> {t(`SettingsPreferences.${chatStyle}`)}
    </Button>
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {t('Settings.chat-style')}
      </p>
      <div className="flex flex-row gap-4 justify-start">
        {Object.values(ChatStyle).map((chatStyle) =>
          renderChatStyleOption(chatStyle),
        )}
      </div>
    </div>
  );
};

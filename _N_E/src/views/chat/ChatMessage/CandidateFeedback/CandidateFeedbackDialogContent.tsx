import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { voiceChatEnabledSignal } from '@/lib/state/signals';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CandidateFeedbackItem } from './CandidateFeedbackItem';
import {
  badFeedbackLabels,
  badVoiceLabels,
  goodFeedbackLabels,
} from './FeedbackUtils';

type FeedbackTabs = 'text' | 'voice';

export function CandidateFeedbackDialogContent({
  selectedPills,
  togglePillSelection,
  saveCustomFeedback,
  isOpen,
}: {
  selectedPills: string[];
  togglePillSelection: (label: string) => void;
  saveCustomFeedback: (text: string) => void;
  isOpen?: boolean;
}) {
  const { t } = useTranslation();
  const [feedbackText, setFeedbackText] = useState('');
  const [open, setOpen] = useState(false);
  const voiceEnabled = voiceChatEnabledSignal.value;
  const [tab, setTab] = useState<FeedbackTabs>(voiceEnabled ? 'voice' : 'text');

  useEffect(() => {
    if (open) {
      logAnalyticsEvent(AnalyticsEvents.UX.ContentViewed, {
        referrer: 'CandidateFeedbackDialogContent',
      });
    }
  }, [open]);

  return (
    <Dialog
      open={isOpen ?? open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer: 'Chat', type: 'CandidateFeedbackDialog' }}
    >
      <DialogTrigger asChild>
        <div
          className="text-sm bg-surface-elevation-3 rounded-full px-2 mt-1 py-1 hover:bg-accent cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {t('Feedback.tell-us-more')}
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('Feedback.feedback')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="gap-2 flex flex-col justify-center">
          <Tabs
            value={tab}
            tabIndex={-1}
            onValueChange={(newTab) => setTab(newTab as typeof tab)}
          >
            {!!voiceEnabled && (
              <TabsList className="px-4">
                <TabsTrigger value="voice">
                  {t('Feedback.voice-feedback')}
                </TabsTrigger>
                <TabsTrigger value="text">
                  {t('Feedback.text-feedback')}
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="voice">
              <ToggleGroup
                type="multiple"
                className="flex flex-wrap items-start text-foreground text-sm md:text-md align-top justify-start w-full"
              >
                {badVoiceLabels.map((label) => (
                  <CandidateFeedbackItem
                    label={label}
                    key={label}
                    isSelected={!!selectedPills.find((l) => l === label)}
                    onClick={() => {
                      togglePillSelection(label);
                    }}
                  />
                ))}
              </ToggleGroup>
            </TabsContent>
            <TabsContent value="text">
              <ToggleGroup
                type="multiple"
                className="flex flex-wrap items-start text-foreground text-sm md:text-md align-top justify-start w-full"
              >
                {badFeedbackLabels.map((label) => (
                  <CandidateFeedbackItem
                    label={label}
                    key={label}
                    isSelected={!!selectedPills.find((l) => l === label)}
                    onClick={() => {
                      togglePillSelection(label);
                    }}
                  />
                ))}
              </ToggleGroup>
              <Separator />
              <ToggleGroup
                type="multiple"
                className="flex flex-wrap text-foreground text-sm md:text-md align-top justify-start w-full"
              >
                {goodFeedbackLabels.map((label) => (
                  <CandidateFeedbackItem
                    label={label}
                    key={label}
                    isSelected={!!selectedPills.find((l) => l === label)}
                    onClick={() => {
                      togglePillSelection(label);
                    }}
                  />
                ))}
              </ToggleGroup>
            </TabsContent>
          </Tabs>
          <Textarea
            className="text-md items-center bg-transparent text-foreground"
            onChange={(e) => {
              setFeedbackText(e.target.value);
            }}
            value={feedbackText}
            autoFocus={false}
            maxLength={100}
            label={t('Feedback.anything-else')}
            placeholder={t('Common.optional')}
          />
        </DialogDescription>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              onPress={() => {
                setOpen(false);
              }}
              variant="ghost"
            >
              {t('Common.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              onPress={() => {
                saveCustomFeedback(feedbackText);
                setOpen(false);
              }}
            >
              {t('Feedback.submit-feedback')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

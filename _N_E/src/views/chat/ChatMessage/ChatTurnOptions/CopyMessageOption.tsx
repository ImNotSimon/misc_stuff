import { CopyIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { AppUtils } from '@/utils/appUtils';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';

export function CopyMessageOption({ text }: { text?: string }) {
  const textToCopy = useRef(text);

  useEffect(() => {
    const selectionText = getSelectionText();
    if (selectionText) {
      textToCopy.current = selectionText;
    }
  }, []);
  return (
    <Button
      key="copy-button"
      variant="ghost"
      className="justify-between w-full rounded-spacing-s"
      onPress={() => {
        AppUtils.copyTextToClipboard(
          textToCopy.current ?? '',
          t('Common.message-copied-to-clipboard'),
          'ChatMessage',
        );
      }}
    >
      {t('Common.copy')} <CopyIcon height="1.25em" />
    </Button>
  );
}

function getSelectionText() {
  let text: string | undefined = '';
  if (window && window.getSelection) {
    text = window.getSelection()?.toString();
  }
  return text;
}

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { t } from 'i18next';
import { useState } from 'react';

export function EditCandidateText({
  text,
  onSave,
  onCancel,
}: {
  text: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [editText, setEditText] = useState(text);
  return (
    <div className="w-full gap-2 flex flex-col max-w-xl">
      <Textarea
        inputMode="text"
        maxLength={4092}
        className="box-border w-full rounded-none placeholder:text-placeholder min-w-xl bg-transparent text-lg-chat"
        value={editText}
        onChange={(e) => {
          setEditText(e.target.value);
        }}
      />
      <div className="flex gap-2">
        <Button variant="ghost" onPress={onCancel}>
          {t('Common.cancel')}
        </Button>
        <Button isDisabled={!editText} onPress={() => onSave(editText)}>
          {t('Form.save')}
        </Button>
      </div>
    </div>
  );
}

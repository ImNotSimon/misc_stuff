import { Button } from '@/components/ui/button';
import { t } from 'i18next';

export const Footer = ({
  isSubmitLoading,
  submitDisabled,
  createOrUpdate,
  handleSubmit,
}: {
  isSubmitLoading: boolean;
  submitDisabled: boolean;
  createOrUpdate: 'create' | 'update';
  handleSubmit: () => void;
}) => (
  <div className="w-full flex mb-1 justify-end">
    <Button
      type="submit"
      isLoading={isSubmitLoading}
      isDisabled={submitDisabled}
      preventDefault
      onPress={handleSubmit}
    >
      {createOrUpdate === 'create'
        ? t('CharacterEditor.create-character')
        : t('CharacterEditor.save-changes')}
    </Button>
  </div>
);

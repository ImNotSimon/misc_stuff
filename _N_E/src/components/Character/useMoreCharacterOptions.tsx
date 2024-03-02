import { EditIcon } from '@/components/ui/Icon';
import { AppPaths } from '@/utils/appUtils';
import { t } from 'i18next';
import Link from 'next/link';

const EditOption = ({ characterId }: { characterId: string }) => (
  <Link href={AppPaths.character(characterId)}>
    <div className="p-2 px-3 w-full flex justify-between items-center bg-surface-elevation-3 hover:bg-[--transparency-4] text-primary">
      {t('Common.edit')}
      <EditIcon width="1rem" height="1rem" />
    </div>
  </Link>
);

export const useMoreCharacterOptions = ({
  thisIsMyCharacter,
  characterId,
}: {
  thisIsMyCharacter: boolean;
  characterId: string;
}) => {
  if (thisIsMyCharacter) {
    return [
      {
        content: <EditOption characterId={characterId} />,
        asChild: true,
        key: 'edit',
      },
    ];
  }

  return [];
};

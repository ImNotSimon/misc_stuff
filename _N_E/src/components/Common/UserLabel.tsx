import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { HumanAvatar } from '../Profile/HumanAvatar';

export function UserLabel({ user }: { user: Participant }) {
  return (
    <div className="flex">
      <div className="w-[36px] h-[36px] flex items-center justify-center">
        <HumanAvatar
          name={user.name || user.email || ''}
          size={20}
          src={user.user?.account?.avatar_file_name}
          rounded
        />
      </div>
      <div className="text-xl flex flex-auto flex-col justify-center text-left ml-1">
        {<p>{user?.name}</p>}
      </div>
    </div>
  );
}

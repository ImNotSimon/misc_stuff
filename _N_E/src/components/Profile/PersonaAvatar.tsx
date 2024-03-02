import { useAuth } from '@/context/AuthContext';
import { useGetPublicUser } from '@character-tech/client-common/src/hooks/queries/social';
import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import {
  CharacterAvatar,
  type CharacterAvatarProps,
} from '../Character/CharacterAvatar';

type PersonaAvatarProps = {
  persona: CharacterDetailed;
} & Omit<CharacterAvatarProps, 'name'>;

export function PersonaAvatar(props: PersonaAvatarProps) {
  const { persona } = props;

  const { participant__name: name, avatar_file_name: avatarFileName } = persona;
  const thisUser = useAuth().user;
  const { data: publicUser } = useGetPublicUser(
    thisUser?.user?.username ?? '',
    false,
  );

  return (
    <CharacterAvatar
      {...props}
      src={avatarFileName || publicUser?.avatar_file_name}
      name={name}
    />
  );
}

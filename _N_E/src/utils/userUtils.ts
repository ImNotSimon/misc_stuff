import {
  type Participant,
  type Subscription,
} from '@character-tech/client-common/src/types/app-api';

export const isUserPlusMember = (user: Participant | null) =>
  getUsersSubscription(user?.user?.subscription) === 'PLUS';

const getUsersSubscription = (sub?: Subscription) => {
  const active = !!sub && new Date(sub.expires_at) > new Date();
  return active ? sub.type : 'NONE';
};

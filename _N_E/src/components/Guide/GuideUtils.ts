import { type RecentChatShunt } from '@character-tech/client-common/src/types/app-api';

enum RecentChatDate {
  today = 'Today',
  yesterday = 'Yesterday',
  thisWeek = 'This Week',
  lastWeek = 'Last Week',
  thisMonth = 'This Month',
  aWhileAgo = 'A while ago',
}

type RecentChatSection = {
  title: RecentChatDate;
  characters: RecentChatShunt[];
};

export const categorizeCharacters = (
  characters: RecentChatShunt[],
): RecentChatSection[] => {
  const categories: Record<RecentChatDate, RecentChatShunt[]> = {
    [RecentChatDate.today]: [],
    [RecentChatDate.yesterday]: [],
    [RecentChatDate.thisWeek]: [],
    [RecentChatDate.lastWeek]: [],
    [RecentChatDate.thisMonth]: [],
    [RecentChatDate.aWhileAgo]: [],
  };

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const oneDay = 1000 * 60 * 60 * 24;
  const startOfYesterday = new Date(startOfToday.getTime() - oneDay);
  const startOfWeek = new Date(startOfToday.getTime() - oneDay * now.getDay());
  const startOfLastWeek = new Date(startOfWeek.getTime() - oneDay * 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  characters.forEach((character) => {
    const characterDate = new Date(character.date);

    if (characterDate >= startOfToday) {
      categories.Today.push(character);
    } else if (
      characterDate >= startOfYesterday &&
      characterDate < startOfToday
    ) {
      categories.Yesterday.push(character);
    } else if (
      characterDate >= startOfWeek &&
      characterDate < startOfYesterday
    ) {
      categories['This Week'].push(character);
    } else if (
      characterDate >= startOfLastWeek &&
      characterDate < startOfWeek
    ) {
      categories['Last Week'].push(character);
    } else if (
      characterDate >= startOfMonth &&
      characterDate < startOfLastWeek
    ) {
      categories['This Month'].push(character);
    } else {
      categories['A while ago'].push(character);
    }
  });

  return Object.entries(categories).map(([title, chars]) => ({
    title: title as RecentChatDate,
    characters: chars,
  }));
};

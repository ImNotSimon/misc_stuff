import { t } from 'i18next';
import { EXAMPLE_CHATS_CARD_WIDTH, ExampleChatsCard } from './ExampleChatsCard';
import { HomeGrid } from './HomeGrid';

export const exampleChatElems = [
  {
    characterId: 'YntB_ZeqRq2l_aVf2gWDCZl4oBttQzDvhj9cXafWcF8',
    questionKey: 'CharacterAssistant',
  },
  {
    characterId: 'YpuGnNPQiGvb0DIg77pDUruORvqEPQAxmabNuOIGylo',
    questionKey: 'WhoWouldWin',
  },

  {
    characterId: '6HhWfeDjetnxESEcThlBQtEUo0O8YHcXyHqCgN7b2hY',
    questionKey: 'ElonMusk',
  },
  {
    characterId: '7yDt2WH6Y_OpaAV4GsxKcY5xIQ8QT5M0kgpDQ6VAflI',
    questionKey: 'AreYouFeelingOkay',
  },

  {
    characterId: 'W4MWmsvbFFnKF8b9e3Eg6ZUNzdhqvEZYy-tNRtxB_Og',
    questionKey: 'AlternateTimeline',
  },
  {
    characterId: 'GxP9L6QQ-qocxM9sYfvwywDw6wwfSmBJUjalAlD1ZCY',
    questionKey: 'DebateChampion',
  },
];

const exampleChatGrid = exampleChatElems.map((elem) => [elem]);

export const HomeExampleChats = () => {
  const renderGridCard = (props: {
    characterId: string;
    questionKey: string;
  }) => <ExampleChatsCard {...props} key={props.characterId} />;
  return (
    <div className="w-full flex flex-col gap-4 mb-4 pr-2">
      <p className="ml-4">{t('Feed.try-saying')}</p>
      <HomeGrid
        grid={exampleChatGrid}
        renderGridCard={renderGridCard}
        itemWidth={EXAMPLE_CHATS_CARD_WIDTH}
      />
    </div>
  );
};

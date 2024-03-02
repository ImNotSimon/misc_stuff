import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { CreatorLink } from '../Common/CreatorLink';
import { NumCharacterAttribute } from '../Common/NumCharacterAttribute';
import LinkWithAnalytics from '../ui/button/linkWithAnalytics';
import { CharacterAvatar } from './CharacterAvatar';
import { CharacterDropdownOptions } from './CharacterDropdownOptions';

export function CharacterListItemStandard({
  referrer,
  name,
  src,
  title,
  author,
  interactions,
  upvotes,
  href,
  optionsProps,
}: {
  referrer: string;
  name: string;
  href: string;
  title: string;
  src: string;
  author?: string;
  interactions?: number;
  upvotes?: number;
  optionsProps?: { thisIsMyCharacter: boolean; characterId: string };
}) {
  const renderInfo = () => {
    const elems = [];
    if (!!interactions && interactions > 0) {
      elems.push(
        <div className="flex items-center justify-start">
          <NumCharacterAttribute
            type="interactions"
            num={interactions}
            iconProps={{ size: '1em', className: 'mr-1' }}
          />
        </div>,
      );
    }

    if (!!upvotes && upvotes > 0) {
      if (elems.length >= 1) {
        elems.push(<>•</>);
      }
      elems.push(
        <div className="flex items-center justify-start">
          <NumCharacterAttribute
            type="upvotes"
            num={upvotes}
            iconProps={{ size: '1em', className: 'mr-1' }}
          />
        </div>,
      );
    }
    if (author) {
      if (elems.length >= 1) {
        elems.push(<>•</>);
      }
      elems.push(<CreatorLink author={author} />);
    }
    return <>{elems.map((elem) => elem)}</>;
  };

  return (
    <LinkWithAnalytics
      href={href}
      className="group my-1 flex w-full flex-row justify-between hover:bg-surface-elevation-3 hover:rounded-spacing-m p-2 items-center"
      analyticsProps={{
        eventName: AnalyticsEvents.Links.Handled,
        properties: {
          link: href,
          referrer,
          type: 'CharacterListItemStandard',
        },
      }}
    >
      <div className="flex w-full flex-row gap-3 items-center text-md">
        <CharacterAvatar name={name} src={src} size={90} circle={false} />
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-lg">{name}</p>
          <p className="text-md line-clamp-1 text-ellipsis text-muted-foreground">
            {title}
          </p>
          <div className="flex gap-2 text-muted-foreground">{renderInfo()}</div>
        </div>
      </div>
      {!!optionsProps && (
        <div className="z-50">
          <CharacterDropdownOptions {...optionsProps} />
        </div>
      )}
    </LinkWithAnalytics>
  );
}

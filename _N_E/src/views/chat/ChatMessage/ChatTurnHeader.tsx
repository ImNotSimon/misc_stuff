import type { Author } from '@character-tech/client-common/src/chatManager/chatServiceTypes';

export function ChatTurnHeaderComponent({ author }: { author: Author }) {
  return (
    <div className="mx-2 flex flex-row items-center gap-2 font-light">
      <div className="text-small">{author.name}</div>
      {!author.is_human && (
        // eslint-disable-next-line i18next/no-literal-string
        <div className="rounded-2xl text-sm bg-secondary px-2 font-light">
          c.ai
        </div>
      )}
    </div>
  );
}

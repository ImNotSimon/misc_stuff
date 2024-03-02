import { mergeProps } from '@react-aria/utils';
import { type ForwardedRef, type ReactElement, type Ref } from 'react';

import ListboxSection from '@/components/ui/listbox/listbox-section';
import { forwardRef } from '@/components/ui/util/utils';
import ListboxItem from './listbox-item';
import { useListbox, type UseListboxProps } from './use-listbox';

type Props<T> = UseListboxProps<T>;

function Listbox<T extends object>(
  props: Props<T>,
  ref: ForwardedRef<HTMLUListElement>,
) {
  const {
    Component,
    state,
    color,
    variant,
    itemClasses,
    getBaseProps,
    topContent,
    bottomContent,
    hideEmptyContent,
    hideSelectedIcon,
    shouldHighlightOnFocus,
    disableAnimation,
    getEmptyContentProps,
    getListProps,
  } = useListbox<T>({ ...props, ref });

  const content = (
    <Component {...getListProps()}>
      {!state.collection.size && !hideEmptyContent && (
        <li>
          <div {...getEmptyContentProps()} />
        </li>
      )}
      {[...state.collection].map((item) => {
        const itemProps = {
          color,
          item,
          state,
          variant,
          disableAnimation,
          hideSelectedIcon,
          ...item.props,
        };

        if (item.type === 'section') {
          return (
            <ListboxSection
              key={item.key}
              {...itemProps}
              itemClasses={itemClasses}
            />
          );
        }
        let listboxItem = (
          <ListboxItem
            key={item.key}
            {...itemProps}
            classNames={mergeProps(itemClasses, item.props?.classNames)}
            shouldHighlightOnFocus={shouldHighlightOnFocus}
          />
        );

        if (item.wrapper) {
          listboxItem = item.wrapper(listboxItem);
        }

        return listboxItem;
      })}
    </Component>
  );

  return (
    <div {...getBaseProps()}>
      {topContent}
      {content}
      {bottomContent}
    </div>
  );
}

Listbox.displayName = 'NextUI.Listbox';

export type ListboxProps<T = object> = Props<T> & { ref?: Ref<HTMLElement> };

// forwardRef doesn't support generic parameters, so cast the result to the correct type
export default forwardRef(Listbox) as <T = object>(
  props: ListboxProps<T>,
) => ReactElement;

Listbox.displayName = 'NextUI.Listbox';

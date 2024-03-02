import { type ListboxSectionSlots } from '@/components/ui/theme/components/listbox';
import { type SlotsToClasses } from '@/components/ui/theme/utils';
import {
  BaseSection,
  type SectionProps,
} from '@/components/ui/util/aria-utils/collections/section';
import { type DividerProps } from '@nextui-org/react';
import { type ListboxItemProps } from '../listbox-item';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ListboxSectionBaseProps<T extends object = {}>
  extends SectionProps<'ul', T> {
  /**
   * The listbox section classNames.
   */
  classNames?: SlotsToClasses<ListboxSectionSlots>;
  /**
   * The listbox items classNames.
   */
  itemClasses?: ListboxItemProps['classNames'];
  /**
   * Whether to hide the check icon when the items are selected.
   * @default false
   */
  hideSelectedIcon?: boolean;
  /**
   * Shows a divider between sections
   * @default false
   */
  showDivider?: boolean;
  /**
   * The divider props
   */
  dividerProps?: DividerProps;
}

const ListboxSectionBase = BaseSection as <T extends object>(
  props: ListboxSectionBaseProps<T>,
) => JSX.Element;

export default ListboxSectionBase;

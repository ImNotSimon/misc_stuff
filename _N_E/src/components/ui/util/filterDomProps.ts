/* eslint-disable no-continue */
import { DOMEventNames, DOMPropNames } from '@/components/ui/util/domProps';
import { type AriaLabelingProps, type DOMProps } from '@react-types/shared';

interface Options {
  /**
   * If the filter should be enabled.
   */
  enabled?: boolean;
  /**
   * If labelling associated aria properties should be included in the filter.
   */
  labelable?: boolean;
  /**
   * A Set of other property names that should be included in the filter.
   */
  propNames?: Set<string>;
  /**
   * A Set of other property names that should be removed from the filter.
   */
  omitPropNames?: Set<string>;
  /**
   * A Set of event names that should be excluded from the filter.
   */
  omitEventNames?: Set<string>;
}

const propRe = /^(data-.*)$/;
const ariaRe = /^(aria-.*)$/;
const funcRe = /^(on[A-Z].*)$/;

/**
 * Filters out all props that aren't valid DOM props or defined via override prop obj.
 * @param props - The component props to be filtered.
 * @param opts - Props to override.
 */
export function filterDOMProps(
  props: DOMProps & AriaLabelingProps,
  opts: Options = {},
): DOMProps & AriaLabelingProps {
  const {
    labelable = true,
    enabled = true,
    propNames,
    omitPropNames,
    omitEventNames,
  } = opts;
  const filteredProps = {};

  if (!enabled) {
    return props;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in props) {
    if (omitPropNames?.has(prop)) {
      continue;
    }

    if (omitEventNames?.has(prop) && funcRe.test(prop)) {
      continue;
    }

    if (funcRe.test(prop) && !DOMEventNames.has(prop)) {
      continue;
    }

    if (
      (Object.prototype.hasOwnProperty.call(props, prop) &&
        (DOMPropNames.has(prop) ||
          (labelable && ariaRe.test(prop)) ||
          propNames?.has(prop) ||
          propRe.test(prop))) ||
      funcRe.test(prop)
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
}

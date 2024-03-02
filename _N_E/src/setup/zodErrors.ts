import { capitalize } from '@/utils/stringUtils';
import { t } from 'i18next';
import { z } from 'zod';

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let name = (issue.path[issue.path.length - 1] as string) ?? '';
  name = t(`Form.labels.${name}`, {
    defaultValue: capitalize(name),
  });
  if (issue.code === z.ZodIssueCode.too_small) {
    if (ctx.data.length === 0) {
      return { message: t('Error.required', { name }) };
    }
    return {
      message: t('Error.minLength', { name, minLength: issue.minimum }),
    };
  }

  if (issue.code === z.ZodIssueCode.too_big) {
    return {
      message: t('Error.maxLength', { name, maxLength: issue.maximum }),
    };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

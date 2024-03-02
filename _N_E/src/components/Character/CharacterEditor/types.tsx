import { type DynamicTooltipProps } from '@/components/ui/DynamicTooltip';
import { CharacterVisibility } from '@character-tech/client-common/src/types/types';
import { CharacterConstants } from '@character-tech/client-common/src/utils/characterUtils';
import { validNameRegex } from '@character-tech/client-common/src/utils/constants';
import { t } from 'i18next';
import { isMobile } from 'react-device-detect';
import { z } from 'zod';

export const characterTooltipProps = {
  side: isMobile ? 'right' : 'left',
  sideOffset: isMobile ? -240 : 8,
  className: 'max-w-52',
} as Partial<DynamicTooltipProps>;

export const CharacterEditorFormSchema = z.object({
  name: z
    .string()
    .min(CharacterConstants.MIN_NAME_LEN)
    .max(CharacterConstants.MAX_NAME_LEN)
    .regex(validNameRegex, t('Form.invalid-characters')),
  title: z
    .string()
    .min(CharacterConstants.MIN_TITLE_LEN)
    .max(CharacterConstants.MAX_TITLE_LEN)
    .or(z.literal(''))
    .optional(),
  visibility: z.nativeEnum(CharacterVisibility),
  copyable: z.boolean(),
  greeting: z
    .string()
    .min(CharacterConstants.MIN_GREETING_LEN)
    .max(CharacterConstants.MAX_GREETING_LEN),
  definition: z.string().max(CharacterConstants.MAX_DEFINITION_LEN).optional(),
  description: z
    .string()
    .max(CharacterConstants.MAX_DESCRIPTION_LEN)
    .optional(),
  categories: z.string().array(),
  // avatar
  avatar_rel_path: z.string().optional(),
  // image
  img_gen_enabled: z.boolean(),
  base_img_prompt: z.string().optional(),
  strip_img_prompt_from_msg: z.boolean(),
  // voice
  voice_id: z.string().optional(),
  default_voice_id: z.string().optional(),
  // identifier
  external_id: z.string().optional(),
  identifier: z.string().optional(),
});

export type GenerateFieldParams = {
  onSuccess:
    | ((
        data: {
          uuid: string;
          text: string;
        }[],
        variables: {
          field_to_generate: string;
          num_candidates?: number | undefined;
          metadata: Record<string, string>;
        },
        context: unknown,
      ) => void)
    | undefined;
  onError:
    | ((
        error: unknown,
        variables: {
          field_to_generate: string;
          num_candidates?: number | undefined;
          metadata: Record<string, string>;
        },
        context: unknown,
      ) => void)
    | undefined;
};

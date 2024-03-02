import {
  PERSONA_DEFINITION_LIMIT,
  PERSONA_NAME_MAX_LIMIT,
  PERSONA_NAME_MIN_LIMIT,
} from '@character-tech/client-common/src/hooks/queries/persona';
import {
  type CharacterDetailed,
  type UserSettings,
} from '@character-tech/client-common/src/types/app-api';
import { validNameRegex } from '@character-tech/client-common/src/utils/constants';
import { t } from 'i18next';
import { z } from 'zod';

export const PersonaFormSchema = z.object({
  name: z
    .string()
    .min(PERSONA_NAME_MIN_LIMIT)
    .max(PERSONA_NAME_MAX_LIMIT)
    .regex(validNameRegex, t('Form.invalid-characters')),
  definition: z.string().max(PERSONA_DEFINITION_LIMIT),
  avatar_rel_path: z.string(),
  enabled: z.boolean(),
});

export const EMPTY_PERSONA = {
  external_id: 'new',
  name: '',
  participant__name: '',
  definition: '',
} as CharacterDetailed;

export const isActivePersona = (
  personaId: string,
  characterId: string,
  settings?: UserSettings,
) => {
  const isOverridenPersona =
    settings?.personaOverrides?.[characterId] === personaId;

  const characterHasNoOverride =
    settings?.personaOverrides?.[characterId] === undefined;
  const isDefaultPersona =
    settings?.default_persona_id === personaId && characterHasNoOverride;

  return isOverridenPersona || isDefaultPersona;
};

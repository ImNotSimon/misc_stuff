import { Input } from '@/components/ui/input';
import { enableDebugModeSignal } from '@/lib/state/signals';
import { parseDebugInfo } from '@/utils/debugUtils';
import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useSignalValue } from 'signals-react-safe';

import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { AppToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AppUtils } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { FaCode } from 'react-icons/fa';
import { TextScambleEffect } from '../Effects/TextScramble';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export function EnableDebugOptions() {
  const { user } = useAuth();
  const enableDebugModeValue = useSignalValue(enableDebugModeSignal);

  const isStaff = user?.user?.is_staff;

  if (!isStaff) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="flex justify-between gap-3 font-mono text-sm w-full rounded-spacing-xs"
      onPress={() => {
        if (!enableDebugModeValue) {
          AppToast(
            'Debug mode enabled. New messages should have debug info attached.',
          );
        }

        enableDebugModeSignal.value = !enableDebugModeValue;
      }}
    >
      <FaCode className="ml-1 text-muted-foreground size-4" />
      <TextScambleEffect
        className="text-muted-foreground"
        phrases={[
          !enableDebugModeValue
            ? `{ enable debug mode }`
            : `{ disable debug mode }`,
        ]}
      />
    </Button>
  );
}

// helper to find a value in a nested object for debug purposes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findValueByKeyHelper(keyToFind: string, obj: any) {
  // Check if the current object has the key
  // eslint-disable-next-line no-prototype-builtins
  if (obj.hasOwnProperty(keyToFind)) {
    return obj[keyToFind];
  }

  // If the current value is an object, search its keys
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = findValueByKeyHelper(keyToFind, obj[key]);
      if (result !== undefined) {
        return { [keyToFind]: result };
      }
    }
  }

  // Key not found in this path
  return undefined;
}

// we need a HOC so that we can guard against non-staff users
// without running the other hooks
export function CandidateDebugInfo(props: {
  candidate: Candidate;
  turn: Turn;
}) {
  const enableDebugModeValue = useSignalValue(enableDebugModeSignal);
  if (!enableDebugModeValue) {
    return null;
  }

  return <DebugInfo {...props} />;
}

function DebugField({
  label,
  field,
  slice,
}: {
  label: string;
  field: string;
  slice?: number;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <p
      title={field}
      className="cursor-copy hover:text-ring p-1 font-mono text-sm"
      onClick={() => {
        logAnalyticsEvent(AnalyticsEvents.Message.Copied);
        AppUtils.copyTextToClipboard(field);
      }}
    >
      {label}: {slice ? field.slice(0, slice) : field}
    </p>
  );
}

function DebugInfo({
  candidate,
  turn,
}: {
  candidate: Candidate;
  turn: ViewChatMessage;
}) {
  // candidate.debug_info = stubDebug;
  const [filter, setFilter] = useState('');
  let debugInfo = useMemo(() => parseDebugInfo(candidate), [candidate]);
  const debugKeysCount = Object.keys(debugInfo).length;

  const filteredField = findValueByKeyHelper(filter, debugInfo);
  if (filteredField) {
    debugInfo = filteredField;
  }

  return (
    <>
      <div className="rounded-spacing-xxs overflow-hidden bg-black [&>*:nth-child(odd)]:bg-surface-elevation-1 [&>*:nth-child(even)]:bg-surface-elevation-3">
        <DebugField label="create_time" field={candidate.create_time} />
        <DebugField label="turn_id" field={turn.turn_key.turn_id} slice={8} />
        <DebugField
          label="primary_candidate_id"
          field={turn.primary_candidate_id}
          slice={8}
        />
        <DebugField
          label="candidate_id"
          field={candidate.candidate_id}
          slice={8}
        />

        {!!turn.isLastAiMessage && (
          <DebugField
            label="isLastAiMessage"
            field={turn.isLastAiMessage ? 'true' : 'false'}
            slice={8}
          />
        )}
        {!!turn.isLastUserMessage && (
          <DebugField
            label="isLastUserMessage"
            field={turn.isLastUserMessage ? 'true' : 'false'}
            slice={8}
          />
        )}
        {!!turn.isGreetingMessage && (
          <DebugField
            label="greeting_mesage"
            field={turn.isGreetingMessage ? 'true' : 'false'}
            slice={8}
          />
        )}
        {!!candidate.base_candidate_id && (
          <DebugField
            label="base_candidate_id"
            field={candidate.base_candidate_id}
            slice={8}
          />
        )}
      </div>
      {debugKeysCount > 0 && (
        <div className="flex flex-col gap-2 p-2">
          <Input
            value={filter}
            onChange={(evt) => setFilter(evt.target.value)}
            placeholder="debug filter key"
          />
          <ReactJson
            theme="ocean"
            name={null}
            src={debugInfo}
            displayDataTypes={false}
            shouldCollapse={() => true}
            collapseStringsAfterLength={50}
            iconStyle="circle"
          />
        </div>
      )}
    </>
  );
}

// // test data to use for debugging
// const stubDebug = `
// {
//   "ranking_params":[
//      {
//         "name":"chosen_after_swipe_crowd_preference",
//         "pow":0.5,
//         "negation":false
//      },
//      {
//         "name":"chosen_after_swipe_preference",
//         "pow":0.5,
//         "negation":false
//      }
//   ],
//   "penalty_params":[
//      {
//         "name":"annotations_sexually_suggestive",
//         "penalty":10000,
//         "final_threshold":0.25,
//         "per_unit_penalty":0
//      },
//      {
//         "name":"annotations_porn",
//         "penalty":10000,
//         "final_threshold":0.12,
//         "per_unit_penalty":0
//      },
//      {
//         "name":"annotations_porn",
//         "penalty":20000,
//         "final_threshold":0.2,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_racist",
//         "penalty":10000,
//         "final_threshold":0.15,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_disturbing",
//         "penalty":10000,
//         "final_threshold":0.15,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_harmful_promotes_selfharm",
//         "penalty":10000,
//         "final_threshold":0.09,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_harmful_promotes_selfharm",
//         "penalty":10000,
//         "final_threshold":0.04,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_harmful_promotes_terrorism",
//         "penalty":10000,
//         "final_threshold":0.05,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"repetitive",
//         "penalty":1000,
//         "final_threshold":0.36,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_nonsense_gd",
//         "penalty":1000,
//         "final_threshold":0.4,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_looping",
//         "penalty":1000,
//         "final_threshold":0.07,
//         "per_unit_penalty":1
//      },
//      {
//         "name":"annotations_out_of_character_gd",
//         "penalty":1000,
//         "final_threshold":0.3,
//         "per_unit_penalty":1
//      }
//   ],
//   "termination_bonus_min":0,
//   "termination_bonus_max":0,
//   "batch_size":21,
//   "max_batch_size":48,
//   "prefix":"SAMPLE PREFIX",
//   "prefix_len":598,
//   "cache_retrieved_len":16,
//   "cache_age_seconds":1769,
//   "chunk_0":{
//      "chosen_after_swipe_crowd_preference":{
//         "0":0.1980641782283783,
//         "1":0.25534364581108093,
//         "2":0.3302551507949829,
//         "3":0.3225259780883789
//      },
//      "chosen_after_swipe_preference":{
//         "0":0.13660839200019836,
//         "1":0.14223189651966095,
//         "2":0.1200256198644638,
//         "3":0.13660839200019836
//      },
//      "prob_sexually_suggestive":{
//         "0":0.0003569706459529698,
//         "1":0.0004044814850203693,
//         "2":0.0005193048855289817,
//         "3":0.00043055712012574077
//      },
//      "prob_porn":{
//         "0":0.0020507434383034706,
//         "1":0.0017007222631946206,
//         "2":0.0016484829830005765,
//         "3":0.0017007222631946206
//      },
//      "prob_racist":{
//         "0":0.006903838831931353,
//         "1":0.004609572235494852,
//         "2":0.004609572235494852,
//         "3":0.004905405919998884
//      },
//      "prob_disturbing":{
//         "0":0.00023050670279189944,
//         "1":0.0002959570847451687,
//         "2":0.00036829791497439146,
//         "3":0.00024536947603337467
//      },
//      "prob_harmful_promotes_selfharm":{
//         "0":0.0023967307060956955,
//         "1":0.0023967307060956955,
//         "2":0.003172682598233223,
//         "3":0.0024726230185478926
//      },
//      "prob_harmful_promotes_terrorism":{
//         "0":0.0035936026833951473,
//         "1":0.0025509123224765062,
//         "2":0.0025509123224765062,
//         "3":0.0026316740550100803
//      },
//      "repetitive":{
//         "0":0.010986941866576672,
//         "1":0.015424552373588085,
//         "2":0.011331753805279732,
//         "3":0.009412589482963085
//      },
//      "prob_nonsense_gd":{
//         "0":0.1127954050898552,
//         "1":0.10818895697593689,
//         "2":0.1561049073934555,
//         "3":0.13296423852443695
//      },
//      "prob_looping":{
//         "0":0.023689469322562218,
//         "1":0.015424552373588085,
//         "2":0.01640303246676922,
//         "3":0.011331753805279732
//      },
//      "prob_out_of_character_gd":{
//         "0":0.12940272688865662,
//         "1":0.1520322561264038,
//         "2":0.14033624529838562,
//         "3":0.15002880990505219
//      },
//      "termination_bonus":0,
//      "is_finished":{
//         "0":true,
//         "1":true,
//         "2":true,
//         "3":true
//      },
//      "final_score":{
//         "0":0.16449081897735596,
//         "1":0.1905728429555893,
//         "2":0.19909565150737762,
//         "3":0.20990414917469025
//      },
//      "chosen candidate":3,
//      "text":{
//         "0":" Hi!<|endofmessage|><|beginningofmessage|>Tech-Adept: Peni Parker, pleasure to meet you",
//         "1":" Hi! How are you doing?<|endofmessage|><|beginningofmessage|>Tech-Adept: i am well",
//         "2":" Hello, tech-Adept. How may I help you today?<|endofmessage|><|beginningofmessage|>Tech",
//         "3":" Hi, Tech-Adept. What’s up?<|endofmessage|><|beginningofmessage|>Tech-Adept"
//      },
//      "is_filtered":false
//   },
//   "classifiers":{
//      "stay_time_minutes_character_turn_0":0.09534945338964462,
//      "stay_time_minutes_character_turn_1":0.08756384253501892,
//      "stay_time_minutes_character_turn_2":0.13296423852443695,
//      "stay_time_minutes_character_turn_3":0.06954174488782883,
//      "stay_time_minutes_character_turn_4":0.11920291930437088,
//      "stay_time_minutes_character_turn_5":0.11436853557825089,
//      "stay_time_minutes_character_turn_6":0.1276526302099228,
//      "stay_time_minutes_character_turn_7":0.09670579433441162,
//      "star_rating_0":0.0018102108733728528,
//      "star_rating_1":0.0008040859247557819,
//      "star_rating_2":0.004331501666456461,
//      "star_rating_3":0.011687257327139378,
//      "repetitive":0.011687257327139378,
//      "chosen_after_swipe":0.5338835716247559,
//      "first_candidate_swipe_away":0.4593186378479004,
//      "community_post_rejected":0.5336405038833618,
//      "community_comment_rejected":0.3486451208591461,
//      "adult_content":0.004905405919998884,
//      "adult_content_v2":0.010986941866576672,
//      "bad":0.05749328061938286,
//      "bad_memory":0.008847354911267757,
//      "bad_response":0.06278920918703079,
//      "boring":0.008315778337419033,
//      "broken_link":0.008061991073191166,
//      "chosen_response":0.005554925184696913,
//      "conspiracy_theories":0.00013135180051904172,
//      "contains_factual_information":0.0037072531413286924,
//      "contains_factual_information_that_may_change_with_time":0.008315778337419033,
//      "custom_feedback":0.007815888151526451,
//      "depressing":0.00023050670279189944,
//      "dislike":0.00712142838165164,
//      "disrespectful_towards_anyone":0.00015843621804378927,
//      "disrespectful_towards_sensitive_groups":0.00628990214318037,
//      "disturbing":0.00024536947603337467,
//      "disturbing_v2":0.004755199886858463,
//      "diverting_communication":0.014957086183130741,
//      "does_not_follow_instruction":0.002182716503739357,
//      "doesnt_drive_conversation_forward":0.0060975621454417706,
//      "empathetic":0.02161533385515213,
//      "ends_chat_early":0.010013571009039879,
//      "engaging":0.007815888151526451,
//      "especially_in_character":0.004609572235494852,
//      "five_star":0.005554925184696913,
//      "flag":0.011687257327139378,
//      "follows_instruction_correctly":0.027169233188033104,
//      "follows_instruction_incorrectly":0.0019267346942797303,
//      "four_star":0.008315778337419033,
//      "funny":0.0044683837331831455,
//      "good!":0.24798744916915894,
//      "good_response":0.11124119907617569,
//      "great_response":0.054198723286390305,
//      "harmful_promotes_hatespeech_red":0.005060331895947456,
//      "harmful_promotes_physical_harm_to_others_red":0.01798621006309986,
//      "harmful_promotes_selfharm":0.0024726230185478926,
//      "harmful_promotes_selfharm_red":0.008315778337419033,
//      "harmful_promotes_terrorism":0.0026316740550100803,
//      "harmful_promotes_terrorism_red":0.0038244836032390594,
//      "helpful":0.0034834241960197687,
//      "i_dislike_this_image":0.003172682598233223,
//      "i_hate_this_image":0.004331501666456461,
//      "i_like_this_image":0.0025509123224765062,
//      "i_love_this_image":0.0060975621454417706,
//      "image_contains_text_that_is_unreadable_or_in_unknown_language":0.0035936026833951473,
//      "image_five_star":0.03514484688639641,
//      "image_four_star":0.0060975621454417706,
//      "image_has_noticeable_defects":0.001987774157896638,
//      "image_is_hard_to_understand":0.020023440942168236,
//      "image_is_missing_key_elements_described_in_prompt":0.008061991073191166,
//      "image_is_not_pleasing_to_the_eye":0.0060975621454417706,
//      "image_is_photorealistic":0.004755199886858463,
//      "image_is_poorly_cropped":0.01065251138061285,
//      "image_is_very_well_drawn_painted_photographed":0.013222821988165379,
//      "image_may_be_disturbing_to_some_people":0.007577241398394108,
//      "image_may_be_inappropriate_to_some_people":0.011687257327139378,
//      "image_one_star":0.008315778337419033,
//      "image_three_star":0.008847354911267757,
//      "image_two_star":0.006692850962281227,
//      "immoral":0.009708477184176445,
//      "inaccurate":0.011687257327139378,
//      "initiates_ending_chat":0.000552778656128794,
//      "initiates_talking_about_adult_content":0.0059110685251653194,
//      "interesting":0.02931223064661026,
//      "leak":0.005554925184696913,
//      "like":0.006692850962281227,
//      "long":0.007577241398394108,
//      "looping":0.011331753805279732,
//      "misleading":0.009125636890530586,
//      "missing_factual_information":0.008847354911267757,
//      "no_instruction_given":0.9343951344490051,
//      "nonsense":0.030675802379846573,
//      "nonsense_gd":0.13296423852443695,
//      "ok_response":0.43014734983444214,
//      "one_star":0.020645929500460625,
//      "out_of_character":0.008577484637498856,
//      "out_of_character_gd":0.15002880990505219,
//      "pedophilia":0.0038244836032390594,
//      "phantom_context":0.004331501666456461,
//      "politically_contentious":0.004905405919998884,
//      "porn":0.0017007222631946206,
//      "potentially_controversial":0.00628990214318037,
//      "potentially_harmful":0.0003569706459529698,
//      "potentially_harmful_financial_advice":0.0037072531413286924,
//      "potentially_harmful_medical_advice":0.004331501666456461,
//      "potentially_harmful_v2":0.03622005507349968,
//      "potentially_misleading":0.0120537793263793,
//      "privacy_sensitive":0.0037072531413286924,
//      "profane":0.000503335555549711,
//      "promising_to_do_something_later":0.001597845577634871,
//      "racist":0.004905405919998884,
//      "rude_uncaring":0.0007554056355729699,
//      "seeks_factual_information":0.0024726230185478926,
//      "sexually_suggestive":0.00043055712012574077,
//      "sexually_suggestive_M_rated":0.01798621006309986,
//      "sexually_suggestive_R_rated":0.012821214273571968,
//      "sexually_suggestive_X_rated":0.00712142838165164,
//      "sexually_suggestive_v2":0.06560483574867249,
//      "short":0.007345826830714941,
//      "superlike":0.013222821988165379,
//      "swipe_selected":0.0030753696337342262,
//      "terrible_response":0.006692850962281227,
//      "three_star":0.01590639166533947,
//      "truncated":0.0034834241960197687,
//      "two_star":0.0028009270317852497,
//      "ugly":0.0027149852830916643,
//      "unhelpful":0.00628990214318037,
//      "unhelpful_factual_information":0.0064882696606218815,
//      "unsafe":0.008315778337419033,
//      "violence":0.00628990214318037,
//      "wrong_broken_link":0.0039454069919884205,
//      "wrong_facts":0.011331753805279732,
//      "wrong_link":0.0064882696606218815,
//      "👍":0.009412589482963085,
//      "👎":0.009708477184176445,
//      "😀":0.14608724415302277,
//      "😍":0.010328153148293495,
//      "😒":0.08756384253501892,
//      "😞":0.005384937860071659,
//      "😡":0.005730246659368277,
//      "😮":0.008061991073191166,
//      "🤗":0.009708477184176445,
//      "🤣":0.007577241398394108,
//      "🤮":0.014503579586744308,
//      "chosen_after_swipe_crowd_preference":0.3225259780883789,
//      "chosen_after_swipe_preference":0.13660839200019836,
//      "chosen_after_swipe_repetitive_preference":0.4493926167488098,
//      "chosen_after_swipe_out_of_character_preference":0.5869964361190796,
//      "chosen_after_swipe_bad_memory_preference":0.5209837555885315,
//      "chosen_after_swipe_long_preference":0.5912512540817261,
//      "chosen_after_swipe_short_preference":0.4904796779155731
//   }
// }`;

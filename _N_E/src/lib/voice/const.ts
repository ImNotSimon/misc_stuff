/**
 * How long to wait until we considered that no sound is playing, after audio signal was detected.
 */
export const timeoutWithoutSoundMs = 3_000;

/**
 * How long to wait without audio signal.
 */
export const timeoutWithoutAnySoundMs = 5_000;

/** How long to wait for the audio track from the peer connection. */
export const timeoutForTrackMs = 5_000;

/** How long to wait for peer connection to reach the connected state. */
export const timeoutForConnectedMs = 5_000;

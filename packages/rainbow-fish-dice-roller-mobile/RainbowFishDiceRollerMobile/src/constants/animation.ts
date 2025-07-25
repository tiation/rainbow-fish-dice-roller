export const SOUNDS = {
  // Sound files can be added here when needed
  roll: null,
};

export const HAPTIC_FEEDBACK_OPTIONS = {
  enableVibration: true,
};

export interface AnimationSettings {
  duration: number;
  bounces: number;
  rotations: number;
  hapticFeedback: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  duration: 1000,
  bounces: 3,
  rotations: 2,
  hapticFeedback: true,
  soundEnabled: true,
};

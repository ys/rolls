/**
 * Haptic feedback utility for native-like tactile responses
 *
 * Provides vibration feedback on supported devices (iOS, Android)
 * Gracefully degrades on unsupported platforms
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [10, 50, 10], // Two quick taps
  warning: [20, 100, 20], // Medium intensity double tap
  error: [50, 100, 50, 100, 50], // Strong triple tap
};

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback to provide
 */
export function haptic(type: HapticType = 'light'): void {
  // Check if vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  // Don't vibrate if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[type];
  navigator.vibrate(pattern);
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

// Convenience functions for common patterns
export const haptics = {
  light: () => haptic('light'),
  medium: () => haptic('medium'),
  heavy: () => haptic('heavy'),
  success: () => haptic('success'),
  warning: () => haptic('warning'),
  error: () => haptic('error'),
  cancel: cancelHaptic,
};

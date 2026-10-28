/**
 * Camera Constraints and Compatibility Utilities
 * Configures optimal video stream constraints for mobile and desktop browsers,
 * with multi-tier progressive fallbacks to prevent OverconstrainedError and NotFoundError.
 */

export interface DeviceEnvironmentInfo {
  isMobile: boolean;
  isIos: boolean;
  isAndroid: boolean;
  hasMediaDevices: boolean;
  isSecureContext: boolean;
}

/**
 * Detect client hardware environment (mobile vs desktop)
 */
export function detectDeviceEnvironment(): DeviceEnvironmentInfo {
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
  if (!isBrowser) {
    return {
      isMobile: false,
      isIos: false,
      isAndroid: false,
      hasMediaDevices: false,
      isSecureContext: false
    };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = isAndroid || isIos || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasMediaDevices = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return {
    isMobile,
    isIos,
    isAndroid,
    hasMediaDevices,
    isSecureContext: isSecure
  };
}

/**
 * Returns prioritized array of MediaStreamConstraints configurations.
 * Desktop machines typically have a single front-facing webcam (user facing),
 * whereas mobile devices have dedicated rear (environment) cameras.
 */
export function getCompatibleConstraintsList(preferredFacing: 'environment' | 'user' = 'environment'): MediaStreamConstraints[] {
  const { isMobile } = detectDeviceEnvironment();

  // If on desktop and user requested environment, use 'user' or loose facingMode to avoid OverconstrainedError
  const effectiveFacing = isMobile ? preferredFacing : (preferredFacing === 'environment' ? 'user' : preferredFacing);

  return [
    // Tier 1: Optimal 720p/1080p with ideal facingMode
    {
      audio: false,
      video: {
        facingMode: { ideal: effectiveFacing },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    },
    // Tier 2: Loose facingMode without strict resolution constraints
    {
      audio: false,
      video: {
        facingMode: { ideal: effectiveFacing }
      }
    },
    // Tier 3: Opposite facingMode (e.g. if environment is not present on device)
    {
      audio: false,
      video: {
        facingMode: { ideal: effectiveFacing === 'environment' ? 'user' : 'environment' }
      }
    },
    // Tier 4: Generic video (bypasses any driver/platform facingMode quirks)
    {
      audio: false,
      video: true
    }
  ];
}

/**
 * Query the browser's current camera permission state if supported by the Permissions API.
 */
export async function queryCameraPermissionStatus(): Promise<PermissionState | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return status.state;
  } catch {
    return 'unsupported';
  }
}

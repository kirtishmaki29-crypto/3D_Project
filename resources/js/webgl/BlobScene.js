import * as THREE from 'three';
import gsap from 'gsap';
import { blobVertexShader } from './shaders/blob.vert.js';
import { blobFragmentShader } from './shaders/blob.frag.js';

const CONFIG = {
  geometryRadius: 3.4,
  pointerSmoothing: 0.055,
  reducedPointerSmoothing: 0.035,
  stateDamping: 0.065,
  opacityDamping: 0.08,
  rotationDamping: 0.045,
  desktopPixelRatio: 1.5,
  mobilePixelRatio: 1.45,
  tabletPixelRatio: 1.5,
  desktopSegments: { width: 1, height: 1 },
  tabletSegments: { width: 1, height: 1 },
  mobileSegments: { width: 1, height: 1 },
  toneExposure: 0.95
};

const DEFAULT_STATE = {
  x: 0.34,
  y: -0.04,
  scale: 1.65,
  distortion: 0.88,
  opacity: 0.94,
  cameraZ: 9.6,
  cameraFov: 45,
  colorIntensity: 0.98,
  reveal: 1,
  interactionStrength: 1,
  noiseStrength: 0.16,
  noiseFrequency: 1.05,
  noiseSpeed: 0.38,
  hoverStrength: 0.18,
  scrollProgress: 0,
  pointerInfluence: 0.08,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  fresnelPower: 2.7,
  fresnelIntensity: 1.08,
  hueShift: 0
};

const RESPONSIVE_STATES = {
  hero: {
    desktop: {
      x: -0.08,
      y: -0.045,
      scale: 1.78,
      cameraZ: 9.34,
      cameraFov: 45,
      noiseStrength: 0.185,
      noiseFrequency: 1.04,
      colorIntensity: 1.08,
      hoverStrength: 0.2,
      pointerInfluence: 0.09
    },
    wide: {
      x: -0.08,
      y: -0.045,
      scale: 1.94,
      cameraZ: 9.48,
      cameraFov: 44,
      noiseStrength: 0.18,
      noiseFrequency: 1.02,
      colorIntensity: 1.08,
      hoverStrength: 0.19,
      pointerInfluence: 0.085
    },
    tablet: {
      x: 0.28,
      y: -0.03,
      scale: 1.28,
      cameraZ: 9.18,
      cameraFov: 45,
      noiseStrength: 0.165,
      noiseFrequency: 1.0,
      colorIntensity: 0.96,
      hoverStrength: 0.14,
      pointerInfluence: 0.055
    },
    mobile: {
      x: 0.18,
      y: -0.015,
      scale: 1.02,
      cameraZ: 9.05,
      cameraFov: 46,
      noiseStrength: 0.15,
      noiseFrequency: 0.96,
      colorIntensity: 0.9,
      hoverStrength: 0.08,
      pointerInfluence: 0.025
    }
  },
  workIntro: {
    desktop: {
      x: 0.1,
      y: -0.02,
      scale: 1.24,
      cameraZ: 9.7,
      cameraFov: 45,
      distortion: 0.88,
      noiseStrength: 0.15,
      noiseFrequency: 0.92,
      colorIntensity: 0.88,
      pointerInfluence: 0.055,
      hoverStrength: 0.12,
      scrollProgress: 0.06
    },
    wide: {
      x: 0.08,
      y: -0.02,
      scale: 1.36,
      cameraZ: 9.85,
      cameraFov: 44,
      distortion: 0.86,
      noiseStrength: 0.145,
      noiseFrequency: 0.9,
      colorIntensity: 0.9,
      pointerInfluence: 0.052,
      hoverStrength: 0.12,
      scrollProgress: 0.06
    },
    tablet: {
      x: 0.12,
      y: -0.02,
      scale: 1.06,
      cameraZ: 9.42,
      cameraFov: 45,
      distortion: 0.82,
      noiseStrength: 0.13,
      colorIntensity: 0.82,
      pointerInfluence: 0.035,
      hoverStrength: 0.08,
      scrollProgress: 0.05
    },
    mobile: {
      x: 0.05,
      y: -0.05,
      scale: 0.82,
      cameraZ: 9.18,
      cameraFov: 46,
      distortion: 0.76,
      noiseStrength: 0.112,
      colorIntensity: 0.76,
      pointerInfluence: 0.018,
      hoverStrength: 0.04,
      scrollProgress: 0.04
    }
  },
  workExit: {
    desktop: {
      x: -0.18,
      y: 0.02,
      scale: 1.08,
      cameraZ: 9.92,
      distortion: 0.72,
      opacity: 0.7,
      colorIntensity: 0.66,
      noiseStrength: 0.1,
      pointerInfluence: 0.025,
      hoverStrength: 0.05,
      scrollProgress: 0.72
    },
    wide: {
      x: -0.15,
      y: 0.02,
      scale: 1.18,
      cameraZ: 10.1,
      distortion: 0.72,
      opacity: 0.7,
      colorIntensity: 0.66,
      noiseStrength: 0.1,
      pointerInfluence: 0.025,
      hoverStrength: 0.05,
      scrollProgress: 0.72
    },
    tablet: {
      x: -0.1,
      y: 0,
      scale: 0.9,
      cameraZ: 9.62,
      distortion: 0.68,
      opacity: 0.62,
      colorIntensity: 0.58,
      noiseStrength: 0.09,
      pointerInfluence: 0.018,
      hoverStrength: 0.04,
      scrollProgress: 0.68
    },
    mobile: {
      x: -0.04,
      y: -0.04,
      scale: 0.7,
      cameraZ: 9.32,
      distortion: 0.62,
      opacity: 0.56,
      colorIntensity: 0.52,
      noiseStrength: 0.08,
      pointerInfluence: 0.012,
      hoverStrength: 0.025,
      scrollProgress: 0.64
    }
  },
  aboutIntro: {
    desktop: {
      x: -0.16,
      y: 0.03,
      scale: 0.82,
      cameraZ: 9.86,
      distortion: 0.72,
      opacity: 0.66,
      colorIntensity: 0.56,
      noiseStrength: 0.105,
      noiseFrequency: 0.86,
      pointerInfluence: 0.026,
      hoverStrength: 0.05,
      scrollProgress: 0.18
    },
    wide: {
      x: -0.14,
      y: 0.025,
      scale: 0.9,
      cameraZ: 10.04,
      distortion: 0.72,
      opacity: 0.66,
      colorIntensity: 0.56,
      noiseStrength: 0.105,
      noiseFrequency: 0.86,
      pointerInfluence: 0.026,
      hoverStrength: 0.05,
      scrollProgress: 0.18
    },
    tablet: {
      x: -0.12,
      y: 0.02,
      scale: 0.72,
      cameraZ: 9.62,
      distortion: 0.68,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.095,
      pointerInfluence: 0.018,
      hoverStrength: 0.035,
      scrollProgress: 0.16
    },
    mobile: {
      x: -0.04,
      y: -0.1,
      scale: 0.58,
      cameraZ: 9.28,
      distortion: 0.64,
      opacity: 0.58,
      colorIntensity: 0.48,
      noiseStrength: 0.078,
      pointerInfluence: 0.01,
      hoverStrength: 0.02,
      scrollProgress: 0.14
    }
  },
  aboutStatement: {
    desktop: {
      x: 0.2,
      y: -0.035,
      scale: 1.04,
      cameraZ: 9.46,
      distortion: 0.96,
      opacity: 0.86,
      colorIntensity: 0.8,
      noiseStrength: 0.15,
      noiseFrequency: 0.98,
      pointerInfluence: 0.046,
      hoverStrength: 0.1,
      fresnelIntensity: 1.04,
      hueShift: 0.38,
      scrollProgress: 0.28
    },
    wide: {
      x: 0.18,
      y: -0.035,
      scale: 1.14,
      cameraZ: 9.66,
      distortion: 0.96,
      opacity: 0.86,
      colorIntensity: 0.8,
      noiseStrength: 0.15,
      noiseFrequency: 0.98,
      pointerInfluence: 0.046,
      hoverStrength: 0.1,
      fresnelIntensity: 1.04,
      hueShift: 0.38,
      scrollProgress: 0.28
    },
    tablet: {
      x: 0.13,
      y: -0.035,
      scale: 0.86,
      cameraZ: 9.28,
      distortion: 0.88,
      opacity: 0.8,
      colorIntensity: 0.72,
      noiseStrength: 0.125,
      pointerInfluence: 0.028,
      hoverStrength: 0.06,
      fresnelIntensity: 1,
      hueShift: 0.38,
      scrollProgress: 0.25
    },
    mobile: {
      x: 0.02,
      y: -0.12,
      scale: 0.7,
      cameraZ: 9.0,
      distortion: 0.8,
      opacity: 0.76,
      colorIntensity: 0.66,
      noiseStrength: 0.102,
      pointerInfluence: 0.012,
      hoverStrength: 0.025,
      fresnelIntensity: 0.94,
      hueShift: 0.38,
      scrollProgress: 0.22
    }
  },
  aboutDetails: {
    desktop: {
      x: -0.26,
      y: 0.075,
      scale: 0.9,
      cameraZ: 9.74,
      distortion: 0.78,
      opacity: 0.78,
      colorIntensity: 0.66,
      noiseStrength: 0.112,
      noiseFrequency: 0.9,
      pointerInfluence: 0.034,
      hoverStrength: 0.06,
      fresnelIntensity: 0.92,
      hueShift: 0.9,
      scrollProgress: 0.46
    },
    wide: {
      x: -0.24,
      y: 0.07,
      scale: 0.98,
      cameraZ: 9.9,
      distortion: 0.78,
      opacity: 0.78,
      colorIntensity: 0.66,
      noiseStrength: 0.112,
      noiseFrequency: 0.9,
      pointerInfluence: 0.034,
      hoverStrength: 0.06,
      fresnelIntensity: 0.92,
      hueShift: 0.9,
      scrollProgress: 0.46
    },
    tablet: {
      x: -0.18,
      y: 0.045,
      scale: 0.76,
      cameraZ: 9.44,
      distortion: 0.72,
      opacity: 0.72,
      colorIntensity: 0.58,
      noiseStrength: 0.096,
      pointerInfluence: 0.022,
      hoverStrength: 0.045,
      fresnelIntensity: 0.88,
      hueShift: 0.9,
      scrollProgress: 0.4
    },
    mobile: {
      x: -0.04,
      y: -0.03,
      scale: 0.62,
      cameraZ: 9.18,
      distortion: 0.68,
      opacity: 0.68,
      colorIntensity: 0.54,
      noiseStrength: 0.082,
      pointerInfluence: 0.01,
      hoverStrength: 0.02,
      fresnelIntensity: 0.84,
      hueShift: 0.9,
      scrollProgress: 0.34
    }
  },
  aboutExit: {
    desktop: {
      x: 0.1,
      y: 0.12,
      scale: 0.78,
      cameraZ: 9.92,
      distortion: 0.66,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.09,
      pointerInfluence: 0.022,
      hoverStrength: 0.04,
      fresnelIntensity: 0.86,
      hueShift: 1.24,
      scrollProgress: 0.62
    },
    wide: {
      x: 0.08,
      y: 0.11,
      scale: 0.86,
      cameraZ: 10.08,
      distortion: 0.66,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.09,
      pointerInfluence: 0.022,
      hoverStrength: 0.04,
      fresnelIntensity: 0.86,
      hueShift: 1.24,
      scrollProgress: 0.62
    },
    tablet: {
      x: 0.06,
      y: 0.07,
      scale: 0.68,
      cameraZ: 9.58,
      distortion: 0.62,
      opacity: 0.56,
      colorIntensity: 0.46,
      noiseStrength: 0.078,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.8,
      hueShift: 1.24,
      scrollProgress: 0.56
    },
    mobile: {
      x: 0.02,
      y: -0.02,
      scale: 0.54,
      cameraZ: 9.32,
      distortion: 0.58,
      opacity: 0.54,
      colorIntensity: 0.44,
      noiseStrength: 0.066,
      pointerInfluence: 0.01,
      hoverStrength: 0.018,
      fresnelIntensity: 0.76,
      hueShift: 1.24,
      scrollProgress: 0.5
    }
  },
  capabilitiesIntro: {
    desktop: {
      x: 0.02,
      y: 0.065,
      scale: 0.86,
      cameraZ: 9.84,
      distortion: 0.72,
      opacity: 0.66,
      colorIntensity: 0.58,
      noiseStrength: 0.098,
      noiseFrequency: 0.9,
      pointerInfluence: 0.024,
      hoverStrength: 0.045,
      fresnelIntensity: 0.9,
      hueShift: 1.36,
      scrollProgress: 0.36
    },
    wide: {
      x: 0,
      y: 0.06,
      scale: 0.94,
      cameraZ: 10.02,
      distortion: 0.72,
      opacity: 0.66,
      colorIntensity: 0.58,
      noiseStrength: 0.098,
      noiseFrequency: 0.9,
      pointerInfluence: 0.024,
      hoverStrength: 0.045,
      fresnelIntensity: 0.9,
      hueShift: 1.36,
      scrollProgress: 0.36
    },
    tablet: {
      x: 0.02,
      y: 0.035,
      scale: 0.72,
      cameraZ: 9.56,
      distortion: 0.68,
      opacity: 0.6,
      colorIntensity: 0.52,
      noiseStrength: 0.082,
      noiseFrequency: 0.86,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.84,
      hueShift: 1.36,
      scrollProgress: 0.32
    },
    mobile: {
      x: 0,
      y: -0.02,
      scale: 0.56,
      cameraZ: 9.28,
      distortion: 0.62,
      opacity: 0.58,
      colorIntensity: 0.48,
      noiseStrength: 0.068,
      noiseFrequency: 0.84,
      pointerInfluence: 0.008,
      hoverStrength: 0.018,
      fresnelIntensity: 0.8,
      hueShift: 1.36,
      scrollProgress: 0.28
    }
  },
  capabilitiesExit: {
    desktop: {
      x: -0.12,
      y: -0.055,
      scale: 0.92,
      cameraZ: 9.86,
      distortion: 0.78,
      opacity: 0.68,
      colorIntensity: 0.58,
      noiseStrength: 0.102,
      noiseFrequency: 0.88,
      pointerInfluence: 0.022,
      hoverStrength: 0.042,
      fresnelIntensity: 0.88,
      hueShift: 1.72,
      scrollProgress: 0.54
    },
    wide: {
      x: -0.1,
      y: -0.055,
      scale: 1.02,
      cameraZ: 10.04,
      distortion: 0.78,
      opacity: 0.68,
      colorIntensity: 0.58,
      noiseStrength: 0.102,
      noiseFrequency: 0.88,
      pointerInfluence: 0.022,
      hoverStrength: 0.042,
      fresnelIntensity: 0.88,
      hueShift: 1.72,
      scrollProgress: 0.54
    },
    tablet: {
      x: -0.08,
      y: -0.035,
      scale: 0.78,
      cameraZ: 9.6,
      distortion: 0.72,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.088,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.82,
      hueShift: 1.72,
      scrollProgress: 0.48
    },
    mobile: {
      x: -0.03,
      y: -0.085,
      scale: 0.62,
      cameraZ: 9.34,
      distortion: 0.68,
      opacity: 0.58,
      colorIntensity: 0.48,
      noiseStrength: 0.072,
      pointerInfluence: 0.008,
      hoverStrength: 0.018,
      fresnelIntensity: 0.78,
      hueShift: 1.72,
      scrollProgress: 0.42
    }
  },
  journalIntro: {
    desktop: {
      x: -0.18,
      y: -0.03,
      scale: 0.88,
      cameraZ: 9.82,
      distortion: 0.74,
      opacity: 0.62,
      colorIntensity: 0.54,
      noiseStrength: 0.092,
      noiseFrequency: 0.86,
      pointerInfluence: 0.024,
      hoverStrength: 0.042,
      fresnelIntensity: 0.86,
      rotationX: 0.02,
      rotationY: -0.04,
      rotationZ: 0.04,
      hueShift: 1.6,
      scrollProgress: 0.42
    },
    wide: {
      x: -0.16,
      y: -0.035,
      scale: 0.98,
      cameraZ: 10.02,
      distortion: 0.74,
      opacity: 0.62,
      colorIntensity: 0.54,
      noiseStrength: 0.092,
      noiseFrequency: 0.86,
      pointerInfluence: 0.024,
      hoverStrength: 0.042,
      fresnelIntensity: 0.86,
      rotationX: 0.02,
      rotationY: -0.04,
      rotationZ: 0.04,
      hueShift: 1.6,
      scrollProgress: 0.42
    },
    tablet: {
      x: -0.1,
      y: -0.035,
      scale: 0.76,
      cameraZ: 9.58,
      distortion: 0.68,
      opacity: 0.58,
      colorIntensity: 0.5,
      noiseStrength: 0.078,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.8,
      rotationX: 0.012,
      rotationY: -0.03,
      rotationZ: 0.03,
      hueShift: 1.6,
      scrollProgress: 0.38
    },
    mobile: {
      x: -0.04,
      y: -0.12,
      scale: 0.58,
      cameraZ: 9.3,
      distortion: 0.62,
      opacity: 0.54,
      colorIntensity: 0.46,
      noiseStrength: 0.064,
      pointerInfluence: 0.008,
      hoverStrength: 0.018,
      fresnelIntensity: 0.74,
      rotationX: 0.01,
      rotationY: -0.02,
      rotationZ: 0.02,
      hueShift: 1.6,
      scrollProgress: 0.34
    }
  },
  journalList: {
    desktop: {
      x: 0.28,
      y: 0.03,
      scale: 1.0,
      cameraZ: 9.72,
      distortion: 0.88,
      opacity: 0.7,
      colorIntensity: 0.66,
      noiseStrength: 0.112,
      noiseFrequency: 0.92,
      pointerInfluence: 0.04,
      hoverStrength: 0.08,
      fresnelIntensity: 0.94,
      rotationX: -0.02,
      rotationY: 0.08,
      rotationZ: -0.02,
      hueShift: 1.26,
      scrollProgress: 0.34
    },
    wide: {
      x: 0.26,
      y: 0.025,
      scale: 1.12,
      cameraZ: 9.92,
      distortion: 0.88,
      opacity: 0.7,
      colorIntensity: 0.66,
      noiseStrength: 0.112,
      noiseFrequency: 0.92,
      pointerInfluence: 0.04,
      hoverStrength: 0.08,
      fresnelIntensity: 0.94,
      rotationX: -0.02,
      rotationY: 0.08,
      rotationZ: -0.02,
      hueShift: 1.26,
      scrollProgress: 0.34
    },
    tablet: {
      x: 0.16,
      y: 0,
      scale: 0.84,
      cameraZ: 9.46,
      distortion: 0.82,
      opacity: 0.64,
      colorIntensity: 0.58,
      noiseStrength: 0.092,
      pointerInfluence: 0.024,
      hoverStrength: 0.045,
      fresnelIntensity: 0.86,
      rotationX: -0.012,
      rotationY: 0.05,
      rotationZ: -0.016,
      hueShift: 1.26,
      scrollProgress: 0.3
    },
    mobile: {
      x: 0.04,
      y: -0.08,
      scale: 0.66,
      cameraZ: 9.2,
      distortion: 0.74,
      opacity: 0.58,
      colorIntensity: 0.52,
      noiseStrength: 0.072,
      pointerInfluence: 0.008,
      hoverStrength: 0.018,
      fresnelIntensity: 0.78,
      rotationX: -0.008,
      rotationY: 0.03,
      rotationZ: -0.01,
      hueShift: 1.26,
      scrollProgress: 0.26
    }
  },
  journalFocus: {
    desktop: {
      x: 0.18,
      y: 0.0,
      scale: 1.06,
      cameraZ: 9.62,
      distortion: 0.96,
      opacity: 0.76,
      colorIntensity: 0.76,
      noiseStrength: 0.13,
      noiseFrequency: 0.98,
      pointerInfluence: 0.048,
      hoverStrength: 0.1,
      fresnelIntensity: 1.04,
      rotationX: -0.04,
      rotationY: 0.14,
      rotationZ: -0.06,
      hueShift: 0.96,
      scrollProgress: 0.28
    },
    wide: {
      x: 0.16,
      y: -0.005,
      scale: 1.18,
      cameraZ: 9.82,
      distortion: 0.96,
      opacity: 0.76,
      colorIntensity: 0.76,
      noiseStrength: 0.13,
      noiseFrequency: 0.98,
      pointerInfluence: 0.046,
      hoverStrength: 0.1,
      fresnelIntensity: 1.04,
      rotationX: -0.04,
      rotationY: 0.14,
      rotationZ: -0.06,
      hueShift: 0.96,
      scrollProgress: 0.28
    },
    tablet: {
      x: 0.12,
      y: -0.02,
      scale: 0.9,
      cameraZ: 9.42,
      distortion: 0.9,
      opacity: 0.7,
      colorIntensity: 0.66,
      noiseStrength: 0.104,
      pointerInfluence: 0.026,
      hoverStrength: 0.05,
      fresnelIntensity: 0.94,
      rotationX: -0.026,
      rotationY: 0.08,
      rotationZ: -0.04,
      hueShift: 0.96,
      scrollProgress: 0.24
    },
    mobile: {
      x: 0.02,
      y: -0.1,
      scale: 0.68,
      cameraZ: 9.18,
      distortion: 0.8,
      opacity: 0.62,
      colorIntensity: 0.56,
      noiseStrength: 0.078,
      pointerInfluence: 0.008,
      hoverStrength: 0.018,
      fresnelIntensity: 0.82,
      rotationX: -0.012,
      rotationY: 0.04,
      rotationZ: -0.02,
      hueShift: 0.96,
      scrollProgress: 0.2
    }
  },
  journalExit: {
    desktop: {
      x: -0.02,
      y: -0.1,
      scale: 0.86,
      cameraZ: 9.9,
      distortion: 0.7,
      opacity: 0.6,
      colorIntensity: 0.5,
      noiseStrength: 0.084,
      noiseFrequency: 0.84,
      pointerInfluence: 0.02,
      hoverStrength: 0.036,
      fresnelIntensity: 0.8,
      rotationX: 0.02,
      rotationY: -0.02,
      rotationZ: 0.08,
      hueShift: 1.84,
      scrollProgress: 0.48
    },
    wide: {
      x: -0.02,
      y: -0.1,
      scale: 0.96,
      cameraZ: 10.08,
      distortion: 0.7,
      opacity: 0.6,
      colorIntensity: 0.5,
      noiseStrength: 0.084,
      noiseFrequency: 0.84,
      pointerInfluence: 0.02,
      hoverStrength: 0.036,
      fresnelIntensity: 0.8,
      rotationX: 0.02,
      rotationY: -0.02,
      rotationZ: 0.08,
      hueShift: 1.84,
      scrollProgress: 0.48
    },
    tablet: {
      x: -0.02,
      y: -0.08,
      scale: 0.74,
      cameraZ: 9.58,
      distortion: 0.66,
      opacity: 0.56,
      colorIntensity: 0.46,
      noiseStrength: 0.072,
      pointerInfluence: 0.014,
      hoverStrength: 0.026,
      fresnelIntensity: 0.74,
      rotationX: 0.014,
      rotationY: -0.012,
      rotationZ: 0.05,
      hueShift: 1.84,
      scrollProgress: 0.42
    },
    mobile: {
      x: -0.02,
      y: -0.12,
      scale: 0.58,
      cameraZ: 9.32,
      distortion: 0.62,
      opacity: 0.52,
      colorIntensity: 0.42,
      noiseStrength: 0.058,
      pointerInfluence: 0.008,
      hoverStrength: 0.016,
      fresnelIntensity: 0.7,
      rotationX: 0.01,
      rotationY: -0.01,
      rotationZ: 0.036,
      hueShift: 1.84,
      scrollProgress: 0.36
    }
  },
  contactIntro: {
    desktop: {
      x: 0.18,
      y: -0.1,
      scale: 0.9,
      cameraZ: 9.82,
      distortion: 0.7,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.08,
      noiseFrequency: 0.82,
      noiseSpeed: 0.34,
      pointerInfluence: 0.022,
      hoverStrength: 0.04,
      fresnelIntensity: 0.82,
      rotationX: 0.016,
      rotationY: -0.02,
      rotationZ: 0.06,
      hueShift: 1.72,
      scrollProgress: 0.42
    },
    wide: {
      x: 0.16,
      y: -0.1,
      scale: 1,
      cameraZ: 9.98,
      distortion: 0.7,
      opacity: 0.62,
      colorIntensity: 0.52,
      noiseStrength: 0.08,
      noiseFrequency: 0.82,
      noiseSpeed: 0.34,
      pointerInfluence: 0.022,
      hoverStrength: 0.04,
      fresnelIntensity: 0.82,
      rotationX: 0.016,
      rotationY: -0.02,
      rotationZ: 0.06,
      hueShift: 1.72,
      scrollProgress: 0.42
    },
    tablet: {
      x: 0.1,
      y: -0.1,
      scale: 0.74,
      cameraZ: 9.54,
      distortion: 0.66,
      opacity: 0.56,
      colorIntensity: 0.46,
      noiseStrength: 0.066,
      noiseFrequency: 0.78,
      noiseSpeed: 0.3,
      pointerInfluence: 0.014,
      hoverStrength: 0.026,
      fresnelIntensity: 0.74,
      rotationX: 0.012,
      rotationY: -0.014,
      rotationZ: 0.044,
      hueShift: 1.72,
      scrollProgress: 0.36
    },
    mobile: {
      x: 0.02,
      y: -0.13,
      scale: 0.58,
      cameraZ: 9.28,
      distortion: 0.62,
      opacity: 0.52,
      colorIntensity: 0.42,
      noiseStrength: 0.052,
      noiseFrequency: 0.74,
      noiseSpeed: 0.26,
      pointerInfluence: 0.008,
      hoverStrength: 0.016,
      fresnelIntensity: 0.68,
      rotationX: 0.008,
      rotationY: -0.01,
      rotationZ: 0.032,
      hueShift: 1.72,
      scrollProgress: 0.32
    }
  },
  contactLocation: {
    desktop: {
      x: 0.02,
      y: -0.02,
      scale: 1.34,
      cameraZ: 9.42,
      distortion: 0.92,
      opacity: 0.82,
      colorIntensity: 0.78,
      noiseStrength: 0.12,
      noiseFrequency: 0.94,
      noiseSpeed: 0.4,
      pointerInfluence: 0.04,
      hoverStrength: 0.075,
      fresnelIntensity: 1.08,
      rotationX: -0.024,
      rotationY: 0.08,
      rotationZ: -0.05,
      hueShift: 1.18,
      scrollProgress: 0.28
    },
    wide: {
      x: 0.02,
      y: -0.02,
      scale: 1.48,
      cameraZ: 9.58,
      distortion: 0.92,
      opacity: 0.82,
      colorIntensity: 0.78,
      noiseStrength: 0.12,
      noiseFrequency: 0.94,
      noiseSpeed: 0.4,
      pointerInfluence: 0.04,
      hoverStrength: 0.075,
      fresnelIntensity: 1.08,
      rotationX: -0.024,
      rotationY: 0.08,
      rotationZ: -0.05,
      hueShift: 1.18,
      scrollProgress: 0.28
    },
    tablet: {
      x: 0.03,
      y: -0.04,
      scale: 1.02,
      cameraZ: 9.26,
      distortion: 0.84,
      opacity: 0.72,
      colorIntensity: 0.66,
      noiseStrength: 0.092,
      noiseFrequency: 0.88,
      noiseSpeed: 0.34,
      pointerInfluence: 0.022,
      hoverStrength: 0.042,
      fresnelIntensity: 0.94,
      rotationX: -0.014,
      rotationY: 0.052,
      rotationZ: -0.035,
      hueShift: 1.18,
      scrollProgress: 0.24
    },
    mobile: {
      x: 0.02,
      y: -0.1,
      scale: 0.78,
      cameraZ: 9.02,
      distortion: 0.76,
      opacity: 0.64,
      colorIntensity: 0.56,
      noiseStrength: 0.072,
      noiseFrequency: 0.82,
      noiseSpeed: 0.3,
      pointerInfluence: 0.01,
      hoverStrength: 0.02,
      fresnelIntensity: 0.82,
      rotationX: -0.01,
      rotationY: 0.032,
      rotationZ: -0.024,
      hueShift: 1.18,
      scrollProgress: 0.2
    }
  },
  contactCTA: {
    desktop: {
      x: -0.22,
      y: 0.08,
      scale: 1.08,
      cameraZ: 9.7,
      distortion: 0.82,
      opacity: 0.72,
      colorIntensity: 0.66,
      noiseStrength: 0.1,
      noiseFrequency: 0.9,
      noiseSpeed: 0.36,
      pointerInfluence: 0.034,
      hoverStrength: 0.062,
      fresnelIntensity: 0.94,
      rotationX: 0.012,
      rotationY: -0.06,
      rotationZ: 0.06,
      hueShift: 0.86,
      scrollProgress: 0.34
    },
    wide: {
      x: -0.2,
      y: 0.07,
      scale: 1.2,
      cameraZ: 9.86,
      distortion: 0.82,
      opacity: 0.72,
      colorIntensity: 0.66,
      noiseStrength: 0.1,
      noiseFrequency: 0.9,
      noiseSpeed: 0.36,
      pointerInfluence: 0.034,
      hoverStrength: 0.062,
      fresnelIntensity: 0.94,
      rotationX: 0.012,
      rotationY: -0.06,
      rotationZ: 0.06,
      hueShift: 0.86,
      scrollProgress: 0.34
    },
    tablet: {
      x: -0.12,
      y: 0.02,
      scale: 0.9,
      cameraZ: 9.4,
      distortion: 0.76,
      opacity: 0.64,
      colorIntensity: 0.56,
      noiseStrength: 0.078,
      noiseFrequency: 0.84,
      noiseSpeed: 0.31,
      pointerInfluence: 0.02,
      hoverStrength: 0.04,
      fresnelIntensity: 0.84,
      rotationX: 0.008,
      rotationY: -0.04,
      rotationZ: 0.044,
      hueShift: 0.86,
      scrollProgress: 0.28
    },
    mobile: {
      x: -0.04,
      y: -0.02,
      scale: 0.7,
      cameraZ: 9.16,
      distortion: 0.7,
      opacity: 0.58,
      colorIntensity: 0.5,
      noiseStrength: 0.062,
      noiseFrequency: 0.8,
      noiseSpeed: 0.27,
      pointerInfluence: 0.01,
      hoverStrength: 0.02,
      fresnelIntensity: 0.76,
      rotationX: 0.006,
      rotationY: -0.026,
      rotationZ: 0.032,
      hueShift: 0.86,
      scrollProgress: 0.24
    }
  },
  footerFinal: {
    desktop: {
      x: 0.2,
      y: -0.18,
      scale: 1.5,
      cameraZ: 9.56,
      distortion: 0.64,
      opacity: 0.56,
      colorIntensity: 0.48,
      noiseStrength: 0.065,
      noiseFrequency: 0.78,
      noiseSpeed: 0.28,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.76,
      rotationX: 0.018,
      rotationY: 0.04,
      rotationZ: -0.035,
      hueShift: 1.54,
      scrollProgress: 0.52
    },
    wide: {
      x: 0.18,
      y: -0.18,
      scale: 1.62,
      cameraZ: 9.72,
      distortion: 0.64,
      opacity: 0.56,
      colorIntensity: 0.48,
      noiseStrength: 0.065,
      noiseFrequency: 0.78,
      noiseSpeed: 0.28,
      pointerInfluence: 0.016,
      hoverStrength: 0.03,
      fresnelIntensity: 0.76,
      rotationX: 0.018,
      rotationY: 0.04,
      rotationZ: -0.035,
      hueShift: 1.54,
      scrollProgress: 0.52
    },
    tablet: {
      x: 0.14,
      y: -0.16,
      scale: 1.14,
      cameraZ: 9.32,
      distortion: 0.6,
      opacity: 0.5,
      colorIntensity: 0.42,
      noiseStrength: 0.05,
      noiseFrequency: 0.74,
      noiseSpeed: 0.24,
      pointerInfluence: 0.01,
      hoverStrength: 0.02,
      fresnelIntensity: 0.68,
      rotationX: 0.012,
      rotationY: 0.028,
      rotationZ: -0.026,
      hueShift: 1.54,
      scrollProgress: 0.44
    },
    mobile: {
      x: 0.08,
      y: -0.18,
      scale: 0.9,
      cameraZ: 9.08,
      distortion: 0.56,
      opacity: 0.46,
      colorIntensity: 0.38,
      noiseStrength: 0.04,
      noiseFrequency: 0.7,
      noiseSpeed: 0.22,
      pointerInfluence: 0.006,
      hoverStrength: 0.014,
      fresnelIntensity: 0.62,
      rotationX: 0.01,
      rotationY: 0.02,
      rotationZ: -0.02,
      hueShift: 1.54,
      scrollProgress: 0.38
    }
  }
};

const PROJECT_STATE_PRESETS = [
  {
    desktop: { x: 0.28, y: -0.03, scale: 1.16, cameraZ: 9.46, distortion: 1.06, noiseStrength: 0.18, noiseFrequency: 1.02, colorIntensity: 0.94, rotationZ: -0.06, hueShift: 0.08 },
    wide: { x: 0.26, y: -0.035, scale: 1.26, cameraZ: 9.62, distortion: 1.06, noiseStrength: 0.18, noiseFrequency: 1.02, colorIntensity: 0.94, rotationZ: -0.06, hueShift: 0.08 },
    tablet: { x: 0.2, y: -0.02, scale: 0.98, cameraZ: 9.34, distortion: 1.0, noiseStrength: 0.15, colorIntensity: 0.86, rotationZ: -0.04, hueShift: 0.08 },
    mobile: { x: 0.1, y: -0.06, scale: 0.78, cameraZ: 9.08, distortion: 0.92, noiseStrength: 0.12, colorIntensity: 0.8, rotationZ: -0.03, hueShift: 0.08 }
  },
  {
    desktop: { x: -0.24, y: -0.015, scale: 1.08, cameraZ: 9.4, distortion: 1.14, noiseStrength: 0.195, noiseFrequency: 1.12, colorIntensity: 0.98, rotationZ: 0.08, hueShift: 0.62 },
    wide: { x: -0.22, y: -0.02, scale: 1.18, cameraZ: 9.58, distortion: 1.14, noiseStrength: 0.19, noiseFrequency: 1.12, colorIntensity: 0.98, rotationZ: 0.08, hueShift: 0.62 },
    tablet: { x: -0.18, y: -0.015, scale: 0.94, cameraZ: 9.28, distortion: 1.06, noiseStrength: 0.165, colorIntensity: 0.9, rotationZ: 0.06, hueShift: 0.62 },
    mobile: { x: -0.08, y: -0.055, scale: 0.74, cameraZ: 9.02, distortion: 0.98, noiseStrength: 0.13, colorIntensity: 0.84, rotationZ: 0.04, hueShift: 0.62 }
  },
  {
    desktop: { x: 0.06, y: 0.01, scale: 1.24, cameraZ: 9.52, distortion: 1.02, noiseStrength: 0.17, noiseFrequency: 0.96, colorIntensity: 0.9, rotationZ: 0.02, hueShift: 1.1 },
    wide: { x: 0.04, y: 0, scale: 1.34, cameraZ: 9.72, distortion: 1.02, noiseStrength: 0.17, noiseFrequency: 0.96, colorIntensity: 0.9, rotationZ: 0.02, hueShift: 1.1 },
    tablet: { x: 0.04, y: 0, scale: 1.0, cameraZ: 9.36, distortion: 0.96, noiseStrength: 0.145, colorIntensity: 0.84, rotationZ: 0.01, hueShift: 1.1 },
    mobile: { x: 0.02, y: -0.04, scale: 0.8, cameraZ: 9.1, distortion: 0.9, noiseStrength: 0.12, colorIntensity: 0.78, rotationZ: 0.01, hueShift: 1.1 }
  },
  {
    desktop: { x: -0.08, y: -0.07, scale: 1.12, cameraZ: 9.42, distortion: 1.18, noiseStrength: 0.205, noiseFrequency: 1.18, colorIntensity: 1.02, rotationZ: -0.11, hueShift: 1.72 },
    wide: { x: -0.08, y: -0.07, scale: 1.22, cameraZ: 9.6, distortion: 1.18, noiseStrength: 0.2, noiseFrequency: 1.18, colorIntensity: 1.02, rotationZ: -0.11, hueShift: 1.72 },
    tablet: { x: -0.08, y: -0.045, scale: 0.96, cameraZ: 9.3, distortion: 1.08, noiseStrength: 0.17, colorIntensity: 0.92, rotationZ: -0.08, hueShift: 1.72 },
    mobile: { x: -0.03, y: -0.07, scale: 0.76, cameraZ: 9.04, distortion: 1.0, noiseStrength: 0.135, colorIntensity: 0.86, rotationZ: -0.05, hueShift: 1.72 }
  }
];

const CAPABILITY_STATE_PRESETS = [
  {
    desktop: { x: 0.28, y: -0.035, scale: 1.06, cameraZ: 9.42, distortion: 1.02, noiseStrength: 0.16, noiseFrequency: 1.0, colorIntensity: 0.9, pointerInfluence: 0.056, hoverStrength: 0.12, fresnelIntensity: 1.05, rotationX: 0.02, rotationY: 0.08, rotationZ: -0.04, hueShift: 0.18 },
    wide: { x: 0.26, y: -0.04, scale: 1.16, cameraZ: 9.58, distortion: 1.02, noiseStrength: 0.16, noiseFrequency: 1.0, colorIntensity: 0.9, pointerInfluence: 0.052, hoverStrength: 0.12, fresnelIntensity: 1.05, rotationX: 0.02, rotationY: 0.08, rotationZ: -0.04, hueShift: 0.18 },
    tablet: { x: 0.18, y: -0.025, scale: 0.9, cameraZ: 9.28, distortion: 0.96, noiseStrength: 0.13, noiseFrequency: 0.96, colorIntensity: 0.82, pointerInfluence: 0.03, hoverStrength: 0.065, fresnelIntensity: 0.98, rotationX: 0.01, rotationY: 0.05, rotationZ: -0.03, hueShift: 0.18 },
    mobile: { x: 0.06, y: -0.085, scale: 0.72, cameraZ: 9.04, distortion: 0.9, noiseStrength: 0.104, noiseFrequency: 0.92, colorIntensity: 0.76, pointerInfluence: 0.012, hoverStrength: 0.026, fresnelIntensity: 0.92, rotationX: 0.01, rotationY: 0.03, rotationZ: -0.02, hueShift: 0.18 }
  },
  {
    desktop: { x: -0.3, y: -0.005, scale: 1.18, cameraZ: 9.36, distortion: 1.12, noiseStrength: 0.182, noiseFrequency: 1.08, colorIntensity: 0.96, pointerInfluence: 0.052, hoverStrength: 0.12, fresnelIntensity: 1.1, rotationX: -0.015, rotationY: -0.08, rotationZ: 0.09, hueShift: 0.72 },
    wide: { x: -0.28, y: -0.01, scale: 1.3, cameraZ: 9.54, distortion: 1.12, noiseStrength: 0.18, noiseFrequency: 1.08, colorIntensity: 0.96, pointerInfluence: 0.05, hoverStrength: 0.12, fresnelIntensity: 1.1, rotationX: -0.015, rotationY: -0.08, rotationZ: 0.09, hueShift: 0.72 },
    tablet: { x: -0.2, y: -0.02, scale: 0.98, cameraZ: 9.26, distortion: 1.04, noiseStrength: 0.148, noiseFrequency: 1.02, colorIntensity: 0.88, pointerInfluence: 0.028, hoverStrength: 0.06, fresnelIntensity: 1.02, rotationX: -0.01, rotationY: -0.05, rotationZ: 0.06, hueShift: 0.72 },
    mobile: { x: -0.08, y: -0.065, scale: 0.78, cameraZ: 9.02, distortion: 0.98, noiseStrength: 0.116, noiseFrequency: 0.96, colorIntensity: 0.82, pointerInfluence: 0.01, hoverStrength: 0.024, fresnelIntensity: 0.96, rotationX: -0.01, rotationY: -0.035, rotationZ: 0.04, hueShift: 0.72 }
  },
  {
    desktop: { x: 0.04, y: 0.055, scale: 0.98, cameraZ: 9.66, distortion: 0.9, opacity: 0.86, noiseStrength: 0.132, noiseFrequency: 0.92, colorIntensity: 0.76, pointerInfluence: 0.044, hoverStrength: 0.09, fresnelPower: 3.05, fresnelIntensity: 1.08, rotationX: 0.04, rotationY: 0.02, rotationZ: 0.02, hueShift: 1.16 },
    wide: { x: 0.02, y: 0.05, scale: 1.08, cameraZ: 9.82, distortion: 0.9, opacity: 0.86, noiseStrength: 0.132, noiseFrequency: 0.92, colorIntensity: 0.76, pointerInfluence: 0.042, hoverStrength: 0.09, fresnelPower: 3.05, fresnelIntensity: 1.08, rotationX: 0.04, rotationY: 0.02, rotationZ: 0.02, hueShift: 1.16 },
    tablet: { x: 0.03, y: 0.02, scale: 0.82, cameraZ: 9.42, distortion: 0.84, opacity: 0.82, noiseStrength: 0.108, noiseFrequency: 0.88, colorIntensity: 0.7, pointerInfluence: 0.024, hoverStrength: 0.05, fresnelPower: 3, fresnelIntensity: 1.0, rotationX: 0.025, rotationY: 0.01, rotationZ: 0.01, hueShift: 1.16 },
    mobile: { x: 0.02, y: -0.02, scale: 0.66, cameraZ: 9.18, distortion: 0.78, opacity: 0.78, noiseStrength: 0.088, noiseFrequency: 0.86, colorIntensity: 0.66, pointerInfluence: 0.008, hoverStrength: 0.02, fresnelPower: 2.95, fresnelIntensity: 0.94, rotationX: 0.02, rotationY: 0.01, rotationZ: 0.01, hueShift: 1.16 }
  },
  {
    desktop: { x: 0.18, y: -0.02, scale: 1.24, cameraZ: 9.34, distortion: 1.08, noiseStrength: 0.172, noiseFrequency: 1.04, colorIntensity: 0.94, pointerInfluence: 0.05, hoverStrength: 0.11, fresnelIntensity: 1.13, rotationX: -0.03, rotationY: -0.06, rotationZ: -0.1, hueShift: 1.68 },
    wide: { x: 0.16, y: -0.03, scale: 1.36, cameraZ: 9.5, distortion: 1.08, noiseStrength: 0.17, noiseFrequency: 1.04, colorIntensity: 0.94, pointerInfluence: 0.048, hoverStrength: 0.11, fresnelIntensity: 1.13, rotationX: -0.03, rotationY: -0.06, rotationZ: -0.1, hueShift: 1.68 },
    tablet: { x: 0.1, y: -0.035, scale: 1.02, cameraZ: 9.22, distortion: 1.0, noiseStrength: 0.138, noiseFrequency: 0.98, colorIntensity: 0.86, pointerInfluence: 0.026, hoverStrength: 0.056, fresnelIntensity: 1.04, rotationX: -0.02, rotationY: -0.04, rotationZ: -0.07, hueShift: 1.68 },
    mobile: { x: 0.02, y: -0.105, scale: 0.82, cameraZ: 9.0, distortion: 0.94, noiseStrength: 0.108, noiseFrequency: 0.94, colorIntensity: 0.8, pointerInfluence: 0.01, hoverStrength: 0.024, fresnelIntensity: 0.98, rotationX: -0.014, rotationY: -0.025, rotationZ: -0.045, hueShift: 1.68 }
  }
];

const STATE_KEYS = Object.keys(DEFAULT_STATE);
const ABOUT_STATE_SEQUENCE = [
  { progress: 0, state: 'aboutIntro' },
  { progress: 0.34, state: 'aboutStatement' },
  { progress: 0.72, state: 'aboutDetails' },
  { progress: 1, state: 'aboutExit' }
];
const CAPABILITY_INTRO_END = 0.18;
const CAPABILITY_EXIT_START = 0.72;

// Reference-video calibration for the existing 01-04 scroll choreography.
const REFERENCE_STATE_CALIBRATION = {
  workIntro: { scaleMultiplier: 1.18, yOffset: -0.04, opacityBoost: 0.06, colorIntensityBoost: 0.12, fresnelIntensityBoost: 0.1 },
  workExit: { scaleMultiplier: 1.12, opacityBoost: 0.05, colorIntensityBoost: 0.1, fresnelIntensityBoost: 0.08 },
  aboutIntro: { scaleMultiplier: 1.42, opacityBoost: 0.12, colorIntensityBoost: 0.2, fresnelIntensityBoost: 0.18 },
  aboutStatement: { scaleMultiplier: 1.32, opacityBoost: 0.06, colorIntensityBoost: 0.14, fresnelIntensityBoost: 0.12 },
  aboutDetails: { scaleMultiplier: 1.34, opacityBoost: 0.08, colorIntensityBoost: 0.16, fresnelIntensityBoost: 0.14 },
  aboutExit: { scaleMultiplier: 1.34, opacityBoost: 0.08, colorIntensityBoost: 0.18, fresnelIntensityBoost: 0.16 },
  capabilitiesIntro: { scaleMultiplier: 1.5, yOffset: -0.02, opacityBoost: 0.12, colorIntensityBoost: 0.2, fresnelIntensityBoost: 0.18 },
  capabilitiesExit: { scaleMultiplier: 1.42, opacityBoost: 0.1, colorIntensityBoost: 0.18, fresnelIntensityBoost: 0.16 },
  journalIntro: { xOffset: -0.32, yOffset: -0.02, scaleMultiplier: 1.52, opacityBoost: 0.14, colorIntensityBoost: 0.22, fresnelIntensityBoost: 0.2 },
  journalList: { xOffset: -0.3, yOffset: -0.02, scaleMultiplier: 1.42, opacityBoost: 0.1, colorIntensityBoost: 0.18, fresnelIntensityBoost: 0.16 },
  journalFocus: { xOffset: -0.22, yOffset: -0.02, scaleMultiplier: 1.36, opacityBoost: 0.08, colorIntensityBoost: 0.16, fresnelIntensityBoost: 0.14 },
  journalExit: { xOffset: -0.28, yOffset: -0.02, scaleMultiplier: 1.48, opacityBoost: 0.12, colorIntensityBoost: 0.22, fresnelIntensityBoost: 0.2 },
  contactIntro: { xOffset: -0.52, yOffset: -0.04, scaleMultiplier: 1.48, opacityBoost: 0.12, colorIntensityBoost: 0.22, fresnelIntensityBoost: 0.2 },
  contactLocation: { xOffset: -0.18, scaleMultiplier: 1.18, opacityBoost: 0.07, colorIntensityBoost: 0.14, fresnelIntensityBoost: 0.12 },
  contactCTA: { xOffset: -0.24, scaleMultiplier: 1.34, opacityBoost: 0.1, colorIntensityBoost: 0.18, fresnelIntensityBoost: 0.16 },
  footerFinal: { xOffset: -0.3, yOffset: 0.02, scaleMultiplier: 1.14, opacityBoost: 0.1, colorIntensityBoost: 0.18, fresnelIntensityBoost: 0.18 }
};

const REFERENCE_PRESET_CALIBRATION = {
  workProject: { scaleMultiplier: 1.42, yOffset: -0.28, opacityBoost: 0.03, colorIntensityBoost: 0.14, fresnelIntensityBoost: 0.16 },
  capability: { scaleMultiplier: 1.3, opacityBoost: 0.03, colorIntensityBoost: 0.12, fresnelIntensityBoost: 0.12 }
};

export class BlobScene {
  constructor(container = '[data-webgl]', options = {}) {
    this.container = this.resolveContainer(container);
    if (!this.container) return;
    this.externalPointer = options.pointer || null;

    this.width = 1;
    this.height = 1;
    this.syncSize();

    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.quality = this.getQuality();
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.pointerVelocity = { current: 0, target: 0 };
    this.pointerDirection = new THREE.Vector2(0, 0);
    this.pointerDirectionTarget = new THREE.Vector2(0, 0);
    this.mouse = this.pointer;
    this.target = { ...DEFAULT_STATE };
    this.current = { ...DEFAULT_STATE };

    this.pointerNDC = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.pointerWorldTarget = new THREE.Vector3(0, 0, 0);
    this.pointerWorldCurrent = new THREE.Vector3(0, 0, 0);
    this.pointerActive = false;
    this.elapsedTime = 0;

    this.activeStateName = 'hero';
    this.activeProjectIndex = 0;
    this.activeAboutProgress = 0;
    this.activeCapabilitiesProgress = 0;
    this.activeCapabilityCount = 1;
    this.activeJournalProgress = 0;
    this.activeJournalFocus = 0;
    this.activeContactProgress = 0;
    this.activeContactFocus = 0;
    this.scrollDirection = 'down';
    this.previousScrollY = window.scrollY || 0;
    this.scrollVelocity = { current: 0, target: 0 };
    this.scrollAcceleration = 0;
    this.projectAssets = [];
    this.isDestroyed = false;
    this.hasRendered = false;

    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.setCrossOrigin('anonymous');
    this.currentTexture = null;
    this.nextTexture = null;
    this.currentTextureUrl = '';
    this.nextTextureUrl = '';
    this.textureRequestId = 0;

    this.onResize = this.onResize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  resolveContainer(container) {
    if (typeof container !== 'string') return container;

    return document.querySelector(container) || document.getElementById(container.replace('#', ''));
  }

  syncSize() {
    const bounds = this.container.getBoundingClientRect();

    this.width = bounds.width || window.innerWidth;
    this.height = bounds.height || window.innerHeight;
  }

  collectProjectAssets() {
    const selectors = [
      '[data-project-item]',
      '[data-work-project]',
      '[data-journal-item]',
      '[data-bubble-image]',
      '[data-project]'
    ];
    const seen = new Set();

    return gsap.utils.toArray(document.querySelectorAll(selectors.join(',')))
      .map((project, index) => {
        if (seen.has(project)) return null;
        seen.add(project);

        const image = project.querySelector('img');
        const imageUrl = project.dataset.bubbleImage
          || project.dataset.projectImage
          || project.dataset.journalImage
          || project.dataset.img
          || image?.currentSrc
          || image?.src
          || '';

        if (!imageUrl) return null;

        return {
          index,
          project,
          imageElement: image || null,
          imageUrl,
          projectId: project.dataset.project || project.dataset.projectTitle || project.id || `asset-${index}`,
          section: project.closest('section')?.id || project.closest('section')?.dataset?.work || '',
          textureId: `bubble-texture-${index}`
        };
      })
      .filter(Boolean);
  }

  getQuality() {
    const width = this.width || window.innerWidth;

    if (width < 768 || this.isTouch) {
      return {
        ...CONFIG.mobileSegments,
        pixelRatio: CONFIG.mobilePixelRatio
      };
    }

    if (width < 1100) {
      return {
        ...CONFIG.tabletSegments,
        pixelRatio: CONFIG.tabletPixelRatio
      };
    }

    return {
      ...CONFIG.desktopSegments,
      pixelRatio: CONFIG.desktopPixelRatio
    };
  }

  init() {
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.createBlob();

    this.container.replaceChildren();
    this.container.appendChild(this.renderer.domElement);
    this.projectAssets = this.collectProjectAssets();

    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    document.documentElement.addEventListener('pointerenter', this.onPointerEnter, { passive: true });

    this.setState('hero', { immediate: true });
    this.pointerWorldCurrent.set(this.current.x * 3, this.current.y * 2, 0);
    this.pointerWorldTarget.set(this.current.x * 3, this.current.y * 2, 0);
    this.clock = new THREE.Clock();

    this.setTexture(this.getPortraitUrl());

    this.animate();
  }

  createScene() {
    return new THREE.Scene();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(this.current.cameraFov, this.width / this.height, 0.1, 100);
    camera.position.z = this.current.cameraZ;

    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(this.width, this.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.pixelRatio));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CONFIG.toneExposure;

    return renderer;
  }

  createBlob() {
    this.geometry = new THREE.PlaneGeometry(
      CONFIG.geometryRadius,
      CONFIG.geometryRadius,
      1,
      1
    );
    this.uniforms = this.createUniforms();
    this.material = this.createMaterial(this.uniforms);
    this.blobMesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.blobMesh);
  }

  createUniforms() {
    return {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerDirection: { value: new THREE.Vector2(0, 0) },
      uPointerVelocity: { value: 0 },
      uScrollDirection: { value: new THREE.Vector2(0, -1) },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(this.width, this.height) },
      uBlobScale: { value: this.current.scale },
      uNoiseStrength: { value: this.current.noiseStrength },
      uNoiseFrequency: { value: this.current.noiseFrequency },
      uNoiseSpeed: { value: this.current.noiseSpeed },
      uHoverStrength: { value: this.current.hoverStrength },
      uColorIntensity: { value: this.current.colorIntensity },
      uInteractionStrength: { value: this.current.interactionStrength },
      uScrollProgress: { value: this.current.scrollProgress },
      uFresnelPower: { value: this.current.fresnelPower },
      uFresnelIntensity: { value: this.current.fresnelIntensity },
      uDistortion: { value: this.current.distortion },
      uHueShift: { value: this.current.hueShift },
      uOpacity: { value: this.current.opacity },
      uRevealProgress: { value: this.current.reveal },
      uTexture: { value: null },
      uNextTexture: { value: null },
      uMixRatio: { value: 0 },
      uHasTexture: { value: 0 },
      uTextureTransition: { value: 0 }
    };
  }

  createMaterial(uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader: blobVertexShader,
      fragmentShader: blobFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      extensions: {
        derivatives: true
      }
    });
  }

  whenReady() {
    return this.readyPromise;
  }

  getProfileName() {
    if (this.width < 768) return 'mobile';
    if (this.width < 1100) return 'tablet';
    if (this.width >= 1600) return 'wide';

    return 'desktop';
  }

  getStateConfig(name = 'hero') {
    const group = RESPONSIVE_STATES[name] || RESPONSIVE_STATES.hero;
    const profile = this.getProfileName();
    const state = {
      ...DEFAULT_STATE,
      ...(group[profile] || group.desktop)
    };

    return this.applyReferenceCalibration(state, REFERENCE_STATE_CALIBRATION[name]);
  }

  applyReferenceCalibration(state, calibration = {}) {
    if (!calibration) return state;

    const calibrated = { ...state };

    if (typeof calibration.scaleMultiplier === 'number') {
      calibrated.scale *= calibration.scaleMultiplier;
    }

    if (typeof calibration.xOffset === 'number') {
      calibrated.x += calibration.xOffset;
    }

    if (typeof calibration.yOffset === 'number') {
      calibrated.y += calibration.yOffset;
    }

    if (typeof calibration.opacityBoost === 'number') {
      calibrated.opacity = THREE.MathUtils.clamp(calibrated.opacity + calibration.opacityBoost, 0, 0.98);
    }

    if (typeof calibration.colorIntensityBoost === 'number') {
      calibrated.colorIntensity = THREE.MathUtils.clamp(calibrated.colorIntensity + calibration.colorIntensityBoost, 0, 1.24);
    }

    if (typeof calibration.fresnelIntensityBoost === 'number') {
      calibrated.fresnelIntensity = THREE.MathUtils.clamp(calibrated.fresnelIntensity + calibration.fresnelIntensityBoost, 0, 1.34);
    }

    return calibrated;
  }

  getHeroBlobState(options = {}) {
    const state = this.getStateConfig('hero');

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.16;
      state.hoverStrength *= 0.35;
      state.pointerInfluence *= 0.35;
      state.noiseStrength *= 0.72;
    }

    if (options.intro) {
      state.scale *= 0.68;
      state.distortion = 0.58;
      state.opacity = 0;
      state.reveal = 0;
      state.interactionStrength = 0;
      state.colorIntensity *= 0.2;
      state.noiseStrength *= 0.42;
      state.hoverStrength = 0;
      state.cameraZ += 0.72;
    }

    return state;
  }

  getWorkProjectState(index = 0) {
    const preset = PROJECT_STATE_PRESETS[index % PROJECT_STATE_PRESETS.length];
    const profile = this.getProfileName();
    const state = this.applyReferenceCalibration({
      ...DEFAULT_STATE,
      ...(preset[profile] || preset.desktop),
      opacity: 0.94,
      reveal: 1,
      interactionStrength: 0.9,
      pointerInfluence: profile === 'mobile' ? 0.018 : 0.06,
      hoverStrength: profile === 'mobile' ? 0.05 : 0.14,
      fresnelIntensity: 1.08,
      scrollProgress: this.target.scrollProgress || 0
    }, REFERENCE_PRESET_CALIBRATION.workProject);

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.14;
      state.noiseStrength *= 0.58;
      state.hoverStrength *= 0.25;
      state.pointerInfluence *= 0.2;
      state.interactionStrength *= 0.36;
    }

    return state;
  }

  getAboutBlobState(progress = 0) {
    const amount = THREE.MathUtils.clamp(progress, 0, 1);
    let fromStep = ABOUT_STATE_SEQUENCE[0];
    let toStep = ABOUT_STATE_SEQUENCE[ABOUT_STATE_SEQUENCE.length - 1];

    for (let index = 0; index < ABOUT_STATE_SEQUENCE.length - 1; index += 1) {
      const currentStep = ABOUT_STATE_SEQUENCE[index];
      const nextStep = ABOUT_STATE_SEQUENCE[index + 1];

      if (amount >= currentStep.progress && amount <= nextStep.progress) {
        fromStep = currentStep;
        toStep = nextStep;
        break;
      }
    }

    const segmentRange = Math.max(toStep.progress - fromStep.progress, 0.001);
    const segmentProgress = THREE.MathUtils.clamp((amount - fromStep.progress) / segmentRange, 0, 1);
    const easedProgress = smoothstep(segmentProgress);
    const fromState = this.getStateConfig(fromStep.state);
    const toState = this.getStateConfig(toStep.state);
    const state = { ...DEFAULT_STATE };

    STATE_KEYS.forEach((key) => {
      state[key] = THREE.MathUtils.lerp(fromState[key], toState[key], easedProgress);
    });

    state.scrollProgress = amount * 0.62;

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.13;
      state.noiseStrength *= 0.58;
      state.hoverStrength *= 0.24;
      state.pointerInfluence *= 0.2;
      state.interactionStrength *= 0.36;
    }

    return state;
  }

  getCapabilityStateConfig(index = 0) {
    const presetIndex = Math.abs(index) % CAPABILITY_STATE_PRESETS.length;
    const preset = CAPABILITY_STATE_PRESETS[presetIndex];
    const profile = this.getProfileName();
    const state = this.applyReferenceCalibration({
      ...DEFAULT_STATE,
      ...(preset[profile] || preset.desktop),
      opacity: preset[profile]?.opacity ?? preset.desktop.opacity ?? 0.92,
      reveal: 1,
      interactionStrength: 0.92
    }, REFERENCE_PRESET_CALIBRATION.capability);

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.13;
      state.noiseStrength *= 0.56;
      state.hoverStrength *= 0.22;
      state.pointerInfluence *= 0.18;
      state.interactionStrength *= 0.34;
    }

    return state;
  }

  getCapabilitiesBlobState(progress = 0, count = 1) {
    const amount = THREE.MathUtils.clamp(progress, 0, 1);
    const total = Math.max(1, Math.floor(Number(count) || 1));
    const scaled = amount * total;
    const activeIndex = Math.min(total - 1, Math.floor(scaled));
    const localProgress = THREE.MathUtils.clamp(scaled - activeIndex, 0, 1);
    const currentState = this.getCapabilityStateConfig(activeIndex);
    let state = currentState;
    let transitionPressure = 0;

    if (activeIndex === 0 && localProgress < CAPABILITY_INTRO_END) {
      const introProgress = smoothstep(localProgress / CAPABILITY_INTRO_END);
      state = interpolateBlobStates(this.getStateConfig('capabilitiesIntro'), currentState, introProgress);
      transitionPressure = 1 - introProgress;
    } else if (localProgress > CAPABILITY_EXIT_START) {
      const exitProgress = smoothstep((localProgress - CAPABILITY_EXIT_START) / (1 - CAPABILITY_EXIT_START));
      const nextState = activeIndex === total - 1
        ? this.getStateConfig('capabilitiesExit')
        : this.getCapabilityStateConfig(activeIndex + 1);

      state = interpolateBlobStates(currentState, nextState, exitProgress);
      transitionPressure = exitProgress;
    }

    state.scrollProgress = THREE.MathUtils.clamp((amount * 0.1) + (transitionPressure * 0.42), 0, 0.56);
    state.interactionStrength *= 1 - (transitionPressure * 0.18);
    state.pointerInfluence *= 1 - (transitionPressure * 0.24);
    state.distortion += transitionPressure * 0.045;
    state.colorIntensity += transitionPressure * 0.035;

    return state;
  }

  getJournalBlobState(progress = 0, focus = 0) {
    const amount = THREE.MathUtils.clamp(progress, 0, 1);
    const focusAmount = THREE.MathUtils.clamp(focus, 0, 1);
    const introState = this.getStateConfig('journalIntro');
    const listState = this.getStateConfig('journalList');
    const exitState = this.getStateConfig('journalExit');
    const focusState = this.getStateConfig('journalFocus');
    const listProgress = smoothstep(THREE.MathUtils.clamp(amount / 0.42, 0, 1));
    const exitProgress = smoothstep(THREE.MathUtils.clamp((amount - 0.74) / 0.26, 0, 1));
    let state = interpolateBlobStates(introState, listState, listProgress);

    state = interpolateBlobStates(state, exitState, exitProgress);

    if (focusAmount > 0) {
      state = interpolateBlobStates(state, focusState, focusAmount * 0.72);
    }

    state.scrollProgress = THREE.MathUtils.clamp(0.2 + (amount * 0.18) + (exitProgress * 0.18), 0, 0.58);
    state.interactionStrength *= 1 - (exitProgress * 0.18);
    state.distortion += focusAmount * 0.035;
    state.colorIntensity += focusAmount * 0.05;
    state.fresnelIntensity += focusAmount * 0.06;

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.12;
      state.noiseStrength *= 0.56;
      state.hoverStrength *= 0.22;
      state.pointerInfluence *= 0.2;
      state.interactionStrength *= 0.34;
    }

    return state;
  }

  getContactBlobState(progress = 0, focus = 0) {
    const amount = THREE.MathUtils.clamp(progress, 0, 1);
    const focusAmount = THREE.MathUtils.clamp(focus, 0, 1);
    const introState = this.getStateConfig('contactIntro');
    const locationState = this.getStateConfig('contactLocation');
    const ctaState = this.getStateConfig('contactCTA');
    const footerState = this.getStateConfig('footerFinal');
    const locationProgress = smoothstep(THREE.MathUtils.clamp(amount / 0.42, 0, 1));
    const ctaProgress = smoothstep(THREE.MathUtils.clamp((amount - 0.42) / 0.36, 0, 1));
    const footerProgress = smoothstep(THREE.MathUtils.clamp((amount - 0.78) / 0.22, 0, 1));
    let state = interpolateBlobStates(introState, locationState, locationProgress);

    state = interpolateBlobStates(state, ctaState, ctaProgress);
    state = interpolateBlobStates(state, footerState, footerProgress);

    state.scrollProgress = THREE.MathUtils.clamp(0.16 + (amount * 0.2) + (footerProgress * 0.16), 0, 0.58);
    state.interactionStrength *= 1 - (footerProgress * 0.22);
    state.pointerInfluence *= 1 - (footerProgress * 0.18);
    state.noiseSpeed *= 1 - (footerProgress * 0.1);
    state.distortion += focusAmount * 0.04;
    state.colorIntensity += focusAmount * 0.055;
    state.fresnelIntensity += focusAmount * 0.08;
    state.hoverStrength += focusAmount * 0.025;
    state.x += focusAmount * 0.018;
    state.y -= focusAmount * 0.012;

    if (this.prefersReducedMotion) {
      state.noiseSpeed = 0.1;
      state.noiseStrength *= 0.5;
      state.hoverStrength *= 0.2;
      state.pointerInfluence *= 0.18;
      state.interactionStrength *= 0.32;
    }

    return state;
  }

  setState(name = 'hero', options = {}) {
    this.activeStateName = name;

    const state = name === 'hero' ? this.getHeroBlobState(options) : this.getStateConfig(name);
    this.setBlobState(state, options);

    return state;
  }

  setHeroBlobState(options = {}) {
    return this.setState('hero', options);
  }

  setWorkProjectState(index = 0, state = {}, options = {}) {
    this.activeStateName = 'workProject';
    this.activeProjectIndex = index;

    const projectState = {
      ...this.getWorkProjectState(index),
      ...state
    };

    this.setBlobState(projectState, options);

    return projectState;
  }

  setAboutProgress(progress = 0, state = {}, options = {}) {
    this.activeStateName = 'aboutProgress';
    this.activeAboutProgress = THREE.MathUtils.clamp(progress, 0, 1);

    const aboutState = {
      ...this.getAboutBlobState(this.activeAboutProgress),
      ...state
    };

    this.setBlobState(aboutState, options);

    return aboutState;
  }

  setCapabilitiesProgress(progress = 0, count = 1, state = {}, options = {}) {
    this.activeStateName = 'capabilitiesProgress';
    this.activeCapabilitiesProgress = THREE.MathUtils.clamp(progress, 0, 1);
    this.activeCapabilityCount = Math.max(1, Math.floor(Number(count) || 1));

    const capabilityState = {
      ...this.getCapabilitiesBlobState(this.activeCapabilitiesProgress, this.activeCapabilityCount),
      ...state
    };

    this.setBlobState(capabilityState, options);

    return capabilityState;
  }

  setJournalProgress(progress = 0, focus = 0, state = {}, options = {}) {
    this.activeStateName = 'journalProgress';
    this.activeJournalProgress = THREE.MathUtils.clamp(progress, 0, 1);
    this.activeJournalFocus = THREE.MathUtils.clamp(focus, 0, 1);

    const journalState = {
      ...this.getJournalBlobState(this.activeJournalProgress, this.activeJournalFocus),
      ...state
    };

    this.setBlobState(journalState, options);

    return journalState;
  }

  setContactProgress(progress = 0, focus = 0, state = {}, options = {}) {
    this.activeStateName = 'contactProgress';
    this.activeContactProgress = THREE.MathUtils.clamp(progress, 0, 1);
    this.activeContactFocus = THREE.MathUtils.clamp(focus, 0, 1);

    const contactState = {
      ...this.getContactBlobState(this.activeContactProgress, this.activeContactFocus),
      ...state
    };

    this.setBlobState(contactState, options);

    return contactState;
  }

  setScrollDirection(direction = 'down') {
    const validDir = direction === 'up' ? 'up' : 'down';
    if (this.scrollDirection === validDir) return;

    this.scrollDirection = validDir;
    this.refreshActiveState();
  }

  setScrollMetrics(input = {}) {
    const direction = input.direction === 'up' || input.direction === -1 ? 'up' : 'down';
    const rawVelocity = typeof input.velocity === 'number'
      ? input.velocity
      : Math.abs((window.scrollY || 0) - this.previousScrollY);
    const normalizedVelocity = THREE.MathUtils.clamp(Math.abs(rawVelocity) / 3600, 0, 1);

    this.scrollAcceleration = normalizedVelocity - this.scrollVelocity.target;
    this.scrollVelocity.target = normalizedVelocity;
    this.setScrollDirection(direction);
  }

  refreshActiveState(options = {}) {
    if (this.activeStateName === 'hero') {
      const responsiveState = this.getHeroBlobState();
      responsiveState.reveal = this.target.reveal;
      responsiveState.opacity = Math.max(this.target.opacity, responsiveState.opacity);
      this.setBlobState(responsiveState, options);
    } else if (this.activeStateName === 'workProject') {
      const responsiveState = this.getWorkProjectState(this.activeProjectIndex);
      responsiveState.scrollProgress = this.target.scrollProgress;
      this.setBlobState(responsiveState, options);
    } else if (this.activeStateName === 'aboutProgress') {
      this.setBlobState(this.getAboutBlobState(this.activeAboutProgress), options);
    } else if (this.activeStateName === 'capabilitiesProgress') {
      this.setBlobState(this.getCapabilitiesBlobState(
        this.activeCapabilitiesProgress,
        this.activeCapabilityCount
      ), options);
    } else if (this.activeStateName === 'journalProgress') {
      this.setBlobState(this.getJournalBlobState(
        this.activeJournalProgress,
        this.activeJournalFocus
      ), options);
    } else if (this.activeStateName === 'contactProgress') {
      this.setBlobState(this.getContactBlobState(
        this.activeContactProgress,
        this.activeContactFocus
      ), options);
    } else {
      const responsiveState = this.getStateConfig(this.activeStateName);
      responsiveState.reveal = this.target.reveal;
      responsiveState.opacity = Math.max(this.target.opacity, responsiveState.opacity);
      responsiveState.scrollProgress = this.target.scrollProgress;
      this.setBlobState(responsiveState, options);
    }
  }

  setBlobState(state = {}, options = {}) {
    const isUp = this.scrollDirection === 'up';
    const dirScale = isUp ? 1.025 : 1.0;
    const dirDist = isUp ? 0.94 : 1.06;
    const dirNoiseSpeed = isUp ? 0.82 : 1.15;
    const dirRotX = isUp ? 0.08 : -0.05;
    const dirRotZ = isUp ? 0.05 : -0.035;

    const combinedState = { ...state };

    if (typeof state.scale === 'number') combinedState.scale = state.scale * dirScale;
    if (typeof state.distortion === 'number') combinedState.distortion = state.distortion * dirDist;
    if (typeof state.noiseSpeed === 'number') combinedState.noiseSpeed = state.noiseSpeed * dirNoiseSpeed;

    combinedState.rotationX = typeof state.rotationX === 'number' ? state.rotationX + dirRotX : dirRotX;
    combinedState.rotationZ = typeof state.rotationZ === 'number' ? state.rotationZ + dirRotZ : dirRotZ;

    STATE_KEYS.forEach((key) => {
      if (typeof combinedState[key] === 'number') {
        this.target[key] = combinedState[key];
      }
    });

    if (options.immediate) {
      STATE_KEYS.forEach((key) => {
        this.current[key] = this.target[key];
      });
      if (!this.pointerActive && this.pointerWorldCurrent) {
        this.pointerWorldCurrent.set(this.current.x * 3, this.current.y * 2, 0);
      }

      this.applyCurrentState();
    }
  }

  setTargetState(state = {}, options = {}) {
    this.setBlobState(state, options);
  }

  setRevealProgress(value, options = {}) {
    this.setBlobState({ reveal: value }, options);
  }

  setPointer(x, y) {
    this.pointer.targetX = THREE.MathUtils.clamp(x, -1, 1);
    this.pointer.targetY = THREE.MathUtils.clamp(y, -1, 1);
  }

  setPointerVelocity(speed) {
    this.pointerVelocity.target = THREE.MathUtils.clamp(speed, 0, 1);
  }

  setPosition(x, y) {
    this.setBlobState({ x, y });
  }

  setScale(scale) {
    this.setBlobState({ scale });
  }

  setDistortion(distortion) {
    this.setBlobState({ distortion });
  }

  setOpacity(opacity) {
    this.setBlobState({ opacity });
  }

  setCameraZ(cameraZ) {
    this.setBlobState({ cameraZ });
  }

  setProjectTexture(imageUrl, sourceElement = null) {
    this.setTexture(imageUrl || this.getTextureUrlForElement(sourceElement));
  }

  getPortraitUrl() {
    const metaBase = document.querySelector('meta[name="base-url"]')?.content;
    if (metaBase) return `${metaBase}/images/portrait.png`.replace(/([^:]\/)\/+/g, '$1');

    const loc = window.location;
    const path = loc.pathname.replace(/\/(index\.php)?$/, '');
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    return `${loc.origin}${cleanPath}/images/portrait.png`;
  }

  clearTexture(options = {}) {
    if (!this.material) return;
    this.setTexture(this.getPortraitUrl());
  }

  getTextureUrlForElement(sourceElement = null) {
    if (!sourceElement) return '';

    const asset = this.projectAssets.find((entry) => (
      entry.project === sourceElement
      || entry.imageElement === sourceElement
      || entry.project.contains?.(sourceElement)
      || sourceElement.contains?.(entry.project)
    ));

    return asset?.imageUrl || '';
  }

  setTexture(imageUrl) {
    if (!this.material) return;

    const portraitUrl = this.getPortraitUrl();
    const targetUrl = imageUrl || portraitUrl;

    if (targetUrl === this.currentTextureUrl && this.currentTexture) {
      gsap.killTweensOf(this.uniforms.uHasTexture);
      this.uniforms.uTexture.value = this.currentTexture;
      this.uniforms.uNextTexture.value = this.currentTexture;
      this.uniforms.uMixRatio.value = 0;
      gsap.to(this.uniforms.uHasTexture, {
        value: 1,
        duration: 0.36,
        ease: 'power2.out',
        overwrite: true
      });
      return;
    }

    if (targetUrl === this.nextTextureUrl && this.nextTexture) return;

    const requestId = ++this.textureRequestId;
    this.nextTextureUrl = targetUrl;

    this.textureLoader.load(
      targetUrl,
      (tex) => {
        if (requestId !== this.textureRequestId) {
          tex.dispose?.();
          return;
        }

        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = false;
        gsap.killTweensOf(this.uniforms.uHasTexture);
        gsap.killTweensOf(this.uniforms.uTextureTransition);
        this.uniforms.uHasTexture.value = 1.0;
        this.uniforms.uTextureTransition.value = 1.0;

        if (!this.currentTexture) {
          this.currentTexture = tex;
          this.currentTextureUrl = targetUrl;
          this.nextTexture = null;
          this.nextTextureUrl = '';
          this.uniforms.uTexture.value = tex;
          this.uniforms.uNextTexture.value = tex;
          this.uniforms.uHasTexture.value = 1.0;
          gsap.to(this.uniforms.uTextureTransition, {
            value: 0,
            duration: 0.72,
            ease: 'power3.out',
            overwrite: true
          });
          return;
        }

        const previousTexture = this.currentTexture;
        this.nextTexture = tex;
        this.uniforms.uNextTexture.value = tex;

        const textureMix = { value: 0 };
        gsap.to(textureMix, {
          value: 1,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            this.uniforms.uMixRatio.value = textureMix.value;
          },
          onComplete: () => {
            this.currentTexture = this.nextTexture;
            this.currentTextureUrl = targetUrl;
            this.nextTexture = null;
            this.nextTextureUrl = '';
            this.uniforms.uTexture.value = this.currentTexture;
            this.uniforms.uNextTexture.value = this.currentTexture;
            this.uniforms.uMixRatio.value = 0;
            if (previousTexture && previousTexture !== this.currentTexture) {
              previousTexture.dispose?.();
            }
          }
        });
        gsap.to(this.uniforms.uTextureTransition, {
          value: 0,
          duration: 0.9,
          ease: 'power3.out',
          overwrite: true
        });
      },
      undefined,
      () => {
        if (requestId !== this.textureRequestId) return;

        this.nextTexture = null;
        this.nextTextureUrl = '';
        this.clearTexture({ duration: 0.42 });
      }
    );
  }

  onPointerMove(event) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (!this.isFinePointer) return;

    this.pointerActive = true;
    const rawNDC_X = (event.clientX / (this.width || 1)) * 2 - 1;
    const rawNDC_Y = -((event.clientY / (this.height || 1)) * 2 - 1);

    this.pointerNDC.x = THREE.MathUtils.clamp(rawNDC_X, -1, 1);
    this.pointerNDC.y = THREE.MathUtils.clamp(rawNDC_Y, -1, 1);
    this.pointerDirectionTarget.set(
      this.pointerNDC.x - this.pointer.targetX,
      this.pointerNDC.y - this.pointer.targetY
    );
    if (this.pointerDirectionTarget.lengthSq() > 0.0001) {
      this.pointerDirectionTarget.normalize();
    }
    this.setPointer(this.pointerNDC.x, this.pointerNDC.y);
  }

  onPointerLeave() {
    this.pointerActive = false;
  }

  onPointerEnter() {
    this.pointerActive = true;
  }

  onResize() {
    this.syncSize();
    this.quality = this.getQuality();
    this.isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.pixelRatio));
    this.uniforms.uResolution.value.set(this.width, this.height);
    this.projectAssets = this.collectProjectAssets();

    this.refreshActiveState();
  }

  onVisibilityChange() {
    if (!document.hidden && this.clock) {
      this.clock.getDelta();
    }
  }

  animate() {
    if (this.isDestroyed) return;

    this.frameId = requestAnimationFrame(this.animate);

    if (document.hidden && this.hasRendered) return;

    this.update();
    this.render();
  }

  update() {
    const delta = Math.min(this.clock ? this.clock.getDelta() : 0.016, 0.05);
    this.elapsedTime += delta;
    const pointerSmoothing = this.prefersReducedMotion ? CONFIG.reducedPointerSmoothing : CONFIG.pointerSmoothing;
    const damping = CONFIG.stateDamping;

    if (this.externalPointer?.state) {
      const pointerState = this.externalPointer.state;
      if (typeof pointerState.isInsideViewport === 'boolean') {
        this.pointerActive = pointerState.isInsideViewport;
      }
      if (this.pointerActive && this.isFinePointer) {
        const rawX = typeof pointerState.rawNormalizedX === 'number' ? pointerState.rawNormalizedX : pointerState.normalizedX;
        const rawY = typeof pointerState.rawNormalizedY === 'number' ? pointerState.rawNormalizedY : pointerState.normalizedY;
        this.pointerNDC.x = THREE.MathUtils.clamp(rawX, -1, 1);
        this.pointerNDC.y = THREE.MathUtils.clamp(rawY, -1, 1);
        this.setPointer(this.pointerNDC.x, this.pointerNDC.y);
      }
      this.setPointerVelocity(pointerState.speed / 44);
      this.pointerDirectionTarget.set(pointerState.velocityX || 0, -(pointerState.velocityY || 0));
      if (this.pointerDirectionTarget.lengthSq() > 0.0001) {
        this.pointerDirectionTarget.normalize();
      }
    }

    this.pointer.x += (this.pointer.targetX - this.pointer.x) * pointerSmoothing;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * pointerSmoothing;
    this.pointerVelocity.current = THREE.MathUtils.lerp(
      this.pointerVelocity.current,
      this.prefersReducedMotion ? 0 : this.pointerVelocity.target,
      0.12
    );
    this.pointerDirection.lerp(this.pointerDirectionTarget, 0.12);
    if (this.pointerVelocity.current < 0.01) {
      this.pointerDirection.multiplyScalar(0.92);
    }
    this.scrollVelocity.current = THREE.MathUtils.lerp(
      this.scrollVelocity.current,
      this.prefersReducedMotion ? 0 : this.scrollVelocity.target,
      0.11
    );
    this.scrollVelocity.target *= 0.86;

    STATE_KEYS.forEach((key) => {
      const amount = key === 'opacity' || key === 'reveal' ? CONFIG.opacityDamping : damping;
      this.current[key] = THREE.MathUtils.lerp(this.current[key], this.target[key], amount);
    });

    const sectionWorldX = this.current.x * 3;
    const sectionWorldY = this.current.y * 2;

    let targetWorldX = sectionWorldX;
    let targetWorldY = sectionWorldY;

    if (this.pointerActive && this.isFinePointer && !this.prefersReducedMotion && this.camera) {
      this.raycaster.setFromCamera(this.pointerNDC, this.camera);
      const intersect = this.raycaster.ray.intersectPlane(this.pointerPlane, this.pointerWorldTarget);
      if (intersect) {
        const influence = typeof this.current.pointerInfluence === 'number' ? this.current.pointerInfluence : 0.08;
        const blendRatio = THREE.MathUtils.clamp(influence * 12.0, 0.45, 0.95);
        targetWorldX = THREE.MathUtils.lerp(sectionWorldX, this.pointerWorldTarget.x * 0.72, blendRatio);
        targetWorldY = THREE.MathUtils.lerp(sectionWorldY, this.pointerWorldTarget.y * 0.72, blendRatio);
      }
    }

    const FOLLOW_DAMPING = 12.0;

    this.pointerWorldCurrent.x = THREE.MathUtils.damp(
      this.pointerWorldCurrent.x,
      targetWorldX,
      FOLLOW_DAMPING,
      delta
    );

    this.pointerWorldCurrent.y = THREE.MathUtils.damp(
      this.pointerWorldCurrent.y,
      targetWorldY,
      FOLLOW_DAMPING,
      delta
    );

    this.applyCurrentState(this.elapsedTime);
  }

  applyCurrentState(elapsedTime) {
    const time = typeof elapsedTime === 'number'
      ? elapsedTime
      : (this.elapsedTime || 0);
    const interaction = this.prefersReducedMotion
      ? 0
      : (typeof this.current.interactionStrength === 'number' ? this.current.interactionStrength : 1.0);

    this.blobMesh.position.x = this.pointerWorldCurrent.x;
    this.blobMesh.position.y = this.pointerWorldCurrent.y;
    this.blobMesh.scale.setScalar(this.current.scale);

    const pointerRotationX = this.prefersReducedMotion ? 0 : -this.pointer.y * 0.28 * interaction;
    const pointerRotationY = this.prefersReducedMotion ? 0 : this.pointer.x * 0.38 * interaction;
    const idleSpeed = this.prefersReducedMotion ? 0.16 : 1;

    this.blobMesh.rotation.x = THREE.MathUtils.lerp(
      this.blobMesh.rotation.x,
      this.current.rotationX + pointerRotationX + Math.sin(time * 0.09 * idleSpeed) * 0.045,
      CONFIG.rotationDamping
    );
    this.blobMesh.rotation.y = THREE.MathUtils.lerp(
      this.blobMesh.rotation.y,
      this.current.rotationY + pointerRotationY + time * 0.055 * idleSpeed,
      CONFIG.rotationDamping
    );
    this.blobMesh.rotation.z = THREE.MathUtils.lerp(
      this.blobMesh.rotation.z,
      this.current.rotationZ + Math.sin(time * 0.07 * idleSpeed) * 0.052 + this.pointer.x * 0.025 * interaction,
      CONFIG.rotationDamping
    );

    this.camera.position.z = this.current.cameraZ;
    this.camera.fov = this.current.cameraFov;
    this.camera.updateProjectionMatrix();

    const shaderTime = this.prefersReducedMotion ? time * 0.22 : time;

    this.uniforms.uTime.value = shaderTime;
    this.uniforms.uPointer.value.set(this.pointer.x, this.pointer.y);
    this.uniforms.uPointerDirection.value.copy(this.pointerDirection);
    this.uniforms.uPointerVelocity.value = this.pointerVelocity.current * interaction;
    this.uniforms.uScrollDirection.value.set(0, this.scrollDirection === 'up' ? 1 : -1);
    this.uniforms.uScrollVelocity.value = this.scrollVelocity.current;
    this.uniforms.uBlobScale.value = this.current.scale;
    this.uniforms.uNoiseStrength.value = this.current.noiseStrength;
    this.uniforms.uNoiseFrequency.value = this.current.noiseFrequency;
    this.uniforms.uNoiseSpeed.value = this.current.noiseSpeed;
    this.uniforms.uHoverStrength.value = this.current.hoverStrength * interaction;
    this.uniforms.uColorIntensity.value = this.current.colorIntensity + (this.pointerVelocity.current * 0.045 * interaction);
    this.uniforms.uInteractionStrength.value = interaction;
    this.uniforms.uScrollProgress.value = this.current.scrollProgress;
    this.uniforms.uFresnelPower.value = this.current.fresnelPower;
    this.uniforms.uFresnelIntensity.value = this.current.fresnelIntensity;
    this.uniforms.uDistortion.value = this.current.distortion;
    this.uniforms.uHueShift.value = this.current.hueShift;
    this.uniforms.uOpacity.value = this.current.opacity;
    this.uniforms.uRevealProgress.value = this.current.reveal;
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (!this.hasRendered) {
      this.hasRendered = true;
      this.resolveReady();
    }
  }

  destroy() {
    this.isDestroyed = true;

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('pointermove', this.onPointerMove);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    document.documentElement.removeEventListener('pointerenter', this.onPointerEnter);

    this.currentTexture?.dispose?.();
    this.nextTexture?.dispose?.();
    this.currentTextureUrl = '';
    this.nextTextureUrl = '';
    this.geometry?.dispose?.();
    this.material?.dispose?.();
    this.renderer?.dispose?.();
    this.renderer?.forceContextLoss?.();
    this.container?.replaceChildren();
  }
}

function smoothstep(value) {
  const amount = THREE.MathUtils.clamp(value, 0, 1);

  return amount * amount * (3 - 2 * amount);
}

function interpolateBlobStates(fromState, toState, progress) {
  const amount = THREE.MathUtils.clamp(progress, 0, 1);
  const state = { ...DEFAULT_STATE };

  STATE_KEYS.forEach((key) => {
    state[key] = THREE.MathUtils.lerp(fromState[key], toState[key], amount);
  });

  return state;
}

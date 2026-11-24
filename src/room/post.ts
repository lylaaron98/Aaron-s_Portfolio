/**
 * Desktop-only post-processing, loaded on demand so phones never download it:
 * screen-space ambient occlusion (N8AO) to ground everything, then bloom,
 * filmic tone mapping, a soft vignette, a whisper of film grain and SMAA.
 */
import * as THREE from 'three'
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing'
import { N8AOPostPass } from 'n8ao'

export interface Post {
  render(dt: number, bloom: number): void
  setSize(w: number, h: number): void
  dispose(): void
}

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): Post {
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType })
  composer.addPass(new RenderPass(scene, camera))
  const ao = new N8AOPostPass(scene, camera, 1, 1)
  Object.assign(ao.configuration, {
    aoRadius: 0.45,
    distanceFalloff: 0.6,
    intensity: 2.2,
    halfRes: true,
    depthAwareUpsampling: true,
    gammaCorrection: false,
  })
  ao.setQualityMode('Medium')
  composer.addPass(ao)
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.82, luminanceSmoothing: 0.25, intensity: 0.6, radius: 0.72 })
  const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false })
  grain.blendMode.opacity.value = 0.035
  composer.addPass(
    new EffectPass(
      camera,
      bloom,
      new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      new VignetteEffect({ offset: 0.32, darkness: 0.42 }),
      grain,
    ),
  )
  composer.addPass(new EffectPass(camera, new SMAAEffect()))
  return {
    render(dt, strength) {
      bloom.intensity = strength
      composer.render(dt)
    },
    setSize: (w, h) => composer.setSize(w, h),
    dispose: () => composer.dispose(),
  }
}

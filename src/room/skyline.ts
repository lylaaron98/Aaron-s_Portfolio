import * as THREE from 'three'
import type { Lighting } from './timeOfDay'

/**
 * The view: a sky with drifting clouds and a sun or moon, and a skyline seen
 * from a high floor. Building windows are drawn in the shader from world
 * position, so every facade gets correctly sized floors and windows instead
 * of one stretched texture, and each window lights up on its own at night.
 */

const NOISE = /* glsl */ `
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += vnoise(p) * a; p *= 2.03; a *= 0.5; } return s; }
`

export function createSkyline(scene: THREE.Scene, lite: boolean) {
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(item: T) => (disposables.push(item), item)

  // ── Sky dome ───────────────────────────────────────────────────────────
  const skyUniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 0.3, -1) },
    uSunColor: { value: new THREE.Color() },
    uIsDay: { value: 1 },
    uStars: { value: 0 },
    uCloud: { value: new THREE.Color() },
    uClouds: { value: 0.5 },
    uTime: { value: 0 },
  }
  const sky = new THREE.Mesh(
    track(new THREE.SphereGeometry(400, 48, 24)),
    track(
      new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop, uHorizon, uSunColor, uSunDir, uCloud;
          uniform float uIsDay, uStars, uClouds, uTime;
          varying vec3 vDir;
          ${NOISE}
          void main() {
            vec3 d = normalize(vDir);
            float h = clamp(d.y, -0.2, 1.0);
            vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.45, h));
            // Haze band right at the horizon.
            col = mix(col, uHorizon * 1.08, exp(-abs(h) * 18.0) * 0.5);

            float cosA = dot(d, normalize(uSunDir));
            float disc = smoothstep(0.9993, 0.9996, cosA);
            float glow = pow(max(cosA, 0.0), uIsDay > 0.5 ? 18.0 : 220.0) * (uIsDay > 0.5 ? 0.6 : 0.35);
            float scatter = pow(max(cosA, 0.0), 3.0) * 0.18 * uIsDay;
            col += uSunColor * (glow + scatter);

            // Clouds on a flat layer above the city.
            vec2 cp = d.xz / max(d.y + 0.08, 0.02) * 0.9 + vec2(uTime * 0.006, 0.0);
            float n = fbm(cp * 1.4);
            float cover = smoothstep(1.0 - uClouds * 0.75, 1.15 - uClouds * 0.5, n) * smoothstep(-0.01, 0.12, h);
            vec3 cloudCol = mix(uCloud * 0.75, uCloud, smoothstep(0.4, 0.9, n)) + uSunColor * pow(max(cosA, 0.0), 6.0) * 0.4 * uIsDay;
            col = mix(col, cloudCol, cover * 0.85);

            vec2 cell = floor(vec2(atan(d.x, d.z) * 260.0, d.y * 420.0));
            float star = step(0.9968, hash12(cell));
            float twinkle = 0.55 + 0.45 * sin(uTime * 2.3 + hash12(cell + 3.1) * 40.0);
            col += vec3(star * twinkle * uStars * smoothstep(0.08, 0.3, h) * (1.0 - cover));

            col += disc * uSunColor * (uIsDay > 0.5 ? 6.0 : 2.0);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    ),
  )
  sky.renderOrder = -1
  scene.add(sky)

  // ── Buildings ──────────────────────────────────────────────────────────
  const cityUniforms = { uCity: { value: 0 }, uDay: { value: 1 }, uTime: { value: 0 } }
  const cityMaterial = track(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75, metalness: 0.15, envMapIntensity: 0.15 }))
  cityMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, cityUniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCityPos;\nvarying vec3 vCityNormal;\nvarying float vCityId;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vec4 cityWorld = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
         vCityPos = cityWorld.xyz;
         vCityNormal = normalize(mat3(modelMatrix * instanceMatrix) * objectNormal);
         vCityId = float(gl_InstanceID);`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uCity, uDay, uTime;
         varying vec3 vCityPos;
         varying vec3 vCityNormal;
         varying float vCityId;
         ${NOISE}
         float cityWindow;
         float cityLit;
         vec3 cityLitColor;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         // Rounded: an interpolated id can drift by a hair and scramble hashes.
         float cityId = floor(vCityId + 0.5);
         vec3 n = normalize(vCityNormal);
         float side = 1.0 - step(0.5, abs(n.y));
         float across = abs(n.x) > 0.5 ? vCityPos.z : vCityPos.x;
         float style = hash12(vec2(cityId, 7.0));
         vec2 size = style > 0.6 ? vec2(1.5, 3.4) : style > 0.3 ? vec2(2.1, 3.6) : vec2(1.2, 3.2);
         vec2 g = vec2(across, vCityPos.y) / size;
         vec2 f = fract(g);
         vec2 cell = floor(g);
         float frame = style > 0.6 ? 0.1 : 0.2;
         cityWindow = side * step(frame, f.x) * step(f.x, 1.0 - frame) * step(0.22, f.y) * step(f.y, 0.86);
         float r = hash12(cell + cityId * 13.1);
         float flicker = step(0.997, hash12(cell + floor(uTime * 0.25)));
         cityLit = cityWindow * step(1.0 - uCity * (0.12 + style * 0.22), r) * (1.0 - flicker) * (0.45 + 0.55 * hash12(cell + 9.3));
         cityLitColor = mix(vec3(1.0, 0.78, 0.5), vec3(0.75, 0.88, 1.0), step(0.8, hash12(cell + 2.7)));
         // Rooms read deeper at the top; some have blinds half down.
         float blinds = step(0.65, hash12(cell + 5.1)) * step(0.6, f.y) * (0.6 + 0.4 * step(0.5, fract(f.y * 14.0)));
         cityLitColor *= mix(1.0, 0.55, smoothstep(0.3, 0.86, f.y)) * (1.0 - blinds * 0.7);
         vec3 facade = diffuseColor.rgb * (0.85 + 0.3 * hash12(vec2(cityId, 3.0))) * mix(0.22, 1.0, uDay);
         vec3 glass = mix(vec3(0.16, 0.2, 0.27), vec3(0.42, 0.55, 0.68), uDay) * (0.8 + 0.4 * r);
         diffuseColor.rgb = mix(facade, glass, cityWindow * 0.85);
         // Roofs read darker.
         diffuseColor.rgb *= mix(1.0, 0.7, step(0.5, n.y));`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = mix(roughnessFactor, 0.15, cityWindow);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance += cityLitColor * cityLit * 1.25;`,
      )
  }

  const count = lite ? 120 : 240
  const box = track(new THREE.BoxGeometry(1, 1, 1))
  const city = new THREE.InstancedMesh(box, cityMaterial, count)
  const tints = ['#8a93a6', '#a49c90', '#7e8796', '#b0b4bb', '#6f7686', '#9aa4b2']
  const dummy = new THREE.Object3D()
  const roofs: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    const z = -70 - Math.pow(Math.random(), 0.8) * 170
    const spread = 40 + -z * 1.15
    const x = (Math.random() * 2 - 1) * spread
    const w = 7 + Math.random() * 14
    const d = 7 + Math.random() * 14
    const top = -30 + Math.random() * 30 + (Math.abs(x) < 45 && Math.random() < 0.35 ? 14 : 0)
    const height = 200
    dummy.position.set(x, top - height / 2, z)
    dummy.rotation.y = Math.random() < 0.15 ? Math.PI / 4 : 0
    dummy.scale.set(w, height, d)
    dummy.updateMatrix()
    city.setMatrixAt(i, dummy.matrix)
    city.setColorAt(i, new THREE.Color(tints[i % tints.length]))
    if (top > -12 && Math.random() < 0.6) roofs.push(new THREE.Vector3(x, top + 1.5, z))
  }
  city.receiveShadow = false
  scene.add(city)

  // Rooftop plant boxes and antennas break up the silhouettes.
  const roofGeo = track(new THREE.BoxGeometry(1, 1, 1))
  const roof = new THREE.InstancedMesh(roofGeo, track(new THREE.MeshStandardMaterial({ color: '#5d6472', roughness: 0.9, envMapIntensity: 0.15 })), roofs.length * 2)
  roofs.forEach((p, i) => {
    dummy.rotation.set(0, 0, 0)
    dummy.position.set(p.x + (Math.random() - 0.5) * 3, p.y - 0.5, p.z)
    dummy.scale.set(2 + Math.random() * 3, 2 + Math.random() * 2, 2 + Math.random() * 3)
    dummy.updateMatrix()
    roof.setMatrixAt(i * 2, dummy.matrix)
    dummy.position.set(p.x + 1, p.y + 3, p.z + 1)
    dummy.scale.set(0.25, 7 + Math.random() * 6, 0.25)
    dummy.updateMatrix()
    roof.setMatrixAt(i * 2 + 1, dummy.matrix)
  })
  scene.add(roof)

  // Red aviation beacons, blinking out of step.
  const beaconPositions = new Float32Array(roofs.length * 3)
  const beaconSeeds = new Float32Array(roofs.length)
  roofs.forEach((p, i) => {
    beaconPositions.set([p.x + 1, p.y + 10.5, p.z + 1], i * 3)
    beaconSeeds[i] = Math.random()
  })
  const beaconGeo = track(new THREE.BufferGeometry())
  beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPositions, 3))
  beaconGeo.setAttribute('seed', new THREE.BufferAttribute(beaconSeeds, 1))
  const beaconUniforms = { uTime: { value: 0 }, uNight: { value: 0 } }
  const beacons = new THREE.Points(
    beaconGeo,
    track(
      new THREE.ShaderMaterial({
        uniforms: beaconUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute float seed; uniform float uTime; varying float vOn;
          void main() {
            vOn = step(0.82, fract(uTime * 0.5 + seed));
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 260.0 / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uNight; varying float vOn;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vOn * uNight;
            gl_FragColor = vec4(vec3(1.0, 0.15, 0.1) * 3.0, a);
          }`,
      }),
    ),
  )
  scene.add(beacons)

  // A faint far ridge of towers, mostly lost in haze, for depth.
  const farCount = lite ? 40 : 80
  const farMat = track(new THREE.MeshBasicMaterial({ color: '#7d8799', fog: true }))
  const far = new THREE.InstancedMesh(box, farMat, farCount)
  for (let i = 0; i < farCount; i++) {
    const z = -260 - Math.random() * 60
    dummy.rotation.set(0, 0, 0)
    dummy.position.set((Math.random() * 2 - 1) * 380, -40 + Math.random() * 40, z)
    dummy.scale.set(10 + Math.random() * 20, 80, 10)
    dummy.updateMatrix()
    far.setMatrixAt(i, dummy.matrix)
  }
  scene.add(far)

  return {
    update(L: Lighting, sunDir: THREE.Vector3, isDay: boolean) {
      skyUniforms.uTop.value.set(L.skyTop)
      skyUniforms.uHorizon.value.set(L.skyHorizon)
      skyUniforms.uSunColor.value.set(isDay ? L.sun : '#dfe6ff')
      skyUniforms.uSunDir.value.copy(sunDir)
      skyUniforms.uIsDay.value = isDay ? 1 : 0
      skyUniforms.uStars.value = L.stars
      skyUniforms.uCloud.value.set(L.cloud)
      skyUniforms.uClouds.value = L.clouds
      cityUniforms.uCity.value = L.city
      cityUniforms.uDay.value = 1 - L.city
      beaconUniforms.uNight.value = Math.min(1, L.city * 1.2)
      farMat.color.set(L.skyHorizon).multiplyScalar(0.82)
    },
    tick(time: number) {
      skyUniforms.uTime.value = time
      cityUniforms.uTime.value = time
      beaconUniforms.uTime.value = time
    },
    dispose() {
      disposables.forEach((item) => item.dispose())
    },
  }
}

import * as THREE from 'three'

/**
 * A stylised figure at the desk, posed and animated procedurally. Arms use
 * two-bone IK, so hands land on real targets (keys, mouse, mug) and the elbows
 * follow naturally. A small routine cycles between typing, using the mouse
 * and taking a sip of coffee, with breathing and eye-line changes on top.
 */

export interface AvatarProps {
  keyboard: THREE.Vector3
  mouse: THREE.Object3D
  mug: THREE.Object3D
  mainMonitor: THREE.Vector3
  sideMonitor: THREE.Vector3
}

type State = 'type' | 'mouse' | 'sip'

const UPPER = 0.29
const FORE = 0.27
const HIPS = new THREE.Vector3(-0.1, 0.56, -0.66)
const up = new THREE.Vector3(0, 1, 0)

function capsuleBetween(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3) {
  mesh.position.copy(from).add(to).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(up, to.clone().sub(from).normalize())
}

function hairGeometry() {
  const geo = new THREE.IcosahedronGeometry(1, 6)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    // Hairline: keep the top and back, pull the face and lower sides inside.
    const covered = v.y > 0.12 - v.z * 0.35 || (v.z > 0.35 && v.y > -0.45)
    const tuft = 0.004 * Math.sin(v.x * 6 + v.z * 5) * Math.sin(v.y * 5 + v.x * 3)
    const r = covered ? 0.118 + tuft + Math.max(0, v.y) * 0.012 : 0.094
    v.multiplyScalar(r)
    pos.setXYZ(i, v.x, v.y * 1.06, v.z * 1.04)
  }
  geo.computeVertexNormals()
  return geo
}

export function createAvatar(scene: THREE.Scene, props: AvatarProps) {
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(item: T) => (disposables.push(item), item)

  const skin = track(new THREE.MeshPhysicalMaterial({ color: '#c99478', roughness: 0.55, sheen: 0.3, sheenColor: new THREE.Color('#ffb59a') }))
  const hoodie = track(
    new THREE.MeshPhysicalMaterial({ color: '#2f3466', roughness: 0.92, sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color('#7a80c8') }),
  )
  const pants = track(new THREE.MeshPhysicalMaterial({ color: '#2a2c33', roughness: 0.9, sheen: 0.3, sheenColor: new THREE.Color('#555a66') }))
  const hairMat = track(new THREE.MeshPhysicalMaterial({ color: '#16110f', roughness: 0.55, sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color('#3a302a') }))
  const shoeMat = track(new THREE.MeshStandardMaterial({ color: '#f1f0ec', roughness: 0.6 }))
  const soleMat = track(new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.8 }))
  const tealMat = track(new THREE.MeshStandardMaterial({ color: '#19c3b2', roughness: 0.35, metalness: 0.3 }))
  const blackMat = track(new THREE.MeshStandardMaterial({ color: '#16171b', roughness: 0.4, metalness: 0.4 }))

  const root = new THREE.Group()
  scene.add(root)
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(track(geo), mat)
    m.castShadow = true
    m.receiveShadow = true
    parent.add(m)
    return m
  }
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

  // ── Legs (static) ──────────────────────────────────────────────────────
  for (const [sx, reach] of [
    [-0.095, 0],
    [0.095, 0.05],
  ] as const) {
    const hip = v(HIPS.x + sx, HIPS.y, HIPS.z + 0.02)
    const knee = v(HIPS.x + sx * 1.15, HIPS.y + 0.02, HIPS.z - 0.4 - reach * 0.3)
    const ankle = v(HIPS.x + sx * 1.2, 0.1, knee.z - 0.06 - reach)
    capsuleBetween(mesh(new THREE.CapsuleGeometry(0.075, 0.4 - 0.1, 6, 16), pants), hip, knee)
    capsuleBetween(mesh(new THREE.CapsuleGeometry(0.058, knee.distanceTo(ankle) - 0.06, 6, 16), pants), knee, ankle)
    const kneeCap = mesh(new THREE.SphereGeometry(0.068, 16, 12), pants)
    kneeCap.position.copy(knee)
    const shoe = mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 16), shoeMat)
    shoe.rotation.x = Math.PI / 2
    shoe.scale.set(1.05, 1, 0.75)
    shoe.position.set(ankle.x, 0.045, ankle.z - 0.07)
    const sole = mesh(new THREE.BoxGeometry(0.1, 0.02, 0.27), soleMat)
    sole.position.set(ankle.x, 0.012, ankle.z - 0.07)
  }
  const pelvis = mesh(new THREE.SphereGeometry(1, 24, 16), pants)
  pelvis.scale.set(0.17, 0.09, 0.14)
  pelvis.position.copy(HIPS)

  // ── Torso ──────────────────────────────────────────────────────────────
  const torso = new THREE.Group()
  torso.position.copy(HIPS)
  root.add(torso)
  const profile = [
    [0.0, 0.0],
    [0.14, 0.01],
    [0.155, 0.1],
    [0.152, 0.2],
    [0.158, 0.3],
    [0.172, 0.38],
    [0.16, 0.43],
    [0.1, 0.475],
    [0.05, 0.49],
    [0.0, 0.49],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const chest = mesh(new THREE.LatheGeometry(profile, 32), hoodie, torso)
  chest.scale.set(1.12, 1, 0.74)
  const pocket = mesh(new THREE.CapsuleGeometry(0.03, 0.16, 4, 12), hoodie, torso)
  pocket.rotation.z = Math.PI / 2
  pocket.position.set(0, 0.12, -0.112)
  const hood = mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7), hoodie, torso)
  hood.scale.set(0.13, 0.09, 0.1)
  hood.position.set(0, 0.43, 0.075)
  hood.rotation.x = -0.5
  const neck = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16), skin, torso)
  neck.position.set(0, 0.52, -0.01)
  const shoulderL = new THREE.Object3D()
  const shoulderR = new THREE.Object3D()
  shoulderL.position.set(-0.175, 0.405, 0)
  shoulderR.position.set(0.175, 0.405, 0)
  torso.add(shoulderL, shoulderR)
  for (const s of [shoulderL, shoulderR]) {
    const cap = mesh(new THREE.SphereGeometry(0.062, 20, 14), hoodie, s)
    cap.scale.set(1, 0.9, 1)
  }

  // ── Head ───────────────────────────────────────────────────────────────
  const head = new THREE.Group()
  head.position.set(0, 0.6, -0.015)
  torso.add(head)
  const skull = mesh(new THREE.SphereGeometry(0.1, 32, 24), skin, head)
  skull.scale.set(0.93, 1.1, 1.02)
  const jaw = mesh(new THREE.SphereGeometry(0.075, 24, 16), skin, head)
  jaw.position.set(0, -0.055, -0.03)
  jaw.scale.set(0.95, 0.8, 1)
  const nose = mesh(new THREE.ConeGeometry(0.014, 0.035, 10), skin, head)
  nose.rotation.x = -Math.PI / 2 - 0.3
  nose.position.set(0, -0.01, -0.108)
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.026, 12, 10), skin, head)
    ear.scale.set(0.45, 1, 0.7)
    ear.position.set(sx * 0.094, -0.005, 0.01)
  }
  mesh(hairGeometry(), hairMat, head).position.set(0, 0.012, 0.004)
  const band = mesh(new THREE.TorusGeometry(0.122, 0.011, 8, 32, Math.PI), blackMat, head)
  band.position.set(0, 0.012, 0.01)
  for (const sx of [-1, 1]) {
    const cup = mesh(new THREE.CylinderGeometry(0.044, 0.046, 0.032, 24), tealMat, head)
    cup.rotation.z = Math.PI / 2
    cup.position.set(sx * 0.115, -0.012, 0.01)
    const pad = mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 20), blackMat, head)
    pad.rotation.y = Math.PI / 2
    pad.position.set(sx * 0.1, -0.012, 0.01)
  }

  // ── Arms and hands ─────────────────────────────────────────────────────
  interface Arm {
    shoulder: THREE.Object3D
    side: number
    upper: THREE.Mesh
    fore: THREE.Mesh
    elbow: THREE.Mesh
    cuff: THREE.Mesh
    hand: THREE.Group
    fingers: THREE.Object3D[]
    press: number[]
    target: THREE.Vector3
    desired: THREE.Vector3
    jitter: THREE.Vector3
  }
  const buildArm = (shoulder: THREE.Object3D, side: number): Arm => {
    const upper = mesh(new THREE.CapsuleGeometry(0.052, UPPER - 0.05, 6, 16), hoodie)
    const fore = mesh(new THREE.CapsuleGeometry(0.044, FORE - 0.06, 6, 16), hoodie)
    const elbow = mesh(new THREE.SphereGeometry(0.05, 16, 12), hoodie)
    const cuff = mesh(new THREE.CylinderGeometry(0.038, 0.04, 0.03, 16), hoodie)
    const hand = new THREE.Group()
    root.add(hand)
    const palm = mesh(new THREE.CapsuleGeometry(0.03, 0.035, 4, 12), skin, hand)
    palm.rotation.x = Math.PI / 2
    palm.scale.set(1.25, 1, 0.55)
    palm.position.z = 0.035
    const fingers: THREE.Object3D[] = []
    for (let i = 0; i < 4; i++) {
      const pivot = new THREE.Group()
      pivot.position.set((i - 1.5) * 0.017 * side, -0.004, 0.072)
      hand.add(pivot)
      const finger = mesh(new THREE.CapsuleGeometry(0.0085, 0.03 + (i === 1 || i === 2 ? 0.008 : 0), 4, 8), skin, pivot)
      finger.rotation.x = Math.PI / 2 + 0.35
      finger.position.set(0, -0.008, 0.018)
      fingers.push(pivot)
    }
    const thumb = mesh(new THREE.CapsuleGeometry(0.01, 0.028, 4, 8), skin, hand)
    thumb.position.set(-side * 0.04, -0.006, 0.05)
    thumb.rotation.set(Math.PI / 2, 0, side * 0.7)
    return {
      shoulder,
      side,
      upper,
      fore,
      elbow,
      cuff,
      hand,
      fingers,
      press: [0, 0, 0, 0],
      target: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      jitter: new THREE.Vector3(),
    }
  }
  const left = buildArm(shoulderL, -1)
  const right = buildArm(shoulderR, 1)
  const arms = [left, right]

  // Rest positions on the desk.
  const keyLeft = props.keyboard.clone().add(v(-0.1, 0.035, 0.02))
  const keyRight = props.keyboard.clone().add(v(0.09, 0.035, 0.02))
  const mouseHome = props.mouse.position.clone()
  const mugHome = props.mug.position.clone()
  const mugGrip = v(-0.085, 0.05, 0.0)
  const sipPoint = v(-0.13, 1.13, -0.86)
  left.target.copy(keyLeft)
  right.target.copy(keyRight)

  const tmp = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const pole = new THREE.Vector3()
  const elbowPos = new THREE.Vector3()
  const solve = (arm: Arm) => {
    const s = arm.shoulder.getWorldPosition(new THREE.Vector3())
    const t = arm.target
    dir.copy(t).sub(s)
    const dist = Math.min(dir.length(), UPPER + FORE - 0.002)
    dir.normalize()
    const cosA = (UPPER * UPPER + dist * dist - FORE * FORE) / (2 * UPPER * dist)
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA))
    pole.set(arm.side * 0.9, -1, 0.35).normalize()
    pole.sub(tmp.copy(dir).multiplyScalar(pole.dot(dir))).normalize()
    elbowPos.copy(s).addScaledVector(dir, UPPER * cosA).addScaledVector(pole, UPPER * sinA)
    const wrist = tmp.copy(s).addScaledVector(dir, dist)
    capsuleBetween(arm.upper, s, elbowPos)
    capsuleBetween(arm.fore, elbowPos, wrist)
    arm.elbow.position.copy(elbowPos)
    capsuleBetween(arm.cuff, wrist.clone().lerp(elbowPos, 0.12), wrist)
    arm.hand.position.copy(wrist)
    const forward = wrist.clone().sub(elbowPos)
    forward.y *= 0.3
    arm.hand.lookAt(wrist.add(forward.normalize()))
  }

  // ── Routine ────────────────────────────────────────────────────────────
  let state: State = 'type'
  let stateTime = 0
  let stateLength = 5
  let typedRounds = 0
  let nextTap = 0
  let lean = -0.14
  const look = { yaw: 0, pitch: 0, wantYaw: 0, wantPitch: 0, next: 0 }
  let mugHeld = false

  const pickNext = () => {
    stateTime = 0
    if (state !== 'type') {
      state = 'type'
      stateLength = 3.5 + Math.random() * 3.5
      return
    }
    typedRounds++
    state = typedRounds % 3 === 0 ? 'sip' : 'mouse'
    stateLength = state === 'sip' ? 4.4 : 2.6 + Math.random() * 1.6
  }

  const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

  const update = (time: number, dt: number, reduced: boolean) => {
    if (!reduced) {
      stateTime += dt
      if (stateTime > stateLength) pickNext()
    }

    // Where each hand wants to be.
    left.desired.copy(keyLeft)
    right.desired.copy(keyRight)
    let wantLean = -0.15
    let lookAt = props.mainMonitor
    if (state === 'mouse') {
      const t = stateTime
      right.desired.copy(mouseHome).add(v(0.012 * Math.sin(t * 2.1), 0.028, 0.035 + 0.01 * Math.sin(t * 1.3)))
      wantLean = -0.11
      if (t > 0.8 && t < 2.2) lookAt = props.sideMonitor
    } else if (state === 'sip') {
      const t = stateTime
      wantLean = -0.04
      const reach = mugHome.clone().add(mugGrip)
      if (t < 0.9) left.desired.copy(keyLeft).lerp(reach, ease(t / 0.9))
      else if (t < 1.8) left.desired.copy(reach).lerp(sipPoint, ease((t - 0.9) / 0.9))
      else if (t < 2.7) left.desired.copy(sipPoint)
      else if (t < 3.5) left.desired.copy(sipPoint).lerp(reach, ease((t - 2.7) / 0.8))
      else left.desired.copy(reach).lerp(keyLeft, ease((t - 3.5) / 0.9))
      mugHeld = t > 0.9 && t < 3.5
      if (t > 1.6 && t < 2.8) lookAt = sipPoint.clone().add(v(0, 0.2, -0.6))
    }

    // Typing: small hops between keys and finger presses.
    if (!reduced && time > nextTap) {
      nextTap = time + 0.08 + Math.random() * 0.1
      for (const arm of arms) {
        const typing = state === 'type' || (state === 'mouse' && arm === left) || (state === 'sip' && arm === right)
        if (!typing) continue
        if (state === 'type') arm.jitter.set((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.03)
        arm.press[Math.floor(Math.random() * 4)] = state === 'type' ? 1 : 0.4
      }
    }
    for (const arm of arms) {
      const onKeys = arm.desired.equals(arm === left ? keyLeft : keyRight)
      if (onKeys && state === 'type') arm.desired.add(arm.jitter)
      const k = 1 - Math.exp(-dt * (state === 'sip' && arm === left ? 9 : 12))
      arm.target.lerp(arm.desired, reduced ? 1 : k)
      arm.press.forEach((p, i) => {
        arm.fingers[i].rotation.x = p * 0.45
        arm.press[i] = Math.max(0, p - dt * 9)
      })
    }

    // Props follow the hands.
    if (state === 'mouse') props.mouse.position.set(right.target.x, mouseHome.y, right.target.z - 0.035)
    else props.mouse.position.lerp(mouseHome, 1 - Math.exp(-dt * 6))
    if (mugHeld) {
      props.mug.position.copy(left.target).sub(mugGrip)
      const lift = ease((left.target.y - mugHome.y - mugGrip.y) / (sipPoint.y - mugHome.y - mugGrip.y))
      props.mug.rotation.z = -lift * 0.9
    } else {
      props.mug.position.copy(mugHome)
      props.mug.rotation.z = 0
    }

    // Body: lean, breathing, eye line with quick saccades.
    lean += (wantLean - lean) * (1 - Math.exp(-dt * 2.5))
    torso.rotation.x = lean
    const breath = reduced ? 0 : Math.sin(time * 1.5)
    torso.scale.set(1 + breath * 0.006, 1 + breath * 0.008, 1 + breath * 0.01)
    if (time > look.next || reduced) {
      head.updateWorldMatrix(true, false)
      const from = head.getWorldPosition(new THREE.Vector3())
      const to = lookAt.clone().add(reduced ? v(0, 0, 0) : v((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.08, 0))
      const d = to.sub(from)
      look.wantYaw = -Math.atan2(d.x, -d.z)
      look.wantPitch = Math.atan2(d.y, Math.hypot(d.x, d.z))
      look.next = time + 0.6 + Math.random() * 1.4
    }
    const kl = reduced ? 1 : 1 - Math.exp(-dt * 7)
    look.yaw += (look.wantYaw - look.yaw) * kl
    look.pitch += (look.wantPitch - look.pitch) * kl
    head.rotation.set(look.pitch - lean + (state === 'sip' && mugHeld ? 0.12 : 0), look.yaw, 0, 'YXZ')

    root.updateMatrixWorld(true)
    arms.forEach(solve)
  }

  update(0, 0, true)

  return {
    update,
    dispose() {
      disposables.forEach((item) => item.dispose())
    },
  }
}

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

/** Where the sit-stand desk is, and how far he is through standing up. */
export interface DeskPose {
  /** Metres the desk top has risen above its sitting height. */
  lift: number
  /** 0 seated, 1 standing. */
  stand: number
  /** True while he's holding the desk's up/down button. */
  deskMoving: boolean
  /** World position of the desk's control panel. */
  panel: THREE.Vector3
}

const UPPER = 0.29
const FORE = 0.27
const HIPS = new THREE.Vector3(-0.1, 0.56, -0.66)
// Standing, a step closer to the desk.
const HIPS_STAND = new THREE.Vector3(-0.1, 0.97, -0.8)
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

  // ── Legs: seated and standing poses, blended as he gets up ─────────────
  interface Leg {
    thigh: THREE.Mesh
    shin: THREE.Mesh
    kneeCap: THREE.Mesh
    shoe: THREE.Mesh
    sole: THREE.Mesh
    sit: { hip: THREE.Vector3; knee: THREE.Vector3; ankle: THREE.Vector3 }
    stand: { hip: THREE.Vector3; knee: THREE.Vector3; ankle: THREE.Vector3 }
  }
  const legs: Leg[] = []
  for (const [sx, reach] of [
    [-0.095, 0],
    [0.095, 0.05],
  ] as const) {
    const hip = v(HIPS.x + sx, HIPS.y, HIPS.z + 0.02)
    const knee = v(HIPS.x + sx * 1.15, HIPS.y + 0.02, HIPS.z - 0.4 - reach * 0.3)
    const ankle = v(HIPS.x + sx * 1.2, 0.1, knee.z - 0.06 - reach)
    const sHip = v(HIPS_STAND.x + sx, HIPS_STAND.y, HIPS_STAND.z + 0.02)
    const sKnee = v(HIPS_STAND.x + sx * 1.05, 0.53, HIPS_STAND.z - 0.03 - reach * 0.2)
    const sAnkle = v(HIPS_STAND.x + sx * 1.1, 0.1, HIPS_STAND.z + 0.01 - reach * 0.3)
    const thigh = mesh(new THREE.CapsuleGeometry(0.075, 0.4 - 0.1, 6, 16), pants)
    const shin = mesh(new THREE.CapsuleGeometry(0.058, 0.45 - 0.06, 6, 16), pants)
    const kneeCap = mesh(new THREE.SphereGeometry(0.068, 16, 12), pants)
    const shoe = mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 16), shoeMat)
    shoe.rotation.x = Math.PI / 2
    shoe.scale.set(1.05, 1, 0.75)
    const sole = mesh(new THREE.BoxGeometry(0.1, 0.02, 0.27), soleMat)
    legs.push({ thigh, shin, kneeCap, shoe, sole, sit: { hip, knee, ankle }, stand: { hip: sHip, knee: sKnee, ankle: sAnkle } })
  }
  const jHip = new THREE.Vector3()
  const jKnee = new THREE.Vector3()
  const jAnkle = new THREE.Vector3()
  // Stretch a capsule between two joints, scaling it to the gap.
  const limb = (m: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, nominal: number) => {
    capsuleBetween(m, from, to)
    m.scale.y = from.distanceTo(to) / nominal
  }
  const poseLegs = (s: number) => {
    for (const leg of legs) {
      jHip.lerpVectors(leg.sit.hip, leg.stand.hip, s)
      jKnee.lerpVectors(leg.sit.knee, leg.stand.knee, s)
      // Knees come forward mid-rise, as weight shifts over the feet.
      jKnee.z -= 0.08 * Math.sin(Math.PI * s)
      jAnkle.lerpVectors(leg.sit.ankle, leg.stand.ankle, s)
      limb(leg.thigh, jHip, jKnee, 0.4)
      limb(leg.shin, jKnee, jAnkle, 0.45)
      leg.kneeCap.position.copy(jKnee)
      leg.shoe.position.set(jAnkle.x, 0.045, jAnkle.z - 0.07)
      leg.sole.position.set(jAnkle.x, 0.012, jAnkle.z - 0.07)
    }
  }
  poseLegs(0)
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

  const lifted = new THREE.Vector3()
  const hips = new THREE.Vector3()
  const deskKeyLeft = new THREE.Vector3()
  const deskKeyRight = new THREE.Vector3()
  const deskMouse = new THREE.Vector3()
  const deskMug = new THREE.Vector3()
  const sip = new THREE.Vector3()
  const mainLook = new THREE.Vector3()
  const sideLook = new THREE.Vector3()

  const update = (time: number, dt: number, reduced: boolean, pose: DeskPose = { lift: 0, stand: 0, deskMoving: false, panel: v(0, 0, 0) }) => {
    // Everything on the desk rides up with it.
    lifted.set(0, pose.lift, 0)
    deskKeyLeft.copy(keyLeft).add(lifted)
    deskKeyRight.copy(keyRight).add(lifted)
    deskMouse.copy(mouseHome).add(lifted)
    deskMug.copy(mugHome).add(lifted)
    mainLook.copy(props.mainMonitor).add(lifted)
    sideLook.copy(props.sideMonitor).add(lifted)
    const standEase = ease(pose.stand)
    hips.lerpVectors(HIPS, HIPS_STAND, standEase)
    sip.copy(sipPoint).y += hips.y - HIPS.y
    sip.z += hips.z - HIPS.z
    torso.position.copy(hips)
    pelvis.position.copy(hips)
    poseLegs(standEase)

    // Hands on the desk buttons: hold the routine until the desk stops.
    if (pose.deskMoving || (pose.stand > 0 && pose.stand < 1)) {
      state = 'type'
      stateTime = 0
    } else if (!reduced) {
      stateTime += dt
      if (stateTime > stateLength) pickNext()
    }

    // Where each hand wants to be.
    left.desired.copy(deskKeyLeft)
    right.desired.copy(deskKeyRight)
    let wantLean = THREE.MathUtils.lerp(-0.15, -0.06, standEase)
    let lookAt = mainLook
    if (pose.deskMoving) {
      right.desired.copy(pose.panel)
      left.desired.copy(hips).add(v(-0.06, 0.1, -0.24))
      lookAt = pose.panel
    } else if (pose.stand > 0 && pose.stand < 1) {
      // Getting up or sitting down: hands on the desk edge for support.
      left.desired.copy(deskKeyLeft).add(v(-0.08, -0.01, 0.1))
      right.desired.copy(deskKeyRight).add(v(0.08, -0.01, 0.1))
    }
    if (state === 'mouse') {
      const t = stateTime
      right.desired.copy(deskMouse).add(v(0.012 * Math.sin(t * 2.1), 0.028, 0.035 + 0.01 * Math.sin(t * 1.3)))
      wantLean += 0.04
      if (t > 0.8 && t < 2.2) lookAt = sideLook
    } else if (state === 'sip') {
      const t = stateTime
      wantLean += 0.11
      const reach = deskMug.clone().add(mugGrip)
      if (t < 0.9) left.desired.copy(deskKeyLeft).lerp(reach, ease(t / 0.9))
      else if (t < 1.8) left.desired.copy(reach).lerp(sip, ease((t - 0.9) / 0.9))
      else if (t < 2.7) left.desired.copy(sip)
      else if (t < 3.5) left.desired.copy(sip).lerp(reach, ease((t - 2.7) / 0.8))
      else left.desired.copy(reach).lerp(deskKeyLeft, ease((t - 3.5) / 0.9))
      mugHeld = t > 0.9 && t < 3.5
      if (t > 1.6 && t < 2.8) lookAt = sip.clone().add(v(0, 0.2, -0.6))
    } else mugHeld = false

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
      const onKeys = arm.desired.equals(arm === left ? deskKeyLeft : deskKeyRight)
      if (onKeys && state === 'type') arm.desired.add(arm.jitter)
      const k = 1 - Math.exp(-dt * (state === 'sip' && arm === left ? 9 : 12))
      arm.target.lerp(arm.desired, reduced ? 1 : k)
      arm.press.forEach((p, i) => {
        arm.fingers[i].rotation.x = p * 0.45
        arm.press[i] = Math.max(0, p - dt * 9)
      })
    }

    // Props follow the hands.
    if (state === 'mouse') props.mouse.position.set(right.target.x, deskMouse.y, right.target.z - 0.035)
    else {
      props.mouse.position.lerp(deskMouse, 1 - Math.exp(-dt * 6))
      // Ride the desk exactly, rather than lagging behind it.
      props.mouse.position.y = deskMouse.y
    }
    if (mugHeld) {
      props.mug.position.copy(left.target).sub(mugGrip)
      const raised = ease((left.target.y - deskMug.y - mugGrip.y) / (sip.y - deskMug.y - mugGrip.y))
      props.mug.rotation.z = -raised * 0.9
    } else {
      props.mug.position.copy(deskMug)
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

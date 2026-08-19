import { useEffect, useRef } from "react";

export type FurnitureKind = "bedrooms" | "sofas" | "kids";
export type WoodTone = "walnut" | "honey" | "ivory";
type FurnitureStageProps = { kind: FurnitureKind; tone: WoodTone };

declare global {
  interface Window { THREE?: any }
}

const tones: Record<WoodTone, string> = { walnut: "#633b24", honey: "#ca872f", ivory: "#ded4c1" };
const THREE_SOURCE = "https://unpkg.com/three@0.185.1/build/three.min.js";

function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise<any>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-didi-three]');
    if (existing) { existing.addEventListener("load", () => resolve(window.THREE), { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
    const script = document.createElement("script"); script.dataset.didiThree = "true"; script.src = THREE_SOURCE; script.async = true;
    script.onload = () => resolve(window.THREE); script.onerror = () => reject(new Error("Three.js could not load")); document.head.appendChild(script);
  });
}

export default function FurnitureStage({ kind, tone }: FurnitureStageProps) {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true; let frame = 0; let renderer: any; let resizeObserver: ResizeObserver | undefined;
    loadThree().then(THREE => {
      if (!active || !mount.current || !THREE) return;
      const host = mount.current; const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(32, 1, .1, 100); camera.position.set(5.5, 3.25, 7.2); camera.lookAt(0, .7, 0);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); host.appendChild(renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffead0, 1.1)); const key = new THREE.DirectionalLight(0xffdfaa, 2.5); key.position.set(4, 7, 5); scene.add(key); const fill = new THREE.PointLight(0xd89036, 14); fill.position.set(-5, 2, -4); scene.add(fill);
      const group = new THREE.Group(); scene.add(group); const wood = tones[tone]; const linen = tone === "ivory" ? "#b2a18a" : "#ddc9a9";
      const addBox = (position: number[], size: number[], color: string, roughness = .6) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, roughness })); mesh.position.set(...position); group.add(mesh); };
      if (kind === "bedrooms") { addBox([0,.15,0],[3.6,.35,2.25],wood,.43); addBox([0,.62,.08],[3.28,.56,2.02],linen,.78); addBox([0,1.9,.88],[3.6,2.1,.15],wood,.35); addBox([-1.05,.98,.12],[1.15,.34,.15],"#f0e3d1",.9); addBox([1.05,.98,.12],[1.15,.34,.15],"#f0e3d1",.9); }
      if (kind === "sofas") { addBox([0,.48,0],[4.1,.9,1.35],linen,.9); addBox([0,1.5,.42],[4.1,1.25,.48],linen,.86); addBox([-1.78,.96,0],[.55,1,1.35],linen,.86); addBox([1.78,.96,0],[.55,1,1.35],linen,.86); addBox([0,-.15,.45],[3.85,.25,.25],wood,.36); }
      if (kind === "kids") { addBox([0,.48,0],[3.6,.4,1.85],wood,.45); addBox([0,1.32,.62],[3.6,1.35,.18],wood,.4); addBox([.62,1.1,-.22],[1.55,.8,1.38],"#f4e7d5",.88); addBox([-1.18,.9,-.18],[.72,.95,1.35],"#b67a38",.52); }
      const draw = () => { if (!active) return; group.rotation.y += .004; renderer.render(scene, camera); frame = requestAnimationFrame(draw); };
      const resize = () => { const { width, height } = host.getBoundingClientRect(); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
      resize(); resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); draw();
    }).catch(() => undefined);
    return () => { active = false; cancelAnimationFrame(frame); resizeObserver?.disconnect(); renderer?.dispose(); mount.current?.replaceChildren(); };
  }, [kind, tone]);
  return <div ref={mount} className="furniture-canvas" aria-label="Interactive three-dimensional furniture study" />;
}

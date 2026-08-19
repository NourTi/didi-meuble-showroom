import * as THREE from "three";
import { useEffect, useRef } from "react";

export type FurnitureKind = "bedrooms" | "sofas" | "kids";
export type WoodTone = "walnut" | "honey" | "ivory";
type FurnitureStageProps = { kind: FurnitureKind; tone: WoodTone };

const tones: Record<WoodTone, string> = { walnut: "#5b2f1c", honey: "#bc7624", ivory: "#d8cbb6" };

export default function FurnitureStage({ kind, tone }: FurnitureStageProps) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(5.8, 3.15, 7.2);
    camera.lookAt(0, 0.65, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.replaceChildren(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.set(0.14, -0.5, 0);
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0xffead2, 0x23150e, 1.7));
    const key = new THREE.DirectionalLight(0xffc66d, 2.8);
    key.position.set(5, 7, 4);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.PointLight(0xcb6f29, 24, 15);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(4.4, 64), new THREE.MeshBasicMaterial({ color: 0x110b08, transparent: true, opacity: 0.36 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.23;
    scene.add(shadow);

    const wood = tones[tone];
    const linen = tone === "ivory" ? "#baa98d" : "#e0ccb0";
    const materials: THREE.Material[] = [];
    const box = (position: [number, number, number], size: [number, number, number], color: string, roughness = 0.55) => {
      const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: color === wood ? 0.08 : 0 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      materials.push(material);
    };

    if (kind === "bedrooms") {
      box([0, 0.1, 0], [3.8, 0.3, 2.35], wood, 0.35);
      box([0, 0.55, 0.05], [3.45, 0.6, 2.08], linen, 0.82);
      box([0, 1.9, 0.93], [3.8, 2.15, 0.16], wood, 0.37);
      box([-1.1, 0.98, 0.12], [1.15, 0.32, 0.17], "#f0e4d2", 0.93);
      box([1.1, 0.98, 0.12], [1.15, 0.32, 0.17], "#f0e4d2", 0.93);
      box([-2.5, 0.25, 0.2], [0.58, 0.66, 0.66], wood, 0.38);
    } else if (kind === "sofas") {
      box([0, 0.42, 0], [4.25, 0.78, 1.46], linen, 0.9);
      box([0, 1.44, 0.42], [4.25, 1.26, 0.5], linen, 0.86);
      box([-1.85, 0.92, 0], [0.56, 1.02, 1.46], linen, 0.86);
      box([1.85, 0.92, 0], [0.56, 1.02, 1.46], linen, 0.86);
      box([0, -0.06, 0.48], [4.04, 0.2, 0.22], wood, 0.35);
      box([0, 0.82, -0.43], [3.44, 0.18, 0.18], "#9c6329", 0.38);
    } else {
      box([0, 0.38, 0], [3.6, 0.38, 1.82], wood, 0.42);
      box([0, 1.28, 0.62], [3.6, 1.3, 0.16], wood, 0.38);
      box([0.64, 1.03, -0.2], [1.58, 0.74, 1.35], "#f4e7d5", 0.9);
      box([-1.18, 0.86, -0.18], [0.72, 0.92, 1.32], "#b86f2d", 0.5);
      box([2.35, 0.42, 0.2], [0.48, 0.86, 0.7], wood, 0.38);
    }

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetY = group.rotation.y;
    let targetX = group.rotation.x;

    const startDrag = (event: PointerEvent) => { dragging = true; lastX = event.clientX; lastY = event.clientY; host.setPointerCapture?.(event.pointerId); };
    const moveDrag = (event: PointerEvent) => {
      if (!dragging) return;
      targetY += (event.clientX - lastX) * 0.012;
      targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * 0.004, -0.1, 0.45);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const endDrag = () => { dragging = false; };
    host.addEventListener("pointerdown", startDrag);
    host.addEventListener("pointermove", moveDrag);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointerleave", endDrag);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    const render = () => {
      if (!dragging) targetY += 0.0024;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.07);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.07);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointerdown", startDrag);
      host.removeEventListener("pointermove", moveDrag);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointerleave", endDrag);
      group.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
      materials.forEach(material => material.dispose());
      renderer.dispose();
      host.replaceChildren();
    };
  }, [kind, tone]);

  return <div ref={mount} className="furniture-canvas" role="img" aria-label="نموذج أثاث ثلاثي الأبعاد قابل للدوران" />;
}

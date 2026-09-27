"use client";

import * as React from "react";
import * as THREE from "three";
import type { Billboard } from "@/lib/data";

type Props = { billboard: Billboard };

function billboardTexture(billboard: Billboard) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 760;
  const ctx = canvas.getContext("2d")!;
  const accent = billboard.accent;
  const bg = billboard.surface;
  const gradient = ctx.createLinearGradient(0, 0, 1600, 760);
  gradient.addColorStop(0, bg);
  gradient.addColorStop(0.62, "#080B16");
  gradient.addColorStop(1, "#11102A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1600, 760);

  const glow = ctx.createRadialGradient(1230, 230, 10, 1230, 230, 520);
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(700, 0, 900, 760);

  ctx.strokeStyle = accent + "40";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(1270, 300, 150 + i * 75, Math.PI * 0.1, Math.PI * 1.2);
    ctx.stroke();
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 30px Inter, Arial";
  ctx.fillText("#1  TOP SPOT · LIVE NOW", 70, 76);

  ctx.fillStyle = accent;
  ctx.font = "800 74px Inter, Arial";
  ctx.fillText(billboard.company, 70, 175);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 72px Inter, Arial";
  const words = billboard.headline.split(" ");
  let line = "";
  let y = 280;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > 760) {
      ctx.fillText(line, 70, y);
      y += 82;
      line = word;
    } else line = test;
  }
  if (line) ctx.fillText(line, 70, y);

  ctx.fillStyle = "#A9B0C2";
  ctx.font = "400 27px Inter, Arial";
  ctx.fillText(billboard.subheadline, 70, 585);

  ctx.fillStyle = accent;
  ctx.roundRect(70, 630, 250, 62, 18);
  ctx.fill();
  ctx.fillStyle = billboard.logoText;
  ctx.font = "800 25px Inter, Arial";
  ctx.fillText("VISIT BRAND  →", 112, 670);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 30px Inter, Arial";
  ctx.fillText("#1  ₹" + billboard.price.toLocaleString("en-IN"), 1190, 675);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createPerson(material: THREE.Material, skin: THREE.Material, scale: number, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.65, 4, 8), material);
  body.position.y = 1.05;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), skin);
  head.position.y = 1.72;
  group.add(head);

  const legGeo = new THREE.BoxGeometry(0.12, 0.65, 0.14);
  const left = new THREE.Mesh(legGeo, material);
  const right = new THREE.Mesh(legGeo, material);
  left.position.set(-0.09, 0.48, 0);
  right.position.set(0.09, 0.48, 0);
  group.add(left, right);

  const armGeo = new THREE.CapsuleGeometry(0.055, 0.42, 3, 6);
  const armL = new THREE.Mesh(armGeo, material);
  const armR = new THREE.Mesh(armGeo, material);
  armL.position.set(-0.28, 1.12, 0);
  armR.position.set(0.28, 1.12, 0);
  armL.rotation.z = -0.18;
  armR.rotation.z = 0.18;
  group.add(armL, armR);

  group.userData.walkOffset = Math.random() * Math.PI * 2;
  group.userData.walkSpeed = 0.7 + Math.random() * 0.55;
  return group;
}

export function ThreeDBillboard({ billboard }: Props) {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#060914", 0.045);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.8, 4.4, 15.5);
    camera.lookAt(0, 3.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.y = -0.08;
    scene.add(group);

    scene.add(new THREE.HemisphereLight("#A8C7FF", "#050505", 1.2));
    const key = new THREE.DirectionalLight("#FFFFFF", 2.4);
    key.position.set(-4, 9, 10);
    scene.add(key);
    const rim = new THREE.PointLight(billboard.accent, 18, 18);
    rim.position.set(5, 5, 2);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 22),
      new THREE.MeshStandardMaterial({ color: "#070A10", roughness: 0.94, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    group.add(ground);

    const cityMat = new THREE.MeshStandardMaterial({ color: "#101522", roughness: 0.9, metalness: 0.1 });
    for (let i = 0; i < 13; i++) {
      const w = 1.1 + (i % 4) * 0.5;
      const h = 2.2 + ((i * 17) % 9) * 0.35;
      const d = 1.2 + (i % 3) * 0.45;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cityMat);
      b.position.set(-8 + i * 1.35, h / 2, -4.4 - (i % 3) * 0.8);
      group.add(b);
      const windows = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.55, h * 0.65),
        new THREE.MeshBasicMaterial({ color: i % 2 ? "#27334D" : "#38415A", transparent: true, opacity: 0.7 })
      );
      windows.position.set(b.position.x, h * 0.55, b.position.z + d / 2 + 0.01);
      group.add(windows);
    }

    const frameMat = new THREE.MeshStandardMaterial({ color: "#20242D", metalness: 0.8, roughness: 0.28 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(11.8, 5.75, 0.42), frameMat);
    frame.position.set(0, 4.25, 0);
    group.add(frame);

    const screenTexture = billboardTexture(billboard);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(11.35, 5.4),
      new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
    );
    screen.position.set(0, 4.25, 0.24);
    group.add(screen);

    const glowMat = new THREE.MeshBasicMaterial({ color: billboard.accent, transparent: true, opacity: 0.75 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 5.75), glowMat);
    glow.position.set(0, 4.25, 0.04);
    glow.scale.set(1.015, 1.015, 1);
    glow.material.blending = THREE.AdditiveBlending;
    glow.renderOrder = -1;
    group.add(glow);

    const poleMat = new THREE.MeshStandardMaterial({ color: "#171A22", metalness: 0.75, roughness: 0.35 });
    for (const x of [-4.65, 4.65]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 10), poleMat);
      pole.position.set(x, 1.4, 0);
      group.add(pole);
    }

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.08, 0.08), glowMat);
    topBar.position.set(0, 7.17, 0.18);
    group.add(topBar);

    for (let i = -4; i <= 4; i += 2) {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 8),
        new THREE.MeshBasicMaterial({ color: "#FFF3C4" })
      );
      lamp.position.set(i, 7.28, 0.22);
      group.add(lamp);
      const light = new THREE.PointLight("#FFF0BE", 4.5, 2.4);
      light.position.copy(lamp.position);
      group.add(light);
    }

    const people = new THREE.Group();
    group.add(people);
    const skin = new THREE.MeshStandardMaterial({ color: "#8E6E59", roughness: 0.95 });
    const clothes = ["#151A24", "#20242D", "#2C3140", "#10131A", "#3A2D32"].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.96 }));
    for (let i = 0; i < 22; i++) {
      const person = createPerson(clothes[i % clothes.length], skin, 0.75 + Math.random() * 0.65, -7.5 + Math.random() * 15, 2.1 + Math.random() * 4.7);
      person.rotation.y = Math.PI + (Math.random() - 0.5) * 0.22;
      people.add(person);
    }

    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      people.children.forEach((p, i) => {
        const offset = Number(p.userData.walkOffset) || 0;
        const speed = Number(p.userData.walkSpeed) || 1;
        p.position.z += Math.sin(t * 0.12 + i) * 0.0008;
        p.rotation.y = Math.PI + Math.sin(t * 0.35 * speed + offset) * 0.035;
        p.children.forEach((part, index) => {
          if (index === 2 || index === 3) part.rotation.x = Math.sin(t * 4 * speed + offset) * 0.18 * (index === 2 ? 1 : -1);
        });
      });
      screenTexture.needsUpdate = false;
      group.rotation.y = -0.08 + Math.sin(t * 0.16) * 0.012;
      renderer.render(scene, camera);
    };
    animate();

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      screenTexture.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse(obj => {
        if ("geometry" in obj && obj.geometry instanceof THREE.BufferGeometry) obj.geometry.dispose();
        if ("material" in obj) {
          const material = obj.material;
          if (Array.isArray(material)) material.forEach(m => m.dispose());
          else if (material instanceof THREE.Material) material.dispose();
        }
      });
    };
  }, [billboard]);

  return <div ref={mountRef} className="absolute inset-0" aria-label="Interactive 3D city billboard with a walking crowd" role="img" />;
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getMeshUrl } from "@/lib/api";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";
import GemMesh from "./GemMesh";

interface StonePlacement {
  position: [number, number, number];
  normal: [number, number, number];
}

export default function GeneratedMeshViewer({ designId }: { designId: string }) {
  const url = useMemo(() => getMeshUrl(designId), [designId]);
  const design = useJewelryStore((s) => s.design);
  const groupRef = useRef<THREE.Group>(null);
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [centered, setCentered] = useState(false);
  const [stonePlacements, setStonePlacements] = useState<StonePlacement[]>([]);
  const { scene: r3fScene } = useThree();

  // ── Effect 1: Load the mesh ──
  useEffect(() => {
    let cancelled = false;
    setCentered(false);
    setStonePlacements([]);

    async function loadMesh() {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
          new GLTFLoader().load(url, resolve, undefined, reject);
        });
        if (!cancelled) setScene(gltf.scene);
        return;
      } catch (e) {
        console.warn("[MeshViewer] GLB load failed:", e);
      }

      try {
        const obj = await new Promise<THREE.Group>((resolve, reject) => {
          new OBJLoader().load(url, resolve, undefined, reject);
        });
        if (!cancelled) setScene(obj);
      } catch (e) {
        console.warn("[MeshViewer] OBJ load failed:", e);
      }
    }

    loadMesh();
    return () => { cancelled = true; };
  }, [url]);

  // ── Effect 2: Apply metal material to the entire mesh ──
  useEffect(() => {
    if (!scene) return;

    const envMap = r3fScene.environment;
    const preset = design
      ? (METAL_PRESETS[design.metal as keyof typeof METAL_PRESETS] ?? METAL_PRESETS.yellow_gold)
      : METAL_PRESETS.yellow_gold;
    const finishExtra = design
      ? (FINISH_ROUGHNESS[design.finish as keyof typeof FINISH_ROUGHNESS] ?? 0)
      : 0;
    const metalColor = new THREE.Color(preset.color);

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.geometry && !child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }

      child.material = new THREE.MeshPhysicalMaterial({
        color: metalColor,
        metalness: preset.metalness,
        roughness: Math.min(1, preset.roughness + finishExtra),
        reflectivity: 1.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0,
        envMap: envMap ?? undefined,
        side: THREE.DoubleSide,
      });
    });
  }, [scene, design?.metal, design?.finish, r3fScene.environment]);

  // ── Effect 3: Auto-center, auto-scale, and correct orientation ──
  useEffect(() => {
    if (!scene) return;
    setCentered(false);

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 3.0 / maxDim : 1;
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    scene.scale.setScalar(scale);

    // Z-up → Y-up correction
    if (size.z > size.y * 1.5) {
      scene.rotation.x = -Math.PI / 2;
      const box2 = new THREE.Box3().setFromObject(scene);
      const center2 = box2.getCenter(new THREE.Vector3());
      scene.position.set(-center2.x, -center2.y, -center2.z);
    }

    // Force a world matrix update so raycasting works correctly
    scene.updateMatrixWorld(true);
    setCentered(true);
  }, [scene]);

  // ── Effect 4: Raycast onto the mesh surface to place stones ──
  useEffect(() => {
    if (!scene || !centered || !design) {
      setStonePlacements([]);
      return;
    }
    if (design.stone === "none" || (!design.center_stone && design.accent_count === 0)) {
      setStonePlacements([]);
      return;
    }

    const stoneCount = design.accent_count + (design.center_stone ? 1 : 0);
    if (stoneCount === 0) { setStonePlacements([]); return; }

    // Get the world-space bounding box of the centered/scaled mesh
    const box = new THREE.Box3().setFromObject(scene);
    const meshCenter = box.getCenter(new THREE.Vector3());
    const meshSize = box.getSize(new THREE.Vector3());

    // Determine the "hole axis" — the thinnest dimension of the bounding box.
    // For a bracelet/ring lying flat: Y is thin. For one standing up: Z or X is thin.
    const dims = [
      { axis: "x" as const, val: meshSize.x },
      { axis: "y" as const, val: meshSize.y },
      { axis: "z" as const, val: meshSize.z },
    ].sort((a, b) => a.val - b.val);
    const holeAxis = dims[0].axis; // thinnest
    const majorDim1 = dims[1].val;
    const majorDim2 = dims[2].val;

    // Ray origin distance: well outside the mesh
    const rayDist = Math.max(majorDim1, majorDim2) * 1.5;

    const raycaster = new THREE.Raycaster();
    const placements: StonePlacement[] = [];

    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2;

      // Build ray origin and direction based on the hole axis
      const origin = new THREE.Vector3();
      const dir = new THREE.Vector3();

      if (holeAxis === "y") {
        // Bracelet in XZ plane — rays shoot inward in XZ
        origin.set(
          meshCenter.x + Math.cos(angle) * rayDist,
          meshCenter.y,
          meshCenter.z + Math.sin(angle) * rayDist
        );
        dir.set(-Math.cos(angle), 0, -Math.sin(angle));
      } else if (holeAxis === "z") {
        origin.set(
          meshCenter.x + Math.cos(angle) * rayDist,
          meshCenter.y + Math.sin(angle) * rayDist,
          meshCenter.z
        );
        dir.set(-Math.cos(angle), -Math.sin(angle), 0);
      } else {
        // holeAxis === "x"
        origin.set(
          meshCenter.x,
          meshCenter.y + Math.cos(angle) * rayDist,
          meshCenter.z + Math.sin(angle) * rayDist
        );
        dir.set(0, -Math.cos(angle), -Math.sin(angle));
      }

      raycaster.set(origin, dir.normalize());
      const hits = raycaster.intersectObject(scene, true);

      if (hits.length > 0) {
        const hit = hits[0];
        // Normal from the hit face (transform to world space)
        const worldNormal = hit.face
          ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
          : dir.clone().negate();

        // Offset the gem slightly above the surface so it sits ON TOP
        const surfaceOffset = worldNormal.clone().multiplyScalar(0.01);
        const pos = hit.point.clone().add(surfaceOffset);

        placements.push({
          position: [pos.x, pos.y, pos.z],
          normal: [worldNormal.x, worldNormal.y, worldNormal.z],
        });
      }
    }

    setStonePlacements(placements);
  }, [scene, centered, design?.stone, design?.accent_count, design?.center_stone]);

  if (!scene) return null;

  // Compute gem size relative to the mesh (small enough to look like inset stones)
  const gemSize = design?.stone_size
    ? design.stone_size * 0.12
    : 0.08;

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {stonePlacements.map((sp, i) => (
        <GemMesh
          key={i}
          stone={design?.stone ?? "diamond"}
          size={gemSize}
          position={sp.position}
        />
      ))}
    </group>
  );
}

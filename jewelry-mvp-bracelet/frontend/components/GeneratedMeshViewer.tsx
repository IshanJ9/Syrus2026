"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getMeshUrl } from "@/lib/api";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";

export default function GeneratedMeshViewer({ designId }: { designId: string }) {
  const url = useMemo(() => getMeshUrl(designId), [designId]);
  const design = useJewelryStore((s) => s.design);
  const groupRef = useRef<THREE.Group>(null);
  const [scene, setScene] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMesh() {
      // Try GLB first
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
          new GLTFLoader().load(url, resolve, undefined, reject);
        });
        if (!cancelled) setScene(gltf.scene);
        return;
      } catch {}

      // Try OBJ fallback
      try {
        const obj = await new Promise<THREE.Group>((resolve, reject) => {
          new OBJLoader().load(url, resolve, undefined, reject);
        });
        if (!cancelled) setScene(obj);
        return;
      } catch {}
    }

    loadMesh();
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (!design || !scene) return;
    const preset = METAL_PRESETS[design.metal as keyof typeof METAL_PRESETS] ?? METAL_PRESETS.yellow_gold;
    const finishExtra = FINISH_ROUGHNESS[design.finish as keyof typeof FINISH_ROUGHNESS] ?? 0;
    const color = new THREE.Color(preset.color);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial();
        }
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.color = color;
        mat.metalness = preset.metalness;
        mat.roughness = Math.min(1, preset.roughness + finishExtra);
        mat.needsUpdate = true;
      }
    });
  }, [scene, design?.metal, design?.finish]);

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 3.0 / maxDim : 1;
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    scene.scale.setScalar(scale);
  }, [scene]);

  if (!scene) return null;

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

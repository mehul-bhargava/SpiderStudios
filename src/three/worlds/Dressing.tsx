"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { usePlayer } from "@/state/player";
import { useUi } from "@/state/ui";
import { Character } from "../Character";
import { Env, Particles } from "../kit";
import { colorMat, unitBox } from "../extrude";
import { useWorldReady } from "../runtime";
import { SpiderMob } from "../actors";

export default function Dressing() {
  const config = usePlayer((s) => s.config);
  const pose = useUi((s) => s.pose);
  const ref = useRef<CameraControls>(null);
  const spin = useRef<THREE.Group>(null);
  useWorldReady("dressing", true);
  useEffect(() => {
    useUi.getState().setPois([]);
    void ref.current?.setLookAt(0, 1.4, 4.6, 0, 1.05, 0, false);
  }, []);
  useFrame((_, dt) => {
    if (spin.current && pose === "walk") spin.current.rotation.y += dt * 0.2;
  });
  return (
    <>
      <Env bg="#17121c" fog={["#17121c", 8, 24]} ambient={0.9} sun={{ pos: [3, 6, 5], intensity: 1.2, color: "#fff2e0" }} />
      <pointLight position={[-3, 3, 2]} color="#e0313f" intensity={8} distance={10} />
      <CameraControls ref={ref} makeDefault minDistance={2.2} maxDistance={7} minPolarAngle={0.6} maxPolarAngle={1.75} />
      <group ref={spin}>
        <Character config={config} anim={pose} />
      </group>
      <mesh geometry={unitBox} material={colorMat("#ece6dd")} position={[0, -0.25, 0]} scale={[1.8, 0.5, 1.8]} />
      <mesh geometry={unitBox} material={colorMat("#b02e26")} position={[0, -0.02, 0]} scale={[1.5, 0.06, 1.5]} />
      <mesh geometry={unitBox} material={colorMat("#2a2228")} position={[0, -1.5, 0]} scale={[30, 2, 30]} />
      <SpiderMob position={[1.6, 0, -0.6]} rotation={[0, -0.6, 0]} scale={0.8} />
      <Particles count={40} area={[8, 4, 8]} center={[0, 1.5, 0]} color="#ff7a88" size={0.05} velocity={[0, 0.2, 0]} />
    </>
  );
}

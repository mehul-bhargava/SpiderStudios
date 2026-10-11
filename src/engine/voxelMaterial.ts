"use client";
import * as THREE from "three";
import { getAtlasCanvas } from "./textures";

let atlasTex: THREE.CanvasTexture | null = null;

export function getAtlasTexture(): THREE.CanvasTexture {
  if (atlasTex) return atlasTex;
  const t = new THREE.CanvasTexture(getAtlasCanvas());
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  atlasTex = t;
  return t;
}

const vertexShader = /* glsl */ `
attribute vec3 shade;
attribute vec3 light;
varying vec2 vUv;
varying vec3 vShade;
varying vec3 vLight;
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vShade = shade;
  vLight = light;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const fragmentShader = /* glsl */ `
uniform sampler2D map;
uniform float uSky;
uniform vec3 uSkyColor;
uniform vec3 uBlockColor;
uniform vec3 uAmbient;
uniform float uAlphaTest;
uniform float uEmissive;
varying vec2 vUv;
varying vec3 vShade;
varying vec3 vLight;
#include <fog_pars_fragment>
void main() {
  vec4 t = texture2D(map, vUv);
  if (t.a < uAlphaTest) discard;
  float s = pow(vLight.x, 1.5) * uSky;
  float b = pow(vLight.y, 1.7);
  vec3 L = uSkyColor * s + uBlockColor * b * (1.0 - s * 0.6) + uAmbient;
  vec3 lit = t.rgb * vShade * L;
  vec3 col = mix(lit, t.rgb * uEmissive, vLight.z);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export type VoxelLook = {
  sky?: number;
  skyColor?: string;
  blockColor?: string;
  ambient?: string;
  emissive?: number;
};

export function createVoxelMaterial(cutout: boolean, look: VoxelLook = {}): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      map: { value: null },
      uSky: { value: look.sky ?? 1 },
      uSkyColor: { value: new THREE.Color(look.skyColor ?? "#ffffff") },
      uBlockColor: { value: new THREE.Color(look.blockColor ?? "#ffcf8a") },
      uAmbient: { value: new THREE.Color(look.ambient ?? "#141418") },
      uAlphaTest: { value: cutout ? 0.5 : 0 },
      uEmissive: { value: look.emissive ?? 1.15 },
    },
  ]);
  uniforms.map.value = getAtlasTexture();
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    fog: true,
    side: cutout ? THREE.DoubleSide : THREE.FrontSide,
  });
}

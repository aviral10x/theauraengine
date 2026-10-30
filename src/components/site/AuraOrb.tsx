"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const NOISE = /* glsl */ `
// Ashima 3D simplex noise
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform vec2 uMouse;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
${NOISE}
void main(){
  vec3 p = position;
  float n = snoise(p*0.9 + vec3(uTime*0.16, uTime*0.11, uMouse.x*0.5));
  float n2 = snoise(p*2.2 - vec3(0.0, uTime*0.25, uMouse.y*0.5));
  float d = n*uAmp + n2*uAmp*0.12;
  p += normal * d;
  vNoise = n;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
void main(){
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  vec3 orange = vec3(1.0, 0.353, 0.122);
  vec3 amber  = vec3(1.0, 0.71, 0.28);
  vec3 violet = vec3(0.608, 0.482, 1.0);
  vec3 deep   = vec3(0.05, 0.03, 0.06);
  float bands = 0.5 + 0.5*sin(vNoise*6.0 + uTime*0.6);
  vec3 base = mix(orange, amber, bands);
  base = mix(base, violet, smoothstep(0.35, 1.0, vNormal.y*0.5+0.5) * 0.55);
  // Dark glassy core so type stays readable, light lives on the rim.
  vec3 col = mix(deep, base, 0.10 + 0.32*smoothstep(-0.2, 0.9, vNoise));
  vec3 rim = mix(orange, mix(amber, violet, smoothstep(-0.3, 0.6, vNormal.y)), bands);
  col += rim * pow(fres, 1.2) * 1.15;
  float alpha = 0.55 + 0.45*fres;
  gl_FragColor = vec4(col, alpha);
}`;

/** Real-time WebGL "engine" orb: noise-displaced sphere + particle halo, mouse reactive. */
export function AuraOrb({ className = "", intensity = 1 }: { className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the CSS glow behind still looks fine
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.2 * intensity },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 128),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true }),
    );
    scene.add(orb);

    // Particle halo (two tilted rings + scattered dust)
    const count = 1400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ring = i % 3;
      const a = Math.random() * Math.PI * 2;
      if (ring < 2) {
        const r = 2.05 + Math.random() * 0.35 + ring * 0.5;
        pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.06, Math.sin(a) * r], i * 3);
      } else {
        const r = 1.9 + Math.random() * 1.8;
        const phi = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(phi) * Math.cos(a), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(a)], i * 3);
      }
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0xffc58a, size: 0.018, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    particles.rotation.set(0.42, 0, 0.18);
    scene.add(particles);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(target, 0.04);
      orb.rotation.y = t * 0.12 + uniforms.uMouse.value.x * 0.5;
      orb.rotation.x = uniforms.uMouse.value.y * 0.35;
      particles.rotation.y = -t * 0.05;
      renderer.render(scene, camera);
    };
    if (reduced) renderer.render(scene, camera);
    else tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      orb.geometry.dispose();
      (orb.material as THREE.Material).dispose();
      pGeo.dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [intensity]);

  return <div ref={ref} className={className} aria-hidden />;
}

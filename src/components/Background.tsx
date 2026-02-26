"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Background({ isLoaded, setIsLoaded }: { isLoaded: boolean, setIsLoaded: (v: boolean) => void }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Strict mode safety: clear existing canvases
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, animationFrameId: number;
        const particlesData: { velocity: THREE.Vector3 }[] = [];
        const maxParticleCount = 300;
        const particleCount = window.innerWidth < 768 ? 100 : 180;
        const r = 900;
        const maxDistance = 150;

        let positions: Float32Array, colors: Float32Array;
        let particlePositions: Float32Array;
        let pointCloud: THREE.Points, linesMesh: THREE.LineSegments;

        const mouse = new THREE.Vector2(-9999, -9999);
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const mousePosition3D = new THREE.Vector3(-9999, -9999, 0);

        const getCircleTexture = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext("2d");
            if (context) {
                context.beginPath();
                context.arc(32, 32, 30, 0, Math.PI * 2, false);
                context.fillStyle = "white";
                context.fill();
            }
            return new THREE.CanvasTexture(canvas);
        };

        const init = () => {
            scene = new THREE.Scene();
            scene.background = new THREE.Color("#000000");
            scene.fog = new THREE.FogExp2("#000000", 0.0008);

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
            camera.position.z = 1000;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current?.appendChild(renderer.domElement);

            const circleTexture = getCircleTexture();

            const starsGeometry = new THREE.BufferGeometry();
            const starsVertices = [];
            for (let i = 0; i < 1500; i++) {
                starsVertices.push(
                    THREE.MathUtils.randFloatSpread(3000),
                    THREE.MathUtils.randFloatSpread(3000),
                    THREE.MathUtils.randFloatSpread(3000)
                );
            }
            starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3));
            scene.add(
                new THREE.Points(
                    starsGeometry,
                    new THREE.PointsMaterial({
                        color: 0xffffff,
                        size: 1.5,
                        transparent: true,
                        opacity: 0.5,
                        map: circleTexture,
                        depthWrite: false,
                    })
                )
            );

            const group = new THREE.Group();
            scene.add(group);

            positions = new Float32Array(maxParticleCount * maxParticleCount * 3);
            colors = new Float32Array(maxParticleCount * maxParticleCount * 3);
            particlePositions = new Float32Array(maxParticleCount * 3);

            for (let i = 0; i < maxParticleCount; i++) {
                particlePositions[i * 3] = Math.random() * r - r / 2;
                particlePositions[i * 3 + 1] = Math.random() * r - r / 2;
                particlePositions[i * 3 + 2] = Math.random() * r - r / 2;
                particlesData.push({
                    velocity: new THREE.Vector3(
                        -1 + Math.random() * 2,
                        -1 + Math.random() * 2,
                        -1 + Math.random() * 2
                    )
                        .normalize()
                        .multiplyScalar(0.18),
                });
            }

            const particles = new THREE.BufferGeometry();
            particles.setAttribute(
                "position",
                new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage)
            );

            pointCloud = new THREE.Points(
                particles,
                new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 6,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    map: circleTexture,
                    depthWrite: false,
                })
            );
            pointCloud.frustumCulled = false;
            group.add(pointCloud);

            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
            lineGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

            linesMesh = new THREE.LineSegments(
                lineGeo,
                new THREE.LineBasicMaterial({
                    vertexColors: true,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.9,
                    linewidth: 2,
                })
            );
            linesMesh.frustumCulled = false;
            group.add(linesMesh);

            setIsLoaded(true);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, mousePosition3D);
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);

        const animate = () => {
            let vertexpos = 0,
                colorpos = 0,
                numConnected = 0;

            for (let i = 0; i < particleCount; i++) {
                const pData = particlesData[i];
                particlePositions[i * 3] += pData.velocity.x;
                particlePositions[i * 3 + 1] += pData.velocity.y;
                particlePositions[i * 3 + 2] += pData.velocity.z;

                if (Math.abs(particlePositions[i * 3]) > r / 2) pData.velocity.x *= -1;
                if (Math.abs(particlePositions[i * 3 + 1]) > r / 2) pData.velocity.y *= -1;
                if (Math.abs(particlePositions[i * 3 + 2]) > r / 2) pData.velocity.z *= -1;

                const p1 = new THREE.Vector3(
                    particlePositions[i * 3],
                    particlePositions[i * 3 + 1],
                    particlePositions[i * 3 + 2]
                );

                const distToM = p1.distanceTo(mousePosition3D);
                if (distToM < maxDistance * 1.8) {
                    positions[vertexpos++] = p1.x;
                    positions[vertexpos++] = p1.y;
                    positions[vertexpos++] = p1.z;
                    positions[vertexpos++] = mousePosition3D.x;
                    positions[vertexpos++] = mousePosition3D.y;
                    positions[vertexpos++] = mousePosition3D.z;

                    const alpha = 1.0 - distToM / (maxDistance * 1.8);
                    for (let k = 0; k < 6; k++) colors[colorpos++] = alpha * 1.2;
                    numConnected++;
                }

                for (let j = i + 1; j < particleCount; j++) {
                    const p2 = new THREE.Vector3(
                        particlePositions[j * 3],
                        particlePositions[j * 3 + 1],
                        particlePositions[j * 3 + 2]
                    );
                    const d = p1.distanceTo(p2);
                    if (d < maxDistance) {
                        const a = 1.0 - d / maxDistance;
                        positions[vertexpos++] = p1.x;
                        positions[vertexpos++] = p1.y;
                        positions[vertexpos++] = p1.z;
                        positions[vertexpos++] = p2.x;
                        positions[vertexpos++] = p2.y;
                        positions[vertexpos++] = p2.z;

                        for (let k = 0; k < 6; k++) colors[colorpos++] = a * 0.8;
                        numConnected++;
                    }
                }
            }

            linesMesh.geometry.setDrawRange(0, numConnected * 2);
            linesMesh.geometry.attributes.position.needsUpdate = true;
            linesMesh.geometry.attributes.color.needsUpdate = true;
            pointCloud.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            if (mountRef.current && renderer?.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer?.dispose();
        };
    }, [setIsLoaded]);

    // Removed pointer-events-none completely. Changed z-index mapping context slightly.
    return (
        <div
            ref={mountRef}
            className={`fixed inset-0 top-0 left-0 w-full h-full -z-10 transition-opacity duration-2000 ${isLoaded ? "opacity-100" : "opacity-0"
                }`}
        />
    );
}

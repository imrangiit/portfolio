import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * RoomWarmup Component
 * 
 * Lets the active scene compile during preload without importing every room.
 * Individual rooms and their assets load only when a visitor opens them.
 */
const RoomWarmup = ({ onWarmupComplete, isLowTier }) => {
    const [isDone, setIsDone] = useState(false);
    const frameCount = useRef(0);
    const completeFired = useRef(false);
    const { gl, scene, camera } = useThree();

    // Wait for the core scene to render a few frames, then compile it.
    const warmupStart = useRef(performance.now());

    useFrame(() => {
        if (isDone || completeFired.current) return;

        frameCount.current++;

        // For low tier, we skip warmup, but still wait 1 frame for entrance to mount
        const targetFrames = isLowTier ? 1 : 3;

        if (frameCount.current >= targetFrames) {
            completeFired.current = true;

            const finishWarmup = () => {
                const warmupDuration = ((performance.now() - warmupStart.current) / 1000).toFixed(2);
                // console.info(`🔥 GPU/Shader Warmup Complete: ${warmupDuration}s ${isLowTier ? '(Bypassed for LOW tier)' : ''}`);
                
                requestAnimationFrame(() => {
                    setIsDone(true);
                    onWarmupComplete?.();
                });
            };

            // On low tier, bypass intense gl.compileAsync to save memory and avoid Context Lost
            if (isLowTier) {
                finishWarmup();
                return;
            }

            // Force compile all shaders in the scene (including warm-up rooms)
            // Use 2026 compileAsync to avoid blocking the main thread!
            if (gl.compileAsync) {
                gl.compileAsync(scene, camera, scene)
                    .then(finishWarmup)
                    .catch((err) => {
                        console.error('Async compilation failed, falling back to sync', err);
                        gl.compile(scene, camera);
                        finishWarmup();
                    });
            } else {
                gl.compile(scene, camera);
                finishWarmup();
            }
        }
    });

    if (isDone || isLowTier) return null;
    return null;
};

export default RoomWarmup;

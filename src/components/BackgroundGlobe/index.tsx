'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  BACKGROUND_GLOBE_POINTS,
  MOBILE_GLOBE_POINTS,
  generateArcs,
  generateRingPulses,
  type BackgroundGlobePoint,
  type AnimatedArc,
} from '@/lib/backgroundGlobeData';

// Dynamic import to avoid SSR issues with Three.js
const GlobeGL = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <div />,
});

interface Dimensions {
  width: number;
  height: number;
}

const BackgroundGlobe: React.FC = () => {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Mount detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dimension management — use layout viewport (respects body zoom) + visualViewport for mobile toolbars
  useEffect(() => {
    const updateDimensions = () => {
      const el = document.documentElement;
      const vv = window.visualViewport;
      setDimensions({
        width: Math.max(vv?.width ?? el.clientWidth, el.clientWidth),
        height: Math.max(vv?.height ?? el.clientHeight, el.clientHeight),
      });
    };

    updateDimensions();
    const t = window.setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    window.visualViewport?.addEventListener('resize', updateDimensions);
    window.visualViewport?.addEventListener('scroll', updateDimensions);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', updateDimensions);
      window.visualViewport?.removeEventListener('resize', updateDimensions);
      window.visualViewport?.removeEventListener('scroll', updateDimensions);
    };
  }, []);

  // Select points based on device
  const points = useMemo(() => {
    return isMobile ? MOBILE_GLOBE_POINTS : BACKGROUND_GLOBE_POINTS;
  }, [isMobile]);

  // Generate arcs (6 for desktop, 3 for mobile)
  const arcData = useMemo(() => {
    const arcCount = isMobile ? 3 : 6;
    return generateArcs(points, arcCount);
  }, [points, isMobile]);

  // Generate ring pulses for glow effects
  const ringData = useMemo(() => {
    return generateRingPulses(points);
  }, [points]);

  // Animation loop for pulsing points
  useEffect(() => {
    if (!mounted) return;

    let frameId: number;
    let lastUpdate = Date.now();

    const animate = () => {
      const now = Date.now();
      // Update every 50ms for smooth animation
      if (now - lastUpdate > 50) {
        setAnimationFrame((prev) => prev + 0.1);
        lastUpdate = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [mounted]);

  // Setup auto-rotation and camera controls
  useEffect(() => {
    if (!mounted || !globeRef.current) return;

    try {
      // Small delay to ensure globe is fully initialized
      const initTimer = setTimeout(() => {
        if (!globeRef.current) return;

        // Set initial camera position
        globeRef.current.pointOfView({
          lat: 20,
          lng: 0,
          altitude: 2.5,
        }, 0);

        // Access and configure OrbitControls
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.5;
          controls.enableZoom = false;
          controls.enablePan = false;
        }
      }, 100);

      // Gentle camera drift
      let driftTimer: NodeJS.Timeout;
      const startCameraDrift = () => {
        driftTimer = setInterval(() => {
          if (!globeRef.current) return;

          const time = Date.now() * 0.0001;
          const lat = 20 + Math.sin(time * 0.5) * 10; // Drift ±10 degrees
          const lng = Math.sin(time * 0.3) * 15; // Drift ±15 degrees

          globeRef.current.pointOfView({
            lat,
            lng,
            altitude: 2.5,
          }, 2000); // 2 second transition
        }, 5000); // Update every 5 seconds
      };

      // Start drift after a brief delay
      const driftStartTimer = setTimeout(startCameraDrift, 2000);

      return () => {
        clearTimeout(initTimer);
        clearTimeout(driftStartTimer);
        if (driftTimer) {
          clearInterval(driftTimer);
        }
      };
    } catch (error) {
      console.error('Error configuring globe controls:', error);
    }
  }, [mounted]);

  // Calculate pulsing point radius
  const getPointRadius = (obj: object) => {
    const point = obj as BackgroundGlobePoint;
    return point.baseSize * (Math.sin(animationFrame + point.animationOffset) * 0.15 + 1);
  };

  // Don't render until mounted (avoid SSR issues)
  if (!mounted) {
    return null;
  }

  // Check for reduced motion preference and small screens
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.innerWidth < 480;

  if (isSmallScreen || prefersReducedMotion) {
    return null;
  }

  // Don't render until we have dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="background-globe-container"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isMobile ? 0.5 : 0.7,
        isolation: 'isolate',
      }}
    >
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}

        // Textures
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl=""

        // Background color (transparent for light theme)
        backgroundColor="rgba(232, 238, 242, 0)"

        // Atmosphere
        atmosphereColor="#94a3b8"
        atmosphereAltitude={0.12}

        // Interaction disabled for background
        enablePointerInteraction={false}
        animateIn={true}

        // Pulsing points
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointRadius={getPointRadius}
        pointColor="color"
        pointResolution={12}

        // Flowing arcs
        arcsData={arcData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={(obj: object) => 1000 / (obj as AnimatedArc).animationSpeed}
        arcStroke={0.5}
        arcAltitude={0.2}
        arcAltitudeAutoScale={0.3}

        // Ring pulses for glow effects
        ringsData={ringData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={() => 'rgba(59, 130, 246, 0.2)'}
      />
    </div>
  );
};

export default BackgroundGlobe;

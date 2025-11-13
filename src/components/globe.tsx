'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface GlobeProps {
    pointsData: { lat: number; lng: number; label: string; result: string }[];
}

const Globe: React.FC<GlobeProps> = ({ pointsData }) => {
    const globeEl = useRef<HTMLDivElement>(null);
    const [Globe, setGlobe] = useState<any>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        import('react-globe.gl').then(module => setGlobe(() => module.default));
    }, []);

    if (!Globe) {
        return <div>Загрузка глобуса...</div>;
    }

    return (
        <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)"
            pointsData={pointsData}
            pointColor={() => resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)'}
            pointAltitude={0}
            pointRadius={0.5}
            pointsMerge={true}
            pointLabel={({ label, result }: any) => `
                <div style="background: hsl(var(--background)); color: hsl(var(--foreground)); padding: 8px; border-radius: 4px; font-family: sans-serif; border: 1px solid hsl(var(--border));">
                    <b>${label}</b><br/>
                    <span>${result}</span>
                </div>
            `}
        />
    );
};

export default Globe;

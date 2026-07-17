'use client';

import { useEffect, useRef } from 'react';
import proj4 from 'proj4';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import manifestData from '../data/terrain/little-bighorn-1876/manifest.json';
import type { Scenario } from '../src/schema/scenario-schema';
import type { SimState, UnitRuntime } from '../engine/src/state';

const scenario = scenarioData as unknown as Scenario;
const manifest = manifestData;
const fullBounds = manifest.tiers.full.localBounds;

interface ContourFeature {
  properties: { indexContour: boolean };
  geometry: { coordinates: number[][][] };
}

interface ViewshedImage {
  width: number;
  height: number;
  values: Uint8ClampedArray;
}

interface BattleMapProps {
  state?: SimState;
  leaderId: string;
  mode: 'reality' | 'belief' | 'split';
  viewshed?: ViewshedImage;
}

function localPoint(lat: number, lon: number): [number, number] {
  const [easting, northing] = proj4(
    manifest.crs.geographic,
    manifest.crs.projectedDefinition,
    [lon, lat],
  );
  return [
    easting - manifest.crs.localOrigin.easting,
    northing - manifest.crs.localOrigin.northing,
  ];
}

function formationGlyph(formation: UnitRuntime['formation']): string {
  switch (formation) {
    case 'COLUMN': return '▮';
    case 'LINE': return '—';
    case 'SKIRMISH': return '··';
    case 'DISPERSED': return '×';
    case 'CAMP': return '△';
  }
}

export function BattleMap({ state, leaderId, mode, viewshed }: BattleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contoursRef = useRef<ContourFeature[]>([]);
  const imageRef = useRef<HTMLImageElement>();
  const redrawRef = useRef(0);

  useEffect(() => {
    const image = new Image();
    image.src = './terrain/hillshade-full.png';
    image.onload = () => { imageRef.current = image; redrawRef.current += 1; window.dispatchEvent(new Event('mapasset')); };
    void fetch('./terrain/contours-core.geojson.gz')
      .then(async (response) => {
        if (!response.ok || !response.body) throw new Error('Contour fetch failed');
        const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
        return new Response(stream).json() as Promise<{ features: ContourFeature[] }>;
      })
      .then((geojson) => {
        contoursRef.current = geojson.features;
        redrawRef.current += 1;
        window.dispatchEvent(new Event('mapasset'));
      });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const mapWidth = fullBounds.maxX - fullBounds.minX;
      const mapHeight = fullBounds.maxY - fullBounds.minY;
      const scale = Math.max(width / mapWidth, height / mapHeight);
      const offsetX = (width - mapWidth * scale) / 2;
      const offsetY = (height - mapHeight * scale) / 2;
      const screen = (x: number, y: number): [number, number] => [
        offsetX + (x - fullBounds.minX) * scale,
        offsetY + (fullBounds.maxY - y) * scale,
      ];

      context.fillStyle = '#d8d0bd';
      context.fillRect(0, 0, width, height);
      if (imageRef.current) {
        context.globalAlpha = 0.82;
        context.drawImage(imageRef.current, offsetX, offsetY, mapWidth * scale, mapHeight * scale);
        context.globalAlpha = 1;
        context.fillStyle = 'rgba(226,217,196,.25)';
        context.fillRect(0, 0, width, height);
      }

      scenario.terrain.cover.forEach((cover) => {
        context.beginPath();
        cover.area.ring.forEach((point, index) => {
          const [x, y] = localPoint(point.lat, point.lon);
          const [sx, sy] = screen(x, y);
          if (index === 0) context.moveTo(sx, sy); else context.lineTo(sx, sy);
        });
        context.closePath();
        context.fillStyle = cover.kind === 'TIMBER' ? 'rgba(68,79,53,.16)' : 'rgba(121,92,64,.10)';
        context.fill();
      });

      const river = scenario.terrain.rivers[0];
      const corrected = scenario.terrain.historicalCorrections.find(
        (correction) => correction.replaces === river?.id && 'points' in correction.geometry,
      );
      const correctedPoints = corrected && 'points' in corrected.geometry
        ? corrected.geometry.points
        : undefined;
      const riverPoints = correctedPoints ?? river?.path.points ?? [];
      context.beginPath();
      riverPoints.forEach((point, index) => {
        const [x, y] = localPoint(point.lat, point.lon);
        const [sx, sy] = screen(x, y);
        if (index === 0) context.moveTo(sx, sy); else context.lineTo(sx, sy);
      });
      context.strokeStyle = 'rgba(61,85,92,.72)';
      context.lineWidth = 1.6;
      context.stroke();
      river?.fords.forEach((ford) => {
        const [x, y] = localPoint(ford.position.lat, ford.position.lon);
        const [sx, sy] = screen(x, y);
        context.strokeStyle = '#ece4d0';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(sx - 4, sy - 4);
        context.lineTo(sx + 4, sy + 4);
        context.stroke();
      });

      context.strokeStyle = 'rgba(78,65,48,.28)';
      for (const feature of contoursRef.current) {
        context.lineWidth = feature.properties.indexContour ? 0.9 : 0.35;
        context.globalAlpha = feature.properties.indexContour ? 0.7 : 0.42;
        context.beginPath();
        for (const line of feature.geometry.coordinates) {
          line.forEach(([lon, lat], index) => {
            if (index % 2 !== 0 && index !== line.length - 1) return;
            const [x, y] = localPoint(lat, lon);
            const [sx, sy] = screen(x, y);
            if (index < 2) context.moveTo(sx, sy); else context.lineTo(sx, sy);
          });
        }
        context.stroke();
      }
      context.globalAlpha = 1;

      if (leaderId && viewshed) {
        const overlay = document.createElement('canvas');
        overlay.width = viewshed.width;
        overlay.height = viewshed.height;
        const overlayContext = overlay.getContext('2d');
        if (overlayContext) {
          const pixels = overlayContext.createImageData(viewshed.width, viewshed.height);
          for (let row = 0; row < viewshed.height; row += 1) {
            const northRow = viewshed.height - 1 - row;
            for (let column = 0; column < viewshed.width; column += 1) {
              const source = row * viewshed.width + column;
              const target = (northRow * viewshed.width + column) * 4;
              pixels.data[target] = 38;
              pixels.data[target + 1] = 37;
              pixels.data[target + 2] = 34;
              pixels.data[target + 3] = Math.round((255 - viewshed.values[source]) * 0.48);
            }
          }
          overlayContext.putImageData(pixels, 0, 0);
          context.drawImage(overlay, offsetX, offsetY, mapWidth * scale, mapHeight * scale);
        }
      }

      const selectedLeader = scenario.leaders.find((leader) => leader.id === leaderId);
      const drawUnit = (unit: UnitRuntime, x: number, y: number, ghosted: boolean) => {
        const source = scenario.units[unit.unitIndex];
        const side = scenario.sides.find((item) => item.id === source.sideId);
        const [sx, sy] = screen(x, y);
        context.save();
        context.globalAlpha = ghosted ? 0.4 : 0.92;
        context.strokeStyle = side?.color ?? '#222';
        context.fillStyle = side?.color ?? '#222';
        context.lineWidth = 1.2;
        context.setLineDash(ghosted ? [3, 2] : []);
        context.beginPath();
        if (source.sideId === 'us-7th-cavalry') context.rect(sx - 5, sy - 5, 10, 10);
        else {
          context.moveTo(sx, sy - 6); context.lineTo(sx + 6, sy);
          context.lineTo(sx, sy + 6); context.lineTo(sx - 6, sy); context.closePath();
        }
        if (!ghosted) context.fill();
        context.stroke();
        context.fillStyle = ghosted ? side?.color ?? '#222' : '#f4eddc';
        context.font = 'bold 8px system-ui';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(formationGlyph(unit.formation), sx, sy - 0.5);
        context.setLineDash([]);
        context.fillStyle = 'rgba(28,25,21,.35)';
        context.fillRect(sx - 6, sy + 8, 12, 2);
        context.fillStyle = side?.color ?? '#222';
        context.fillRect(sx - 6, sy + 8, 12 * unit.strengthAvailable / Math.max(1, unit.strengthTotal), 2);
        context.restore();
      };

      const drawReality = () => state?.units.forEach((unit) =>
        drawUnit(unit, unit.position.x, unit.position.y, false));
      const drawBelief = () => {
        if (!state || !selectedLeader) return;
        const picture = state.believedPictures[selectedLeader.sideId] ?? {};
        state.units.forEach((unit) => {
          const source = scenario.units[unit.unitIndex];
          if (source.sideId === selectedLeader.sideId) {
            drawUnit(unit, unit.position.x, unit.position.y, false);
            return;
          }
          const contact = picture[unit.id];
          if (!contact) return;
          drawUnit(unit, contact.lastSeenPos.x, contact.lastSeenPos.y, contact.status === 'lastKnown');
        });
      };
      if (mode === 'split') {
        context.save(); context.beginPath(); context.rect(0, 0, width / 2, height); context.clip(); drawReality(); context.restore();
        context.save(); context.beginPath(); context.rect(width / 2, 0, width / 2, height); context.clip(); drawBelief(); context.restore();
        context.strokeStyle = 'rgba(35,31,26,.7)'; context.beginPath();
        context.moveTo(width / 2, 0); context.lineTo(width / 2, height); context.stroke();
        context.font = '600 10px system-ui'; context.fillStyle = '#342f28';
        context.fillText('REALITY', width / 2 - 52, 22); context.fillText('BELIEF', width / 2 + 16, 22);
      } else if (mode === 'belief') drawBelief();
      else drawReality();

      const important = new Set(['ford-a', 'ford-b', 'reno-hill', 'weir-point', 'last-stand-hill', 'timber', 'village-s-end', 'village-n-end']);
      context.textBaseline = 'alphabetic';
      scenario.terrain.landmarks.filter((landmark) => important.has(landmark.id)).forEach((landmark) => {
        const [x, y] = localPoint(landmark.position.lat, landmark.position.lon);
        const [sx, sy] = screen(x, y);
        context.font = `${landmark.id.includes('hill') ? 11 : 9}px Georgia, serif`;
        context.fillStyle = 'rgba(48,41,33,.84)';
        context.textAlign = 'left';
        context.fillText(landmark.name.toUpperCase(), sx + 7, sy - 7);
        context.fillRect(sx - 1, sy - 1, 2, 2);
      });

      context.textAlign = 'right';
      context.fillStyle = 'rgba(39,34,28,.84)';
      context.font = '22px Georgia, serif';
      context.fillText('Little Bighorn', width - 22, 34);
      context.font = '9px system-ui';
      context.fillText('JUNE 25, 1876 · LOCAL SUN TIME', width - 22, 51);
    };

    draw();
    const resize = () => draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mapasset', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mapasset', resize);
    };
  }, [leaderId, mode, state, viewshed]);

  return <canvas ref={canvasRef} className="battle-map" aria-label="Battle map" />;
}

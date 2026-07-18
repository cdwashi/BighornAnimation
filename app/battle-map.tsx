'use client';

import { useEffect, useRef, useState } from 'react';
import proj4 from 'proj4';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import manifestData from '../data/terrain/little-bighorn-1876/manifest.json';
import type { Scenario } from '../src/schema/scenario-schema';
import type { SimState, UnitRuntime } from '../engine/src/state';
import { FORMATION_LEGEND, STATE_LEGEND } from './lib/legend-data';
import {
  buildUnitTooltip,
  fanOutMarkerProjections,
  focusMapView,
  panMapView,
  resetMapView,
  transformPoint,
  zoomMapView,
  type MapView,
  type ScreenPoint,
  type UnitTooltipContent,
} from './lib/map-interactions';

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

interface MarkerHit {
  unitId: string;
  x: number;
  y: number;
  base: ScreenPoint;
  ghosted: boolean;
  clustered: boolean;
  tooltip: UnitTooltipContent;
}

interface TooltipState extends MarkerHit { left: number; top: number }

interface RenderableMarker {
  unit: UnitRuntime;
  x: number;
  y: number;
  ghosted: boolean;
  ghostLastSeenTick?: number;
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

function distance(left: ScreenPoint, right: ScreenPoint): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

export function BattleMap({ state, leaderId, mode, viewshed }: BattleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contoursRef = useRef<ContourFeature[]>([]);
  const imageRef = useRef<HTMLImageElement>();
  const markerHitsRef = useRef<MarkerHit[]>([]);
  const pointersRef = useRef(new Map<number, ScreenPoint>());
  const pointerMovedRef = useRef(false);
  const lastTapRef = useRef<{ time: number; point: ScreenPoint }>();
  const [view, setView] = useState<MapView>(resetMapView());
  const [tooltip, setTooltip] = useState<TooltipState>();
  const [legendOpen, setLegendOpen] = useState(false);
  const [assetRevision, setAssetRevision] = useState(0);

  useEffect(() => {
    const image = new Image();
    image.src = './terrain/hillshade-full.png';
    image.onload = () => { imageRef.current = image; setAssetRevision((revision) => revision + 1); };
    void fetch('./terrain/contours-core.geojson.gz')
      .then(async (response) => {
        if (!response.ok || !response.body) throw new Error('Contour fetch failed');
        const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
        return new Response(stream).json() as Promise<{ features: ContourFeature[] }>;
      })
      .then((geojson) => {
        contoursRef.current = geojson.features;
        setAssetRevision((revision) => revision + 1);
      });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const mapWidth = fullBounds.maxX - fullBounds.minX;
    const mapHeight = fullBounds.maxY - fullBounds.minY;
    const baseScale = Math.min(width / mapWidth, height / mapHeight);
    const offsetX = (width - mapWidth * baseScale) / 2;
    const offsetY = (height - mapHeight * baseScale) / 2;
    const baseScreen = (x: number, y: number): ScreenPoint => ({
      x: offsetX + (x - fullBounds.minX) * baseScale,
      y: offsetY + (fullBounds.maxY - y) * baseScale,
    });
    const screen = (x: number, y: number): ScreenPoint => transformPoint(baseScreen(x, y), view);

    context.fillStyle = '#d8d0bd';
    context.fillRect(0, 0, width, height);
    const mapOrigin = transformPoint({ x: offsetX, y: offsetY }, view);
    const displayMapWidth = mapWidth * baseScale * view.scale;
    const displayMapHeight = mapHeight * baseScale * view.scale;
    if (imageRef.current) {
      context.globalAlpha = 0.86;
      context.drawImage(imageRef.current, mapOrigin.x, mapOrigin.y, displayMapWidth, displayMapHeight);
      context.globalAlpha = 1;
      context.fillStyle = 'rgba(226,217,196,.19)';
      context.fillRect(mapOrigin.x, mapOrigin.y, displayMapWidth, displayMapHeight);
    }

    scenario.terrain.cover.forEach((cover) => {
      context.beginPath();
      cover.area.ring.forEach((point, index) => {
        const [x, y] = localPoint(point.lat, point.lon);
        const projected = screen(x, y);
        if (index === 0) context.moveTo(projected.x, projected.y);
        else context.lineTo(projected.x, projected.y);
      });
      context.closePath();
      context.fillStyle = cover.kind === 'TIMBER'
        ? 'rgba(68,79,53,.16)'
        : 'rgba(121,92,64,.10)';
      context.fill();
    });

    const river = scenario.terrain.rivers[0];
    const corrected = scenario.terrain.historicalCorrections.find(
      (correction) => correction.replaces === river?.id && 'points' in correction.geometry,
    );
    const riverPoints = corrected && 'points' in corrected.geometry
      ? corrected.geometry.points
      : river?.path.points ?? [];
    context.beginPath();
    riverPoints.forEach((point, index) => {
      const [x, y] = localPoint(point.lat, point.lon);
      const projected = screen(x, y);
      if (index === 0) context.moveTo(projected.x, projected.y);
      else context.lineTo(projected.x, projected.y);
    });
    context.strokeStyle = 'rgba(61,85,92,.76)';
    context.lineWidth = 1.6;
    context.stroke();
    river?.fords.forEach((ford) => {
      const [x, y] = localPoint(ford.position.lat, ford.position.lon);
      const projected = screen(x, y);
      context.strokeStyle = '#ece4d0';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(projected.x - 4, projected.y - 4);
      context.lineTo(projected.x + 4, projected.y + 4);
      context.stroke();
    });

    context.strokeStyle = 'rgba(78,65,48,.31)';
    for (const feature of contoursRef.current) {
      context.lineWidth = feature.properties.indexContour ? 1 : 0.45;
      context.globalAlpha = feature.properties.indexContour ? 0.74 : 0.46;
      context.beginPath();
      for (const line of feature.geometry.coordinates) {
        let started = false;
        line.forEach(([lon, lat], index) => {
          if (index % 2 !== 0 && index !== line.length - 1) return;
          const [x, y] = localPoint(lat, lon);
          const projected = screen(x, y);
          if (!started) {
            context.moveTo(projected.x, projected.y);
            started = true;
          } else context.lineTo(projected.x, projected.y);
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
            pixels.data[target] = 31;
            pixels.data[target + 1] = 30;
            pixels.data[target + 2] = 28;
            pixels.data[target + 3] = Math.round((255 - viewshed.values[source]) * 0.64);
          }
        }
        overlayContext.putImageData(pixels, 0, 0);
        context.imageSmoothingEnabled = true;
        context.drawImage(overlay, mapOrigin.x, mapOrigin.y, displayMapWidth, displayMapHeight);
      }
    }

    markerHitsRef.current = [];
    const selectedLeader = scenario.leaders.find((leader) => leader.id === leaderId);
    const drawUnit = (
      marker: RenderableMarker,
      base: ScreenPoint,
      displayPoint: ScreenPoint,
      clusterSize: number,
      hitBounds?: { minimumX: number; maximumX: number },
    ) => {
      if (!state) return;
      const { unit, ghosted, ghostLastSeenTick } = marker;
      const source = scenario.units[unit.unitIndex];
      const side = scenario.sides.find((item) => item.id === source.sideId);
      const projected = displayPoint;
      context.save();
      context.globalAlpha = ghosted ? 0.4 : 0.94;
      context.strokeStyle = side?.color ?? '#222';
      context.fillStyle = side?.color ?? '#222';
      context.lineWidth = ghosted ? 1.7 : 1.2;
      context.setLineDash(ghosted ? [4, 3] : []);
      context.beginPath();
      if (source.sideId === 'us-7th-cavalry') {
        context.rect(projected.x - 5, projected.y - 5, 10, 10);
      } else {
        context.moveTo(projected.x, projected.y - 6);
        context.lineTo(projected.x + 6, projected.y);
        context.lineTo(projected.x, projected.y + 6);
        context.lineTo(projected.x - 6, projected.y);
        context.closePath();
      }
      if (!ghosted) context.fill();
      context.stroke();
      context.fillStyle = ghosted ? side?.color ?? '#222' : '#f4eddc';
      context.font = 'bold 8px system-ui';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(formationGlyph(unit.formation), projected.x, projected.y - 0.5);
      if (!ghosted) {
        context.setLineDash([]);
        context.fillStyle = 'rgba(28,25,21,.35)';
        context.fillRect(projected.x - 6, projected.y + 8, 12, 2);
        context.fillStyle = side?.color ?? '#222';
        context.fillRect(
          projected.x - 6,
          projected.y + 8,
          12 * unit.strengthAvailable / Math.max(1, unit.strengthTotal),
          2,
        );
      }
      context.restore();
      if (hitBounds && (projected.x < hitBounds.minimumX || projected.x >= hitBounds.maximumX)) return;
      markerHitsRef.current.push({
        unitId: unit.id,
        x: projected.x,
        y: projected.y,
        base,
        ghosted,
        clustered: clusterSize > 1,
        tooltip: buildUnitTooltip(scenario, state, unit, ghostLastSeenTick),
      });
    };

    const drawMarkers = (
      markers: readonly RenderableMarker[],
      hitBounds?: { minimumX: number; maximumX: number },
    ) => {
      const projected = markers.map((marker) => ({
        id: marker.unit.id,
        point: screen(marker.x, marker.y),
      }));
      const layout = fanOutMarkerProjections(projected);
      const byId = new Map(markers.map((marker) => [marker.unit.id, marker]));
      context.save();
      context.strokeStyle = 'rgba(54,48,39,.42)';
      context.fillStyle = 'rgba(54,48,39,.48)';
      context.lineWidth = 0.7;
      for (const placement of layout) {
        if (placement.clusterSize < 2) continue;
        context.beginPath();
        context.moveTo(placement.point.x, placement.point.y);
        context.lineTo(placement.displayPoint.x, placement.displayPoint.y);
        context.stroke();
        context.beginPath();
        context.arc(placement.point.x, placement.point.y, 1.2, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
      for (const placement of layout) {
        const marker = byId.get(placement.id);
        if (!marker) continue;
        drawUnit(
          marker,
          baseScreen(marker.x, marker.y),
          placement.displayPoint,
          placement.clusterSize,
          hitBounds,
        );
      }
    };

    const realityMarkers = (): RenderableMarker[] => state?.units.map((unit) => ({
      unit,
      x: unit.position.x,
      y: unit.position.y,
      ghosted: false,
    })) ?? [];
    const beliefMarkers = (): RenderableMarker[] => {
      if (!state || !selectedLeader) return [];
      const picture = state.believedPictures[selectedLeader.sideId] ?? {};
      const markers: RenderableMarker[] = [];
      state.units.forEach((unit) => {
        const source = scenario.units[unit.unitIndex];
        if (source.sideId === selectedLeader.sideId) {
          markers.push({ unit, x: unit.position.x, y: unit.position.y, ghosted: false });
          return;
        }
        const contact = picture[unit.id];
        if (!contact) return;
        const ghosted = contact.status === 'lastKnown';
        markers.push({
          unit,
          x: contact.lastSeenPos.x,
          y: contact.lastSeenPos.y,
          ghosted,
          ghostLastSeenTick: ghosted ? contact.lastSeenTick : undefined,
        });
      });
      return markers;
    };
    if (mode === 'split') {
      context.save();
      context.beginPath();
      context.rect(0, 0, width / 2, height);
      context.clip();
      drawMarkers(realityMarkers(), { minimumX: 0, maximumX: width / 2 });
      context.restore();
      context.save();
      context.beginPath();
      context.rect(width / 2, 0, width / 2, height);
      context.clip();
      drawMarkers(beliefMarkers(), { minimumX: width / 2, maximumX: width });
      context.restore();
      context.strokeStyle = 'rgba(35,31,26,.7)';
      context.beginPath();
      context.moveTo(width / 2, 0);
      context.lineTo(width / 2, height);
      context.stroke();
      context.font = '600 10px system-ui';
      context.fillStyle = '#342f28';
      context.fillText('REALITY', width / 2 - 52, 22);
      context.fillText('BELIEF', width / 2 + 16, 22);
    } else if (mode === 'belief') drawMarkers(beliefMarkers());
    else drawMarkers(realityMarkers());

    const important = new Set([
      'ford-a', 'ford-b', 'reno-hill', 'weir-point', 'last-stand-hill',
      'timber', 'village-s-end', 'village-n-end',
    ]);
    context.textBaseline = 'alphabetic';
    scenario.terrain.landmarks
      .filter((landmark) => important.has(landmark.id))
      .forEach((landmark) => {
        const [x, y] = localPoint(landmark.position.lat, landmark.position.lon);
        const projected = screen(x, y);
        context.font = `${landmark.id.includes('hill') ? 11 : 9}px Georgia, serif`;
        context.fillStyle = 'rgba(48,41,33,.86)';
        context.textAlign = 'left';
        context.fillText(landmark.name.toUpperCase(), projected.x + 7, projected.y - 7);
        context.fillRect(projected.x - 1, projected.y - 1, 2, 2);
      });

    context.textAlign = 'right';
    context.fillStyle = 'rgba(39,34,28,.84)';
    context.font = '22px Georgia, serif';
    context.fillText('Little Bighorn', width - 22, 34);
    context.font = '9px system-ui';
    context.fillText('JUNE 25, 1876 · LOCAL SUN TIME', width - 22, 51);
  }, [assetRevision, leaderId, mode, state, view, viewshed]);

  const canvasPoint = (event: React.MouseEvent<HTMLCanvasElement>): ScreenPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  const hitAt = (point: ScreenPoint): MarkerHit | undefined => markerHitsRef.current
    .find((marker) => Math.hypot(marker.x - point.x, marker.y - point.y) <= 12);
  const showTooltip = (marker: MarkerHit, point: ScreenPoint) => setTooltip({
    ...marker,
    left: Math.min(point.x + 14, (canvasRef.current?.clientWidth ?? point.x + 250) - 244),
    top: Math.max(10, point.y - 18),
  });
  const focusMarker = (marker: MarkerHit) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setView(focusMapView(marker.base, { width: canvas.clientWidth, height: canvas.clientHeight }));
    setTooltip(undefined);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    pointersRef.current.set(event.pointerId, point);
    pointerMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    const previous = pointersRef.current.get(event.pointerId);
    if (!previous) {
      const marker = hitAt(point);
      if (marker) showTooltip(marker, point);
      else setTooltip(undefined);
      return;
    }
    const pointers = pointersRef.current;
    if (pointers.size === 1) {
      const deltaX = point.x - previous.x;
      const deltaY = point.y - previous.y;
      if (Math.hypot(deltaX, deltaY) > 0) {
        pointerMovedRef.current = true;
        setView((current) => panMapView(current, deltaX, deltaY));
        setTooltip(undefined);
      }
    } else if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
      if (other) {
        const previousCenter = { x: (previous.x + other.x) / 2, y: (previous.y + other.y) / 2 };
        const nextCenter = { x: (point.x + other.x) / 2, y: (point.y + other.y) / 2 };
        const factor = distance(point, other) / Math.max(1, distance(previous, other));
        pointerMovedRef.current = true;
        setView((current) => zoomMapView(
          panMapView(current, nextCenter.x - previousCenter.x, nextCenter.y - previousCenter.y),
          factor,
          nextCenter,
        ));
        setTooltip(undefined);
      }
    }
    pointers.set(event.pointerId, point);
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    pointersRef.current.delete(event.pointerId);
    if (!pointerMovedRef.current) {
      const marker = hitAt(point);
      if (marker) showTooltip(marker, point);
      if (event.pointerType === 'touch' && marker) {
        const now = performance.now();
        const lastTap = lastTapRef.current;
        if (lastTap && now - lastTap.time < 350 && distance(lastTap.point, point) < 24) {
          focusMarker(marker);
          lastTapRef.current = undefined;
        } else lastTapRef.current = { time: now, point };
      }
    }
  };

  return (
    <div className="map-stage">
      <canvas
        ref={canvasRef}
        className="battle-map"
        aria-label="Battle map"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={(event) => pointersRef.current.delete(event.pointerId)}
        onPointerLeave={() => { if (pointersRef.current.size === 0) setTooltip(undefined); }}
        onWheel={(event) => {
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          setView((current) => zoomMapView(current, Math.exp(-event.deltaY * 0.0015), {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          }));
          setTooltip(undefined);
        }}
        onDoubleClick={(event) => {
          const marker = hitAt(canvasPoint(event));
          if (marker) focusMarker(marker);
        }}
      />

      <div className="map-tools" aria-label="Map controls">
        <button type="button" onClick={() => { setView(resetMapView()); setTooltip(undefined); }}>
          Reset view
        </button>
        <button type="button" aria-expanded={legendOpen} onClick={() => setLegendOpen((open) => !open)}>
          Legend {legendOpen ? '−' : '+'}
        </button>
        {legendOpen && (
          <section className="map-legend" aria-label="Map legend">
            <p className="legend-heading">Formation glyphs</p>
            <dl>
              {FORMATION_LEGEND.map((item) => (
                <div key={item.label}>
                  <dt><b>{item.glyph}</b>{item.label}</dt>
                  <dd>{item.detail}</dd>
                </div>
              ))}
            </dl>
            <p className="legend-heading">Map states</p>
            <dl>
              {STATE_LEGEND.map((item) => (
                <div key={item.label}>
                  <dt><i className={`legend-symbol ${item.symbol}`} />{item.label}</dt>
                  <dd>{item.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {tooltip && (
        <aside
          className={`unit-tooltip${tooltip.ghosted ? ' ghost-tooltip' : ''}`}
          style={{ left: tooltip.left, top: tooltip.top }}
          role="tooltip"
          data-unit-id={tooltip.unitId}
        >
          <strong>{tooltip.tooltip.title}</strong>
          <span>{tooltip.tooltip.side}</span>
          <dl>
            <div><dt>Strength</dt><dd>{tooltip.tooltip.strength}</dd></div>
            <div><dt>Formation</dt><dd>{tooltip.tooltip.formation}</dd></div>
            <div><dt>State</dt><dd>{tooltip.tooltip.mounted}</dd></div>
            <div><dt>Order</dt><dd>{tooltip.tooltip.order}</dd></div>
          </dl>
          {tooltip.tooltip.stale && <p>{tooltip.tooltip.stale}</p>}
          {tooltip.clustered && (
            <p>Company marker fanned for clarity. Its tether returns to the recorded position; true march-order spacing is not simulated.</p>
          )}
        </aside>
      )}
    </div>
  );
}

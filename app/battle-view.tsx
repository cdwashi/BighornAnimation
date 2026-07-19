'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import { tickToWallClock } from '../engine/src/clock';
import type { SimEvent } from '../engine/src/events';
import type { SpottingEvent } from '../engine/src/spotting';
import type { SimState } from '../engine/src/state';
import type { Scenario } from '../src/schema/scenario-schema';
import { BattleMap } from './battle-map';
import {
  buildCombatTimelineTicks,
  buildLossSummary,
  effectivePlaybackSpeed,
  ENGAGEMENT_SPEED_CAP,
} from './lib/combat-ui';
import { buildDecisionIndex, decisionKindLabel } from './lib/decision-index';
import { interpolateState, sliderFromSpeed, speedFromSlider } from './lib/map-interactions';
import { viewshedPresetEnabled } from './lib/pov-controls';
import type { WorkerRequest, WorkerResponse } from './lib/sim-messages';

const scenario = scenarioData as unknown as Scenario;
const initialTick = 760 * 2;
const endTick = 18 * 60 * 2;

interface ViewshedState {
  leaderId: string;
  tick: number;
  width: number;
  height: number;
  values: Uint8ClampedArray;
  milliseconds: number;
}

export function BattleView() {
  const workerRef = useRef<Worker>();
  const stateRef = useRef<SimState>();
  const playingRef = useRef(false);
  const advancePendingRef = useRef(false);
  const transitionRef = useRef<{ from: SimState; to: SimState; started: number }>();
  const decisionListRef = useRef<HTMLOListElement>(null);
  const [state, setState] = useState<SimState>();
  const [renderState, setRenderState] = useState<SimState>();
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [spottingEvents, setSpottingEvents] = useState<SpottingEvent[]>([]);
  const [selectedLeader, setSelectedLeader] = useState('');
  const [mode, setMode] = useState<'reality' | 'belief' | 'split'>('reality');
  const [viewshed, setViewshed] = useState<ViewshedState>();
  const [viewshedEnabled, setViewshedEnabled] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [indexOpen, setIndexOpen] = useState(false);
  const [lossesOpen, setLossesOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState('');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [runMilliseconds, setRunMilliseconds] = useState<number>();
  const [error, setError] = useState('');
  const currentTick = state?.tick;
  const effectiveSpeed = effectivePlaybackSpeed(speed, state?.engagementActive ?? false);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const presetLeader = parameters.get('leader');
    const presetMode = parameters.get('mode');
    const cookePreset = parameters.get('index') === 'cooke';
    const renoPreset = parameters.get('scene') === 'reno-1620';
    const fordPreset = parameters.get('scene') === 'ford-a';
    const requestedTick = parameters.has('tick') ? Number(parameters.get('tick')) : Number.NaN;
    queueMicrotask(() => {
      setViewshedEnabled(viewshedPresetEnabled(parameters));
      if (presetLeader && scenario.leaders.some((leader) => leader.id === presetLeader)) {
        setSelectedLeader(presetLeader);
      }
      if (presetMode === 'belief' || presetMode === 'split' || presetMode === 'reality') {
        setMode(presetMode);
      }
      if (cookePreset) {
        setIndexOpen(true);
        setSelectedDecision('order:martini-msg');
        setSelectedLeader('custer');
        setMode('belief');
      }
      if (renoPreset) {
        setSelectedLeader('reno');
        setMode('belief');
      }
      if (fordPreset) {
        setSelectedLeader('reno');
        setMode('reality');
      }
      if (parameters.get('rail') === 'closed') setRailOpen(false);
      if (parameters.get('losses') === 'open') setLossesOpen(true);
    });
    const worker = new Worker(new URL('./sim-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'ready') {
        stateRef.current = message.state;
        setState(message.state);
        setRenderState(message.state);
        setEvents(message.events);
        setSpottingEvents(message.spottingEvents);
        setRunMilliseconds(message.runMilliseconds);
      } else if (message.type === 'state') {
        advancePendingRef.current = false;
        const previous = stateRef.current;
        stateRef.current = message.state;
        setState(message.state);
        if (playingRef.current && previous) {
          transitionRef.current = { from: previous, to: message.state, started: performance.now() };
        } else {
          transitionRef.current = undefined;
          setRenderState(message.state);
        }
      }
      else if (message.type === 'viewshed') setViewshed(message);
      else setError(message.message);
    };
    const cookeTick = scenario.orders.find((order) => order.id === 'martini-msg')?.issuedAtMinute;
    worker.postMessage({ type: 'init', tick: Number.isFinite(requestedTick)
      ? Math.max(0, Math.min(endTick, requestedTick))
      : cookePreset && cookeTick !== undefined
      ? cookeTick * 2
      : renoPreset ? 1600 : fordPreset ? 1360 : initialTick } satisfies WorkerRequest);
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    playingRef.current = playing;
    if (!playing && stateRef.current) {
      transitionRef.current = undefined;
      queueMicrotask(() => setRenderState(stateRef.current));
    }
  }, [playing]);

  useEffect(() => {
    let frame = 0;
    const render = (now: number) => {
      const transition = transitionRef.current;
      if (transition) {
        const fraction = Math.min(1, (now - transition.started) / 250);
        setRenderState(interpolateState(transition.from, transition.to, fraction));
        if (fraction >= 1) transitionRef.current = undefined;
      }
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!viewshedEnabled || !selectedLeader || currentTick === undefined) return;
    workerRef.current?.postMessage({
      type: 'viewshed', leaderId: selectedLeader, atmosphericFactor: 1,
    } satisfies WorkerRequest);
  }, [currentTick, selectedLeader, viewshedEnabled]);

  useEffect(() => {
    if (!playing || !state) return;
    const timer = window.setInterval(() => {
      if (advancePendingRef.current) return;
      const next = Math.min(endTick, Math.max(
        state.tick + 1,
        Math.round(state.tick + effectiveSpeed),
      ));
      advancePendingRef.current = true;
      workerRef.current?.postMessage({ type: 'advance', tick: next } satisfies WorkerRequest);
      if (next === endTick) setPlaying(false);
    }, 250);
    return () => window.clearInterval(timer);
  }, [effectiveSpeed, playing, state]);

  const decisions = useMemo(() => buildDecisionIndex(scenario, events), [events]);
  const lossSummary = useMemo(() => state
    ? buildLossSummary(scenario, state, events)
    : { units: [], sides: [], total: 0 }, [events, state]);

  useEffect(() => {
    if (!indexOpen || !selectedDecision) return;
    decisionListRef.current
      ?.querySelector<HTMLElement>(`[data-decision-id="${selectedDecision}"]`)
      ?.scrollIntoView({ block: 'center' });
  }, [decisions, indexOpen, selectedDecision]);

  const timelineTicks = useMemo(() => {
    const kinds = new Map<number, 'order' | 'spot' | 'camp'>();
    scenario.orders.forEach((order) => kinds.set(order.issuedAtMinute * 2, 'order'));
    spottingEvents.forEach((event) => kinds.set(event.tick, 'spot'));
    events.filter((event) => event.type === 'camp-defense-activated')
      .forEach((event) => kinds.set(event.tick, 'camp'));
    return [
      ...[...kinds.entries()].map(([tick, kind]) => ({ id: `${kind}:${tick}`, tick, kind })),
      ...buildCombatTimelineTicks(events),
    ];
  }, [events, spottingEvents]);

  const seek = (tick: number) => {
    setPlaying(false);
    advancePendingRef.current = true;
    workerRef.current?.postMessage({ type: 'seek', tick } satisfies WorkerRequest);
  };
  const selectMode = (nextMode: typeof mode) => {
    if (!selectedLeader && nextMode !== 'reality') setSelectedLeader('custer');
    setMode(nextMode);
  };

  return (
    <main className="battle-shell">
      <BattleMap
        state={renderState ?? state}
        events={events}
        leaderId={selectedLeader}
        mode={mode}
        viewshed={viewshedEnabled && viewshed?.leaderId === selectedLeader && viewshed.tick === currentTick
          ? viewshed
          : undefined}
      />

      <aside className={`losses-panel${lossesOpen ? ' open' : ''}`} aria-label="losses">
        <button
          type="button"
          className="losses-heading"
          aria-expanded={lossesOpen}
          onClick={() => setLossesOpen((open) => !open)}
        >
          <span>losses</span>
          <b>{lossSummary.total}</b>
          <i>{lossesOpen ? '−' : '+'}</i>
        </button>
        {lossesOpen && (
          <div className="losses-body">
            <div className="loss-side-totals">
              {lossSummary.sides.map((side) => (
                <p key={side.sideId}><span>{side.sideName}</span><b>{side.losses}</b></p>
              ))}
            </div>
            <p className="losses-pending">
              Killed / wounded split pending the M5 model. Reserved blank columns do not mean zero.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Unit</th><th>Losses</th>
                  <th aria-disabled="true">Killed</th><th aria-disabled="true">Wounded</th>
                </tr>
              </thead>
              <tbody>
                {lossSummary.units.map((unit) => (
                  <tr key={unit.unitId}>
                    <th scope="row">{unit.unitName}</th>
                    <td>{unit.losses}</td>
                    <td className="reserved" aria-label="Pending M5" aria-disabled="true" />
                    <td className="reserved" aria-label="Pending M5" aria-disabled="true" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>

      <button
        className="rail-tab"
        type="button"
        aria-expanded={railOpen}
        aria-label={railOpen ? 'Collapse controls' : 'Open controls'}
        onClick={() => setRailOpen((open) => !open)}
      >
        {railOpen ? '‹' : '›'}
      </button>

      {railOpen && (
        <aside className="left-rail" aria-label="Point of view and decision controls">
          <header className="rail-header">
            <p>WHAT THEY SAW</p>
            <h1>Command & visibility</h1>
          </header>

          <label className="control-label" htmlFor="leader">Point of view</label>
          <select
            id="leader"
            value={selectedLeader}
            onChange={(event) => setSelectedLeader(event.target.value)}
          >
            <option value="">Full map · no observer</option>
            {scenario.sides.map((side) => (
              <optgroup key={side.id} label={side.name}>
                {scenario.leaders.filter((leader) => leader.sideId === side.id).map((leader) => (
                  <option key={leader.id} value={leader.id}>{leader.name}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <span className="control-label">Picture</span>
          <div className="segmented" role="group" aria-label="Belief versus reality">
            {(['reality', 'belief', 'split'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => selectMode(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="legend-copy">
            Solid: spotted · dashed: last known · unseen: absent
          </p>

          <button
            className="viewshed-toggle"
            type="button"
            role="switch"
            aria-checked={viewshedEnabled}
            disabled={!selectedLeader}
            onClick={() => setViewshedEnabled((enabled) => !enabled)}
          >
            <span>Viewshed</span>
            <b>{viewshedEnabled ? 'ON' : 'OFF'}</b>
          </button>

          <button
            className="index-heading"
            type="button"
            aria-expanded={indexOpen}
            onClick={() => setIndexOpen((open) => !open)}
          >
            <span>Decision index</span>
            <span>{decisions.length} entries {indexOpen ? '−' : '+'}</span>
          </button>
          {indexOpen && (
            <>
              <p className="index-explainer">
                <b>ORDER</b> reconstructs a historical instruction; <b>EMERGENT</b> is engine-generated.
              </p>
              <ol ref={decisionListRef} className="decision-list">
              {decisions.map((decision) => {
                const issuer = scenario.leaders.find((leader) => leader.id === decision.issuerLeaderId);
                return (
                  <li key={decision.id} className={decision.kind === 'emergent' ? 'emergent' : ''}>
                    <button
                      type="button"
                      data-decision-id={decision.id}
                      data-decision-kind={decision.kind}
                      aria-current={selectedDecision === decision.id ? 'true' : undefined}
                      onClick={() => {
                        setSelectedDecision(decision.id);
                        setSelectedLeader(decision.issuerLeaderId);
                        setMode('belief');
                        setViewshedEnabled(true);
                        seek(decision.tick);
                      }}
                    >
                      <time>{decision.wallClock}</time>
                      <b className={`decision-badge ${decision.kind}`}>
                        {decisionKindLabel(decision.kind)}
                      </b>
                      <strong>{decision.label}</strong>
                      <span>{issuer?.name ?? decision.issuerLeaderId}</span>
                      <small>to {decision.recipients.join(', ')}</small>
                    </button>
                  </li>
                );
              })}
              </ol>
            </>
          )}

          <footer className="rail-metrics">
            {runMilliseconds === undefined ? 'Loading terrain and reconstruction…' :
              `Full day ${runMilliseconds.toFixed(0)} ms · viewshed ${viewshedEnabled && viewshed
                ? `${viewshed.milliseconds.toFixed(1)} ms`
                : 'off'}`}
            {error && <span className="error">{error}</span>}
          </footer>
        </aside>
      )}

      <section className="timeline" aria-label="Battle timeline">
        <button type="button" className="play" onClick={() => setPlaying((value) => !value)}>
          {playing ? 'PAUSE' : 'PLAY'}
        </button>
        <time className="clock">
          {tickToWallClock(
            scenario.clock.start,
            renderState?.tick ?? state?.tick ?? initialTick,
            scenario.clock.tickSeconds,
          )}
        </time>
        <div className="scrubber-wrap">
          <div className="event-marks" aria-hidden="true">
            {timelineTicks.map(({ id, tick, kind }) => (
              <i key={id} className={kind} style={{ left: `${tick / endTick * 100}%` }} />
            ))}
          </div>
          <input
            aria-label="Simulation time"
            type="range"
            min={0}
            max={endTick}
            step={2}
            value={state?.tick ?? initialTick}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <div className="timeline-labels"><span>03:00</span><span>12:00</span><span>21:00</span></div>
        </div>
        <div className="speed">
          <label htmlFor="playback-speed">Speed <output>{speed.toFixed(speed < 10 ? 1 : 0)}×</output></label>
          <input
            id="playback-speed"
            aria-label="Playback speed"
            type="range"
            min={0}
            max={1000}
            step={1}
            value={sliderFromSpeed(speed)}
            onChange={(event) => setSpeed(speedFromSlider(Number(event.target.value)))}
          />
          {state?.engagementActive && (
            <small className="speed-cap" role="status">
              contact · {speed > ENGAGEMENT_SPEED_CAP
                ? `capped at ${effectiveSpeed.toFixed(0)}×`
                : `ceiling ${ENGAGEMENT_SPEED_CAP}×`}
            </small>
          )}
        </div>
      </section>
    </main>
  );
}

/**
 * scenario-schema.ts
 * Battle-agnostic scenario format for the order-driven historical battle simulator.
 * First target: Little Bighorn, June 25, 1876.
 *
 * Design principles:
 *  1. DATA-ONLY battles. The engine knows nothing about any specific battle;
 *     a new battle is a new Scenario JSON file (same pattern as the NMJL card data).
 *  2. ORDERS DRIVE, CHECKPOINTS SCORE. The simulation consumes `orders` and
 *     resolves movement/LOS/combat itself. `checkpoints` are historical ground
 *     truth used only to score calibration runs — never to teleport units.
 *  3. PROVENANCE IS FIRST-CLASS. Anything historically derived carries
 *     confidence + sources. Disputed quantities are ranges, not averages.
 *  4. DISPUTES ARE VARIANTS. Competing scholarly interpretations are labeled
 *     overlay patches the user can toggle, never silently blended.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** WGS84 decimal degrees. Engine projects to a local meter grid at load time. */
export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface GeoPath {
  points: GeoPoint[];
}

export interface GeoPolygon {
  ring: GeoPoint[]; // closed implicitly
}

/**
 * Simulation clock uses minutes since scenario start (integer ticks).
 * `wallClock` is the human-readable local sun time for UI display,
 * anchored to the Gray chronology (see meta.timeAnchor).
 */
export interface SimTime {
  minute: number;      // minutes since clock.start
  wallClock: string;   // "15:20" local sun time, display only
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'DISPUTED';

export interface SourceRef {
  /** Short key into meta.bibliography, e.g. "GRAY1991", "FOX1993", "RCOI". */
  key: string;
  /** Page/locus or note, e.g. "pp. 310–318", "Godfrey testimony, day 12". */
  locus?: string;
}

export interface Provenance {
  confidence: Confidence;
  sources: SourceRef[];
  note?: string; // free text: caveats, translation issues, etc.
}

/** Disputed quantity. NEVER collapse to a single number in the data file. */
export interface Estimate {
  low: number;
  best: number; // engine default; UI slider can sweep low..high
  high: number;
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Scenario root
// ---------------------------------------------------------------------------

export interface Scenario {
  meta: ScenarioMeta;
  clock: ClockSpec;
  terrain: TerrainSpec;
  weapons: Record<string, WeaponSpec>;
  tacticsProfiles: Record<string, TacticsProfile>;
  sides: Side[];
  leaders: Leader[];
  units: Unit[];
  orders: Order[];
  checkpoints: Checkpoint[];
  observationEvents: ObservationEvent[];
  variants: Variant[];
  calibration: CalibrationTargets;
}

export interface ScenarioMeta {
  id: string;                 // "little-bighorn-1876"
  title: string;
  date: string;               // ISO date of day one
  schemaVersion: string;      // semver of this schema
  /**
   * Time anchor statement, e.g.:
   * "Local sun time per Gray (1991) time-motion chronology. Sources using
   *  Chicago railroad time have been offset -62 min."
   */
  timeAnchor: string;
  /** Bibliography keyed by SourceRef.key. */
  bibliography: Record<string, { citation: string; url?: string }>;
  notes?: string;
}

export interface ClockSpec {
  /** Wall-clock of minute 0, e.g. "03:00" (Crow's Nest approach). */
  start: string;
  /** Wall-clock of scenario end, e.g. "21:00" June 25. */
  end: string;
  /** Engine tick length in sim-seconds. 30–60s is the expected range. */
  tickSeconds: number;
}

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------

export interface TerrainSpec {
  dem: {
    source: string;          // "USGS 3DEP 1/3 arc-second"
    bounds: { sw: GeoPoint; ne: GeoPoint };
    resolutionMeters: number;
  };
  /** Named landmarks for orders, checkpoints, and the UI. */
  landmarks: Landmark[];
  /** Rivers as paths with crossing points; depth class gates fording. */
  rivers: RiverSpec[];
  /** Vegetation/cover polygons: LOS opacity + movement + cover modifiers. */
  cover: CoverPolygon[];
  /**
   * 1876 corrections vs. the modern DEM/imagery: historical river meanders,
   * timber extent then vs. now. Applied as overrides at load time.
   */
  historicalCorrections: HistoricalCorrection[];
}

export interface Landmark {
  id: string;                // "crows-nest", "weir-point", "ford-b"
  name: string;              // "Crow's Nest"
  position: GeoPoint;
  provenance: Provenance;    // some landmark locations are themselves disputed
}

export interface RiverSpec {
  id: string;                // "little-bighorn-river"
  name: string;
  path: GeoPath;
  /** Fording points; elsewhere the river blocks or heavily penalizes crossing. */
  fords: { id: string; name: string; position: GeoPoint; provenance: Provenance }[];
  crossingPenaltyMinutes: number; // at a ford, per unit
}

export type CoverKind = 'TIMBER' | 'BRUSH' | 'RAVINE' | 'VILLAGE' | 'DUST_SMOKE_ZONE';

export interface CoverPolygon {
  id: string;
  kind: CoverKind;
  area: GeoPolygon;
  /** 0 = fully transparent to LOS, 1 = fully blocking. */
  losOpacity: number;
  /** Movement speed multiplier inside, 0..1. */
  movementFactor: number;
  /** Incoming fire effectiveness multiplier for units inside, 0..1. */
  coverFactor: number;
  provenance: Provenance;
}

export interface HistoricalCorrection {
  id: string;
  description: string;       // "1876 river course east of modern channel near Ford B"
  replaces?: string;         // id of the modern feature being overridden
  geometry: GeoPath | GeoPolygon;
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

/**
 * Effectiveness is a stepwise range-band table, not a formula, so the research
 * data (and later tuning) maps in directly.
 */
export interface WeaponSpec {
  id: string;                // "springfield-1873-carbine"
  name: string;
  class: 'CARBINE' | 'RIFLE_REPEATER' | 'RIFLE_MUZZLELOADER' | 'REVOLVER' | 'BOW' | 'MELEE';
  /** Aimed rounds per minute under combat conditions (not bench rate). */
  effectiveRoundsPerMinute: Estimate;
  /** Hit probability per aimed shot vs. an exposed man-sized target, by range band. */
  rangeBands: { maxRangeMeters: number; hitProbability: number }[];
  /** Can arc over cover (bows at Deep Ravine / Calhoun Hill). */
  indirectCapable: boolean;
  /** Malfunction chance per N rounds; carries the Springfield extraction debate. */
  malfunctionPer100Rounds: Estimate;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Sides, leaders, units
// ---------------------------------------------------------------------------

export interface Side {
  id: string;                // "us-7th-cavalry", "lakota-cheyenne-coalition"
  name: string;
  color: string;             // UI hex
  /**
   * Command model: HIERARCHICAL = orders flow through the tree with delays;
   * CONSENSUS_INITIATIVE = leaders influence nearby units, individual
   * initiative dominates (the native coalition per Fox's model).
   */
  commandModel: 'HIERARCHICAL' | 'CONSENSUS_INITIATIVE';
}

export interface Leader {
  id: string;                // "custer", "gall", "crazy-horse"
  sideId: string;
  name: string;
  /** All ratings 0–100. Engine treats 50 as doctrine-average. */
  ratings: {
    aggression: number;        // bias toward attack orders / accepting risk
    tacticalSkill: number;     // modifier on unit combat effectiveness in contact
    rally: number;             // chance to halt rout / reform within influence radius
    perception: number;        // modifier on spotting rolls & estimate accuracy
    /** Minutes of friction added to orders this leader issues or relays. */
    orderDelayMinutes: number;
  };
  /** Named behavioral biases the AI consults, e.g. "fears-enemy-escape". */
  traits: string[];
  /** Which unit this leader physically rides with (drives his viewshed POV). */
  attachedToUnitId: string;
  ratingsProvenance: Provenance; // rationale + sources for the numbers chosen
}

export type UnitKind =
  | 'CAVALRY_COMPANY'        // mounted; can dismount to skirmish (1-in-4 horse holders)
  | 'SCOUT_DETACHMENT'
  | 'PACK_TRAIN'
  | 'WARRIOR_BAND'           // fluid membership, initiative-driven
  | 'NONCOMBATANT_CAMP';     // village circles: LOS targets, objectives, not combatants

export interface Unit {
  id: string;                // "co-c", "hunkpapa-circle", "gall-band"
  sideId: string;
  kind: UnitKind;
  name: string;
  /** Effective fighting strength at scenario start. */
  strength: Estimate;
  /** weaponId -> fraction of the unit carrying it (fractions sum ≤ 1). */
  weaponMix: Record<string, number>;
  /** Rounds per man per weapon at start; resupply via orders (pack train). */
  ammunition: Record<string, Estimate>;
  mounted: boolean;
  /** 0–100. Combat, casualties, leader loss, flanking, and fatigue move it. */
  baseMorale: number;
  tacticsProfileId: string;
  startPosition: GeoPoint | GeoPolygon; // polygon for camps/dispersed bands
  startFormation: 'COLUMN' | 'LINE' | 'SKIRMISH' | 'DISPERSED' | 'CAMP';
  commandingLeaderId?: string;
  provenance: Provenance;
}

/**
 * Doctrine/behavior weights consulted by unit AI between explicit orders,
 * and by the engine when resolving how a unit executes an order.
 */
export interface TacticsProfile {
  id: string;                // "us-cav-doctrine-1876", "plains-warrior-fox-model"
  name: string;
  /** 0–100 weights. */
  weights: {
    standoffFire: number;      // prefer firing at range vs. closing
    infiltration: number;      // use dead ground/ravines to approach unseen
    shockCharge: number;       // willingness to close to melee
    dispersion: number;        // fight as individuals/small knots vs. formed body
    withdrawalDiscipline: number; // orderly retirement vs. disintegration when breaking
    targetHorses: number;      // priority on horse-holders / pony herds
  };
  /** Fraction of a mounted unit lost to horse-holding when dismounted (0.25). */
  dismountHolderFraction?: number;
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Orders — the input that drives the simulation
// ---------------------------------------------------------------------------

export type OrderType =
  | 'MOVE'                   // follow waypoints
  | 'ATTACK'                 // advance on objective, engage on contact
  | 'CHARGE'
  | 'HOLD'
  | 'DISMOUNT_SKIRMISH'
  | 'MOUNT'
  | 'WITHDRAW'               // retire toward objective, fighting
  | 'SCREEN'                 // scout/skirmish forward of a position
  | 'RESUPPLY'               // draw ammunition from a PACK_TRAIN unit in range
  | 'DEFEND_CAMP';           // warrior-band default trigger behavior

export interface Order {
  id: string;                // "custer-to-benteen-1520"
  issuedAtMinute: number;
  issuerLeaderId: string;
  recipientUnitIds: string[];
  type: OrderType;
  objective?: {
    waypoints?: GeoPoint[];
    landmarkId?: string;
    targetUnitId?: string;
  };
  /**
   * Transmission delay in minutes before the order takes effect (courier ride,
   * trumpet, in-person). Engine adds issuer's orderDelayMinutes on top.
   */
  transmissionMinutes: number;
  /** Verbatim historical text if recorded, e.g. the Cooke/Martini note. */
  historicalText?: string;
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Ground truth: checkpoints & observation events (calibration only)
// ---------------------------------------------------------------------------

/** Where a unit historically WAS at a time. Scores the sim; never moves units. */
export interface Checkpoint {
  id: string;
  minute: number;
  unitId: string;
  position: GeoPoint | GeoPolygon;
  /** Scoring tolerances: a run "hits" this checkpoint if within both. */
  toleranceMeters: number;
  toleranceMinutes: number;
  provenance: Provenance;
}

/**
 * Documented sighting or FAILURE to sight — validates the LOS model itself.
 * e.g. Crow's Nest: scouts see the pony herd, Custer cannot (haze);
 * Reno in the valley sees only the southern village edge.
 */
export interface ObservationEvent {
  id: string;
  minute: number;
  observerLeaderId?: string;
  observerUnitId?: string;
  observerPosition?: GeoPoint;  // if known independently of unit track
  target: { unitId?: string; landmarkId?: string; description: string };
  observed: boolean;            // false = historically could NOT see it
  atmosphericFactor?: number;   // 0..1 extra attenuation (haze, dust)
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Variants — labeled competing interpretations (never averaged)
// ---------------------------------------------------------------------------

export interface Variant {
  id: string;                 // "mtc-attempted-crossing" vs "mtc-feint"
  label: string;              // "Medicine Tail Coulee: attempted crossing"
  description: string;
  proponents: string;         // "Fox (1993); cf. ..." — free text
  /** Patch semantics: applied to the base scenario when this variant is on. */
  patch: {
    addOrders?: Order[];
    removeOrderIds?: string[];
    modifyOrders?: { id: string; changes: Partial<Order> }[];
    addCheckpoints?: Checkpoint[];
    removeCheckpointIds?: string[];
    modifyUnits?: { id: string; changes: Partial<Unit> }[];
  };
  /** Variants that cannot be enabled together. */
  excludesVariantIds: string[];
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Calibration targets — how a run is graded
// ---------------------------------------------------------------------------

export interface CalibrationTargets {
  /** unitId -> historical losses. */
  casualties: Record<string, { killed: Estimate; wounded: Estimate }>;
  /** Narrative end-state assertions the engine can check mechanically. */
  endState: {
    description: string;      // "Custer battalion annihilated; Reno-Benteen besieged on hill"
    unitId: string;
    condition: 'DESTROYED' | 'ROUTED' | 'HOLDING_AT' | 'WITHDRAWN';
    landmarkId?: string;
    byMinute: number;
    provenance: Provenance;
  }[];
  /** Weights for the composite calibration score. */
  scoring: {
    checkpointWeight: number;
    casualtyWeight: number;
    endStateWeight: number;
    observationWeight: number; // LOS-model validation events
  };
}

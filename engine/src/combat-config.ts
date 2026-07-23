/**
 * M4-A's single auditable [CAL] table. Scenario weapon tables remain the
 * data-authored source for RPM, range bands, and malfunction Estimates; every
 * engine-owned combat value is declared here and nowhere else.
 */
export interface CombatConfig {
  engagementRangeMeters: number;
  meleeRangeMeters: number;
  chargeRangeMeters: number;
  disengageRangeMeters: number;
  intensityExpectedHitsScale: number;
  combatFrictionFactor: number;
  exposureColumn: number;
  exposureLine: number;
  exposureSkirmish: number;
  exposureDispersed: number;
  exposurePackTrain: number;
  coverFloor: number;
  flankingMultiplier: number;
  flankingAngleRadians: number;
  tacticsBase: number;
  tacticsWeightScale: number;
  bowIndirectHitProbabilityMultiplier: number;
  clearJamTicks: number;
  lowAmmoFraction: number;
  lowAmmoDiscipline: number;
  shakenDiscipline: number;
  brokenDiscipline: number;
  moraleSteadyThreshold: number;
  moraleShakenThreshold: number;
  moraleBrokenThreshold: number;
  moraleCasualtyDrain: number;
  moraleLeaderLossDrain: number;
  moraleFlankedDrain: number;
  moraleIsolationDrain: number;
  moraleLowAmmoDrain: number;
  moraleSuppressionDrain: number;
  moraleLullRecovery: number;
  moraleFriendlyRecovery: number;
  moraleLeaderRallyScale: number;
  friendlyRadiusMeters: number;
  isolationRadiusMeters: number;
  leaderInfluenceRadiusMeters: number;
  routRallyMorale: number;
  destructionStrengthFloor: number;
  destructionCohesionFloor: number;
  withdrawalDisciplineThreshold: number;
  routCohesionDrain: number;
  leaderExposurePerHit: number;
  leaderMeleeExposureMultiplier: number;
  leaderTraitExposureMultiplier: number;
  leaderOrderDelayBumpMinutes: number;
  resupplyRadiusMeters: number;
  resupplyRoundsPerTick: number;
  fatigueGallopPerTick: number;
  fatigueMeleePerTick: number;
  fatigueHaltRecoveryPerTick: number;
  fatigueSpeedCapThreshold: number;
  fatigueCombatPenaltyMaximum: number;
  chargeShockStrengthScale: number;
  chargeSpeedBonus: number;
  chargeBreakMargin: number;
  chargeRepelMargin: number;
  marchSpacingMeters: number;
  courierTargetExposure: number;
  initiativeRadiusMeters: number;
  pursuitCloseRangeMeters: number;
  pursuitRepathCadenceTicks: number;
  pursuitBreakTicks: number;
  pursuitRangeLossToleranceMeters: number;
  engagementComplexAdjacencyTicks: number;
  enemyInterdictionRadiusMeters: number;
  /** D87 global adoption threshold on the tactics-profile infiltration weight. */
  infiltrationAdoptionThreshold: number;
  /** D87 kill-output share while physically occupying mapped cover. */
  infiltrationKillMultiplier: number;
  /** D87 suppression-output multiplier while physically occupying mapped cover. */
  infiltrationSuppressionMultiplier: number;
  /** D81 global side-level ratios. Override key: killedToWoundedRatio.<sideId>. */
  killedToWoundedRatioBySide: Readonly<Record<string, number>>;
}

export interface SourcedCombatRange {
  low: number;
  best: number;
  high: number;
  provenance: string;
}

export type CombatConfigProvenance = 'spec-given' | 'proposed-flagged' | 'sourced-range';
export const COMBAT_FRICTION_PROVENANCE =
  'anchored by historical-totals arithmetic (268 US / 53 Reno-Benteen / <=300 coalition imply 10-20x reduction from unfrictioned rates); M5 calibrates the digit.';

/** D79 ranges derived and documented before the first M5-B tuning move. */
export const M5B_DERIVED_CALIBRATION_RANGES = Object.freeze({
  combatFrictionFactor: Object.freeze({ low: 0.05, high: 0.1,
    provenance: 'codex-report-m4a-d74.md historical-totals anchor: 10-20x reduction => reciprocal 0.05-0.10' }),
  moraleCasualtyDrain: Object.freeze({ low: 50, high: 100,
    provenance: 'DERIVED: normalized casualty fraction 0-1 may remove one-half to one full 0-100 morale scale at total loss' }),
  moraleSuppressionDrain: Object.freeze({ low: 0, high: 1,
    provenance: 'DERIVED: suppression input is clamped 0-1; bounded at 0-1 morale point per tick' }),
  moraleFlankedDrain: Object.freeze({ low: 0, high: 5,
    provenance: 'DERIVED: binary flanked input; bounded at 0-5 morale points per tick, below the 10-point order-of-magnitude' }),
  moraleLullRecovery: Object.freeze({ low: 0, high: 0.18,
    provenance: 'DERIVED: zero-to-existing M4-A starting scale; no evidence authorizes recovery above the audited starting value' }),
  moraleFriendlyRecovery: Object.freeze({ low: 0, high: 0.12,
    provenance: 'DERIVED: zero-to-existing M4-A starting scale; no evidence authorizes recovery above the audited starting value' }),
  moraleLeaderRallyScale: Object.freeze({ low: 0, high: 0.004,
    provenance: 'DERIVED: zero-to-existing M4-A starting scale; no evidence authorizes rally above the audited starting value' }),
  infiltrationAdoptionThreshold: Object.freeze({ low: 20, high: 90,
    provenance: 'D87 DERIVED: rails are the sourced scenario tactics weights (US 20 through warrior 90); 50 is the doctrine midpoint' }),
  infiltrationKillMultiplier: Object.freeze({ low: 0.2, high: 0.8,
    provenance: 'D87 DERIVED: sustained-suppression posture assigns a minority 20-80% of ordinary lethal output; never zero and never full ordinary fire' }),
  infiltrationSuppressionMultiplier: Object.freeze({ low: 1, high: 10,
    provenance: 'D87 DERIVED: ordinary suppression is the 1x floor; tactics weights use a 0-100 scale, bounding amplification to one order of magnitude' }),
  withdrawalDisciplineThreshold: Object.freeze({ low: 55, high: 70,
    provenance: 'D75/D87 SOURCED: scenario tactics-profile withdrawalDiscipline weights span formed US cavalry 55, scouts 65, and warrior bands 70' }),
});

/**
 * D81 preserves the calibration-target spreads instead of averaging them.
 * US low/high use the unit-keyed target bounds (235/60 and 285/45); the best
 * is the spec's hilltop-inclusive 268/52 anchor. Coalition bounds are the
 * most conservative cross-products of K 31-300 and W 100-200.
 */
export const KILLED_TO_WOUNDED_RATIO_RANGES: Readonly<Record<string, SourcedCombatRange>> =
  Object.freeze({
    'us-7th-cavalry': Object.freeze({
      low: 235 / 60,
      best: 268 / 52,
      high: 285 / 45,
      provenance: 'M5-SPEC D81; calibration.casualties unit bands; research §I hilltop-inclusive 268 K / 52 W',
    }),
    'lakota-cheyenne-coalition': Object.freeze({
      low: 31 / 200,
      best: 60 / 160,
      high: 300 / 100,
      provenance: 'M5-SPEC D81; calibration.sideCasualties DISPUTED K 31-300 / W 100-200',
    }),
  });

/** Scalar values are proposed [CAL] except the two spec-given slots; D81 ratios use sourced ranges above. */
export const DEFAULT_COMBAT_CONFIG: Readonly<CombatConfig> = Object.freeze({
  engagementRangeMeters: 700,
  meleeRangeMeters: 25,
  chargeRangeMeters: 180,
  disengageRangeMeters: 900,
  intensityExpectedHitsScale: 2,
  combatFrictionFactor: 0.06,
  exposureColumn: 1,
  exposureLine: 0.85,
  exposureSkirmish: 0.65,
  exposureDispersed: 0.5,
  exposurePackTrain: 1.25,
  coverFloor: 0.05,
  flankingMultiplier: 1.25,
  flankingAngleRadians: Math.PI * 0.6,
  tacticsBase: 0.75,
  tacticsWeightScale: 200,
  bowIndirectHitProbabilityMultiplier: 0.65,
  clearJamTicks: 4,
  lowAmmoFraction: 0.2,
  lowAmmoDiscipline: 0.65,
  shakenDiscipline: 0.8,
  brokenDiscipline: 0.5,
  moraleSteadyThreshold: 70,
  moraleShakenThreshold: 40,
  moraleBrokenThreshold: 15,
  moraleCasualtyDrain: 70,
  moraleLeaderLossDrain: 22,
  moraleFlankedDrain: 1.2,
  moraleIsolationDrain: 0.35,
  moraleLowAmmoDrain: 0.25,
  moraleSuppressionDrain: 0.08,
  moraleLullRecovery: 0.18,
  moraleFriendlyRecovery: 0.12,
  moraleLeaderRallyScale: 0.004,
  friendlyRadiusMeters: 450,
  isolationRadiusMeters: 650,
  leaderInfluenceRadiusMeters: 500,
  routRallyMorale: 25,
  destructionStrengthFloor: 0,
  destructionCohesionFloor: 3,
  withdrawalDisciplineThreshold: 60,
  routCohesionDrain: 1,
  leaderExposurePerHit: 0.0015,
  leaderMeleeExposureMultiplier: 3,
  leaderTraitExposureMultiplier: 1.75,
  leaderOrderDelayBumpMinutes: 5,
  resupplyRadiusMeters: 250,
  resupplyRoundsPerTick: 240,
  fatigueGallopPerTick: 0.45,
  fatigueMeleePerTick: 0.8,
  fatigueHaltRecoveryPerTick: 0.2,
  fatigueSpeedCapThreshold: 75,
  fatigueCombatPenaltyMaximum: 0.35,
  chargeShockStrengthScale: 1,
  chargeSpeedBonus: 1.2,
  chargeBreakMargin: 1.1,
  chargeRepelMargin: 0.8,
  marchSpacingMeters: 150,
  courierTargetExposure: 0.2,
  initiativeRadiusMeters: 1_500,
  pursuitCloseRangeMeters: 50,
  pursuitRepathCadenceTicks: 10,
  pursuitBreakTicks: 4,
  pursuitRangeLossToleranceMeters: 15,
  engagementComplexAdjacencyTicks: 120,
  enemyInterdictionRadiusMeters: 250,
  infiltrationAdoptionThreshold: 50,
  infiltrationKillMultiplier: 0.35,
  infiltrationSuppressionMultiplier: 5,
  killedToWoundedRatioBySide: Object.freeze(Object.fromEntries(
    Object.entries(KILLED_TO_WOUNDED_RATIO_RANGES).map(([sideId, range]) => [sideId, range.best]),
  )),
});

export const COMBAT_CONFIG_PROVENANCE: Readonly<Record<keyof CombatConfig, CombatConfigProvenance>> =
  Object.freeze(Object.fromEntries(
    (Object.keys(DEFAULT_COMBAT_CONFIG) as Array<keyof CombatConfig>).map((key) => [
      key,
      key === 'killedToWoundedRatioBySide'
        ? 'sourced-range'
        : key === 'lowAmmoFraction' || key === 'marchSpacingMeters'
        ? 'spec-given'
        : 'proposed-flagged',
    ]),
  ) as Record<keyof CombatConfig, CombatConfigProvenance>);

export function combatConfig(overrides: Readonly<Record<string, number>> = {}): CombatConfig {
  const result: CombatConfig = {
    ...DEFAULT_COMBAT_CONFIG,
    killedToWoundedRatioBySide: { ...DEFAULT_COMBAT_CONFIG.killedToWoundedRatioBySide },
  };
  for (const key of Object.keys(DEFAULT_COMBAT_CONFIG) as Array<keyof CombatConfig>) {
    if (key === 'killedToWoundedRatioBySide') continue;
    const value = overrides[key];
    if (value !== undefined) (result[key] as number) = value;
  }
  const ratios = { ...result.killedToWoundedRatioBySide };
  for (const sideId of Object.keys(ratios)) {
    const value = overrides[`killedToWoundedRatio.${sideId}`];
    if (value !== undefined) ratios[sideId] = value;
  }
  return { ...result, killedToWoundedRatioBySide: ratios };
}

import type { Scenario } from './schema/scenario-schema.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * Readable, dependency-free runtime validation for scenario files. It checks the
 * complete required shape; cross-record semantics live in the integrity suite.
 */
export function validateScenario(value: unknown): ValidationResult {
  const errors: string[] = [];
  const fail = (path: string, message: string): void => {
    errors.push(`${path}: ${message}`);
  };
  const objectAt = (candidate: unknown, path: string): JsonRecord | undefined => {
    if (!isRecord(candidate)) {
      fail(path, 'expected object');
      return undefined;
    }
    return candidate;
  };
  const arrayAt = (candidate: unknown, path: string): unknown[] => {
    if (!Array.isArray(candidate)) {
      fail(path, 'expected array');
      return [];
    }
    return candidate;
  };
  const stringAt = (candidate: unknown, path: string): void => {
    if (!isString(candidate)) fail(path, 'expected string');
  };
  const numberAt = (candidate: unknown, path: string): void => {
    if (!isNumber(candidate)) fail(path, 'expected finite number');
  };
  const booleanAt = (candidate: unknown, path: string): void => {
    if (typeof candidate !== 'boolean') fail(path, 'expected boolean');
  };
  const stringsAt = (candidate: unknown, path: string): void => {
    arrayAt(candidate, path).forEach((item, index) => stringAt(item, `${path}[${index}]`));
  };
  const pointAt = (candidate: unknown, path: string): void => {
    const point = objectAt(candidate, path);
    if (!point) return;
    numberAt(point.lat, `${path}.lat`);
    numberAt(point.lon, `${path}.lon`);
  };
  const provenanceAt = (candidate: unknown, path: string): void => {
    const provenance = objectAt(candidate, path);
    if (!provenance) return;
    if (!['HIGH', 'MEDIUM', 'LOW', 'DISPUTED'].includes(String(provenance.confidence))) {
      fail(`${path}.confidence`, 'expected a Confidence value');
    }
    arrayAt(provenance.sources, `${path}.sources`).forEach((item, index) => {
      const source = objectAt(item, `${path}.sources[${index}]`);
      if (source) stringAt(source.key, `${path}.sources[${index}].key`);
    });
    if (provenance.note !== undefined) stringAt(provenance.note, `${path}.note`);
  };
  const estimateAt = (candidate: unknown, path: string): void => {
    const estimate = objectAt(candidate, path);
    if (!estimate) return;
    numberAt(estimate.low, `${path}.low`);
    numberAt(estimate.best, `${path}.best`);
    numberAt(estimate.high, `${path}.high`);
    provenanceAt(estimate.provenance, `${path}.provenance`);
  };
  const polygonAt = (candidate: unknown, path: string): void => {
    const polygon = objectAt(candidate, path);
    if (!polygon) return;
    arrayAt(polygon.ring, `${path}.ring`).forEach((point, index) =>
      pointAt(point, `${path}.ring[${index}]`),
    );
  };
  const positionAt = (candidate: unknown, path: string): void => {
    const position = objectAt(candidate, path);
    if (!position) return;
    if ('ring' in position) polygonAt(position, path);
    else pointAt(position, path);
  };
  const orderAt = (candidate: unknown, path: string): void => {
    const order = objectAt(candidate, path);
    if (!order) return;
    stringAt(order.id, `${path}.id`);
    numberAt(order.issuedAtMinute, `${path}.issuedAtMinute`);
    stringAt(order.issuerLeaderId, `${path}.issuerLeaderId`);
    stringsAt(order.recipientUnitIds, `${path}.recipientUnitIds`);
    stringAt(order.type, `${path}.type`);
    numberAt(order.transmissionMinutes, `${path}.transmissionMinutes`);
    if (order.objective !== undefined) {
      const objective = objectAt(order.objective, `${path}.objective`);
      if (objective?.waypoints !== undefined) {
        arrayAt(objective.waypoints, `${path}.objective.waypoints`).forEach((point, index) =>
          pointAt(point, `${path}.objective.waypoints[${index}]`),
        );
      }
      if (objective?.landmarkId !== undefined) stringAt(objective.landmarkId, `${path}.objective.landmarkId`);
      if (objective?.targetUnitId !== undefined) stringAt(objective.targetUnitId, `${path}.objective.targetUnitId`);
    }
    if (order.historicalText !== undefined) stringAt(order.historicalText, `${path}.historicalText`);
    provenanceAt(order.provenance, `${path}.provenance`);
  };
  const checkpointAt = (candidate: unknown, path: string): void => {
    const checkpoint = objectAt(candidate, path);
    if (!checkpoint) return;
    stringAt(checkpoint.id, `${path}.id`);
    numberAt(checkpoint.minute, `${path}.minute`);
    stringAt(checkpoint.unitId, `${path}.unitId`);
    positionAt(checkpoint.position, `${path}.position`);
    numberAt(checkpoint.toleranceMeters, `${path}.toleranceMeters`);
    numberAt(checkpoint.toleranceMinutes, `${path}.toleranceMinutes`);
    provenanceAt(checkpoint.provenance, `${path}.provenance`);
  };

  const root = objectAt(value, '$');
  if (!root) return { valid: false, errors };

  const meta = objectAt(root.meta, '$.meta');
  if (meta) {
    ['id', 'title', 'date', 'schemaVersion', 'timeAnchor'].forEach((key) =>
      stringAt(meta[key], `$.meta.${key}`),
    );
    const bibliography = objectAt(meta.bibliography, '$.meta.bibliography');
    if (bibliography) {
      Object.entries(bibliography).forEach(([key, item]) => {
        const entry = objectAt(item, `$.meta.bibliography.${key}`);
        if (entry) stringAt(entry.citation, `$.meta.bibliography.${key}.citation`);
      });
    }
  }

  const clock = objectAt(root.clock, '$.clock');
  if (clock) {
    stringAt(clock.start, '$.clock.start');
    stringAt(clock.end, '$.clock.end');
    numberAt(clock.tickSeconds, '$.clock.tickSeconds');
  }

  const terrain = objectAt(root.terrain, '$.terrain');
  if (terrain) {
    const dem = objectAt(terrain.dem, '$.terrain.dem');
    if (dem) {
      stringAt(dem.source, '$.terrain.dem.source');
      numberAt(dem.resolutionMeters, '$.terrain.dem.resolutionMeters');
      const bounds = objectAt(dem.bounds, '$.terrain.dem.bounds');
      if (bounds) {
        pointAt(bounds.sw, '$.terrain.dem.bounds.sw');
        pointAt(bounds.ne, '$.terrain.dem.bounds.ne');
      }
    }
    arrayAt(terrain.landmarks, '$.terrain.landmarks').forEach((item, index) => {
      const landmark = objectAt(item, `$.terrain.landmarks[${index}]`);
      if (!landmark) return;
      stringAt(landmark.id, `$.terrain.landmarks[${index}].id`);
      stringAt(landmark.name, `$.terrain.landmarks[${index}].name`);
      pointAt(landmark.position, `$.terrain.landmarks[${index}].position`);
      provenanceAt(landmark.provenance, `$.terrain.landmarks[${index}].provenance`);
    });
    arrayAt(terrain.rivers, '$.terrain.rivers').forEach((item, index) => {
      const river = objectAt(item, `$.terrain.rivers[${index}]`);
      if (!river) return;
      stringAt(river.id, `$.terrain.rivers[${index}].id`);
      stringAt(river.name, `$.terrain.rivers[${index}].name`);
      const path = objectAt(river.path, `$.terrain.rivers[${index}].path`);
      arrayAt(path?.points, `$.terrain.rivers[${index}].path.points`).forEach((point, pointIndex) =>
        pointAt(point, `$.terrain.rivers[${index}].path.points[${pointIndex}]`),
      );
      arrayAt(river.fords, `$.terrain.rivers[${index}].fords`).forEach((fordItem, fordIndex) => {
        const ford = objectAt(fordItem, `$.terrain.rivers[${index}].fords[${fordIndex}]`);
        if (!ford) return;
        stringAt(ford.id, `$.terrain.rivers[${index}].fords[${fordIndex}].id`);
        stringAt(ford.name, `$.terrain.rivers[${index}].fords[${fordIndex}].name`);
        pointAt(ford.position, `$.terrain.rivers[${index}].fords[${fordIndex}].position`);
        provenanceAt(ford.provenance, `$.terrain.rivers[${index}].fords[${fordIndex}].provenance`);
      });
      numberAt(river.crossingPenaltyMinutes, `$.terrain.rivers[${index}].crossingPenaltyMinutes`);
    });
    arrayAt(terrain.cover, '$.terrain.cover').forEach((item, index) => {
      const cover = objectAt(item, `$.terrain.cover[${index}]`);
      if (!cover) return;
      stringAt(cover.id, `$.terrain.cover[${index}].id`);
      stringAt(cover.kind, `$.terrain.cover[${index}].kind`);
      polygonAt(cover.area, `$.terrain.cover[${index}].area`);
      ['losOpacity', 'movementFactor', 'coverFactor'].forEach((key) =>
        numberAt(cover[key], `$.terrain.cover[${index}].${key}`),
      );
      provenanceAt(cover.provenance, `$.terrain.cover[${index}].provenance`);
    });
    arrayAt(terrain.historicalCorrections, '$.terrain.historicalCorrections').forEach((item, index) => {
      const correction = objectAt(item, `$.terrain.historicalCorrections[${index}]`);
      if (!correction) return;
      stringAt(correction.id, `$.terrain.historicalCorrections[${index}].id`);
      stringAt(correction.description, `$.terrain.historicalCorrections[${index}].description`);
      const geometry = objectAt(correction.geometry, `$.terrain.historicalCorrections[${index}].geometry`);
      if (geometry && 'points' in geometry) {
        arrayAt(geometry.points, `$.terrain.historicalCorrections[${index}].geometry.points`).forEach(
          (point, pointIndex) => pointAt(point, `$.terrain.historicalCorrections[${index}].geometry.points[${pointIndex}]`),
        );
      } else if (geometry) polygonAt(geometry, `$.terrain.historicalCorrections[${index}].geometry`);
      provenanceAt(correction.provenance, `$.terrain.historicalCorrections[${index}].provenance`);
    });
  }

  const weapons = objectAt(root.weapons, '$.weapons');
  if (weapons) Object.entries(weapons).forEach(([key, item]) => {
    const weapon = objectAt(item, `$.weapons.${key}`);
    if (!weapon) return;
    ['id', 'name', 'class'].forEach((field) => stringAt(weapon[field], `$.weapons.${key}.${field}`));
    estimateAt(weapon.effectiveRoundsPerMinute, `$.weapons.${key}.effectiveRoundsPerMinute`);
    arrayAt(weapon.rangeBands, `$.weapons.${key}.rangeBands`).forEach((bandItem, index) => {
      const band = objectAt(bandItem, `$.weapons.${key}.rangeBands[${index}]`);
      if (!band) return;
      numberAt(band.maxRangeMeters, `$.weapons.${key}.rangeBands[${index}].maxRangeMeters`);
      numberAt(band.hitProbability, `$.weapons.${key}.rangeBands[${index}].hitProbability`);
    });
    booleanAt(weapon.indirectCapable, `$.weapons.${key}.indirectCapable`);
    estimateAt(weapon.malfunctionPer100Rounds, `$.weapons.${key}.malfunctionPer100Rounds`);
  });

  const tactics = objectAt(root.tacticsProfiles, '$.tacticsProfiles');
  if (tactics) Object.entries(tactics).forEach(([key, item]) => {
    const profile = objectAt(item, `$.tacticsProfiles.${key}`);
    if (!profile) return;
    stringAt(profile.id, `$.tacticsProfiles.${key}.id`);
    stringAt(profile.name, `$.tacticsProfiles.${key}.name`);
    const weights = objectAt(profile.weights, `$.tacticsProfiles.${key}.weights`);
    if (weights) ['standoffFire', 'infiltration', 'shockCharge', 'dispersion', 'withdrawalDiscipline', 'targetHorses']
      .forEach((field) => numberAt(weights[field], `$.tacticsProfiles.${key}.weights.${field}`));
    if (profile.dismountHolderFraction !== undefined) numberAt(profile.dismountHolderFraction, `$.tacticsProfiles.${key}.dismountHolderFraction`);
    provenanceAt(profile.provenance, `$.tacticsProfiles.${key}.provenance`);
  });

  arrayAt(root.sides, '$.sides').forEach((item, index) => {
    const side = objectAt(item, `$.sides[${index}]`);
    if (side) ['id', 'name', 'color', 'commandModel'].forEach((field) => stringAt(side[field], `$.sides[${index}].${field}`));
  });
  arrayAt(root.leaders, '$.leaders').forEach((item, index) => {
    const leader = objectAt(item, `$.leaders[${index}]`);
    if (!leader) return;
    ['id', 'sideId', 'name', 'attachedToUnitId'].forEach((field) => stringAt(leader[field], `$.leaders[${index}].${field}`));
    const ratings = objectAt(leader.ratings, `$.leaders[${index}].ratings`);
    if (ratings) ['aggression', 'tacticalSkill', 'rally', 'perception', 'orderDelayMinutes']
      .forEach((field) => numberAt(ratings[field], `$.leaders[${index}].ratings.${field}`));
    stringsAt(leader.traits, `$.leaders[${index}].traits`);
    provenanceAt(leader.ratingsProvenance, `$.leaders[${index}].ratingsProvenance`);
  });
  arrayAt(root.units, '$.units').forEach((item, index) => {
    const unit = objectAt(item, `$.units[${index}]`);
    if (!unit) return;
    ['id', 'sideId', 'kind', 'name', 'tacticsProfileId', 'startFormation'].forEach((field) =>
      stringAt(unit[field], `$.units[${index}].${field}`),
    );
    estimateAt(unit.strength, `$.units[${index}].strength`);
    const mix = objectAt(unit.weaponMix, `$.units[${index}].weaponMix`);
    if (mix) Object.entries(mix).forEach(([weaponId, fraction]) => numberAt(fraction, `$.units[${index}].weaponMix.${weaponId}`));
    const ammunition = objectAt(unit.ammunition, `$.units[${index}].ammunition`);
    if (ammunition) Object.entries(ammunition).forEach(([weaponId, estimate]) => estimateAt(estimate, `$.units[${index}].ammunition.${weaponId}`));
    booleanAt(unit.mounted, `$.units[${index}].mounted`);
    numberAt(unit.baseMorale, `$.units[${index}].baseMorale`);
    positionAt(unit.startPosition, `$.units[${index}].startPosition`);
    if (unit.commandingLeaderId !== undefined) stringAt(unit.commandingLeaderId, `$.units[${index}].commandingLeaderId`);
    provenanceAt(unit.provenance, `$.units[${index}].provenance`);
  });
  arrayAt(root.orders, '$.orders').forEach((item, index) => orderAt(item, `$.orders[${index}]`));
  arrayAt(root.checkpoints, '$.checkpoints').forEach((item, index) => checkpointAt(item, `$.checkpoints[${index}]`));
  arrayAt(root.observationEvents, '$.observationEvents').forEach((item, index) => {
    const event = objectAt(item, `$.observationEvents[${index}]`);
    if (!event) return;
    stringAt(event.id, `$.observationEvents[${index}].id`);
    numberAt(event.minute, `$.observationEvents[${index}].minute`);
    if (event.observerLeaderId !== undefined) stringAt(event.observerLeaderId, `$.observationEvents[${index}].observerLeaderId`);
    if (event.observerUnitId !== undefined) stringAt(event.observerUnitId, `$.observationEvents[${index}].observerUnitId`);
    if (event.observerPosition !== undefined) pointAt(event.observerPosition, `$.observationEvents[${index}].observerPosition`);
    const target = objectAt(event.target, `$.observationEvents[${index}].target`);
    if (target) stringAt(target.description, `$.observationEvents[${index}].target.description`);
    booleanAt(event.observed, `$.observationEvents[${index}].observed`);
    if (event.atmosphericFactor !== undefined) numberAt(event.atmosphericFactor, `$.observationEvents[${index}].atmosphericFactor`);
    provenanceAt(event.provenance, `$.observationEvents[${index}].provenance`);
  });
  arrayAt(root.variants, '$.variants').forEach((item, index) => {
    const variant = objectAt(item, `$.variants[${index}]`);
    if (!variant) return;
    ['id', 'label', 'description', 'proponents'].forEach((field) => stringAt(variant[field], `$.variants[${index}].${field}`));
    const patch = objectAt(variant.patch, `$.variants[${index}].patch`);
    if (patch) {
      if (patch.addOrders !== undefined) arrayAt(patch.addOrders, `$.variants[${index}].patch.addOrders`).forEach((order, orderIndex) => orderAt(order, `$.variants[${index}].patch.addOrders[${orderIndex}]`));
      if (patch.addCheckpoints !== undefined) arrayAt(patch.addCheckpoints, `$.variants[${index}].patch.addCheckpoints`).forEach((checkpoint, checkpointIndex) => checkpointAt(checkpoint, `$.variants[${index}].patch.addCheckpoints[${checkpointIndex}]`));
      ['removeOrderIds', 'removeCheckpointIds'].forEach((field) => {
        if (patch[field] !== undefined) stringsAt(patch[field], `$.variants[${index}].patch.${field}`);
      });
      ['modifyOrders', 'modifyUnits'].forEach((field) => {
        if (patch[field] !== undefined) arrayAt(patch[field], `$.variants[${index}].patch.${field}`).forEach((changeItem, changeIndex) => {
          const change = objectAt(changeItem, `$.variants[${index}].patch.${field}[${changeIndex}]`);
          if (change) {
            stringAt(change.id, `$.variants[${index}].patch.${field}[${changeIndex}].id`);
            objectAt(change.changes, `$.variants[${index}].patch.${field}[${changeIndex}].changes`);
          }
        });
      });
    }
    stringsAt(variant.excludesVariantIds, `$.variants[${index}].excludesVariantIds`);
    provenanceAt(variant.provenance, `$.variants[${index}].provenance`);
  });

  const calibration = objectAt(root.calibration, '$.calibration');
  if (calibration) {
    const casualties = objectAt(calibration.casualties, '$.calibration.casualties');
    if (casualties) Object.entries(casualties).forEach(([unitId, item]) => {
      const casualty = objectAt(item, `$.calibration.casualties.${unitId}`);
      if (!casualty) return;
      estimateAt(casualty.killed, `$.calibration.casualties.${unitId}.killed`);
      estimateAt(casualty.wounded, `$.calibration.casualties.${unitId}.wounded`);
    });
    arrayAt(calibration.endState, '$.calibration.endState').forEach((item, index) => {
      const state = objectAt(item, `$.calibration.endState[${index}]`);
      if (!state) return;
      ['description', 'unitId', 'condition'].forEach((field) => stringAt(state[field], `$.calibration.endState[${index}].${field}`));
      if (state.landmarkId !== undefined) stringAt(state.landmarkId, `$.calibration.endState[${index}].landmarkId`);
      numberAt(state.byMinute, `$.calibration.endState[${index}].byMinute`);
      provenanceAt(state.provenance, `$.calibration.endState[${index}].provenance`);
    });
    const scoring = objectAt(calibration.scoring, '$.calibration.scoring');
    if (scoring) ['checkpointWeight', 'casualtyWeight', 'endStateWeight', 'observationWeight']
      .forEach((field) => numberAt(scoring[field], `$.calibration.scoring.${field}`));
  }

  return { valid: errors.length === 0, errors };
}

export function assertScenario(value: unknown): asserts value is Scenario {
  const result = validateScenario(value);
  if (!result.valid) throw new Error(`Invalid scenario:\n${result.errors.join('\n')}`);
}

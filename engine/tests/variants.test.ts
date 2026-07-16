import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import { applyVariants } from '../../src/scenario/apply-variants.js';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { cloneScenario } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

describe('scenario variant application', () => {
  it('applies v-c-company-split by adding co-c-det, halving co-c, and updating wing orders', () => {
    const applied = applyVariants(scenario, ['v-c-company-split']);
    expect(applied.units.find((unit) => unit.id === 'co-c')?.strength.best).toBe(20);
    expect(applied.units.find((unit) => unit.id === 'co-c-det')?.strength.best).toBe(20);
    expect(applied.orders.find((order) => order.id === 'yates-ford-b-probe')?.recipientUnitIds)
      .toEqual(['co-e', 'co-f', 'co-c-det']);
    expect(scenario.units.some((unit) => unit.id === 'co-c-det')).toBe(false);
  });

  it('applies v-benteen-prompt modifyLeaders orderDelayMinutes 3', () => {
    const applied = applyVariants(scenario, ['v-benteen-prompt']);
    expect(applied.leaders.find((leader) => leader.id === 'benteen')?.ratings.orderDelayMinutes)
      .toBe(3);
    expect(applied.orders.find((order) => order.id === 'martini-msg')?.transmissionMinutes)
      .toBe(15);
  });

  it('enforces variant exclusion groups', () => {
    const synthetic = cloneScenario(scenario);
    synthetic.variants[0].excludesVariantIds = [synthetic.variants[1].id];
    synthetic.variants[1].excludesVariantIds = [synthetic.variants[0].id];
    expect(() => applyVariants(synthetic, [synthetic.variants[0].id, synthetic.variants[1].id]))
      .toThrow(/Conflicting variants enabled/);
  });
});

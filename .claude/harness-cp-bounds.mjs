// HARNESS-REPAIR instrument — Clopper-Pearson bounds for the RPC-timeout base rate,
// and absence-of-firing probabilities against the interval's lower bound.
// Deterministic math only; no RNG, no repository bytes touched.
//
// Census populations (sources cited in the registration):
//   ALL-ERA:      16 fired of 19 determinate full-suite serial runs (D91–D128)
//   CURRENT-SUITE: 10 fired of 11 runs on the 22-file suite (D110–D128)
//   RECENT-SIX:    5 fired of 6 (the tally the item carried before the ledger search)

// Regularized incomplete beta via continued fraction (Lentz), then bisection for the
// beta quantile — standard numerics, adequate precision for two-decimal reporting.
function logGamma(x) {
  const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  for (let i = 0; i < 8; i++) a += c[i] / (x + i + 1);
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function betacf(a, b, x) {
  const MAXIT = 200, EPS = 3e-12, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function ibeta(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a
    : 1 - bt * betacf(b, a, 1 - x) / b;
}
function betaQuantile(p, a, b) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (ibeta(a, b, mid) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
// Clopper-Pearson 95% for x of n
function cp95(x, n) {
  const lower = x === 0 ? 0 : betaQuantile(0.025, x, n - x + 1);
  const upper = x === n ? 1 : betaQuantile(0.975, x + 1, n - x);
  return { lower, upper };
}

const populations = [
  { name: 'ALL-ERA (D91-D128)', x: 16, n: 19 },
  { name: 'CURRENT-SUITE (22-file, D110-D128)', x: 10, n: 11 },
  { name: 'RECENT-SIX (pre-search tally)', x: 5, n: 6 },
];
for (const { name, x, n } of populations) {
  const { lower, upper } = cp95(x, n);
  console.log(`${name}: ${x}/${n} fired = ${(100 * x / n).toFixed(1)}%; 95% CP [${lower.toFixed(3)}, ${upper.toFixed(3)}]`);
  const rows = [];
  for (const N of [3, 4, 5, 6, 8, 10, 12]) {
    rows.push(`N=${N}: ${Math.pow(1 - lower, N).toExponential(2)}`);
  }
  console.log(`  P(0 firings in N clean runs | p = CP lower ${lower.toFixed(3)}): ${rows.join('  ')}`);
}
console.log('\nReading: the statistical route needs the smallest N with P < 0.005 against the');
console.log('chosen population\'s CP lower bound; the registration names the population before');
console.log('the arithmetic is applied.');

// Residual-rate table (the adjudication's Amendment 1): what a clean 6-run batch CANNOT
// reject. P(0 firings in 6 | residual p), and the N needed to reject that residual at 0.05.
console.log('\nResidual rates a clean N=6 batch cannot reject:');
for (const p of [0.3, 0.2, 0.1]) {
  const p0in6 = Math.pow(1 - p, 6);
  let N = 1;
  while (Math.pow(1 - p, N) > 0.05) N++;
  console.log(`  residual p=${p}: P(0 in 6) = ${p0in6.toFixed(3)}; N to reject at 0.05 = ${N}`);
}
console.log('A fix taking the rate 0.9 -> 0.2 still produces a clean six-run batch 26% of');
console.log('the time: Route S at N=6 establishes MATERIALLY REDUCED below the bound, never');
console.log('FIXED — which is why exit-1 tolerance retires only under Route M.');

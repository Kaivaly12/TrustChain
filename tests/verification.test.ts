import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeScannedPayload, analyzeScannedPayloadAsync, getHeuristicWebIntelligence } from '../src/services/webScraperIntelligence.ts';
import { INITIAL_LEDGER } from '../src/services/blockchainLedger.ts';

const code = 'NIKE-AIR-JORDAN-1042';

test('a complete registered code matches, including surrounding whitespace', () => {
  const result = analyzeScannedPayload(` ${code} `, INITIAL_LEDGER);
  assert.equal(result.blockchainRecord?.tokenId, code);
  assert.equal(result.trustScore, 100);
});

for (const payload of ['', '   ', 'NIKE', '1042', `${code}-COPY`, `https://example.org/${code}`, 'constructor', '__proto__']) {
  test(`does not register an incomplete, embedded, or inherited identifier: ${JSON.stringify(payload)}`, () => {
    const result = analyzeScannedPayload(payload, INITIAL_LEDGER);
    assert.equal(result.isRegisteredOnBlockchain, false);
    assert.equal(result.blockchainRecord, undefined);
    assert.equal(result.trustScore, 0);
  });
}

test('leading zeroes remain part of an identifier', () => {
  const ledger = { '00123456': { ...INITIAL_LEDGER[code], tokenId: '00123456' } };
  assert.equal(analyzeScannedPayload('123456', ledger).isRegisteredOnBlockchain, false);
  assert.equal(analyzeScannedPayload('00123456', ledger).isRegisteredOnBlockchain, true);
});

test('a recall overrides a registered match', () => {
  const ledger = { [code]: { ...INITIAL_LEDGER[code], status: 'RECALLED' as const, recallReason: 'Test recall' } };
  const result = analyzeScannedPayload(code, ledger);
  assert.equal(result.isRegisteredOnBlockchain, false);
  assert.equal(result.trustScore, 10);
  assert.equal(result.signals.blockchainProof.status, 'RECALLED');
  assert.match(result.reasons[0].english, /Test recall/);
});

test('unknown foods do not receive invented nutrition, prices or certifications', () => {
  const result = analyzeScannedPayload('UNKNOWN-FOOD-123456', {});
  assert.equal(result.webIntelligence.foodDetails, undefined);
  assert.equal(result.webIntelligence.estimatedPrice, 'Not available');
  assert.equal(result.webIntelligence.manufacturer, 'Not available');
  assert.deepEqual(result.webIntelligence.authenticityIndicators, []);
});

test('server metadata is preserved without discarding zero scores', () => {
  const result = analyzeScannedPayload('UNKNOWN-1234', {}, {
    domainTrustScore: 0, exactVariant: 'Small pack', certifications: ['Example'],
    physicalAuthenticityChecks: ['Check seal'], counterfeitRedFlags: ['Broken seal']
  });
  assert.equal(result.webIntelligence.domainTrustScore, 0);
  assert.equal(result.webIntelligence.exactVariant, 'Small pack');
  assert.deepEqual(result.webIntelligence.certifications, ['Example']);
  assert.deepEqual(result.webIntelligence.physicalAuthenticityChecks, ['Check seal']);
  assert.deepEqual(result.webIntelligence.counterfeitRedFlags, ['Broken seal']);
});

test('an unrelated domain containing a brand name cannot verify a product', () => {
  const payload = 'https://nike.com.example.org/product/123456';
  const result = analyzeScannedPayload(payload, INITIAL_LEDGER);
  assert.equal(result.trustScore, 0);
  assert.equal(result.isRegisteredOnBlockchain, false);
  const intel = getHeuristicWebIntelligence(payload);
  assert.equal(intel.resolvedDomain, 'nike.com.example.org');
  assert.deepEqual(intel.legitimacyFactors, []);
});

for (const payload of ['peanut butter', 'fake', 'replica', 'nike fake']) {
  test(`keyword lookup cannot claim a physical authenticity check: ${payload}`, () => {
    const intel = analyzeScannedPayload(payload, {}).webIntelligence;
    assert.match(intel.summary!, /Reference information only/);
    assert.doesNotMatch(intel.summary!, /Authentic|verified|Counterfeit product identified/);
    assert.deepEqual(intel.counterfeitRiskSignals, []);
  });
}

for (const payload of ['194252192566', '0194252192566', '00194252192566']) {
  test(`a complete equivalent UPC/EAN/GTIN matches: ${payload}`, () => {
    const result = analyzeScannedPayload(payload, INITIAL_LEDGER);
    assert.equal(result.blockchainRecord?.tokenId, '0194252192566');
    assert.equal(result.isRegisteredOnBlockchain, true);
  });
}

test('a UPC registry entry can be scanned in its zero-padded EAN form', () => {
  const ledger = { '194252192566': { ...INITIAL_LEDGER[code], tokenId: '194252192566' } };
  assert.equal(analyzeScannedPayload('0194252192566', ledger).isRegisteredOnBlockchain, true);
  assert.equal(analyzeScannedPayload('19425219256', ledger).isRegisteredOnBlockchain, false);
});

// These cases cover both local catalog data and the response shape from server.ts.
test('catalog reasons exclude unknown local fallback codes', () => {
  const result = analyzeScannedPayload('UNKNOWN-REPAIR-123', {});
  assert.equal(result.webIntelligence.brand, 'Unknown brand');
  assert.deepEqual(result.reasons.map(reason => reason.title), ['Code not found']);
});

test('catalog reasons exclude unknown server fallback codes', async context => {
  context.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    intelligence: { productMatchTitle: 'Code: UNKNOWN-REPAIR-123', brand: 'Unknown brand' }
  }), { headers: { 'Content-Type': 'application/json' } }));
  const result = await analyzeScannedPayloadAsync('UNKNOWN-REPAIR-123', {});
  assert.deepEqual(result.reasons.map(reason => reason.title), ['Code not found']);
});

test('catalog reasons require an identified brand and retain real catalog references', () => {
  for (const brand of [undefined, '', 'Unknown brand']) {
    const result = analyzeScannedPayload('UNKNOWN-REPAIR-123', {}, { productMatchTitle: 'Code: UNKNOWN-REPAIR-123', brand });
    assert.equal(result.reasons.some(reason => reason.title === 'Catalog Match Available'), false);
  }
  const local = analyzeScannedPayload('8901262010058', {});
  assert.equal(local.webIntelligence.productMatchTitle, 'Amul Pasteurised Pure Dairy Salted Butter (100g Carton)');
  assert.equal(local.reasons.some(reason => reason.title === 'Catalog Match Available'), true);
  const server = analyzeScannedPayload('KNOWN-CATALOG-123', {}, { productMatchTitle: 'Example product', brand: 'Example brand' });
  assert.equal(server.reasons.some(reason => reason.title === 'Catalog Match Available'), true);
});

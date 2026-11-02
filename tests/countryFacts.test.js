import { test } from "node:test";
import assert from "node:assert/strict";
import { COUNTRIES, byCode } from "../src/data/countries.js";
import { FLAG_FAMILIES, getCountryFact } from "../src/data/countryFacts.js";

test("COUNTRIES dataset is complete and well-formed", () => {
  assert.equal(COUNTRIES.length >= 195, true, "Must have at least 195 sovereign nations");

  const seenCodes = new Set();
  for (const c of COUNTRIES) {
    assert.ok(c.code && typeof c.code === "string", `Country ${c.name} missing code`);
    assert.equal(c.code.length, 2, `Country code ${c.code} must be ISO 2-letter lowercase`);
    assert.ok(!seenCodes.has(c.code), `Duplicate country code detected: ${c.code}`);
    seenCodes.add(c.code);

    assert.ok(c.name && c.name.trim().length > 0, `Country ${c.code} missing valid name`);
    assert.ok(c.region && c.region.trim().length > 0, `Country ${c.name} missing valid region`);
    assert.ok(c.capital && c.capital.trim().length > 0, `Country ${c.name} missing valid capital`);
  }
});

test("getCountryFact returns complete learning dossier for every country", () => {
  for (const c of COUNTRIES) {
    const fact = getCountryFact(c);
    assert.ok(fact, `Fact must not be null for ${c.code}`);
    assert.ok(fact.hook && fact.hook.length >= 20, `Mnemonic hook too short for ${c.code}`);
    assert.ok(fact.symbolism && fact.symbolism.length >= 10, `Symbolism too short for ${c.code}`);
    assert.ok(fact.capitalHook && fact.capitalHook.length >= 10, `Capital hook too short for ${c.code}`);
  }
});

test("FLAG_FAMILIES references valid countries and unique ids", () => {
  const familyIds = new Set();
  for (const family of FLAG_FAMILIES) {
    assert.ok(!familyIds.has(family.id), `Duplicate family ID: ${family.id}`);
    familyIds.add(family.id);

    assert.ok(family.codes.length >= 3, `Family ${family.id} must have at least 3 countries`);
    for (const code of family.codes) {
      const country = byCode(code);
      assert.ok(country, `Family ${family.id} references non-existent country code ${code}`);
    }
  }
});


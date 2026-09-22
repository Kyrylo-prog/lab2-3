import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";

// Load the actual ES modules unchanged. Product is the only dependency; any
// attempted database access fails instead of silently returning fixture data.
async function loadCatalogModule(relativePath) {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const context = createContext({});
  const productStub = new SyntheticModule(
    ["default"],
    function initialize() {
      this.setExport("default", Object.freeze({
        find() {
          throw new Error("This regression suite must not access a database");
        },
      }));
    },
    { context, identifier: "Product test stub" },
  );
  const module = new SourceTextModule(await readFile(sourceUrl, "utf8"), {
    context,
    identifier: sourceUrl.href,
  });
  await module.link((specifier) => {
    assert.equal(specifier, "../../models/Product.js", "Unexpected dependency");
    return productStub;
  });
  await module.evaluate();
  return module.namespace.findBestProductByHint;
}

const baseline = await loadCatalogModule(
  "../before/server/services/ai/aiCatalogService.js",
);
const refactored = await loadCatalogModule(
  "../../../server/services/ai/aiCatalogService.js",
);

function freezeRecursively(value) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freezeRecursively(child);
    Object.freeze(value);
  }
  return value;
}

function assertCase(products, hint, expected, label = "fixture") {
  const snapshot = structuredClone(products);
  freezeRecursively(products);
  assert.equal(baseline(products, hint), expected, `${label}: baseline result`);
  assert.equal(refactored(products, hint), expected, `${label}: refactored result`);
  assert.deepEqual(products, snapshot, `${label}: unchanged input`);
}

test("empty, whitespace and punctuation-only hints return null", () => {
  for (const hint of [undefined, "", "   \n\t", "!!! — , ..."]) {
    assertCase([{ name: "milk" }], hint, null, `empty hint ${String(hint)}`);
  }
});

test("an empty catalog and zero-scoring catalogs return null", () => {
  assertCase([], "milk", null, "empty catalog");
  assertCase([{ name: "water" }, { name: "bread" }], "milk", null, "no match");
});

test("weights distinguish four- and five-character tokens and combine matches", () => {
  const threshold = [{ name: "milk" }, { name: "apple" }];
  assertCase(threshold, "milk apple", threshold[1], "five characters score 3");
  const combined = [{ name: "milk pear" }, { name: "apple" }];
  assertCase(combined, "milk pear apple", combined[0], "two short matches score 4");
});

test("ties keep the first matching object and strictly larger scores replace it", () => {
  const tied = [{ name: "water" }, { name: "milk" }, { name: "milk" }];
  assertCase(tied, "milk", tied[1], "first positive match wins ties");
  const improving = [{ name: "milk" }, { name: "milk apple" }];
  assertCase(improving, "milk apple", improving[1], "later higher score wins");
});

test("Unicode, case conversion and punctuation retain multilingual matching", () => {
  const products = [
    { name: "Water", nameUk: "Вода" },
    { name: "Apple", nameUk: "Червоне яблуко", descriptionUk: "СВІЖЕ" },
  ];
  assertCase(products, "ЯБЛУКО!!! свІже", products[1], "Ukrainian matching");
  assertCase(products, "APPLE?", products[1], "Latin matching");
});

test("repeated query tokens contribute repeatedly to the score", () => {
  const products = [{ name: "apple" }, { name: "milk" }];
  assertCase(products, "milk milk apple", products[1], "repeated short tokens");
});

test("matching uses substrings and ignores category-only matches", () => {
  const products = [{ name: "water", category: "apple" }, { name: "pineapple" }];
  assertCase(products, "apple", products[1], "substring match");
  assertCase([{ name: "water", category: "apple" }], "apple", null, "category excluded");
});

test("array descriptions and absent or falsy fields preserve text conversion", () => {
  const products = [
    { name: false, nameUk: 0, description: null, descriptionUk: false },
    { description: ["fresh", "onion"], descriptionUk: ["зелена", "цибуля"] },
    {},
  ];
  assertCase(products, "onion ЦИБУЛЯ", products[1], "array descriptions");
  assertCase(products, "false 0 undefined null", null, "falsy fields become empty");
  const numericDescription = [{ description: 12345 }, { description: 0 }];
  assertCase(numericDescription, "12345", numericDescription[0], "truthy scalar description");
});

test("results preserve original object identity and inputs stay immutable", () => {
  const products = [
    { _id: "first", name: "milk", description: ["fresh"], image: ["milk.png"] },
    { _id: "second", name: "water", description: ["still"] },
  ];
  assertCase(products, "fresh milk", products[0], "identity and deep immutability");
  assertCase(products, "water", products[1], "repeated call on same frozen catalog");
});

test("180 deterministic generated catalogs produce identical immutable results", () => {
  let state = 0x23c0ffee;
  const next = (max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
  const words = ["milk", "apple", "pear", "pineapple", "цибуля", "СИР", "onion", "rice"];
  const chooseText = () => {
    const choice = next(8);
    if (choice === 0) return undefined;
    if (choice === 1) return null;
    if (choice === 2) return "";
    if (choice === 3) return false;
    return `${words[next(words.length)]} ${words[next(words.length)]}`;
  };

  for (let index = 0; index < 180; index += 1) {
    const products = Array.from({ length: next(9) }, (_, productIndex) => ({
      _id: `${index}-${productIndex}`,
      name: chooseText(),
      nameUk: chooseText(),
      description: next(2) ? [chooseText(), chooseText()] : chooseText(),
      descriptionUk: next(2) ? [chooseText(), chooseText()] : chooseText(),
      category: words[next(words.length)],
    }));
    const hint = Array.from({ length: next(6) }, () => words[next(words.length)]).join(" ! ");
    const snapshot = structuredClone(products);
    freezeRecursively(products);
    const original = baseline(products, hint);
    const current = refactored(products, hint);
    assert.equal(current, original, `generated catalog ${index}: result identity`);
    assert.ok(current === null || products.includes(current), `generated catalog ${index}: catalog object`);
    assert.deepEqual(products, snapshot, `generated catalog ${index}: unchanged input`);
  }
});

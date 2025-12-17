import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as fg from "@/js/factgraph-opt.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedFactGraph = null;

/**
 * Combines XML fact dictionaries for Node.js test environment.
 * This version properly preserves XML structure unlike the browser version.
 */
function combineFactDictionariesForTests(...xmlStrings) {
  // Extract the Meta section from the first XML
  const firstXml = xmlStrings[0];
  const metaMatch = firstXml.match(/<Meta>[\s\S]*?<\/Meta>/);
  const metaSection = metaMatch ? metaMatch[0] : "";

  // Extract all Facts sections
  const allFacts = xmlStrings
    .map((xml) => {
      const factsMatch = xml.match(/<Facts>([\s\S]*?)<\/Facts>/);
      return factsMatch ? factsMatch[1] : "";
    })
    .join("\n");

  // Build the combined XML with proper FactDictionary root
  const combinedXml = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionary>
  ${metaSection}
  <Facts>
    ${allFacts}
  </Facts>
</FactDictionary>`;

  return combinedXml;
}

/**
 * Loads the Fact Graph with all XML fact dictionaries.
 * Caches the result to avoid reloading for each test.
 */
export async function getFactGraph() {
  if (cachedFactGraph) {
    return cachedFactGraph;
  }

  try {
    // Load all XML fact dictionary files
    const projectRoot = resolve(__dirname, "../..");
    const creditCalcXml = readFileSync(
      resolve(projectRoot, "src/facts/credit-calc.xml"),
      "utf-8",
    );
    const federalEitcXml = readFileSync(
      resolve(projectRoot, "src/facts/federal-eitc.xml"),
      "utf-8",
    );
    const federalCtcXml = readFileSync(
      resolve(projectRoot, "src/facts/federal-ctc.xml"),
      "utf-8",
    );
    const mdEitcXml = readFileSync(
      resolve(projectRoot, "src/facts/md-eitc.xml"),
      "utf-8",
    );

    // Combine the XML files using Node.js-compatible method
    const combinedXml = combineFactDictionariesForTests(
      creditCalcXml,
      federalEitcXml,
      federalCtcXml,
      mdEitcXml,
    );

    // Initialize the fact dictionary and graph
    const factDictionary = fg.FactDictionaryFactory.importFromXml(combinedXml);
    cachedFactGraph = fg.GraphFactory.apply(factDictionary);

    return cachedFactGraph;
  } catch (error) {
    console.error("Error loading Fact Graph:", error);
    throw error;
  }
}

/**
 * Creates a fresh Fact Graph instance (not cached).
 * Use this when you need isolated state between tests.
 */
export async function createFreshFactGraph() {
  const projectRoot = resolve(__dirname, "../..");
  const creditCalcXml = readFileSync(
    resolve(projectRoot, "src/facts/credit-calc.xml"),
    "utf-8",
  );
  const federalEitcXml = readFileSync(
    resolve(projectRoot, "src/facts/federal-eitc.xml"),
    "utf-8",
  );
  const federalCtcXml = readFileSync(
    resolve(projectRoot, "src/facts/federal-ctc.xml"),
    "utf-8",
  );
  const mdEitcXml = readFileSync(
    resolve(projectRoot, "src/facts/md-eitc.xml"),
    "utf-8",
  );

  const combinedXml = combineFactDictionariesForTests(
    creditCalcXml,
    federalEitcXml,
    federalCtcXml,
    mdEitcXml,
  );
  const factDictionary = fg.FactDictionaryFactory.importFromXml(combinedXml);
  return fg.GraphFactory.apply(factDictionary);
}

/**
 * Clears the cached Fact Graph.
 * Useful for testing scenarios that require a clean slate.
 */
export function clearFactGraphCache() {
  cachedFactGraph = null;
}

/**
 * Extracts numeric value from Fact Graph results, including Scala BigDecimal objects.
 * This is a test-specific version that handles the BigDecimal format returned by Fact Graph.
 */
export function extractFactGraphValue(result) {
  if (result === null || result === undefined) {
    return "Incomplete";
  }

  // Unwrap Result$Complete objects (Fact Graph wraps values in Result monad)
  if (result && typeof result === "object" && result.aM !== undefined) {
    result = result.aM;
  }

  // Handle boolean values
  if (typeof result === "boolean") {
    return result;
  }

  // Handle primitive numbers and strings
  if (typeof result === "number" || typeof result === "string") {
    return result;
  }

  // Handle Scala BigDecimal objects from Fact Graph
  if (result && typeof result === "object" && result.ay && result.ay.aW) {
    const longValue = result.ay.aW;
    const value = longValue.b + (longValue.c || 0) * 4294967296;
    const scale = result.ay.W || 0;
    return value / 10 ** scale;
  }

  // Handle wrapped values
  if (result.v !== undefined) {
    return result.v;
  }

  return result;
}

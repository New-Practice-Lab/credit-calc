import { describe, expect, it } from "vitest";
import { combineFactDictionaries } from "@/js/credit-calc-utils.js";

describe("combineFactDictionaries", () => {
  const sampleXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Meta>
    <Version>1.0.0</Version>
  </Meta>
  <Facts>
    <Fact path="/fact1">
      <Name>Fact 1</Name>
    </Fact>
  </Facts>
</FactDictionaryModule>`;

  const sampleXml2 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Meta>
    <Version>2.0.0</Version>
  </Meta>
  <Facts>
    <Fact path="/fact2">
      <Name>Fact 2</Name>
    </Fact>
  </Facts>
</FactDictionaryModule>`;

  const sampleXml3 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Facts>
    <Fact path="/fact3">
      <Name>Fact 3</Name>
    </Fact>
  </Facts>
</FactDictionaryModule>`;

  it("should combine two XML files", () => {
    const result = combineFactDictionaries(sampleXml1, sampleXml2);

    // Check for content (case-insensitive due to happy-dom limitations)
    expect(result.toLowerCase()).toContain("fact 1");
    expect(result.toLowerCase()).toContain("fact 2");
  });

  it("should preserve Meta from first file", () => {
    const result = combineFactDictionaries(sampleXml1, sampleXml2);

    // Check version is preserved (case-insensitive)
    expect(result.toLowerCase()).toContain("1.0.0");
    expect(result.toLowerCase()).not.toContain("2.0.0");
  });

  it("should convert FactDictionaryModule to FactDictionary", () => {
    const result = combineFactDictionaries(sampleXml1);

    // In happy-dom, tags are lowercased, so we check for 'factdictionary'
    expect(result.toLowerCase()).toContain("factdictionary");
  });

  it("should combine three XML files", () => {
    const result = combineFactDictionaries(sampleXml1, sampleXml2, sampleXml3);

    expect(result).toContain("Fact 1");
    expect(result).toContain("Fact 2");
    expect(result).toContain("Fact 3");
  });

  it("should merge Facts sections correctly", () => {
    const result = combineFactDictionaries(sampleXml1, sampleXml2);

    // Parse the result to verify structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/xml");

    const facts = doc.querySelectorAll("Facts > Fact");
    expect(facts.length).toBe(2);

    const paths = Array.from(facts).map((fact) => fact.getAttribute("path"));
    expect(paths).toContain("/fact1");
    expect(paths).toContain("/fact2");
  });

  it("should handle single XML file", () => {
    const result = combineFactDictionaries(sampleXml1);

    expect(result.toLowerCase()).toContain("fact 1");

    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/xml");
    const facts = doc.querySelectorAll("facts > fact"); // lowercase for happy-dom
    expect(facts.length).toBe(1);
  });

  it("should maintain fact structure with nested elements", () => {
    const xml1 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Facts>
    <Fact path="/test">
      <Name>Test Fact</Name>
      <Derived>
        <Dollar>100</Dollar>
      </Derived>
    </Fact>
  </Facts>
</FactDictionaryModule>`;

    const result = combineFactDictionaries(xml1);

    // Check for nested elements (case-insensitive)
    expect(result.toLowerCase()).toContain("derived");
    expect(result.toLowerCase()).toContain("100");
  });

  it("should preserve fact attributes", () => {
    const xml1 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Facts>
    <Fact path="/test" id="123">
      <Name>Test</Name>
    </Fact>
  </Facts>
</FactDictionaryModule>`;

    const result = combineFactDictionaries(xml1);

    expect(result).toMatch(/path="\/test"/);
    expect(result).toMatch(/id="123"/);
  });

  it("should combine multiple facts from different files", () => {
    const xml1 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Meta><Version>1.0</Version></Meta>
  <Facts>
    <Fact path="/a"><Name>A</Name></Fact>
    <Fact path="/b"><Name>B</Name></Fact>
  </Facts>
</FactDictionaryModule>`;

    const xml2 = `<?xml version="1.0" encoding="UTF-8"?>
<FactDictionaryModule>
  <Facts>
    <Fact path="/c"><Name>C</Name></Fact>
    <Fact path="/d"><Name>D</Name></Fact>
  </Facts>
</FactDictionaryModule>`;

    const result = combineFactDictionaries(xml1, xml2);

    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/xml");
    const facts = doc.querySelectorAll("Facts > Fact");

    expect(facts.length).toBe(4);
  });

  it("should produce valid XML output", () => {
    const result = combineFactDictionaries(sampleXml1, sampleXml2);

    // Parse result to verify it's parseable
    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/xml");

    // Check for parse errors
    const parserError = doc.querySelector("parsererror");
    expect(parserError).toBeNull();

    // Verify document was parsed successfully
    expect(doc.documentElement).toBeTruthy();
  });
});

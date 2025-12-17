# Agent instructions

## Overview

The credit-calc project is a simple static,web-based demo that estimates the
maximum amount of US federal and state tax credits that someone could be
eligible for.

The eligibility determination is powered by an open-source product from the IRS
called "Fact Graph". Fact Graph is a knowledge graph that was originally
embedded into IRS Direct File to model the US tax code.

### Fact Graph

The [Fact Graph code is on GitHub](https://github.com/IRS-Public/fact-graph) and
can be used with JavaScript as well as any JVM language (_e.g._, Java, Kotlin,
Scala, Clojure).

The Fact Graph repo also contains the
[Architectural Decision Record (ADR)](https://github.com/IRS-Public/fact-graph/blob/main/docs/fact-graph-3.1-adr.md),
for version 3.1, which provides context on the intent and history of Fact Graph.

### Credit Calc components

The basic components of credit-calc are:

1. A web form styled using the US Web Design System
2. A compiled JavaScript build of the Fact Graph engine
3. A series of [Fact Dictionaries](src/facts/) that describe state and federal
   tax credits
3. A project-specific JavaScript file that uses form data and the Fact Graph
   engine to get and set values in the Fact Dictionaries.

## Coding style

- HTML should be styled using the US Web Design System (USWDS) 3.0, which is
documented here: https://designsystem.digital.gov/
- All code should follow the format and linting directives defined in the
  project's .pre-commit-config.yaml file (pre-commit hooks that can be run
  via `prek run`)

## Development environment

The project uses npm for testing and dependency management.
Run `npm install` to install dependencies.

## Testing instructions

The project uses Vitest for unit and integration testing with happy-dom
for DOM testing.

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:unit       # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage   # Run tests with coverage report
npm run test:ui         # Run tests with Vitest UI
```

### Test Structure

**Unit Tests** (`tests/unit/`)
- Test utility functions in isolation
- Focus on single functions with various inputs

**Integration Tests** (`tests/integration/`)
- Test tax calculations using the real Fact Graph engine
- Tests Federal EITC, Federal CTC, and state tax credit calculations

**Test Helpers** (`tests/helpers/`)
- `factGraphHelper.js`: Loads and initializes Fact Graph for integration tests
  - `getFactGraph()`: Returns cached Fact Graph instance
  - `createFreshFactGraph()`: Returns fresh instance for isolated tests
  - `extractFactGraphValue(result)`: Extracts values from Fact Graph Result
    objects (handles Scala BigDecimal conversion)

### Key Testing Patterns

**For Integration Tests:**
```javascript
import { createFreshFactGraph, extractFactGraphValue } from '@tests/helpers/factGraphHelper.js'

const factGraph = await createFreshFactGraph()

// Set input facts
factGraph.set('/filingState', 'MD')
factGraph.set('/primaryFilerTaxId', 'SSN')
factGraph.set('/numQualifyingChildren', 2)

// Get computed facts
const result = factGraph.get('/federalEitcMaxAmount')

// Extract and assert
expect(extractFactGraphValue(result)).toBe(7152)
```

**Important:** Always use `extractFactGraphValue()` from the helper
(not `extractValue()` from credit-calc-utils.js) when testing Fact Graph
results. This handles the Scala BigDecimal objects and Result monad wrapping.

### Coverage Requirements

- Minimum 80% branch coverage
- Minimum 85% function/line/statement coverage
- Excludes: `factgraph-opt.js` (compiled Scala.js code)

### Adding New Tests

**For new tax credit logic:**
1. Add integration test in `tests/integration/taxCalculations.test.js`
2. Use `createFreshFactGraph()` for isolated test state
3. Test edge cases (0 children, ITIN vs SSN, MFJ vs Single)

**For new utility functions:**
1. Add unit test in `tests/unit/`
2. Test all code paths and edge cases
3. Use happy-dom for DOM manipulation tests

### Test Fixtures

**Tax Year Fixtures** (`tests/fixtures/`)
- `taxYear2025.js` - Expected tax credit amounts for 2025
  - Federal EITC max amounts by number of children (0, 1, 2, 3+)
  - Federal CTC max refundable amount per child
  - Maryland EITC percentage of federal EITC
  - Helper functions: `calculateFederalCtc()`, `calculateMarylandEitc()`

**Updating for New Tax Year:**
1. Create new fixture file (e.g., `taxYear2026.js`) with IRS-published amounts
2. Update integration tests to import the new fixture
3. Run tests to verify all calculations match expectations

**XML Fact Dictionaries** (`src/facts/`)
- `credit-calc.xml` - Demographics and filing info
- `federal-eitc.xml` - Federal EITC rules (2025 amounts)
- `federal-ctc.xml` - Federal CTC rules ($1,700 per child)
- `md-eitc.xml` - Maryland EITC rules (50% of federal, accepts ITIN)

Note: Tests use fixture values from `tests/fixtures/taxYear2025.js`,
not hardcoded numbers.

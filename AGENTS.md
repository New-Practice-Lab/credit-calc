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

## Testing instructions

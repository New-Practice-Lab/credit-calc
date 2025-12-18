# Credit Calculator

Credit Calculator is a proof-of-concept site built on the open-sourced
[IRS Fact Graph](https://github.com/IRS-Public/fact-graph).

Fact Graph is a knowledge graph that powered [Direct File](https://www.cbpp.org/blog/trump-plan-to-end-free-direct-file-program-and-rely-on-for-profit-tax-preparers-is-a-mistake). In October 2025, the IRS released it as a separate product.

This project uses the EITC and CTC eligibility calculations from Direct File
(updated for Tax Year 2025) and adds state-level EITC and CTC information,
described as a [series of Fact Dictionaries](src/facts).

## Website

We built the
[Credit Calculator site](https://new-practice-lab.github.io/credit-calc/)
for internal use⏤to better understand the maximum amount of tax credits
that residents of a specific state could receive (the site currently has
information for a limited number of states but can also be used as a
"federal only" estimator).

## Assumptions

Credit Calc is a simplified tax credit estimator and only checks a subset
of actual eligibility rules for the EITC and CTC. It is not a true
eligibility checker and should be treated merely as a proof-of-concept for
repurposing the Fact Graph engine.

Some of the assumptions made by Credit Calc include:

- Filer has no tax liability
- Filer has earned income
- Filer has lived in their state for the entire year
- All children are “qualifying children”
- All children have a valid SSN
- All hildren live full time with the filer and/or spouse (if filing jointly)
- Filer’s investment income is below the EITC threshold
- Filers with 0 children are between the ages of 25 and 64
- Filer cannot be claimed as a dependent of someone else

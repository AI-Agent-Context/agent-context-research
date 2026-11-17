---
name: literature-review
description: A structured workflow for surveying academic literature, synthesizing methodology comparisons, and identifying research gaps.
---

# Skill: literature-review

Use this skill when assigned to survey literature, evaluate prior art, build comparative matrices, or identify research gaps for an academic paper or research topic.

Follow the loaded Global Working Context and Research Context (`RESEARCH_CONTEXT.md`). Never hallucinate or guess citations, DOIs, authors, or venues.

## Phase 1 — Define the Research Scope & Questions

- Clarify the core research questions, scope, and target domains.
- Identify primary keywords, related synonyms, and seminal papers in the field.
- Establish inclusion and exclusion criteria (e.g., publication venues, date range, empirical vs. theoretical focus).

## Phase 2 — Collect & Ground Citations

- Gather relevant publications from verified sources (project `.bib` files, arXiv, Google Scholar, Semantic Scholar).
- Verify every citation: title, complete author list, publication year, venue, and DOI/URL.
- If a citation cannot be verified, flag it explicitly; do not include ungrounded references.
- Extract or generate standardized BibTeX entries.

## Phase 3 — Extract & Analyze Methodologies

For each paper reviewed, extract:
- **Core problem**: The specific limitation or bottleneck being addressed.
- **Key insight**: The primary theoretical or algorithmic proposal.
- **Assumptions**: Mathematical, computational, or domain constraints.
- **Evaluation**: Datasets, baselines compared against, evaluation metrics, and concrete empirical findings.
- **Limitations**: Weaknesses, unaddressed edge cases, or trade-offs acknowledged by the authors.

## Phase 4 — Construct the Comparison Matrix

- Synthesize findings into a structured comparison table (e.g., Method vs. Assumptions vs. Datasets vs. Core Metrics).
- Group papers thematically or by methodological approach rather than isolated summaries.
- Identify common patterns, evolutionary trajectories, and divergent perspectives across the literature.

## Phase 5 — Identify Gaps & Delineate Novelty

- Highlight unaddressed challenges, conflicting findings, or unexplored trade-offs across existing work.
- Clearly articulate how the proposed research differs from and advances beyond prior art.
- Avoid disparaging existing literature; position differences with scholarly objectivity.

## Phase 6 — Verification & Completion Report

Deliver the literature review directly in the conversation:
- **Verification**: State the verification method used for citations (DOI, arXiv ID, or verified database check).
- **Taxonomy / Matrix**: The comparative synthesis table.
- **Research Gaps**: Specific opportunities and open problems identified.
- **BibTeX entries**: Verified citation entries formatted for inclusion.

Do not create an unsolicited report file unless explicitly requested by the user.

# Research Working Context

---

## Purpose & Scope

This document provides domain-specific standards for **Academic and Paper Research** workflows (literature review, methodology formulation, experimental analysis, paper drafting, and peer review). It extends the universal principles defined in `GLOBAL_WORKING_CONTEXT.md`.

---

## Academic Writing Standards

### Tone & Style

- **Objective and Scholarly**: Maintain an academic, precise, and neutral tone.
- **No Marketing Hype**: Strictly avoid buzzwords, superlative claims, and ungrounded marketing rhetoric (e.g., "revolutionary", "game-changing", "groundbreaking", "unprecedented", "state-of-the-art marvel"). Let data, theorems, and empirical evidence speak for themselves.
- **Clarity & Conciseness**: Use clear topic sentences, active voice where appropriate, and standard terminology of the target academic discipline or venue (IEEE, ACM, NeurIPS, ICML, Nature, etc.).

---

## Citation Integrity & Grounded Evidence

### Strict No-Hallucination Rule

- **Zero Fabricated References**: Never invent or guess paper titles, authors, publication years, conference/journal venues, or DOIs.
- **Verification Requirement**: Every cited work must correspond to a verifiable publication. When citing a paper from memory or retrieval, verify the citation against real academic databases (arXiv, Google Scholar, Semantic Scholar, CrossRef, DOI) or existing project `.bib` files.
- **Explicit Uncertainty**: If a citation or reference cannot be definitively confirmed, state the uncertainty explicitly to the user rather than generating a plausible-sounding reference.
- **BibTeX Standards**: Maintain clean, standardized BibTeX entries with accurate keys, complete author lists, formal venue titles, and DOIs/URLs.

---

## Research Structure & Section Conventions

Follow the standard academic structure (IMRAD or venue-specific conventions):

1. **Title & Abstract**: Concise summary of the problem, key insight, proposed approach, and concrete quantitative findings.
2. **Introduction**:
   - Problem statement and research motivation.
   - Core challenges in existing approaches.
   - Explicit list of novel contributions (delineated clearly from prior art).
3. **Related Work / Literature Review**:
   - Organized thematically or chronologically by methodology rather than as an isolated list of summaries.
   - Clearly delineate prior art from the current work to establish novelty without disparaging existing research.
4. **Methodology / Problem Formulation**:
   - Formal mathematical formulation with consistent notation and definitions.
   - Clear explanations of assumptions, theoretical bounds, and design choices.
5. **Experiments & Evaluation**:
   - Fair comparison against relevant baselines and state-of-the-art (SOTA).
   - Clear metrics, ablation studies, error bars, and reproducibility details.
6. **Discussion & Conclusion**:
   - Balanced reflection on limitations, ethical considerations, and realistic future research directions.

---

## Mathematical Rigor & LaTeX Formatting

- **Notation Consistency**: Maintain rigorous notation throughout the manuscript (e.g., scalars in italics, vectors in lowercase bold, matrices in uppercase bold, sets in calligraphic/blackboard font). Define all symbols upon first appearance.
- **Valid Syntax**: Ensure all equations and expressions use valid, clean LaTeX/KaTeX syntax that compiles without errors.
- **Figures & Tables**: Provide self-contained captions explaining what is shown, key trends, and baseline comparisons. Tables must use clean formatting (e.g., `booktabs` style: `\toprule`, `\midrule`, `\bottomrule` without vertical lines).

---

## Research Notes & Literature Synthesis

- **Structured Notes Authorized**: In contrast to purely minimal coding changes, creating research notes, literature comparison matrices (e.g., Method vs. Dataset vs. Metric), and section outlines is explicitly authorized and encouraged when assisting research tasks.
- **Empirical vs. Theoretical Claims**: Always distinguish between mathematically proven theorems and empirically observed results. Never state an empirical observation as an unconditional theoretical guarantee.

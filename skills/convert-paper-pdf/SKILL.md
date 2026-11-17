---
name: convert-paper-pdf
description: A structured workflow to convert research paper PDFs to Markdown and extract embedded figures with adaptive runtime detection and zero token burn.
---

# Skill: convert-paper-pdf

Use this skill when assigned to ingest and convert an academic research paper from PDF format into a clean Markdown document with extracted figures and illustrations.

Follow the loaded Global Working Context and Research Context (`RESEARCH_CONTEXT.md`). Do not use LLM text generation to manually retype raw PDF binaries; always execute deterministic script extraction to ensure zero token burn and high-fidelity output.

## Workflow & Execution Strategy

### Phase 1 — Environment & Runtime Probing

Check for Python runtime availability on the host machine in order of preference:
1. On Windows: check `py -3 --version`, then `python --version`.
2. On Linux/macOS: check `python3 --version`, then `python --version`.
3. Verify that the detected Python version is 3.8 or higher (`python -c "import sys; print(sys.version_info >= (3, 8))"`).

If a supported Python runtime is detected, proceed immediately to **Phase 3** without asking the user.

### Phase 2 — Graceful Fallback (When Python is Absent)

If no supported Python runtime is found on the machine, **DO NOT attempt to write a custom binary PDF parser from scratch**. Stop immediately and prompt the user with two clear options:

1. **Option 1 (Recommended)**: Provide a single-line command suited for the user's operating system to install Python:
   - Windows: `winget install Python.Python.3.12`
   - macOS: `brew install python`
   - Ubuntu/Debian: `sudo apt update && sudo apt install -y python3 python3-pip`
2. **Option 2 (Alternative Runtime Choice)**: Allow the user to specify an alternative runtime installed on their system (e.g. Node.js).
   - *Mandatory Warning*: Explicitly warn the user: *"Writing a custom converter in [runtime] may result in reduced mathematical formula/table fidelity, and debugging extraction errors may consume additional tokens. Do you wish to proceed?"*
   - Only implement an alternative script after explicit user confirmation.

### Phase 3 — Dependency Verification & Auto-Installation

Verify that the required `pymupdf` library is present:
- Run: `python -c "import fitz"` (or `py -3 -c "import fitz"`).
- If the exit code is `10` or `ModuleNotFoundError`:
  - Auto-install the dependency: `pip install pymupdf` (or `py -3 -m pip install pymupdf`).
  - Re-verify that `import fitz` succeeds before proceeding.

### Phase 4 — Execution & Image Extraction

Run the pre-bundled extraction script located at `research/skills/convert-paper-pdf/scripts/pdf_to_md.py`:

```bash
python research/skills/convert-paper-pdf/scripts/pdf_to_md.py <path_to_pdf> --output-dir papers --assets-dir assets/images
```

The script will:
- Parse all text blocks, fixing hyphenated word-breaks across lines.
- Extract all embedded high-resolution figures into `assets/images/<paper_slug>/`.
- Insert valid relative Markdown links `![Figure](assets/images/<paper_slug>/fig_pX_Y.png)`.
- Save the structured output to `papers/<paper_slug>.md`.

### Phase 5 — Verification & Markdown Validation

- Inspect the generated Markdown file in `papers/` to verify non-empty content and valid structure.
- Verify that image links point to valid files in `assets/images/<paper_slug>/`.
- Verify that no raw LLM tokens were wasted on binary text parsing.

## Deliverables & Expected Output

Deliver the conversion results directly in conversation:
- **Markdown Document**: Path to the generated file (`papers/<paper_slug>.md`).
- **Extracted Assets**: Path to the image folder (`assets/images/<paper_slug>/`) and count of extracted figures.
- **Page Metrics**: Total page count and conversion status.

Do not create an unsolicited report file.

## Verification & Completion Criteria

- **Verified Output File**: The target `.md` file is created, readable, and structured.
- **Asset Integrity**: Embedded diagrams and plots are extracted as standalone image files with matching markdown links.
- **Zero Token Burn**: The entire conversion was performed by the script without manual LLM text regeneration.

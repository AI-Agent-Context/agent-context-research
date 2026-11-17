#!/usr/bin/env python3
"""
Convert Academic Research PDF to Markdown with Embedded Figure Extraction.
Compatible with Python 3.8+.
"""

import sys
import os
import re
import argparse
from typing import List, Tuple, Optional

# Check for PyMuPDF (fitz)
try:
    import fitz  # PyMuPDF
except ImportError:
    sys.stderr.write(
        "MISSING_DEPENDENCY: pymupdf\n"
        "Please install the required dependency by running:\n"
        "  pip install pymupdf  (or py -3 -m pip install pymupdf)\n"
    )
    sys.exit(10)


def slugify(value: str) -> str:
    """Normalize string into a clean, filesystem-safe slug."""
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    return re.sub(r"[-\s]+", "_", value)


def clean_text_block(text: str) -> str:
    """Clean common PDF extraction artifacts."""
    # Fix hyphenated line breaks (e.g., 'trans- \n former' -> 'transformer')
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)
    # Fix multiple consecutive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def convert_pdf_to_markdown(
    pdf_path: str,
    output_dir: str = "papers",
    assets_dir: str = "assets/images",
    custom_slug: Optional[str] = None,
) -> Tuple[str, int, int]:
    """
    Converts a PDF file to Markdown, extracts embedded figures, and returns:
    (output_markdown_path, total_pages, total_images_extracted).
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    slug = custom_slug or slugify(base_name)

    # Prepare output directories
    os.makedirs(output_dir, exist_ok=True)
    paper_assets_dir = os.path.join(assets_dir, slug)
    os.makedirs(paper_assets_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    total_images = 0
    md_content: List[str] = []

    # Title header
    md_content.append(f"# {base_name.replace('_', ' ').replace('-', ' ').title()}\n")

    for page_idx in range(total_pages):
        page_num = page_idx + 1
        page = doc[page_idx]

        # Extract text blocks
        text = page.get_text("text")
        cleaned_text = clean_text_block(text)
        if cleaned_text:
            md_content.append(cleaned_text)

        # Extract embedded images on this page
        image_list = page.get_images(full=True)
        if image_list:
            md_content.append(f"\n<!-- Page {page_num} Figures -->\n")
            for img_idx, img_info in enumerate(image_list, start=1):
                xref = img_info[0]
                try:
                    base_image = doc.extract_image(xref)
                    if not base_image:
                        continue
                    image_bytes = base_image["image"]
                    image_ext = base_image.get("ext", "png")

                    image_filename = f"fig_p{page_num}_{img_idx}.{image_ext}"
                    image_filepath = os.path.join(paper_assets_dir, image_filename)

                    with open(image_filepath, "wb") as img_file:
                        img_file.write(image_bytes)

                    total_images += 1

                    # Relative markdown link
                    rel_img_path = os.path.relpath(
                        image_filepath, start=output_dir
                    ).replace("\\", "/")
                    md_content.append(
                        f"\n![Figure {page_num}-{img_idx}]({rel_img_path})\n"
                    )
                except Exception as img_err:
                    sys.stderr.write(
                        f"Warning: Failed to extract image {xref} on page {page_num}: {img_err}\n"
                    )

        md_content.append(f"\n---\n<!-- Page {page_num} End -->\n")

    output_md_path = os.path.join(output_dir, f"{slug}.md")
    with open(output_md_path, "w", encoding="utf-8") as md_file:
        md_file.write("\n\n".join(md_content))

    return output_md_path, total_pages, total_images


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert research PDF to Markdown and extract embedded images."
    )
    parser.add_argument("pdf_path", help="Path to the PDF file to convert")
    parser.add_argument(
        "--output-dir",
        default="papers",
        help="Directory to save the generated Markdown file (default: papers)",
    )
    parser.add_argument(
        "--assets-dir",
        default="assets/images",
        help="Directory to save extracted figures (default: assets/images)",
    )
    parser.add_argument(
        "--slug",
        default=None,
        help="Custom slug/name for the paper folder and Markdown file",
    )

    args = parser.parse_args()

    try:
        out_path, pages, images = convert_pdf_to_markdown(
            pdf_path=args.pdf_path,
            output_dir=args.output_dir,
            assets_dir=args.assets_dir,
            custom_slug=args.slug,
        )
        print("CONVERSION_SUCCESS")
        print(f"Output Markdown: {out_path}")
        print(f"Total Pages: {pages}")
        print(f"Images Extracted: {images}")
        return 0
    except Exception as err:
        sys.stderr.write(f"Error converting PDF: {err}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())

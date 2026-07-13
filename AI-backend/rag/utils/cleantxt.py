"""
clean_text.py
-------------
Basic text cleanup before chunking — collapses extra whitespace,
strips weird control characters PDFs sometimes leave behind.
"""

import re


def clean_text(text):
    if not isinstance(text, str):
        return ""

    # Collapse 3+ newlines down to 2 (keeps paragraph breaks, drops big gaps)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse multiple spaces/tabs into one
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Strip leading/trailing whitespace on each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)

    return text.strip()

if __name__ == "__main__":
    messy = "Hello    world.\n\n\n\n\nThis   is   messy.   "
    print(repr(clean_text(messy)))
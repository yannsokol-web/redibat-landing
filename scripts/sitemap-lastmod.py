#!/usr/bin/env python3
"""Recalcule les <lastmod> de sitemap.xml depuis l'historique git.

Chaque <loc> est rattachée au fichier HTML qui la produit, et sa date devient
celle du dernier commit ayant touché ce fichier. Lancé par .github/workflows/
deploy-pages.yml juste avant la publication : le sitemap servi porte donc
toujours des dates justes, sans qu'on ait à les maintenir à la main.

Le script est idempotent et se lance aussi en local pour inspecter le résultat
(`python3 scripts/sitemap-lastmod.py && git diff sitemap.xml`), mais le fichier
versionné n'a pas vocation à être commité avec les dates recalculées.
"""

import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "sitemap.xml"
SITE = "https://redibat.fr"


def page_for(loc):
    """Fichier source d'une <loc> : / -> index.html, /cctp -> cctp.html."""
    slug = loc.removeprefix(SITE).strip("/")
    return ROOT / (f"{slug}.html" if slug else "index.html")


def last_commit_date(page):
    """Date du dernier commit touchant `page`, au format YYYY-MM-DD.

    Renvoie None sur un clone sans historique (checkout superficiel) : mieux
    vaut garder la date déjà présente qu'écrire une balise vide.
    """
    rel = page.relative_to(ROOT).as_posix()
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", rel],
        cwd=ROOT, capture_output=True, text=True,
    )
    return result.stdout.strip() or None


def main():
    xml = SITEMAP.read_text(encoding="utf-8")
    missing = []
    stale = []

    def rewrite(block):
        text = block.group(0)
        loc = re.search(r"<loc>\s*(.*?)\s*</loc>", text)
        if not loc:
            return text

        page = page_for(loc.group(1))
        if not page.is_file():
            # Une URL du sitemap ne correspond à aucune page : typiquement une
            # page supprimée qu'on a oublié de retirer d'ici.
            missing.append(loc.group(1))
            return text

        date = last_commit_date(page)
        if date is None:
            stale.append(loc.group(1))
            return text

        return re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{date}</lastmod>", text)

    updated = re.sub(r"<url>.*?</url>", rewrite, xml, flags=re.DOTALL)

    for loc in stale:
        print(f"avertissement : pas d'historique git pour {loc}, lastmod inchangé",
              file=sys.stderr)

    if missing:
        for loc in missing:
            print(f"erreur : {loc} ne correspond à aucun fichier du dépôt",
                  file=sys.stderr)
        return 1

    if updated != xml:
        SITEMAP.write_text(updated, encoding="utf-8")
        print(f"sitemap.xml : lastmod recalculés ({len(re.findall(r'<url>', xml))} URLs)")
    else:
        print("sitemap.xml : lastmod déjà à jour")
    return 0


if __name__ == "__main__":
    sys.exit(main())

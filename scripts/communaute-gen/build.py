import importlib, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import shell

PAGES = [
    ('index.html', 'page_index'),
    ('videos.html', 'page_videos'),
    ('forum.html', 'page_forum'),
    ('guides.html', 'page_guides'),
    ('nouveautes.html', 'page_nouveautes'),
    ('telechargements.html', 'page_telechargements'),
    ('membres.html', 'page_membres'),
    ('profil.html', 'page_profil'),
    ('recherche.html', 'page_recherche'),
    ('publier.html', 'page_publier'),
]

only = sys.argv[1:]
for name, mod in PAGES:
    if only and name not in only:
        continue
    try:
        m = importlib.import_module(mod)
    except ModuleNotFoundError:
        print(f'{name}: module {mod} absent, ignoré')
        continue
    html = shell.build(name, m.TITLE, m.DESCRIPTION, m.MAIN, m.SCRIPT, getattr(m, 'EXTRA_HEAD', ''))
    print(f'{name}: {len(html.splitlines())} lignes')

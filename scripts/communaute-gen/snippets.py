# Fragments de gabarit réutilisés par plusieurs pages.

def RUNS(list_expr, alias='r'):
    """Segments inline (texte, gras, code, lien) d'un contenu en mise en forme légère."""
    a = alias
    return (f'<sc-for list="{{{{ {list_expr} }}}}" as="{a}">'
            f'<sc-if value="{{{{ {a}.isText }}}}"><span>{{{{ {a}.s }}}}</span></sc-if>'
            f'<sc-if value="{{{{ {a}.isBold }}}}"><strong>{{{{ {a}.s }}}}</strong></sc-if>'
            f'<sc-if value="{{{{ {a}.isCode }}}}"><code>{{{{ {a}.s }}}}</code></sc-if>'
            f'<sc-if value="{{{{ {a}.isLink }}}}"><a href="{{{{ {a}.h }}}}" target="_blank" rel="nofollow noopener noreferrer">{{{{ {a}.s }}}}</a></sc-if>'
            f'</sc-for>')

def PROSE(blocks_expr):
    """Rendu d'un contenu en mise en forme légère (blocs de RDB.parseLite)."""
    return f'''<div class="cm-prose">
<sc-for list="{{{{ {blocks_expr} }}}}" as="b">
  <sc-if value="{{{{ b.isH2 }}}}"><h2>{RUNS('b.runs')}</h2></sc-if>
  <sc-if value="{{{{ b.isH3 }}}}"><h3>{RUNS('b.runs')}</h3></sc-if>
  <sc-if value="{{{{ b.isP }}}}"><p>{RUNS('b.runs')}</p></sc-if>
  <sc-if value="{{{{ b.isUl }}}}"><ul><sc-for list="{{{{ b.items }}}}" as="it"><li>{RUNS('it.runs', 'q')}</li></sc-for></ul></sc-if>
  <sc-if value="{{{{ b.isOl }}}}"><ol><sc-for list="{{{{ b.items }}}}" as="it"><li>{RUNS('it.runs', 'q')}</li></sc-for></ol></sc-if>
  <sc-if value="{{{{ b.isCode }}}}"><pre>{{{{ b.text }}}}</pre></sc-if>
  <sc-if value="{{{{ b.isImg }}}}"><img src="{{{{ b.src }}}}" alt="{{{{ b.alt }}}}" loading="lazy"></sc-if>
  <sc-if value="{{{{ b.isVideo }}}}"><a class="cm-video-link" href="{{{{ b.href }}}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>{{{{ b.label }}}}</a></sc-if>
</sc-for>
</div>'''

def LINKS(list_expr, alias='r'):
    """Texte brut d'un message de forum : segments texte et liens cliquables."""
    a = alias
    return (f'<sc-for list="{{{{ {list_expr} }}}}" as="{a}">'
            f'<sc-if value="{{{{ {a}.isText }}}}"><span>{{{{ {a}.s }}}}</span></sc-if>'
            f'<sc-if value="{{{{ {a}.isLink }}}}"><a href="{{{{ {a}.h }}}}" target="_blank" rel="nofollow noopener noreferrer">{{{{ {a}.s }}}}</a></sc-if>'
            f'</sc-for>')

BADGES = '''<sc-for list="{{ %s }}" as="bd"><span class="cm-badge" style="color: {{ bd.color }}; background: {{ bd.bg }};">{{ bd.label }}</span></sc-for>'''

def AUTHOR_BADGES(expr):
    return BADGES % expr

PAGER = '''<sc-if value="{{ hasPager }}">
  <div class="cm-pager">
    <sc-if value="{{ hasPrev }}"><a href="{{ prevHref }}" class="cm-act">← Précédent</a></sc-if>
    <span>Page {{ page }} sur {{ pages }}</span>
    <sc-if value="{{ hasNext }}"><a href="{{ nextHref }}" class="cm-act">Suivant →</a></sc-if>
  </div>
</sc-if>'''

# Aide de renderVals pour la pagination : à appeler avec (page, pages, hrefFor).
PAGER_JS = '''
  pagerVals(page, pages, hrefFor) {
    page = Number(page) || 1; pages = Number(pages) || 1;
    return {
      hasPager: pages > 1, page: String(page), pages: String(pages),
      hasPrev: page > 1, hasNext: page < pages,
      prevHref: hrefFor(Math.max(1, page - 1)), nextHref: hrefFor(Math.min(pages, page + 1)),
    };
  }
'''

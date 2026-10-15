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


# « Signaler un bug à l'éditeur » (POST /v1/bug-report, même canal que l'application) : la
# fenêtre et son envoi, partagés par le Forum et le Profil (15/10/2026 : la barre de l'espace
# client ne mène plus au Forum, le Profil porte le bouton). Chaque page fournit `bugLede` et
# `bugDoneText`, et peut définir `afterBugReport()` (le Profil y relit ses signalements).
BUG_MODAL = """  <!-- Signaler un bug à l'éditeur -->
  <sc-if value="{{ bugOpen }}">
    <div class="cm-overlay" onClick="{{ onCloseBug }}">
      <div class="cm-modal" role="dialog" aria-modal="true" onClick="{{ stop }}">
        <div class="cm-modal-head"><h2>Signaler un bug à l'éditeur</h2><button type="button" class="cm-close" aria-label="Fermer" onClick="{{ onCloseBug }}">✕</button></div>
        <sc-if value="{{ bugDone }}">
          <div class="cm-alert is-ok">{{ bugDoneText }}</div>
          <div style="text-align: right;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCloseBug }}">Fermer</button></div>
        </sc-if>
        <sc-if value="{{ bugForm }}">
          <p class="cm-lede" style="margin-bottom: 16px;">{{ bugLede }}</p>
          <form onSubmit="{{ onSubmitBug }}">
            <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" placeholder="Ex. : l'export DPGF s'arrête sur le lot 3"></label>
            <label class="cm-field"><span>Gravité</span><select class="cm-select" name="severity"><option value="medium">Gênant</option><option value="high">Bloquant</option><option value="low">Mineur</option></select></label>
            <label class="cm-field"><span>Description</span><textarea class="cm-textarea" name="description" maxlength="4000" placeholder="Version, étapes pour reproduire, message affiché…"></textarea></label>
            <sc-if value="{{ hasBugError }}"><div class="cm-alert" role="alert">{{ bugError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCloseBug }}">Annuler</button><button type="submit" class="cm-btn">{{ bugLabel }}</button></div>
          </form>
        </sc-if>
      </div>
    </div>
  </sc-if>
"""

BUG_JS = """
  // Signalement privé à l'éditeur (POST /v1/bug-report, même canal que l'application).
  onOpenBug = () => this.setState({ bugOpen: true, bugError: '', bugDone: false });
  onCloseBug = () => this.setState({ bugOpen: false });
  onSubmitBug = async (e) => {
    e.preventDefault();
    if (this.state.bugBusy) return;
    const form = e.currentTarget || e.target;
    const title = (form.title && form.title.value || '').trim();
    const severity = (form.severity && form.severity.value) || 'medium';
    const description = (form.description && form.description.value || '').trim();
    if (!title) { this.setState({ bugError: 'Donnez un titre à votre signalement.' }); return; }
    this.setState({ bugBusy: true, bugError: '' });
    const r = await RDB.api('/v1/bug-report', { method: 'POST', body: { title, severity, description } });
    if (r.status === 201) {
      this.setState({ bugBusy: false, bugDone: true });
      if (this.afterBugReport) await this.afterBugReport();
      return;
    }
    this.setState({ bugBusy: false, bugError: RDB.errorMessage(r.status, r.data, 'Envoi impossible. Réessayez.') });
  };
  bugVals(s) {
    return { bugOpen: !!s.bugOpen, bugDone: !!s.bugDone, bugForm: !s.bugDone, hasBugError: !!s.bugError, bugError: s.bugError || '',
      bugLabel: s.bugBusy ? 'Envoi…' : 'Envoyer le signalement',
      onOpenBug: this.onOpenBug, onCloseBug: this.onCloseBug, onSubmitBug: this.onSubmitBug };
  }
"""

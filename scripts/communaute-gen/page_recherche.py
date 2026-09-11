TITLE = 'Recherche'
DESCRIPTION = 'Recherche dans la communauté Rédibat : sujets du forum, guides, vidéos et nouveautés.'

MAIN = r'''
<main class="cm-main is-narrow">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <div class="cm-page-head">
    <div>
      <p class="cm-eyebrow">Recherche</p>
      <h1 class="cm-h1">Chercher dans la communauté</h1>
      <p class="cm-lede">Sujets et réponses du forum, guides, vidéos, nouveautés.</p>
    </div>
  </div>

  <form class="cm-card cm-card-body" style="margin-bottom: 22px; display: flex; gap: 10px; align-items: center;" role="search" onSubmit="{{ onSearch }}">
    <input class="cm-input" type="search" name="q" maxlength="80" value="{{ q }}" onChange="{{ onChange }}" placeholder="Ex. : export DPGF, calibrage, bibliothèque…" aria-label="Rechercher">
    <button type="submit" class="cm-btn">Chercher</button>
  </form>

  <sc-if value="{{ isSimplified }}"><div class="cm-alert is-info">Recherche simplifiée (sans classement ni tolérance aux accents) : le serveur n'a pas l'index plein texte.</div></sc-if>
  <sc-if value="{{ tooShort }}"><div class="cm-card cm-empty">Saisissez au moins deux caractères.</div></sc-if>
  <sc-if value="{{ noResults }}"><div class="cm-card cm-empty">Aucun résultat pour « {{ q }} ». Essayez un autre mot, ou posez la question sur le <a href="/communaute/forum" style="color: var(--a-blue);">forum</a>.</div></sc-if>

  <sc-for list="{{ groups }}" as="g">
    <section class="cm-card" style="margin-bottom: 18px;">
      <div class="cm-card-head"><h2 class="cm-h2">{{ g.label }}</h2><span class="cm-mono">{{ g.count }}</span></div>
      <ul class="cm-list">
        <sc-for list="{{ g.items }}" as="r">
          <li><a href="{{ r.href }}" class="cm-row">
            <div class="cm-row-main">
              <p class="cm-row-title">{{ r.title }}</p>
              <sc-if value="{{ r.hasSnippet }}"><p class="cm-small cm-muted" style="margin: 0; line-height: 1.5;">{{ r.snippet }}</p></sc-if>
            </div>
            <sc-if value="{{ r.hasTag }}"><span class="cm-tag">{{ r.tag }}</span></sc-if>
          </a></li>
        </sc-for>
      </ul>
    </section>
  </sc-for>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    q: '', results: null, fts: true };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    this.state.q = (RDB.params().get('q') || '').slice(0, 80);
    RDB.bootPage(this, {});
  }

  async load() {
    const q = this.state.q.trim();
    if (q.length < 2) { this.setState({ results: [] }); return; }
    const r = await RDB.api('/v1/community/search?q=' + encodeURIComponent(q));
    if (RDB.loadFailed(this, r)) return;
    this.setState({ results: r.data.results || [], fts: r.data.fts !== false });
  }

  onChange = (e) => this.setState({ q: e.target.value });
  onSearch = (e) => {
    e.preventDefault();
    const q = (this.state.q || '').trim();
    if (q.length >= 2) location.assign('/communaute/recherche?q=' + encodeURIComponent(q));
  };

  renderVals() {
    const s = this.state;
    const KINDS = [
      ['thread', 'Sujets du forum'], ['post', 'Réponses du forum'], ['guide', 'Guides'], ['video', 'Vidéos'], ['announcement', 'Nouveautés'],
    ];
    const hrefOf = (r) => r.kind === 'thread' ? '/communaute/forum?t=' + r.id
      : r.kind === 'post' ? '/communaute/forum?t=' + r.thread_id
        : r.kind === 'guide' ? '/communaute/guides?g=' + r.slug
          : r.kind === 'video' ? '/communaute/videos?v=' + r.id
            : '/communaute/nouveautes?n=' + r.id;
    const groups = KINDS.map(([kind, label]) => {
      const items = (s.results || []).filter((r) => r.kind === kind).map((r) => ({
        title: r.title, href: hrefOf(r), snippet: RDB.plainText(r.snippet || '', 200), hasSnippet: !!r.snippet,
        tag: r.module ? RDB.moduleName(r.module) : (r.version ? 'v' + r.version : ''), hasTag: !!(r.module || r.version),
      }));
      return { label, items, count: RDB.plural(items.length, 'résultat', 'résultats') };
    }).filter((g) => g.items.length);
    const q = s.q.trim();
    return Object.assign(RDB.shellVals(this, 'search'), {
      q: s.q, onChange: this.onChange, onSearch: this.onSearch,
      isSimplified: s.results !== null && s.fts === false,
      tooShort: s.results !== null && q.length > 0 && q.length < 2,
      noResults: s.results !== null && q.length >= 2 && groups.length === 0,
      groups,
    });
  }
}
'''

from snippets import PROSE, PAGER, PAGER_JS

TITLE = 'Nouveautés'
DESCRIPTION = 'Nouveautés et notes de version de Rédibat, réservées aux membres.'

MAIN = r'''
<main class="cm-main is-narrow">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <sc-if value="{{ viewList }}">
    <div class="cm-page-head">
      <div>
        <p class="cm-eyebrow">Nouveautés</p>
        <h1 class="cm-h1">Ce qui change dans Rédibat</h1>
        <p class="cm-lede">Versions publiées, corrections, annonces de l'éditeur.</p>
      </div>
    </div>
    <div class="cm-card">
      <sc-if value="{{ noItems }}"><div class="cm-empty">Aucune annonce pour l'instant.</div></sc-if>
      <ul class="cm-list">
        <sc-for list="{{ items }}" as="n">
          <li><a href="{{ n.href }}" class="cm-row">
            <div class="cm-row-main">
              <p class="cm-row-title"><sc-if value="{{ n.isPinned }}"><span class="cm-tag" style="margin-right: 8px;">Épinglée</span></sc-if>{{ n.title }}</p>
              <p class="cm-small cm-muted" style="margin: 0 0 6px; line-height: 1.5;">{{ n.excerpt }}</p>
              <div class="cm-row-meta"><span>{{ n.date }}</span></div>
            </div>
            <sc-if value="{{ n.hasVersion }}"><span class="cm-tag">v{{ n.version }}</span></sc-if>
          </a></li>
        </sc-for>
      </ul>
      ''' + PAGER + r'''
    </div>
  </sc-if>

  <sc-if value="{{ viewItem }}">
    <p class="cm-mono" style="margin: 0 0 16px;"><a href="/communaute/nouveautes" style="color: var(--a-blue); text-decoration: none;">← Toutes les nouveautés</a></p>
    <article class="cm-card" style="padding: 34px 38px 40px;">
      <div class="cm-row-meta" style="margin-bottom: 10px;"><sc-if value="{{ item.hasVersion }}"><span class="cm-tag">v{{ item.version }}</span></sc-if><span>{{ item.date }}</span><sc-if value="{{ item.isDraft }}"><span class="cm-tag is-amber">Brouillon (visible du fondateur seulement)</span></sc-if></div>
      <h1 class="cm-h1">{{ item.title }}</h1>
      ''' + PROSE('blocks') + r'''
    </article>
  </sc-if>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    itemId: null, page: 1, pages: 1, items: null, item: null };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    const p = RDB.params();
    const n = Number(p.get('n'));
    this.state.itemId = Number.isInteger(n) && n > 0 ? n : null;
    const pg = Number(p.get('page'));
    this.state.page = Number.isInteger(pg) && pg > 0 ? pg : 1;
    RDB.bootPage(this, {});
  }

  async load() {
    if (this.state.itemId) {
      const r = await RDB.api('/v1/community/announcements/' + this.state.itemId);
      if (r.status === 404) { this.setState({ loadError: 'Cette annonce n\'existe pas ou n\'est pas publiée.' }); return; }
      if (RDB.loadFailed(this, r)) return;
      this.setState({ item: r.data });
      return;
    }
    const r = await RDB.api('/v1/community/announcements?page=' + this.state.page);
    if (RDB.loadFailed(this, r)) return;
    this.setState({ items: r.data.items || [], pages: r.data.pages || 1, page: r.data.page || 1 });
  }
''' + PAGER_JS + r'''
  renderVals() {
    const s = this.state;
    const items = (s.items || []).map((n) => ({
      title: n.title, excerpt: RDB.plainText(n.excerpt, 220), date: RDB.fmtDate(n.published_at), version: n.version || '', hasVersion: !!n.version,
      isPinned: n.is_pinned === true, href: '/communaute/nouveautes?n=' + n.id,
    }));
    const it = s.item;
    const item = it ? { title: it.title, version: it.version || '', hasVersion: !!it.version, date: RDB.fmtDate(it.published_at), isDraft: !it.published_at }
      : { title: '', version: '', hasVersion: false, date: '', isDraft: false };
    return Object.assign(RDB.shellVals(this, 'news'), this.pagerVals(s.page, s.pages, (n) => '/communaute/nouveautes?page=' + n), {
      viewList: !s.itemId, viewItem: !!s.itemId && !!it,
      items, noItems: s.items !== null && items.length === 0,
      item, blocks: it ? RDB.parseLite(it.body) : [],
    });
  }
}
'''

from snippets import PROSE

TITLE = 'Guides'
DESCRIPTION = 'Guides et tutoriels Rédibat, module par module, réservés aux membres.'

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <sc-if value="{{ viewList }}">
    <div class="cm-page-head">
      <div>
        <p class="cm-eyebrow">Guides</p>
        <h1 class="cm-h1">La base de connaissances</h1>
        <p class="cm-lede">Des pas à pas rédigés par l'éditeur, classés par module. À lire dans la page, à relire quand vous voulez.</p>
      </div>
    </div>
    <sc-if value="{{ noGuides }}"><div class="cm-card cm-empty">Les premiers guides arrivent bientôt.</div></sc-if>
    <div class="cm-grid cols-2">
      <sc-for list="{{ modules }}" as="m">
        <section class="cm-card">
          <div class="cm-card-head"><h2 class="cm-h2">{{ m.name }}</h2><span class="cm-mono">{{ m.count }}</span></div>
          <ul class="cm-list">
            <sc-for list="{{ m.guides }}" as="g">
              <li><a href="{{ g.href }}" class="cm-row">
                <div class="cm-row-main">
                  <p class="cm-row-title">{{ g.title }}</p>
                  <sc-if value="{{ g.hasSummary }}"><p class="cm-small cm-muted" style="margin: 0 0 6px;">{{ g.summary }}</p></sc-if>
                  <div class="cm-row-meta"><span>mis à jour {{ g.updated }}</span></div>
                </div>
              </a></li>
            </sc-for>
          </ul>
        </section>
      </sc-for>
    </div>
  </sc-if>

  <sc-if value="{{ viewGuide }}">
    <p class="cm-mono" style="margin: 0 0 16px;"><a href="/communaute/guides" style="color: var(--a-blue); text-decoration: none;">← Tous les guides</a></p>
    <div class="cm-split is-article">
      <article class="cm-card" style="padding: 34px 38px 40px;">
        <div class="cm-row-meta" style="margin-bottom: 10px;"><span class="cm-tag">{{ guide.moduleName }}</span><span>mis à jour {{ guide.updated }}</span><sc-if value="{{ guide.isDraft }}"><span class="cm-tag is-amber">Brouillon (visible du fondateur seulement)</span></sc-if></div>
        <h1 class="cm-h1">{{ guide.title }}</h1>
        <sc-if value="{{ guide.hasSummary }}"><p class="cm-lede" style="margin-bottom: 22px;">{{ guide.summary }}</p></sc-if>
        ''' + PROSE('blocks') + r'''
      </article>
      <aside>
        <div class="cm-card" style="padding: 12px; position: sticky; top: 84px;">
          <div class="cm-mono" style="padding: 8px 12px 10px;">Dans ce module</div>
          <nav class="cm-toc">
            <sc-for list="{{ siblings }}" as="g"><a href="{{ g.href }}" class="{{ g.cls }}">{{ g.title }}</a></sc-for>
          </nav>
        </div>
      </aside>
    </div>
  </sc-if>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    slug: '', modules: null, guide: null, siblings: [] };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    const g = RDB.params().get('g') || '';
    this.state.slug = /^[a-z0-9-]{1,80}$/.test(g) ? g : '';
    RDB.bootPage(this, {});
  }

  async load() {
    const list = await RDB.api('/v1/community/guides');
    if (RDB.loadFailed(this, list)) return;
    const modules = list.data.modules || [];
    if (!this.state.slug) { this.setState({ modules }); return; }
    const r = await RDB.api('/v1/community/guides/' + encodeURIComponent(this.state.slug));
    if (r.status === 404) { this.setState({ modules, loadError: 'Ce guide n\'existe pas ou n\'est pas publié.' }); return; }
    if (RDB.loadFailed(this, r)) return;
    const mod = modules.find((m) => m.code === r.data.module);
    this.setState({ modules, guide: r.data, siblings: mod ? mod.guides : [] });
  }

  renderVals() {
    const s = this.state;
    const modules = (s.modules || []).filter((m) => m.guides && m.guides.length).map((m) => ({
      name: m.name, count: RDB.plural(m.guides.length, 'guide', 'guides'),
      guides: m.guides.map((g) => ({ title: g.title, summary: g.summary || '', hasSummary: !!g.summary, href: '/communaute/guides?g=' + g.slug, updated: RDB.fmtDate(g.updated_at) })),
    }));
    const g = s.guide;
    const guide = g ? { title: g.title, summary: g.summary || '', hasSummary: !!g.summary, moduleName: g.module_name || RDB.moduleName(g.module), updated: RDB.fmtDate(g.updated_at), isDraft: g.published === false }
      : { title: '', summary: '', hasSummary: false, moduleName: '', updated: '', isDraft: false };
    return Object.assign(RDB.shellVals(this, 'guides'), {
      viewList: !s.slug, viewGuide: !!s.slug && !!g,
      modules, noGuides: s.modules !== null && modules.length === 0,
      guide, blocks: g ? RDB.parseLite(g.body) : [],
      siblings: (s.siblings || []).map((x) => ({ title: x.title, href: '/communaute/guides?g=' + x.slug, cls: x.slug === s.slug ? 'is-active' : '' })),
    });
  }
}
'''

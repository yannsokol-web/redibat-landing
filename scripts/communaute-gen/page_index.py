TITLE = 'Accueil'
DESCRIPTION = 'Espace communautaire Rédibat : vidéos, forum, guides et nouveautés, réservés aux comptes.'

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <div class="cm-page-head">
    <div>
      <p class="cm-eyebrow">Communauté Rédibat</p>
      <h1 class="cm-h1">{{ welcome }}</h1>
      <p class="cm-lede">Vidéos explicatives, entraide entre confrères, guides et nouveautés du logiciel. Tout ce qui est ici reste ici.</p>
    </div>
    <div class="cm-tabs">
      <a href="/communaute/forum" class="cm-tab">Poser une question</a>
      <a href="/communaute/videos" class="cm-tab">Voir les vidéos</a>
    </div>
  </div>

  <div class="cm-grid cols-4" style="margin-bottom: 28px;">
    <div class="cm-card cm-stat"><div class="cm-stat-label">Membres</div><div class="cm-stat-value">{{ cMembers }}</div></div>
    <div class="cm-card cm-stat"><div class="cm-stat-label">Sujets du forum</div><div class="cm-stat-value">{{ cThreads }}</div></div>
    <div class="cm-card cm-stat"><div class="cm-stat-label">Vidéos</div><div class="cm-stat-value">{{ cVideos }}</div></div>
    <div class="cm-card cm-stat"><div class="cm-stat-label">Guides</div><div class="cm-stat-value">{{ cGuides }}</div></div>
  </div>

  <sc-if value="{{ hasNews }}">
    <section class="cm-card" style="margin-bottom: 28px;">
      <div class="cm-card-head">
        <h2 class="cm-h2">Nouveautés</h2>
        <a href="/communaute/nouveautes" class="cm-mono" style="text-decoration: none; color: var(--a-blue);">Toutes les nouveautés →</a>
      </div>
      <ul class="cm-list">
        <sc-for list="{{ news }}" as="n">
          <li><a href="{{ n.href }}" class="cm-row">
            <div class="cm-row-main">
              <p class="cm-row-title">{{ n.title }}</p>
              <p class="cm-small cm-muted" style="margin: 0 0 6px; line-height: 1.5;">{{ n.excerpt }}</p>
              <div class="cm-row-meta"><span>{{ n.date }}</span><sc-if value="{{ n.isPinned }}"><span>Épinglée</span></sc-if></div>
            </div>
            <sc-if value="{{ n.hasVersion }}"><span class="cm-tag">v{{ n.version }}</span></sc-if>
          </a></li>
        </sc-for>
      </ul>
    </section>
  </sc-if>

  <div class="cm-split">
    <section>
      <div class="cm-page-head" style="margin-bottom: 14px;">
        <h2 class="cm-h2">Dernières vidéos</h2>
        <a href="/communaute/videos" class="cm-mono" style="text-decoration: none; color: var(--a-blue);">Toutes les vidéos →</a>
      </div>
      <sc-if value="{{ noVideos }}"><div class="cm-card cm-empty">Les premières vidéos arrivent bientôt.</div></sc-if>
      <div class="cm-grid cols-2">
        <sc-for list="{{ videos }}" as="v">
          <a href="{{ v.href }}" class="cm-video-card">
            <span class="cm-thumb">
              <sc-if value="{{ v.hasPoster }}"><img src="{{ v.posterUrl }}" alt="" loading="lazy"></sc-if>
              <sc-if value="{{ v.noPoster }}"><span class="cm-thumb-title">{{ v.title }}</span></sc-if>
              <sc-if value="{{ v.hasDuration }}"><span class="cm-thumb-dur">{{ v.duration }}</span></sc-if>
            </span>
            <h3>{{ v.title }}</h3>
            <div class="cm-row-meta"><span>{{ v.moduleName }}</span></div>
          </a>
        </sc-for>
      </div>
    </section>

    <section class="cm-card">
      <div class="cm-card-head">
        <h2 class="cm-h2">Sur le forum</h2>
        <a href="/communaute/forum" class="cm-mono" style="text-decoration: none; color: var(--a-blue);">Tout le forum →</a>
      </div>
      <sc-if value="{{ noThreads }}"><div class="cm-empty">Aucun sujet pour l'instant. Lancez la conversation !</div></sc-if>
      <ul class="cm-list">
        <sc-for list="{{ threads }}" as="t">
          <li><a href="{{ t.href }}" class="cm-row">
            <span class="cm-avatar" aria-hidden="true">{{ t.author.initial }}</span>
            <div class="cm-row-main">
              <p class="cm-row-title">{{ t.title }}</p>
              <div class="cm-row-meta"><span>{{ t.author.name }}</span><span>{{ t.categoryName }}</span><span>{{ t.replies }}</span><span>{{ t.when }}</span></div>
            </div>
          </a></li>
        </sc-for>
      </ul>
    </section>
  </div>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false, home: null };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    RDB.bootPage(this, {});
  }

  async load() {
    const r = await RDB.api('/v1/community/home');
    if (RDB.loadFailed(this, r)) return;
    this.setState({ home: r.data });
  }

  renderVals() {
    const s = this.state;
    const h = s.home || {};
    const me = s.me || {};
    const counts = h.counts || {};
    const news = (h.announcements || []).map((n) => ({
      id: n.id, title: n.title, excerpt: RDB.plainText(n.excerpt, 200), date: RDB.fmtDate(n.published_at),
      version: n.version || '', hasVersion: !!n.version, isPinned: n.is_pinned === true,
      href: '/communaute/nouveautes?n=' + n.id,
    }));
    const videos = (h.videos || []).map((v) => ({
      id: v.id, title: v.title, href: '/communaute/videos?v=' + v.id,
      posterUrl: RDB.API_BASE + '/v1/community/videos/' + v.id + '/poster',
      hasPoster: v.has_poster === true, noPoster: v.has_poster !== true,
      duration: RDB.fmtDuration(v.duration_s), hasDuration: !!v.duration_s,
      moduleName: v.module_name || RDB.moduleName(v.module),
    }));
    const threads = (h.threads || []).map((t) => ({
      id: t.id, title: t.title, href: '/communaute/forum?t=' + t.id,
      categoryName: t.category_name || '', replies: RDB.plural(t.reply_count || 0, 'réponse', 'réponses'),
      when: RDB.fmtRelative(t.last_post_at), author: RDB.author(t.author),
    }));
    return Object.assign(RDB.shellVals(this, 'home'), {
      welcome: me.display_name ? ('Bonjour ' + me.display_name) : 'Bienvenue dans la communauté',
      cMembers: String(Number(counts.members) || 0),
      cThreads: String(Number(counts.threads) || 0),
      cVideos: String(Number(counts.videos) || 0),
      cGuides: String(Number(counts.guides) || 0),
      news, hasNews: news.length > 0,
      videos, noVideos: s.home !== null && videos.length === 0,
      threads, noThreads: s.home !== null && threads.length === 0,
    });
  }
}
'''

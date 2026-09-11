TITLE = 'Vidéos'
DESCRIPTION = 'Vidéos explicatives Rédibat, réservées aux membres : lecture en ligne uniquement.'

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <sc-if value="{{ viewList }}">
    <div class="cm-page-head">
      <div>
        <p class="cm-eyebrow">Vidéos</p>
        <h1 class="cm-h1">Prenez le logiciel en main</h1>
        <p class="cm-lede">Des démonstrations courtes, module par module. Les vidéos se regardent ici et ne se téléchargent pas.</p>
      </div>
      <div class="cm-tabs">
        <sc-for list="{{ filters }}" as="f"><a href="{{ f.href }}" class="{{ f.cls }}">{{ f.label }}</a></sc-for>
      </div>
    </div>
    <sc-if value="{{ noVideos }}"><div class="cm-card cm-empty">Aucune vidéo pour l'instant dans cette rubrique.</div></sc-if>
    <div class="cm-grid cols-3">
      <sc-for list="{{ videos }}" as="v">
        <a href="{{ v.href }}" class="cm-video-card">
          <span class="cm-thumb">
            <sc-if value="{{ v.hasPoster }}"><img src="{{ v.posterUrl }}" alt="" loading="lazy"></sc-if>
            <sc-if value="{{ v.noPoster }}"><span class="cm-thumb-title">{{ v.title }}</span></sc-if>
            <sc-if value="{{ v.hasDuration }}"><span class="cm-thumb-dur">{{ v.duration }}</span></sc-if>
          </span>
          <h3>{{ v.title }}</h3>
          <div class="cm-row-meta"><span>{{ v.moduleName }}</span><span>{{ v.views }}</span><sc-if value="{{ v.isDraft }}"><span class="cm-tag is-amber">Non publiée</span></sc-if></div>
        </a>
      </sc-for>
    </div>
  </sc-if>

  <sc-if value="{{ viewPlayer }}">
    <p class="cm-mono" style="margin: 0 0 16px;"><a href="/communaute/videos" style="color: var(--a-blue); text-decoration: none;">← Toutes les vidéos</a></p>
    <div class="cm-split is-player">
      <section>
        <sc-if value="{{ hasStream }}">
          <!-- Aucun src ni poster dans le gabarit : le navigateur l'analyse avant React et
               demanderait l'URL littérale. Le composant pose le src (ticket de lecture) et les
               écouteurs sur l'élément #cm-player après le rendu. La vignette est un fond CSS
               (une url() invalide au premier passage est simplement ignorée). -->
          <div class="cm-player" style="background: #000 url({{ posterUrl }}) center / cover no-repeat;">
            <video id="cm-player" controls="{{ true }}" controlsList="nodownload noremoteplayback" disablePictureInPicture="{{ true }}" playsInline="{{ true }}" preload="metadata"></video>
            <div class="cm-watermark" aria-hidden="true">{{ watermark }}</div>
          </div>
        </sc-if>
        <sc-if value="{{ hasPlayerError }}"><div class="cm-alert" role="alert" style="margin-top: 14px;">{{ playerError }}</div></sc-if>
        <sc-if value="{{ hasVideo }}">
          <div style="margin-top: 20px;">
            <div class="cm-row-meta" style="margin-bottom: 8px;"><span class="cm-tag">{{ current.moduleName }}</span><sc-if value="{{ current.hasDuration }}"><span>{{ current.duration }}</span></sc-if><span>{{ current.views }}</span><span>{{ current.date }}</span><sc-if value="{{ current.isDraft }}"><span class="cm-tag is-amber">Non publiée (visible du fondateur seulement)</span></sc-if></div>
            <h1 class="cm-h1" style="font-size: clamp(24px, 3vw, 30px);">{{ current.title }}</h1>
            <sc-if value="{{ current.hasDescription }}"><p class="cm-post-text" style="margin: 0;">{{ current.description }}</p></sc-if>
            <p class="cm-help" style="margin-top: 14px;">Cette vidéo est réservée aux membres et ne peut pas être téléchargée. Le lecteur affiche votre pseudo en filigrane.</p>
          </div>
        </sc-if>
      </section>
      <aside>
        <div class="cm-card">
          <div class="cm-card-head"><h2 class="cm-h2">À voir ensuite</h2></div>
          <sc-if value="{{ noRelated }}"><div class="cm-empty">Pas d'autre vidéo dans ce module pour l'instant.</div></sc-if>
          <ul class="cm-list">
            <sc-for list="{{ related }}" as="v">
              <li><a href="{{ v.href }}" class="cm-row">
                <span class="cm-thumb" style="width: 96px; flex: none; border-radius: 8px;">
                  <sc-if value="{{ v.hasPoster }}"><img src="{{ v.posterUrl }}" alt="" loading="lazy"></sc-if>
                </span>
                <div class="cm-row-main"><p class="cm-row-title" style="font-size: 14px;">{{ v.title }}</p><div class="cm-row-meta"><span>{{ v.moduleName }}</span><sc-if value="{{ v.hasDuration }}"><span>{{ v.duration }}</span></sc-if></div></div>
              </a></li>
            </sc-for>
          </ul>
        </div>
      </aside>
    </div>
  </sc-if>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    videoId: null, module: '', videos: null, current: null, related: [], streamUrl: '', playerError: '', ticketRenewed: false };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    const p = RDB.params();
    const id = Number(p.get('v'));
    this.state.videoId = Number.isInteger(id) && id > 0 ? id : null;
    this.state.module = RDB.MODULES[p.get('module') || ''] ? p.get('module') : '';
    RDB.bootPage(this, {});
  }

  async load() {
    if (this.state.videoId) return this.loadPlayer();
    const r = await RDB.api('/v1/community/videos' + (this.state.module ? '?module=' + encodeURIComponent(this.state.module) : ''));
    if (RDB.loadFailed(this, r)) return;
    this.setState({ videos: r.data.videos || [] });
  }

  async loadPlayer() {
    const r = await RDB.api('/v1/community/videos/' + this.state.videoId);
    if (r.status === 404) { this.setState({ loadError: 'Cette vidéo n\'existe pas ou n\'est plus disponible.' }); return; }
    if (RDB.loadFailed(this, r)) return;
    this.setState({ current: r.data.video, related: r.data.related || [] });
    await this.requestTicket();
  }

  // Ticket de lecture : lié à la session, valable 6 h ; l'URL du flux est inutilisable ailleurs.
  async requestTicket() {
    const r = await RDB.api('/v1/community/videos/' + this.state.videoId + '/ticket', { method: 'POST', body: {} });
    if (r.status === 200 && r.data && r.data.ticket) {
      this.setState({ streamUrl: RDB.API_BASE + '/v1/community/stream/' + r.data.ticket, playerError: '' });
      return true;
    }
    this.setState({ playerError: RDB.errorMessage(r.status, r.data, 'Lecture impossible pour le moment. Réessayez.') });
    return false;
  }

  // Le <video> n'a ni src ni écouteur dans le gabarit (cf. commentaire du gabarit) : on les
  // pose ici, après chaque rendu, sur l'élément réellement présent (React peut le recréer
  // quand le runtime remplace le gabarit par sa source brute).
  componentDidUpdate() { this.syncPlayer(); }
  syncPlayer() {
    const el = typeof document !== 'undefined' ? document.getElementById('cm-player') : null;
    if (!el) return;
    if (!el._rdbBound) {
      el._rdbBound = true;
      el.addEventListener('error', () => this.onPlayerError());
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    const want = this.state.streamUrl || '';
    if (want && el.getAttribute('src') !== want) el.setAttribute('src', want);
  }

  // Le ticket a pu expirer (plus de 6 h sur la page) : on en redemande un, une seule fois.
  onPlayerError = async () => {
    if (this.state.ticketRenewed) {
      this.setState({ playerError: 'Lecture impossible : la vidéo est peut-être encore en cours de traitement, ou votre session a expiré. Rechargez la page dans un instant.' });
      return;
    }
    this.setState({ ticketRenewed: true });
    await this.requestTicket();
  };

  videoView(v) {
    return {
      id: v.id, title: v.title, href: '/communaute/videos?v=' + v.id,
      posterUrl: RDB.API_BASE + '/v1/community/videos/' + v.id + '/poster',
      hasPoster: v.has_poster === true, noPoster: v.has_poster !== true,
      duration: RDB.fmtDuration(v.duration_s), hasDuration: !!v.duration_s,
      moduleName: v.module_name || RDB.moduleName(v.module),
      views: RDB.plural(v.view_count || 0, 'vue', 'vues'),
      date: RDB.fmtDate(v.created_at),
      description: v.description || '', hasDescription: !!v.description,
      isDraft: v.published === false,
    };
  }

  renderVals() {
    const s = this.state;
    const me = s.me || {};
    const list = (s.videos || []).map((v) => this.videoView(v));
    const present = new Set((s.videos || []).map((v) => v.module).filter(Boolean));
    const filters = [{ code: '', label: 'Toutes' }].concat(RDB.moduleList().filter((m) => present.has(m.code)))
      .map((m) => ({ label: m.label || m.name, href: '/communaute/videos' + (m.code ? '?module=' + m.code : ''), cls: (s.module === m.code) ? 'cm-tab is-active' : 'cm-tab' }));
    const current = s.current ? this.videoView(s.current) : null;
    return Object.assign(RDB.shellVals(this, 'videos'), {
      viewList: !s.videoId, viewPlayer: !!s.videoId,
      filters, videos: list, noVideos: s.videos !== null && list.length === 0,
      hasVideo: !!current, current: current || this.videoView({ id: 0, title: '' }),
      hasStream: !!s.streamUrl,
      posterUrl: current && current.hasPoster ? current.posterUrl : '',
      watermark: me.display_name || me.email || '',
      hasPlayerError: !!s.playerError, playerError: s.playerError,
      related: (s.related || []).map((v) => this.videoView(v)), noRelated: !!current && (s.related || []).length === 0,
    });
  }
}
'''

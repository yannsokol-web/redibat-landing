from snippets import AUTHOR_BADGES, PAGER, PAGER_JS

TITLE = 'Membres'
DESCRIPTION = 'Annuaire des membres de la communauté Rédibat (inscription volontaire).'

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <div class="cm-page-head">
    <div>
      <p class="cm-eyebrow">Membres</p>
      <h1 class="cm-h1">L'annuaire de la communauté</h1>
      <p class="cm-lede">Des confrères qui utilisent Rédibat, par métier et par région. Chacun choisit d'y figurer ; les adresses e-mail n'apparaissent jamais.</p>
    </div>
    <span class="cm-mono">{{ total }}</span>
  </div>

  <sc-if value="{{ notListed }}"><div class="cm-alert is-info">Vous n'apparaissez pas dans l'annuaire. Pour y figurer, cochez « Apparaître dans l'annuaire » dans <a href="/communaute/profil" style="color: inherit;">votre profil</a>.</div></sc-if>
  <sc-if value="{{ noMembers }}"><div class="cm-card cm-empty">Personne n'a encore rejoint l'annuaire. Soyez le premier depuis votre profil !</div></sc-if>

  <div class="cm-grid cols-3">
    <sc-for list="{{ members }}" as="m">
      <div class="cm-card cm-card-body" style="display: flex; gap: 14px; align-items: flex-start;">
        <span class="cm-avatar is-lg" aria-hidden="true">{{ m.initial }}</span>
        <div style="min-width: 0; flex: 1;">
          <p class="cm-row-title" style="margin-bottom: 2px;">{{ m.name }}</p>
          <sc-if value="{{ m.hasJob }}"><p class="cm-small" style="margin: 0 0 2px; color: #16314f;">{{ m.job }}</p></sc-if>
          <div class="cm-row-meta" style="margin-bottom: 8px;"><sc-if value="{{ m.hasCompany }}"><span>{{ m.company }}</span></sc-if><sc-if value="{{ m.hasRegion }}"><span>{{ m.region }}</span></sc-if></div>
          <sc-if value="{{ m.hasBio }}"><p class="cm-small cm-muted" style="margin: 0 0 10px; line-height: 1.5; overflow-wrap: anywhere;">{{ m.bio }}</p></sc-if>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
            ''' + AUTHOR_BADGES('m.badges') + r'''
            <span class="cm-mono">membre depuis {{ m.since }}</span>
            <span class="cm-mono">{{ m.posts }}</span>
          </div>
        </div>
      </div>
    </sc-for>
  </div>
  ''' + PAGER + r'''
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    page: 1, pages: 1, total: 0, members: null };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    const pg = Number(RDB.params().get('page'));
    this.state.page = Number.isInteger(pg) && pg > 0 ? pg : 1;
    RDB.bootPage(this, {});
  }

  async load() {
    const r = await RDB.api('/v1/community/members?page=' + this.state.page);
    if (RDB.loadFailed(this, r)) return;
    this.setState({ members: r.data.members || [], pages: r.data.pages || 1, page: r.data.page || 1, total: r.data.total || 0 });
  }
''' + PAGER_JS + r'''
  renderVals() {
    const s = this.state;
    const me = s.me || {};
    const members = (s.members || []).map((m) => ({
      name: m.display_name, initial: RDB.initial(m.display_name),
      job: m.job_title || '', hasJob: !!m.job_title, company: m.company || '', hasCompany: !!m.company,
      region: m.region || '', hasRegion: !!m.region, bio: m.bio || '', hasBio: !!m.bio,
      badges: RDB.badges(m.badges), since: RDB.fmtMonth(m.joined), posts: RDB.plural(m.post_count || 0, 'message', 'messages'),
    }));
    return Object.assign(RDB.shellVals(this, 'members'), this.pagerVals(s.page, s.pages, (n) => '/communaute/membres?page=' + n), {
      members, noMembers: s.members !== null && members.length === 0, total: RDB.plural(s.total || 0, 'membre inscrit', 'membres inscrits'),
      notListed: !!s.me && me.directory_visible !== true,
    });
  }
}
'''

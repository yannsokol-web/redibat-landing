from snippets import AUTHOR_BADGES

TITLE = 'Mon profil'
DESCRIPTION = 'Votre profil dans la communauté Rédibat : pseudo, fiche annuaire, signalements et sessions.'

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>

  <div class="cm-page-head">
    <div style="display: flex; gap: 16px; align-items: center;">
      <span class="cm-avatar is-lg" aria-hidden="true">{{ initial }}</span>
      <div>
        <p class="cm-eyebrow" style="margin-bottom: 4px;">Mon profil</p>
        <h1 class="cm-h1" style="margin-bottom: 4px;">{{ name }}</h1>
        <div class="cm-row-meta"><span>{{ email }}</span><span>offre {{ role }}</span><span>{{ license }}</span>''' + AUTHOR_BADGES('badges') + r'''</div>
      </div>
    </div>
    <button type="button" class="cm-btn is-ghost is-sm" onClick="{{ onLogout }}">Se déconnecter</button>
  </div>

  <div class="cm-split">
    <section class="cm-card">
      <div class="cm-card-head"><h2 class="cm-h2">Ma fiche</h2><span class="cm-mono">visible des membres si vous le souhaitez</span></div>
      <form class="cm-card-body" onSubmit="{{ onSave }}">
        <sc-if value="{{ hasSaved }}"><div class="cm-alert is-ok" role="status">{{ saved }}</div></sc-if>
        <sc-if value="{{ hasSaveError }}"><div class="cm-alert" role="alert">{{ saveError }}</div></sc-if>
        <label class="cm-field"><span>Pseudo (obligatoire pour publier)</span><input class="cm-input" name="display_name" maxlength="30" value="{{ fName }}" onChange="{{ onField }}" placeholder="Ex. : Alice Métreur"></label>
        <p class="cm-help" style="margin: -8px 0 16px;">3 à 30 caractères : lettres, chiffres, espaces, points, tirets ou apostrophes. C'est le nom affiché sur vos messages.</p>
        <div class="cm-grid cols-2" style="gap: 0 16px;">
          <label class="cm-field"><span>Société</span><input class="cm-input" name="company" maxlength="150" value="{{ fCompany }}" onChange="{{ onField }}"></label>
          <label class="cm-field"><span>Métier</span><input class="cm-input" name="job_title" maxlength="80" value="{{ fJob }}" onChange="{{ onField }}" placeholder="Économiste, métreur, architecte…"></label>
        </div>
        <label class="cm-field"><span>Région</span><input class="cm-input" name="region" maxlength="80" value="{{ fRegion }}" onChange="{{ onField }}" placeholder="Ex. : Bretagne"></label>
        <label class="cm-field"><span>Quelques mots</span><textarea class="cm-textarea" name="bio" maxlength="500" style="min-height: 100px;" value="{{ fBio }}" onChange="{{ onField }}" placeholder="Votre activité, vos spécialités…"></textarea></label>
        <label class="cm-check" style="margin-bottom: 18px;"><input type="checkbox" name="directory_visible" checked="{{ fVisible }}" onChange="{{ onField }}"> Apparaître dans l'annuaire des membres</label>
        <div style="display: flex; justify-content: flex-end;"><button type="submit" class="cm-btn">{{ saveLabel }}</button></div>
      </form>
    </section>

    <div style="display: flex; flex-direction: column; gap: 24px;">
      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Mes signalements</h2><span class="cm-mono">{{ reportCount }}</span></div>
        <sc-if value="{{ noReports }}"><div class="cm-empty">Aucun bug signalé. Depuis l'application ou le forum, vos signalements apparaîtront ici avec leur état, et l'éditeur pourra vous y répondre.</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ reports }}" as="b">
            <li><button type="button" class="cm-row" onClick="{{ b.onOpen }}" style="width: 100%; text-align: left; border: none; background: none; cursor: pointer; font: inherit;">
              <div class="cm-row-main">
                <p class="cm-row-title" style="font-size: 14px;"><sc-if value="{{ b.hasUpdate }}"><span class="cm-tag" style="margin-right: 8px;">Mis à jour</span></sc-if>{{ b.title }}</p>
                <sc-if value="{{ b.hasExcerpt }}"><p class="cm-small cm-muted" style="margin: 0 0 6px; line-height: 1.5;">{{ b.excerpt }}</p></sc-if>
                <div class="cm-row-meta"><span>{{ b.date }}</span><span>{{ b.severity }}</span><span>{{ b.messages }}</span></div>
              </div>
              <span class="{{ b.cls }}">{{ b.state }}</span>
            </button></li>
          </sc-for>
        </ul>
      </section>

      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Mes sessions</h2><button type="button" class="cm-act" onClick="{{ onRevokeOthers }}">Déconnecter les autres appareils</button></div>
        <sc-if value="{{ hasSessionNote }}"><div class="cm-alert is-ok" style="margin: 14px 22px 0;">{{ sessionNote }}</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ sessions }}" as="x">
            <li class="cm-row">
              <div class="cm-row-main">
                <p class="cm-row-title" style="font-size: 14px;">{{ x.agent }}<sc-if value="{{ x.current }}"> <span class="cm-tag is-teal">cet appareil</span></sc-if></p>
                <div class="cm-row-meta"><span>ouverte {{ x.opened }}</span><span>active {{ x.seen }}</span><span>{{ x.ip }}</span></div>
              </div>
            </li>
          </sc-for>
        </ul>
        <p class="cm-help" style="padding: 12px 22px 18px; margin: 0;">Une session expire après 30 jours sans activité. La déconnexion est immédiate sur tous les appareils concernés.</p>
      </section>
    </div>
  </div>

  <!-- Fil d'un signalement : description, état, échanges avec l'éditeur, réponse -->
  <sc-if value="{{ reportOpen }}">
    <div class="cm-overlay" onClick="{{ onCloseReport }}">
      <div class="cm-modal is-wide" role="dialog" aria-modal="true" onClick="{{ stop }}">
        <div class="cm-modal-head">
          <div>
            <p class="cm-eyebrow" style="margin-bottom: 6px;">Signalement</p>
            <h2>{{ report.title }}</h2>
            <div class="cm-row-meta" style="margin-top: 8px;"><span class="{{ report.cls }}">{{ report.state }}</span><span>{{ report.severity }}</span><span>signalé le {{ report.date }}</span></div>
          </div>
          <button type="button" class="cm-close" aria-label="Fermer" onClick="{{ onCloseReport }}">✕</button>
        </div>
        <div style="margin: 18px 0 8px;" class="cm-mono">Votre description</div>
        <sc-if value="{{ report.hasDescription }}"><div class="cm-post-text" style="padding: 12px 14px; border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-bg-3);">{{ report.description }}</div></sc-if>
        <sc-if value="{{ report.noDescription }}"><div class="cm-small cm-faint" style="padding: 12px 14px; border: 1px dashed var(--a-border); border-radius: 12px;">Aucune description n'accompagnait ce signalement.</div></sc-if>
        <div style="margin: 20px 0 8px;" class="cm-mono">Échanges avec l'éditeur</div>
        <sc-if value="{{ threadLoading }}"><div class="cm-small cm-faint">Chargement…</div></sc-if>
        <sc-if value="{{ threadEmpty }}"><div class="cm-small cm-faint" style="padding: 12px 14px; border: 1px dashed var(--a-border); border-radius: 12px;">Pas encore de réponse. Vous serez prévenu par e-mail quand l'éditeur vous répondra.</div></sc-if>
        <sc-for list="{{ thread }}" as="m">
          <div style="margin: 8px 0; padding: 12px 14px; border-radius: 12px; background: {{ m.bg }}; border: 1px solid {{ m.border }};">
            <div class="cm-row-meta" style="margin-bottom: 6px;"><sc-if value="{{ m.isFounder }}"><span class="cm-founder-note">Réponse de l'éditeur</span></sc-if><span>{{ m.who }}</span><span>{{ m.when }}</span></div>
            <div class="cm-post-text" style="font-size: 14.5px;">{{ m.body }}</div>
          </div>
        </sc-for>
        <form onSubmit="{{ onReply }}" style="margin-top: 16px;">
          <textarea class="cm-textarea" name="body" maxlength="4000" style="min-height: 90px;" placeholder="Compléter votre signalement ou répondre à l'éditeur…"></textarea>
          <sc-if value="{{ hasReplyError }}"><div class="cm-alert" role="alert" style="margin-top: 10px;">{{ replyError }}</div></sc-if>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;"><button type="submit" class="cm-btn is-sm">{{ replyLabel }}</button></div>
        </form>
      </div>
    </div>
  </sc-if>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    form: null, saving: false, saved: '', saveError: '', reports: null, sessions: null, sessionNote: '',
    report: null, thread: [], threadLoading: false, replyBusy: false, replyError: '' };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    RDB.bootPage(this, { noNamePrompt: true });
  }

  formFrom(me) {
    return { display_name: me.display_name || '', company: me.company || '', job_title: me.job_title || '', region: me.region || '', bio: me.bio || '', directory_visible: me.directory_visible === true };
  }

  async load(me) {
    this.setState({ form: this.formFrom(me) });
    const [r, x] = await Promise.all([RDB.api('/v1/me/bug-reports'), RDB.api('/v1/me/sessions')]);
    this.setState({ reports: r.status === 200 ? (r.data.reports || []) : [], sessions: x.status === 200 ? (x.data.sessions || []) : [] });
    // Lien profond (e-mail « une réponse à votre signalement ») : ouvre directement le fil.
    const wanted = Number(RDB.params().get('signalement'));
    if (Number.isInteger(wanted) && wanted > 0) this.openReport(wanted);
  }

  // Fil d'un signalement : description, état, échanges. La consultation éteint la pastille.
  openReport = async (id) => {
    this.setState({ report: (this.state.reports || []).find((b) => b.id === id) || { id, title: '', state: 'new', severity: 'medium', created_at: '', description: '' }, thread: [], threadLoading: true, replyError: '' });
    const r = await RDB.api('/v1/me/bug-reports/' + id);
    if (r.status !== 200) { this.setState({ report: null, threadLoading: false, saveError: RDB.errorMessage(r.status, r.data, 'Signalement introuvable.') }); return; }
    this.setState((s) => ({
      report: r.data.report, thread: r.data.messages || [], threadLoading: false,
      reports: (s.reports || []).map((b) => b.id === id ? r.data.report : b),
    }));
  };
  onCloseReport = () => this.setState({ report: null, thread: [], replyError: '' });
  stop = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
  onReply = async (e) => {
    e.preventDefault();
    if (this.state.replyBusy || !this.state.report) return;
    const form = e.currentTarget || e.target;
    const body = (form.body && form.body.value || '').trim();
    if (!body) { this.setState({ replyError: 'Écrivez un message.' }); return; }
    this.setState({ replyBusy: true, replyError: '' });
    const r = await RDB.api('/v1/me/bug-reports/' + this.state.report.id + '/messages', { method: 'POST', body: { body } });
    if (r.status === 201) {
      form.body.value = '';
      this.setState({ replyBusy: false });
      await this.openReport(this.state.report.id);
      return;
    }
    this.setState({ replyBusy: false, replyError: RDB.errorMessage(r.status, r.data, 'Envoi impossible. Réessayez.') });
  };

  // Champs contrôlés : la valeur vit dans l'état (le runtime peut re-rendre le formulaire à
  // tout moment, un champ non contrôlé perdrait sa valeur initiale).
  onField = (e) => {
    const t = e.target;
    const value = t.type === 'checkbox' ? t.checked : t.value;
    this.setState((s) => ({ form: Object.assign({}, s.form, { [t.name]: value }) }));
  };

  onSave = async (e) => {
    e.preventDefault();
    if (this.state.saving || !this.state.form) return;
    const f = this.state.form;
    const body = { company: f.company, job_title: f.job_title, region: f.region, bio: f.bio, directory_visible: !!f.directory_visible };
    if ((f.display_name || '').trim()) body.display_name = f.display_name.trim();
    this.setState({ saving: true, saved: '', saveError: '' });
    const r = await RDB.api('/v1/me/profile', { method: 'POST', body });
    if (r.status === 200 && r.data && r.data.me) {
      RDB._me = r.data.me;
      this.setState({ saving: false, saved: 'Profil enregistré.', me: r.data.me, form: this.formFrom(r.data.me) });
      return;
    }
    const msg = r.status === 400 && r.data && r.data.field === 'display_name'
      ? 'Pseudo invalide : 3 à 30 caractères, lettres, chiffres, espaces, points, tirets ou apostrophes, hors noms réservés.'
      : RDB.errorMessage(r.status, r.data, 'Enregistrement impossible. Réessayez.');
    this.setState({ saving: false, saveError: msg });
  };

  onRevokeOthers = async () => {
    const r = await RDB.api('/v1/me/sessions/revoke-others', { method: 'POST', body: {} });
    if (r.status === 200) {
      const n = r.data && r.data.revoked || 0;
      this.setState({ sessionNote: n ? RDB.plural(n, 'autre session déconnectée.', 'autres sessions déconnectées.') : 'Aucune autre session ouverte.' });
      const x = await RDB.api('/v1/me/sessions');
      if (x.status === 200) this.setState({ sessions: x.data.sessions || [] });
      return;
    }
    this.setState({ sessionNote: RDB.errorMessage(r.status, r.data, 'Action impossible.') });
  };

  onLogout = () => RDB.logout();

  agentLabel(ua) {
    const s = String(ua || '');
    const os = /Windows/.test(s) ? 'Windows' : /Macintosh|Mac OS/.test(s) ? 'Mac' : /iPhone|iPad/.test(s) ? 'iOS' : /Android/.test(s) ? 'Android' : /Linux/.test(s) ? 'Linux' : 'Appareil';
    const nav = /Edg\//.test(s) ? 'Edge' : /OPR\//.test(s) ? 'Opera' : /Firefox\//.test(s) ? 'Firefox' : /Chrome\//.test(s) ? 'Chrome' : /Safari\//.test(s) ? 'Safari' : 'navigateur';
    return nav + ' sur ' + os;
  }

  renderVals() {
    const s = this.state;
    const me = s.me || {};
    const f = s.form || this.formFrom(me);
    const STATES = { new: ['Reçu', 'cm-tag'], pending: ['En cours', 'cm-tag is-amber'], done: ['Traité', 'cm-tag is-teal'] };
    const SEV = { high: 'bloquant', medium: 'gênant', low: 'mineur' };
    const reportView = (b) => {
      const st = STATES[b.state] || STATES.new;
      const n = Number(b.message_count) || 0;
      return {
        id: b.id, title: b.title, date: RDB.fmtDate(b.created_at), severity: SEV[b.severity] || 'gênant', state: st[0], cls: st[1],
        description: b.description || '', hasDescription: !!b.description, noDescription: !b.description,
        excerpt: RDB.plainText(b.description || '', 140), hasExcerpt: !!b.description,
        messages: n ? RDB.plural(n, 'message', 'messages') : 'pas de réponse', hasUpdate: b.has_update === true,
        onOpen: () => this.openReport(b.id),
      };
    };
    const reports = (s.reports || []).map(reportView);
    const report = s.report ? reportView(s.report) : reportView({ id: 0, title: '', state: 'new', severity: 'medium' });
    const thread = (s.thread || []).map((m) => ({
      isFounder: m.is_founder === true, who: m.is_founder ? 'Rédibat' : 'Vous', when: RDB.fmtDateTime(m.created_at), body: m.body,
      bg: m.is_founder ? 'rgba(47,99,212,0.06)' : '#ffffff', border: m.is_founder ? 'rgba(47,99,212,0.22)' : 'var(--a-border)',
    }));
    const sessions = (s.sessions || []).map((x) => ({
      agent: this.agentLabel(x.user_agent), current: x.current === true, opened: RDB.fmtRelative(x.created_at), seen: RDB.fmtRelative(x.last_seen), ip: x.ip || '',
    }));
    return Object.assign(RDB.shellVals(this, 'profile'), {
      initial: RDB.initial(me.display_name || me.email), name: me.display_name || 'Sans pseudo', email: me.email || '',
      role: String(me.role || '').toUpperCase(), license: me.license_active === true ? 'licence active' : 'licence inactive', badges: RDB.badges(me.badges),
      fName: f.display_name, fCompany: f.company, fJob: f.job_title, fRegion: f.region, fBio: f.bio, fVisible: !!f.directory_visible,
      hasSaved: !!s.saved, saved: s.saved, hasSaveError: !!s.saveError, saveError: s.saveError, saveLabel: s.saving ? 'Enregistrement…' : 'Enregistrer',
      reports, noReports: s.reports !== null && reports.length === 0, reportCount: RDB.plural(reports.length, 'signalement', 'signalements'),
      reportOpen: !!s.report, report, thread, threadLoading: s.threadLoading, threadEmpty: !!s.report && !s.threadLoading && thread.length === 0,
      hasReplyError: !!s.replyError, replyError: s.replyError, replyLabel: s.replyBusy ? 'Envoi…' : 'Envoyer',
      onCloseReport: this.onCloseReport, onReply: this.onReply, stop: this.stop,
      sessions, hasSessionNote: !!s.sessionNote, sessionNote: s.sessionNote,
      onField: this.onField, onSave: this.onSave, onRevokeOthers: this.onRevokeOthers, onLogout: this.onLogout,
    });
  }
}
'''

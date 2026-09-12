from snippets import AUTHOR_BADGES

TITLE = 'Mon profil'
EXTRA_HEAD = '\n<!-- QR code d\'inscription 2FA (otpauth://) : qrcode-generator, MIT, servi en self. -->\n<script src="/vendor/qrcode-generator.js"></script>'
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
        <div class="cm-card-head"><h2 class="cm-h2">Double authentification</h2><span class="{{ tfCls }}">{{ tfStatus }}</span></div>
        <div class="cm-card-body">
          <sc-if value="{{ hasTfBanner }}"><div class="{{ tfBannerCls }}" role="status">{{ tfBanner }}</div></sc-if>
          <sc-if value="{{ tfOff }}">
            <p style="margin: 0 0 14px; font-size: 14.5px; line-height: 1.6;">Protégez votre compte : à chaque connexion au site, un code à 6 chiffres généré par une application d'authentification (Google Authenticator, Microsoft Authenticator, Authy, 1Password…) sera demandé en plus de votre mot de passe.</p>
            <button type="button" class="cm-btn is-sm" onClick="{{ onTfStart }}">Activer la double authentification</button>
          </sc-if>
          <sc-if value="{{ tfOn }}">
            <p style="margin: 0 0 6px; font-size: 14.5px; line-height: 1.6;">Activée depuis le {{ tfSince }}. Un code de votre application est demandé à chaque connexion au site.</p>
            <p class="{{ tfLeftCls }}" style="margin: 0 0 14px; font-size: 13.5px;">{{ tfLeft }}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="cm-act" onClick="{{ onTfRecovery }}">Nouveaux codes de secours</button>
              <button type="button" class="cm-act is-danger" onClick="{{ onTfDisable }}">Désactiver</button>
            </div>
          </sc-if>
        </div>
      </section>

      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Mes sessions</h2><button type="button" class="cm-act" onClick="{{ onRevokeOthers }}">Déconnecter les autres appareils</button></div>
        <sc-if value="{{ hasSessionNote }}"><div class="cm-alert is-ok" style="margin: 14px 22px 0;">{{ sessionNote }}</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ sessions }}" as="x">
            <li class="cm-row">
              <div class="cm-row-main">
                <p class="cm-row-title" style="font-size: 14px;">{{ x.agent }}<sc-if value="{{ x.current }}"> <span class="cm-tag is-teal">cet appareil</span></sc-if><sc-if value="{{ x.temporary }}"> <span class="cm-tag">fermée avec le navigateur</span></sc-if></p>
                <div class="cm-row-meta"><span>ouverte {{ x.opened }}</span><span>active {{ x.seen }}</span><span>{{ x.ip }}</span></div>
              </div>
            </li>
          </sc-for>
        </ul>
        <p class="cm-help" style="padding: 12px 22px 18px; margin: 0;">Une session expire après 30 jours sans activité, ou à la fermeture du navigateur si « Se souvenir de moi » n'était pas coché à la connexion. La déconnexion est immédiate sur tous les appareils concernés.</p>
      </section>
    </div>
  </div>

  <!-- Double authentification : activation (mot de passe, QR code, premier code, codes de
       secours), désactivation, nouveaux codes de secours -->
  <sc-if value="{{ tfOpen }}">
    <div class="cm-overlay" onClick="{{ onTfClose }}">
      <div class="cm-modal" role="dialog" aria-modal="true" onClick="{{ stop }}">
        <div class="cm-modal-head"><h2>{{ tfTitle }}</h2><button type="button" class="cm-close" aria-label="Fermer" onClick="{{ onTfClose }}">✕</button></div>

        <sc-if value="{{ tfStepPwd }}">
          <form onSubmit="{{ onTfPwd }}">
            <p class="cm-lede" style="margin-bottom: 16px;">{{ tfIntro }}</p>
            <label class="cm-field"><span>Votre mot de passe</span><input class="cm-input" type="password" name="password" autocomplete="current-password" autofocus="{{ true }}"></label>
            <sc-if value="{{ tfNeedsCode }}"><label class="cm-field"><span>Code de votre application (ou code de secours)</span><input class="cm-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="16" placeholder="123456 ou ABCDE-FGHJK"></label></sc-if>
            <sc-if value="{{ hasTfError }}"><div class="cm-alert" role="alert">{{ tfError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onTfClose }}">Annuler</button><button type="submit" class="{{ tfSubmitCls }}">{{ tfLabel }}</button></div>
          </form>
        </sc-if>

        <sc-if value="{{ tfStepScan }}">
          <form onSubmit="{{ onTfEnable }}">
            <p class="cm-lede" style="margin-bottom: 14px;">1. Ouvrez votre application d'authentification et scannez ce code (ou saisissez la clé à la main).</p>
            <div style="display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 16px;">
              <img src="{{ tfQr }}" alt="QR code d'inscription" width="196" height="196" loading="lazy" style="border: 1px solid var(--a-border); border-radius: 12px; background: #fff; flex: none;">
              <div style="flex: 1; min-width: 200px;">
                <div class="cm-mono" style="margin-bottom: 6px;">Clé à saisir à la main</div>
                <code style="display: block; font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.08em; line-height: 1.6; color: #16314f; background: var(--a-bg-3); border: 1px solid var(--a-border); border-radius: 10px; padding: 10px 12px; overflow-wrap: anywhere;">{{ tfSecret }}</code>
                <p class="cm-help">Compte : {{ tfAccount }} · Émetteur : Rédibat · 6 chiffres, toutes les 30 secondes.</p>
              </div>
            </div>
            <p class="cm-lede" style="margin-bottom: 10px;">2. Saisissez le code affiché par l'application pour confirmer.</p>
            <label class="cm-field"><span>Code à 6 chiffres</span><input class="cm-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" style="font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.18em; font-size: 20px; text-align: center;"></label>
            <sc-if value="{{ hasTfError }}"><div class="cm-alert" role="alert">{{ tfError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onTfClose }}">Annuler</button><button type="submit" class="cm-btn">{{ tfLabel }}</button></div>
          </form>
        </sc-if>

        <sc-if value="{{ tfStepCodes }}">
          <div class="cm-alert is-ok" role="status">{{ tfDoneMessage }}</div>
          <p class="cm-lede" style="margin-bottom: 12px;">Notez ces codes de secours et rangez-les en lieu sûr (gestionnaire de mots de passe, papier). Chacun ne sert qu'une fois ; ils remplacent l'application si vous perdez votre téléphone. Ils ne seront plus affichés.</p>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 18px; font-family: 'IBM Plex Mono', monospace; font-size: 15px; letter-spacing: 0.06em; color: #16314f; background: var(--a-bg-3); border: 1px solid var(--a-border); border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;">
            <sc-for list="{{ tfCodes }}" as="c"><span>{{ c }}</span></sc-for>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn" onClick="{{ onTfClose }}">J'ai noté mes codes</button></div>
        </sc-if>
      </div>
    </div>
  </sc-if>

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
    report: null, thread: [], threadLoading: false, replyBusy: false, replyError: '',
    // Double authentification : tf = { mode: 'setup'|'disable'|'recovery', step: 'password'|'scan'|'codes' }
    tf: null, tfBusy: false, tfError: '', tfSecret: '', tfQr: '', tfCodes: [], tfBanner: '', tfBannerCls: 'cm-alert is-ok' };

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
    // Connexion faite avec un code de secours : on le rappelle, il en reste moins.
    const secours = RDB.params().get('secours');
    if (secours !== null) {
      const left = Number(secours);
      this.setState({ tfBanner: 'Vous vous êtes connecté avec un code de secours.' + (Number.isInteger(left) ? ' Il vous en reste ' + left + '.' : '') + (Number.isInteger(left) && left <= 2 ? ' Générez-en de nouveaux dès maintenant.' : ''), tfBannerCls: 'cm-alert is-info' });
    }
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

  // --- Double authentification ---------------------------------------------------------
  onTfStart = () => this.setState({ tf: { mode: 'setup', step: 'password' }, tfError: '', tfSecret: '', tfQr: '', tfCodes: [] });
  onTfDisable = () => this.setState({ tf: { mode: 'disable', step: 'password' }, tfError: '' });
  onTfRecovery = () => this.setState({ tf: { mode: 'recovery', step: 'password' }, tfError: '' });
  onTfClose = () => this.setState({ tf: null, tfError: '', tfSecret: '', tfQr: '', tfCodes: [] });

  tfFail(r, fallback) {
    const code = r.data && r.data.error;
    const msg = r.status === 403 && code === 'invalid_password' ? 'Mot de passe incorrect.'
      : r.status === 403 && code === 'invalid_code' ? 'Code incorrect. Vérifiez l\'heure de votre téléphone et réessayez avec le code suivant.'
        : r.status === 409 && code === 'already_enabled' ? 'La double authentification est déjà active.'
          : RDB.errorMessage(r.status, r.data, fallback);
    this.setState({ tfBusy: false, tfError: msg });
  }

  // Image du QR code (GIF en data URL) à partir de l'URL otpauth, via la bibliothèque vendorisée.
  qrFor(url) {
    try {
      if (typeof qrcode !== 'function') return '';
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
      return qr.createDataURL(5, 4);
    } catch (_) { return ''; }
  }

  // Étape mot de passe : selon le mode, démarre l'inscription, désactive, ou régénère les codes.
  onTfPwd = async (e) => {
    e.preventDefault();
    if (this.state.tfBusy || !this.state.tf) return;
    const form = e.currentTarget || e.target;
    const pwd = (form.password && form.password.value) || '';
    const code = (form.code && form.code.value || '').trim();
    if (!pwd) { this.setState({ tfError: 'Saisissez votre mot de passe.' }); return; }
    const mode = this.state.tf.mode;
    if (mode !== 'setup' && !code) { this.setState({ tfError: 'Saisissez un code de votre application ou un code de secours.' }); return; }
    this.setState({ tfBusy: true, tfError: '' });
    if (mode === 'setup') {
      const r = await RDB.api('/v1/me/totp/setup', { method: 'POST', body: { password: pwd } });
      if (r.status !== 200) { this.tfFail(r, 'Activation impossible pour le moment.'); return; }
      this.setState({ tfBusy: false, tf: { mode: 'setup', step: 'scan' }, tfSecret: r.data.secret, tfQr: this.qrFor(r.data.otpauth_url) });
      return;
    }
    if (mode === 'disable') {
      const r = await RDB.api('/v1/me/totp/disable', { method: 'POST', body: { password: pwd, code } });
      if (r.status !== 200) { this.tfFail(r, 'Désactivation impossible pour le moment.'); return; }
      await this.refreshMe();
      this.setState({ tfBusy: false, tf: null, tfBanner: 'Double authentification désactivée.', tfBannerCls: 'cm-alert is-info' });
      return;
    }
    const r = await RDB.api('/v1/me/totp/recovery', { method: 'POST', body: { password: pwd, code } });
    if (r.status !== 200) { this.tfFail(r, 'Impossible de générer de nouveaux codes.'); return; }
    await this.refreshMe();
    this.setState({ tfBusy: false, tf: { mode: 'recovery', step: 'codes' }, tfCodes: r.data.recovery_codes || [] });
  };

  // Étape confirmation : le premier code juste active la 2FA et livre les codes de secours.
  onTfEnable = async (e) => {
    e.preventDefault();
    if (this.state.tfBusy) return;
    const form = e.currentTarget || e.target;
    const code = (form.code && form.code.value || '').trim();
    if (!/^\d{6}$/.test(code)) { this.setState({ tfError: 'Le code fait 6 chiffres.' }); return; }
    this.setState({ tfBusy: true, tfError: '' });
    const r = await RDB.api('/v1/me/totp/enable', { method: 'POST', body: { code } });
    if (r.status !== 200) { this.tfFail(r, 'Activation impossible pour le moment.'); return; }
    await this.refreshMe();
    this.setState({ tfBusy: false, tf: { mode: 'setup', step: 'codes' }, tfCodes: r.data.recovery_codes || [], tfSecret: '', tfQr: '', tfBanner: 'Double authentification activée.' + (r.data.revoked_sessions ? ' Vos autres sessions ont été fermées.' : ''), tfBannerCls: 'cm-alert is-ok' });
  };

  async refreshMe() {
    const r = await RDB.api('/v1/me');
    if (r.status === 200 && r.data) { RDB._me = r.data; this.setState({ me: r.data }); }
  }

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
      agent: this.agentLabel(x.user_agent), current: x.current === true, temporary: x.persistent === false, opened: RDB.fmtRelative(x.created_at), seen: RDB.fmtRelative(x.last_seen), ip: x.ip || '',
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
      // Double authentification
      tfOn: me.totp_enabled === true, tfOff: !!s.me && me.totp_enabled !== true,
      tfStatus: me.totp_enabled === true ? 'Activée' : 'Désactivée', tfCls: me.totp_enabled === true ? 'cm-tag is-teal' : 'cm-tag is-muted',
      tfSince: RDB.fmtDate(me.totp_since), tfLeft: RDB.plural(Number(me.totp_recovery_left) || 0, 'code de secours restant', 'codes de secours restants'),
      tfLeftCls: (Number(me.totp_recovery_left) || 0) <= 2 ? 'cm-alert' : 'cm-muted',
      hasTfBanner: !!s.tfBanner, tfBanner: s.tfBanner, tfBannerCls: s.tfBannerCls,
      tfOpen: !!s.tf,
      tfStepPwd: !!s.tf && s.tf.step === 'password', tfStepScan: !!s.tf && s.tf.step === 'scan', tfStepCodes: !!s.tf && s.tf.step === 'codes',
      tfNeedsCode: !!s.tf && s.tf.mode !== 'setup',
      tfTitle: !s.tf ? '' : s.tf.mode === 'setup' ? 'Activer la double authentification' : s.tf.mode === 'disable' ? 'Désactiver la double authentification' : 'Nouveaux codes de secours',
      tfIntro: !s.tf ? '' : s.tf.mode === 'setup' ? 'Confirmez votre mot de passe pour commencer. Vous aurez ensuite besoin d\'une application d\'authentification sur votre téléphone.'
        : s.tf.mode === 'disable' ? 'Votre compte ne sera plus protégé que par son mot de passe. Confirmez avec votre mot de passe et un code.'
          : 'Les anciens codes de secours cesseront de fonctionner. Confirmez avec votre mot de passe et un code.',
      tfSubmitCls: s.tf && s.tf.mode === 'disable' ? 'cm-btn is-ghost' : 'cm-btn',
      tfLabel: s.tfBusy ? 'Vérification…' : (!s.tf ? '' : s.tf.mode === 'setup' ? (s.tf.step === 'scan' ? 'Activer' : 'Continuer') : s.tf.mode === 'disable' ? 'Désactiver' : 'Générer'),
      tfSecret: (s.tfSecret || '').replace(/(.{4})/g, '$1 ').trim(), tfQr: s.tfQr, tfAccount: me.email || '', tfCodes: s.tfCodes || [],
      tfDoneMessage: s.tf && s.tf.mode === 'recovery' ? 'Voici vos nouveaux codes de secours.' : 'La double authentification est active. Voici vos codes de secours.',
      hasTfError: !!s.tfError, tfError: s.tfError,
      onTfStart: this.onTfStart, onTfDisable: this.onTfDisable, onTfRecovery: this.onTfRecovery, onTfClose: this.onTfClose, onTfPwd: this.onTfPwd, onTfEnable: this.onTfEnable,
    });
  }
}
'''

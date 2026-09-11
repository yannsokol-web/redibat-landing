TITLE = 'Téléchargements'
DESCRIPTION = 'Téléchargez l\'application Rédibat et les documents proposés par l\'éditeur, réservés aux membres.'

MAIN = r'''
<main class="cm-main is-narrow">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>
  <sc-if value="{{ hasNotice }}"><div class="cm-alert" role="alert">{{ notice }}</div></sc-if>

  <div class="cm-page-head">
    <div>
      <p class="cm-eyebrow">Téléchargements</p>
      <h1 class="cm-h1">L'application et les documents</h1>
      <p class="cm-lede">Ce qui est proposé ici au téléchargement l'est volontairement. Le reste de l'espace (vidéos, guides, forum) se consulte en ligne.</p>
    </div>
  </div>

  <section class="cm-card" style="margin-bottom: 24px;">
    <div class="cm-card-head"><h2 class="cm-h2">Application Rédibat</h2><sc-if value="{{ hasVersion }}"><span class="cm-tag">version {{ version }}</span></sc-if></div>
    <div class="cm-card-body">
      <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6;">Programme d'installation pour Windows 10 et 11 (64 bits). La même adresse e-mail et le même mot de passe servent pour l'application et pour cet espace.</p>
      <sc-if value="{{ hasNotes }}"><div class="cm-alert is-info" style="white-space: pre-wrap;">{{ notes }}</div></sc-if>
      <sc-if value="{{ canDownload }}">
        <button type="button" class="cm-btn" onClick="{{ onDownloadApp }}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Télécharger Rédibat (.exe)
        </button>
        <sc-if value="{{ hasSha }}"><p class="cm-help" style="margin-top: 12px;">Empreinte SHA-256 du fichier : <code style="font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; overflow-wrap: anywhere;">{{ sha }}</code></p></sc-if>
      </sc-if>
      <sc-if value="{{ licenseInactive }}">
        <div class="cm-alert is-info" style="margin: 0;">Votre licence n'est pas active : le téléchargement de l'application est réservé aux licences en cours. Vous gardez l'accès à la communauté. Pour réactiver votre licence, écrivez-nous depuis <a href="/#contact" style="color: inherit;">redibat.fr/#contact</a>.</div>
      </sc-if>
    </div>
  </section>

  <section class="cm-card">
    <div class="cm-card-head"><h2 class="cm-h2">Documents et modèles</h2><span class="cm-mono">{{ fileCount }}</span></div>
    <sc-if value="{{ noFiles }}"><div class="cm-empty">Aucun document proposé pour l'instant.</div></sc-if>
    <ul class="cm-list">
      <sc-for list="{{ files }}" as="f">
        <li class="cm-row">
          <span class="cm-tag is-muted" style="flex: none;">{{ f.kind }}</span>
          <div class="cm-row-main">
            <p class="cm-row-title">{{ f.title }}</p>
            <sc-if value="{{ f.hasDescription }}"><p class="cm-small cm-muted" style="margin: 0 0 6px;">{{ f.description }}</p></sc-if>
            <div class="cm-row-meta"><span>{{ f.size }}</span><span>{{ f.date }}</span><span>{{ f.downloads }}</span></div>
          </div>
          <button type="button" class="cm-act is-primary" onClick="{{ f.onDownload }}">Télécharger</button>
        </li>
      </sc-for>
    </ul>
  </section>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    version: null, files: null, notice: '' };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    // Motif renvoyé par l'API quand un téléchargement par navigation directe a échoué.
    const err = RDB.params().get('erreur') || '';
    const messages = {
      license_inactive: 'Votre licence n\'est pas active : le téléchargement de l\'application est refusé.',
      download_unavailable: 'Téléchargement momentanément indisponible. Réessayez plus tard.',
      not_found: 'Ce fichier n\'existe pas ou n\'est plus proposé.',
      forbidden: 'Téléchargement refusé.',
      community_banned: 'Votre accès à la communauté a été suspendu.',
    };
    this.state.notice = messages[err] || '';
    RDB.bootPage(this, {});
  }

  async load() {
    const [v, f] = await Promise.all([RDB.api('/v1/version', { noRedirect: true }), RDB.api('/v1/community/files')]);
    if (RDB.loadFailed(this, f)) return;
    this.setState({ version: v.status === 200 ? v.data : null, files: f.data.files || [] });
  }

  onDownloadApp = () => RDB.goDownload('/v1/download');

  renderVals() {
    const s = this.state;
    const me = s.me || {};
    const v = s.version || {};
    const files = (s.files || []).map((f) => ({
      title: f.title, description: f.description || '', hasDescription: !!f.description, kind: String(f.kind || '').toUpperCase(),
      size: RDB.fmtSize(f.size_bytes), date: RDB.fmtDate(f.created_at), downloads: RDB.plural(f.download_count || 0, 'téléchargement', 'téléchargements'),
      onDownload: () => RDB.goDownload('/v1/community/files/' + f.id + '/download'),
    }));
    return Object.assign(RDB.shellVals(this, 'downloads'), {
      hasNotice: !!s.notice, notice: s.notice,
      hasVersion: !!v.latest && v.latest !== '0.0.0', version: v.latest || '',
      hasNotes: !!v.notes, notes: v.notes || '',
      hasSha: !!v.sha256, sha: v.sha256 || '',
      canDownload: me.license_active === true, licenseInactive: !!s.me && me.license_active !== true,
      files, noFiles: s.files !== null && files.length === 0, fileCount: RDB.plural(files.length, 'document', 'documents'),
      onDownloadApp: this.onDownloadApp,
    });
  }
}
'''

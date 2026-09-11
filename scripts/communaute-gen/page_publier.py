from snippets import PROSE

TITLE = 'Publier'
DESCRIPTION = 'Espace fondateur : publication des vidéos, documents, guides et nouveautés de la communauté Rédibat.'

FORM_HELP = ("Mise en forme légère : <code>## Titre</code>, <code>### Sous-titre</code>, listes <code>- </code> ou <code>1. </code>, "
             "<code>**gras**</code>, <code>`code`</code>, blocs <code>```</code>, lien <code>[texte](https://…)</code>, "
             "image téléversée <code>![légende](file:ID)</code>, vidéo de l'espace <code>[video:ID]</code>. Aucun HTML.")

MAIN = r'''
<main class="cm-main">
  <sc-if value="{{ hasLoadError }}"><div class="cm-alert" role="alert">{{ loadError }}</div></sc-if>
  <sc-if value="{{ hasBanner }}"><div class="cm-alert is-ok" role="status">{{ banner }}</div></sc-if>
  <sc-if value="{{ hasActionError }}"><div class="cm-alert" role="alert">{{ actionError }}</div></sc-if>

  <div class="cm-page-head">
    <div>
      <p class="cm-eyebrow">Espace fondateur</p>
      <h1 class="cm-h1">Publier dans la communauté</h1>
      <p class="cm-lede">Vidéos, documents, guides et nouveautés. Rien n'est visible des membres tant que vous ne publiez pas.</p>
    </div>
    <div class="cm-tabs">
      <button type="button" class="{{ tabVideos }}" onClick="{{ onTabVideos }}">Vidéos ({{ nVideos }})</button>
      <button type="button" class="{{ tabFiles }}" onClick="{{ onTabFiles }}">Documents ({{ nFiles }})</button>
      <button type="button" class="{{ tabGuides }}" onClick="{{ onTabGuides }}">Guides ({{ nGuides }})</button>
      <button type="button" class="{{ tabNews }}" onClick="{{ onTabNews }}">Nouveautés ({{ nNews }})</button>
    </div>
  </div>

  <!-- ===== Téléversement en cours (commun vidéos / documents) ===== -->
  <sc-if value="{{ uploading }}">
    <div class="cm-card cm-card-body" style="margin-bottom: 22px;">
      <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px;"><span class="cm-h2">{{ uploadLabel }}</span><span class="cm-mono">{{ uploadPct }} %</span></div>
      <div class="cm-progress"><div style="width: {{ uploadPct }}%;"></div></div>
      <p class="cm-help">Ne fermez pas cette page. En cas de coupure, relancez le téléversement du même fichier : il reprend là où il s'est arrêté.</p>
    </div>
  </sc-if>

  <!-- ===== Vidéos ===== -->
  <sc-if value="{{ viewVideos }}">
    <div class="cm-split">
      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Vidéos</h2><span class="cm-mono">{{ ffmpegNote }}</span></div>
        <sc-if value="{{ noVideos }}"><div class="cm-empty">Aucune vidéo. Ajoutez la première depuis le formulaire.</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ videos }}" as="v">
            <li class="cm-row" style="align-items: flex-start;">
              <div class="cm-row-main">
                <p class="cm-row-title">{{ v.title }} <span class="cm-mono">#{{ v.id }}</span></p>
                <div class="cm-row-meta" style="margin-bottom: 8px;"><span class="{{ v.statusCls }}">{{ v.statusLabel }}</span><span class="{{ v.pubCls }}">{{ v.pubLabel }}</span><span>{{ v.moduleName }}</span><sc-if value="{{ v.hasDuration }}"><span>{{ v.duration }}</span></sc-if><span>{{ v.size }}</span><span>{{ v.views }}</span></div>
                <sc-if value="{{ v.hasError }}"><div class="cm-alert" style="margin: 0 0 8px; font-size: 12.5px;">{{ v.error }}</div></sc-if>
                <sc-if value="{{ v.isUploading }}"><p class="cm-help" style="margin: 0 0 8px;">Téléversement incomplet ({{ v.received }}). Sélectionnez à nouveau le même fichier pour reprendre.</p></sc-if>
                <div class="cm-post-actions" style="margin-top: 0;">
                  <sc-if value="{{ v.canPublish }}"><button type="button" class="cm-act is-ok" onClick="{{ v.onPublish }}">Publier</button></sc-if>
                  <sc-if value="{{ v.canUnpublish }}"><button type="button" class="cm-act" onClick="{{ v.onUnpublish }}">Dépublier</button></sc-if>
                  <sc-if value="{{ v.isReady }}"><a class="cm-act" href="{{ v.href }}">Voir</a></sc-if>
                  <button type="button" class="cm-act" onClick="{{ v.onEdit }}">Modifier</button>
                  <sc-if value="{{ v.canReprocess }}"><button type="button" class="cm-act is-primary" onClick="{{ v.onReprocess }}">Relancer la normalisation</button></sc-if>
                  <sc-if value="{{ v.isUploading }}"><label class="cm-act is-primary" style="cursor: pointer;">Reprendre<input type="file" style="display: none;" accept="{{ videoAccept }}" onChange="{{ v.onResume }}"></label></sc-if>
                  <button type="button" class="cm-act is-danger" onClick="{{ v.onDelete }}">Supprimer</button>
                </div>
              </div>
            </li>
          </sc-for>
        </ul>
      </section>
      <aside>
        <sc-if value="{{ editingVideo }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onSaveVideo }}">
            <h2 class="cm-h2" style="margin-bottom: 14px;">Modifier la vidéo #{{ edit.id }}</h2>
            <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" value="{{ edit.title }}" onChange="{{ onEditField }}"></label>
            <label class="cm-field"><span>Description</span><textarea class="cm-textarea" name="description" maxlength="2000" style="min-height: 90px;" value="{{ edit.description }}" onChange="{{ onEditField }}"></textarea></label>
            <label class="cm-field"><span>Module</span><select class="cm-select" name="module" value="{{ edit.module }}" onChange="{{ onEditField }}"><option value="">Aucun</option><sc-for list="{{ moduleOptions }}" as="m"><option value="{{ m.code }}">{{ m.name }}</option></sc-for></select></label>
            <label class="cm-field"><span>Ordre (plus petit = en premier)</span><input class="cm-input" type="number" name="position" value="{{ edit.position }}" onChange="{{ onEditField }}"></label>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCancelEdit }}">Annuler</button><button type="submit" class="cm-btn">{{ saveLabel }}</button></div>
          </form>
        </sc-if>
        <sc-if value="{{ notEditing }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onNewVideo }}">
            <h2 class="cm-h2" style="margin-bottom: 4px;">Nouvelle vidéo</h2>
            <p class="cm-help" style="margin: 0 0 14px;">{{ videoHelp }}</p>
            <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" placeholder="Ex. : Calibrer un plan PDF"></label>
            <label class="cm-field"><span>Description</span><textarea class="cm-textarea" name="description" maxlength="2000" style="min-height: 80px;" placeholder="Ce que la vidéo montre, en deux phrases."></textarea></label>
            <label class="cm-field"><span>Module</span><select class="cm-select" name="module"><option value="">Aucun</option><sc-for list="{{ moduleOptions }}" as="m"><option value="{{ m.code }}">{{ m.name }}</option></sc-for></select></label>
            <label class="cm-field"><span>Fichier vidéo</span><input class="cm-input" type="file" name="file" accept="{{ videoAccept }}"></label>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; justify-content: flex-end;"><button type="submit" class="cm-btn" disabled="{{ uploading }}">Téléverser</button></div>
          </form>
        </sc-if>
      </aside>
    </div>
  </sc-if>

  <!-- ===== Documents ===== -->
  <sc-if value="{{ viewFiles }}">
    <div class="cm-split">
      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Documents et images</h2><span class="cm-mono">{{ fileAcceptNote }}</span></div>
        <sc-if value="{{ noFiles }}"><div class="cm-empty">Aucun document.</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ files }}" as="f">
            <li class="cm-row" style="align-items: flex-start;">
              <div class="cm-row-main">
                <p class="cm-row-title">{{ f.title }} <span class="cm-mono">#{{ f.id }} · {{ f.name }}</span></p>
                <div class="cm-row-meta" style="margin-bottom: 8px;"><span class="{{ f.statusCls }}">{{ f.statusLabel }}</span><span class="{{ f.pubCls }}">{{ f.pubLabel }}</span><span>{{ f.kind }}</span><span>{{ f.size }}</span><span>{{ f.downloads }}</span></div>
                <sc-if value="{{ f.isImage }}"><p class="cm-help" style="margin: 0 0 8px;">Dans un guide : <code>![légende](file:{{ f.id }})</code></p></sc-if>
                <sc-if value="{{ f.isUploading }}"><p class="cm-help" style="margin: 0 0 8px;">Téléversement incomplet ({{ f.received }}). Sélectionnez à nouveau le même fichier pour reprendre.</p></sc-if>
                <div class="cm-post-actions" style="margin-top: 0;">
                  <sc-if value="{{ f.canPublish }}"><button type="button" class="cm-act is-ok" onClick="{{ f.onPublish }}">Publier</button></sc-if>
                  <sc-if value="{{ f.canUnpublish }}"><button type="button" class="cm-act" onClick="{{ f.onUnpublish }}">Dépublier</button></sc-if>
                  <button type="button" class="cm-act" onClick="{{ f.onEdit }}">Modifier</button>
                  <sc-if value="{{ f.isUploading }}"><label class="cm-act is-primary" style="cursor: pointer;">Reprendre<input type="file" style="display: none;" accept="{{ fileAccept }}" onChange="{{ f.onResume }}"></label></sc-if>
                  <button type="button" class="cm-act is-danger" onClick="{{ f.onDelete }}">Supprimer</button>
                </div>
              </div>
            </li>
          </sc-for>
        </ul>
      </section>
      <aside>
        <sc-if value="{{ editingFile }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onSaveFile }}">
            <h2 class="cm-h2" style="margin-bottom: 14px;">Modifier le document #{{ edit.id }}</h2>
            <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" value="{{ edit.title }}" onChange="{{ onEditField }}"></label>
            <label class="cm-field"><span>Description</span><textarea class="cm-textarea" name="description" maxlength="2000" style="min-height: 80px;" value="{{ edit.description }}" onChange="{{ onEditField }}"></textarea></label>
            <label class="cm-field"><span>Ordre</span><input class="cm-input" type="number" name="position" value="{{ edit.position }}" onChange="{{ onEditField }}"></label>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCancelEdit }}">Annuler</button><button type="submit" class="cm-btn">{{ saveLabel }}</button></div>
          </form>
        </sc-if>
        <sc-if value="{{ notEditing }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onNewFile }}">
            <h2 class="cm-h2" style="margin-bottom: 4px;">Nouveau document</h2>
            <p class="cm-help" style="margin: 0 0 14px;">Les documents (PDF, modèles…) sont proposés au téléchargement des membres. Les images servent aux guides et ne sont pas listées comme documents.</p>
            <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" placeholder="Ex. : Guide de démarrage (PDF)"></label>
            <label class="cm-field"><span>Description</span><textarea class="cm-textarea" name="description" maxlength="2000" style="min-height: 70px;"></textarea></label>
            <label class="cm-field"><span>Fichier</span><input class="cm-input" type="file" name="file" accept="{{ fileAccept }}"></label>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; justify-content: flex-end;"><button type="submit" class="cm-btn" disabled="{{ uploading }}">Téléverser</button></div>
          </form>
        </sc-if>
      </aside>
    </div>
  </sc-if>

  <!-- ===== Guides ===== -->
  <sc-if value="{{ viewGuides }}">
    <div class="cm-split is-editor">
      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Guides</h2><button type="button" class="cm-act is-primary" onClick="{{ onNewGuide }}">Nouveau guide</button></div>
        <sc-if value="{{ noGuides }}"><div class="cm-empty">Aucun guide.</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ guides }}" as="g">
            <li class="cm-row" style="align-items: flex-start;">
              <div class="cm-row-main">
                <p class="cm-row-title">{{ g.title }}</p>
                <div class="cm-row-meta" style="margin-bottom: 8px;"><span class="{{ g.pubCls }}">{{ g.pubLabel }}</span><span>{{ g.moduleName }}</span><span>/{{ g.slug }}</span><span>{{ g.updated }}</span></div>
                <div class="cm-post-actions" style="margin-top: 0;">
                  <button type="button" class="cm-act" onClick="{{ g.onEdit }}">Modifier</button>
                  <a class="cm-act" href="{{ g.href }}">Voir</a>
                  <button type="button" class="cm-act is-danger" onClick="{{ g.onDelete }}">Supprimer</button>
                </div>
              </div>
            </li>
          </sc-for>
        </ul>
      </section>
      <aside>
        <sc-if value="{{ editingGuide }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onSaveGuide }}">
            <div class="cm-page-head" style="margin-bottom: 14px;"><h2 class="cm-h2">{{ guideFormTitle }}</h2><button type="button" class="cm-act" onClick="{{ onTogglePreview }}">{{ previewLabel }}</button></div>
            <sc-if value="{{ previewOpen }}">
              <div style="border: 1px solid var(--a-border); border-radius: 12px; padding: 18px 22px; margin-bottom: 16px; max-height: 60vh; overflow: auto;">
                ''' + PROSE('previewBlocks') + r'''
              </div>
            </sc-if>
            <div class="cm-grid cols-2" style="gap: 0 14px;">
              <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" value="{{ edit.title }}" onChange="{{ onEditField }}"></label>
              <label class="cm-field"><span>Module</span><select class="cm-select" name="module" value="{{ edit.module }}" onChange="{{ onEditField }}"><sc-for list="{{ moduleOptions }}" as="m"><option value="{{ m.code }}">{{ m.name }}</option></sc-for></select></label>
            </div>
            <label class="cm-field"><span>Adresse (slug, optionnel)</span><input class="cm-input" name="slug" maxlength="80" value="{{ edit.slug }}" onChange="{{ onEditField }}" placeholder="dérivée du titre si vide"></label>
            <label class="cm-field"><span>Résumé</span><input class="cm-input" name="summary" maxlength="300" value="{{ edit.summary }}" onChange="{{ onEditField }}"></label>
            <label class="cm-field"><span>Contenu</span><textarea class="cm-textarea is-tall" name="body" value="{{ edit.body }}" onChange="{{ onEditField }}"></textarea></label>
            <p class="cm-help" style="margin: -8px 0 14px;">''' + FORM_HELP + r'''</p>
            <div class="cm-grid cols-2" style="gap: 0 14px;">
              <label class="cm-check" style="margin-bottom: 16px;"><input type="checkbox" name="published" checked="{{ edit.published }}" onChange="{{ onEditField }}"> Publié (visible des membres)</label>
              <label class="cm-field"><span>Ordre dans le module</span><input class="cm-input" type="number" name="position" value="{{ edit.position }}" onChange="{{ onEditField }}"></label>
            </div>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCancelEdit }}">Annuler</button><button type="submit" class="cm-btn">{{ saveLabel }}</button></div>
          </form>
        </sc-if>
        <sc-if value="{{ notEditing }}"><div class="cm-card cm-empty">Sélectionnez un guide à modifier, ou créez-en un nouveau.</div></sc-if>
      </aside>
    </div>
  </sc-if>

  <!-- ===== Nouveautés ===== -->
  <sc-if value="{{ viewNews }}">
    <div class="cm-split is-editor">
      <section class="cm-card">
        <div class="cm-card-head"><h2 class="cm-h2">Nouveautés</h2><button type="button" class="cm-act is-primary" onClick="{{ onNewNews }}">Nouvelle annonce</button></div>
        <sc-if value="{{ noNews }}"><div class="cm-empty">Aucune annonce.</div></sc-if>
        <ul class="cm-list">
          <sc-for list="{{ news }}" as="n">
            <li class="cm-row" style="align-items: flex-start;">
              <div class="cm-row-main">
                <p class="cm-row-title">{{ n.title }}</p>
                <div class="cm-row-meta" style="margin-bottom: 8px;"><span class="{{ n.pubCls }}">{{ n.pubLabel }}</span><sc-if value="{{ n.hasVersion }}"><span>v{{ n.version }}</span></sc-if><sc-if value="{{ n.isPinned }}"><span>épinglée</span></sc-if><span>{{ n.date }}</span></div>
                <div class="cm-post-actions" style="margin-top: 0;">
                  <button type="button" class="cm-act" onClick="{{ n.onEdit }}">Modifier</button>
                  <a class="cm-act" href="{{ n.href }}">Voir</a>
                  <button type="button" class="cm-act is-danger" onClick="{{ n.onDelete }}">Supprimer</button>
                </div>
              </div>
            </li>
          </sc-for>
        </ul>
      </section>
      <aside>
        <sc-if value="{{ editingNews }}">
          <form class="cm-card cm-card-body" onSubmit="{{ onSaveNews }}">
            <div class="cm-page-head" style="margin-bottom: 14px;"><h2 class="cm-h2">{{ newsFormTitle }}</h2><button type="button" class="cm-act" onClick="{{ onTogglePreview }}">{{ previewLabel }}</button></div>
            <sc-if value="{{ previewOpen }}">
              <div style="border: 1px solid var(--a-border); border-radius: 12px; padding: 18px 22px; margin-bottom: 16px; max-height: 60vh; overflow: auto;">
                ''' + PROSE('previewBlocks') + r'''
              </div>
            </sc-if>
            <div class="cm-grid cols-2" style="gap: 0 14px;">
              <label class="cm-field"><span>Titre</span><input class="cm-input" name="title" maxlength="200" value="{{ edit.title }}" onChange="{{ onEditField }}"></label>
              <label class="cm-field"><span>Version (optionnel)</span><input class="cm-input" name="version" maxlength="40" value="{{ edit.version }}" onChange="{{ onEditField }}" placeholder="Ex. : 1.3.0"></label>
            </div>
            <label class="cm-field"><span>Contenu</span><textarea class="cm-textarea is-tall" name="body" style="min-height: 220px;" value="{{ edit.body }}" onChange="{{ onEditField }}"></textarea></label>
            <p class="cm-help" style="margin: -8px 0 14px;">''' + FORM_HELP + r'''</p>
            <div style="display: flex; gap: 22px; flex-wrap: wrap; margin-bottom: 16px;">
              <label class="cm-check"><input type="checkbox" name="published" checked="{{ edit.published }}" onChange="{{ onEditField }}"> Publiée</label>
              <label class="cm-check"><input type="checkbox" name="is_pinned" checked="{{ edit.is_pinned }}" onChange="{{ onEditField }}"> Épinglée en tête</label>
            </div>
            <sc-if value="{{ hasFormError }}"><div class="cm-alert" role="alert">{{ formError }}</div></sc-if>
            <div style="display: flex; gap: 10px; justify-content: flex-end;"><button type="button" class="cm-btn is-ghost" onClick="{{ onCancelEdit }}">Annuler</button><button type="submit" class="cm-btn">{{ saveLabel }}</button></div>
          </form>
        </sc-if>
        <sc-if value="{{ notEditing }}"><div class="cm-card cm-empty">Sélectionnez une annonce à modifier, ou créez-en une nouvelle.</div></sc-if>
      </aside>
    </div>
  </sc-if>
</main>
'''

SCRIPT = r'''
class Component extends DCLogic {
  state = { ready: false, me: null, banned: false, loadError: '', nameOpen: false, nameError: '', nameBusy: false, nameForced: false,
    tab: 'videos', banner: '', actionError: '', formError: '', saving: false,
    videos: [], files: [], guides: [], news: [], chunkSize: 2097152, ffmpeg: false, fileExtensions: [],
    edit: null, previewOpen: false,
    upload: null };

  componentDidMount() {
    if (this._started) return;   // garde : un seul démarrage même si le runtime re-monte
    this._started = true;
    const t = RDB.params().get('onglet') || '';
    if (['videos', 'files', 'guides', 'news'].includes(t)) this.state.tab = t;
    RDB.bootPage(this, { founderOnly: true, noNamePrompt: true });
  }
  componentWillUnmount() { if (this._poll) clearInterval(this._poll); }

  async load() {
    await this.refresh();
    // Les vidéos en cours de normalisation changent d'état sans action : on rafraîchit
    // périodiquement tant qu'il y en a.
    this._poll = setInterval(() => {
      if (this.state.videos.some((v) => v.status === 'processing') && !this.state.upload) this.refresh('videos');
    }, 10000);
  }

  async refresh(only) {
    const want = (k) => !only || only === k;
    const calls = [];
    if (want('videos')) calls.push(RDB.api('/v1/founder/community/videos').then((r) => r.status === 200 && this.setState({ videos: r.data.videos || [], chunkSize: r.data.chunk_size || this.state.chunkSize, ffmpeg: r.data.ffmpeg === true })));
    if (want('files')) calls.push(RDB.api('/v1/founder/community/files').then((r) => r.status === 200 && this.setState({ files: r.data.files || [], fileExtensions: r.data.extensions || [] })));
    if (want('guides')) calls.push(RDB.api('/v1/founder/community/guides').then((r) => r.status === 200 && this.setState({ guides: r.data.guides || [] })));
    if (want('news')) calls.push(RDB.api('/v1/founder/community/announcements').then((r) => r.status === 200 && this.setState({ news: r.data.announcements || [] })));
    await Promise.all(calls);
  }

  setTab = (tab) => this.setState({ tab, edit: null, formError: '', actionError: '', banner: '', previewOpen: false });
  onTabVideos = () => this.setTab('videos');
  onTabFiles = () => this.setTab('files');
  onTabGuides = () => this.setTab('guides');
  onTabNews = () => this.setTab('news');

  fail(r, fallback) { this.setState({ actionError: RDB.errorMessage(r.status, r.data, fallback), banner: '' }); }
  async action(path, body, okMsg, kind) {
    const r = await RDB.api(path, { method: body === null ? 'DELETE' : 'POST', body: body === null ? undefined : body });
    if (r.status === 200) { this.setState({ banner: okMsg, actionError: '' }); await this.refresh(kind); return true; }
    this.fail(r, 'Action impossible.');
    return false;
  }

  // ---- Téléversement en morceaux (vidéos et documents) --------------------------------
  sendChunk(kind, id, index, blob, onProgress) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', RDB.API_BASE + '/v1/founder/community/' + kind + '/' + id + '/chunk');
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-Chunk-Index', String(index));
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded); };
      xhr.onload = () => { let data = null; try { data = JSON.parse(xhr.responseText); } catch (_) {} resolve({ status: xhr.status, data }); };
      xhr.onerror = () => resolve({ status: 0, data: null });
      xhr.timeout = 90000;
      xhr.ontimeout = () => resolve({ status: 0, data: null });
      xhr.send(blob);
    });
  }

  async uploadFile(kind, id, file, label) {
    const cs = this.state.chunkSize;
    const total = Math.ceil(file.size / cs);
    const setPct = (bytes) => this.setState({ upload: { label, pct: Math.min(100, Math.floor(bytes * 100 / file.size)) } });
    this.setState({ upload: { label, pct: 0 }, actionError: '' });
    let index = 0;
    const st = await RDB.api('/v1/founder/community/' + kind + '/' + id + '/upload-status');
    if (st.status === 200 && st.data) {
      if (st.data.expected_size !== file.size) { this.setState({ upload: null, actionError: 'Ce fichier n\'a pas la taille attendue : sélectionnez le même fichier que la première fois.' }); return false; }
      index = Number(st.data.next_index) || 0;
    }
    while (index < total) {
      const blob = file.slice(index * cs, Math.min(file.size, (index + 1) * cs));
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt += 1) {
        const r = await this.sendChunk(kind, id, index, blob, (loaded) => setPct(index * cs + loaded));
        if (r.status === 200) { ok = true; index += 1; }
        else if (r.status === 409 && r.data && Number.isInteger(r.data.next_index)) { ok = true; index = r.data.next_index; }   // resynchronisation
        else if (r.status === 401 || r.status === 403) { this.setState({ upload: null, actionError: 'Session expirée ou refusée : reconnectez-vous.' }); return false; }
        else await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
      }
      if (!ok) { this.setState({ upload: null, actionError: 'Téléversement interrompu (réseau). Relancez-le : il reprendra où il s\'est arrêté.' }); return false; }
    }
    setPct(file.size);
    const fin = await RDB.api('/v1/founder/community/' + kind + '/' + id + '/finalize', { method: 'POST', body: {} });
    this.setState({ upload: null });
    if (fin.status !== 200) {
      const code = fin.data && fin.data.error;
      const msg = code === 'not_mp4' ? 'Ce fichier n\'est pas un MP4 : sans ffmpeg sur le serveur, seul un MP4 (H.264) est accepté.'
        : code === 'size_mismatch' ? 'Le fichier est incomplet : relancez le téléversement.' : RDB.errorMessage(fin.status, fin.data, 'Finalisation impossible.');
      this.setState({ actionError: msg });
      await this.refresh(kind);
      return false;
    }
    this.setState({ banner: fin.data.status === 'processing' ? 'Fichier reçu : normalisation en cours (quelques minutes). La vidéo apparaîtra « prête » ensuite.' : 'Fichier reçu et prêt. Pensez à le publier.' });
    await this.refresh(kind);
    return true;
  }

  onNewVideo = async (e) => {
    e.preventDefault();
    if (this.state.upload) return;
    const form = e.currentTarget || e.target;
    const title = (form.title.value || '').trim();
    const description = (form.description.value || '').trim();
    const module = form.module.value || '';
    const file = form.file.files && form.file.files[0];
    if (!title) { this.setState({ formError: 'Donnez un titre.' }); return; }
    if (!file) { this.setState({ formError: 'Choisissez un fichier vidéo.' }); return; }
    this.setState({ formError: '' });
    const r = await RDB.api('/v1/founder/community/videos', { method: 'POST', body: { title, description, module: module || null, size: file.size, filename: file.name } });
    if (r.status !== 201) {
      const acc = r.data && r.data.accepted ? ' Formats acceptés : ' + r.data.accepted.join(', ') + '.' : '';
      this.setState({ formError: RDB.errorMessage(r.status, r.data, 'Création impossible.') + acc });
      return;
    }
    form.reset();
    await this.uploadFile('videos', r.data.id, file, 'Téléversement de « ' + title + ' »');
  };

  onNewFile = async (e) => {
    e.preventDefault();
    if (this.state.upload) return;
    const form = e.currentTarget || e.target;
    const title = (form.title.value || '').trim();
    const description = (form.description.value || '').trim();
    const file = form.file.files && form.file.files[0];
    if (!title) { this.setState({ formError: 'Donnez un titre.' }); return; }
    if (!file) { this.setState({ formError: 'Choisissez un fichier.' }); return; }
    this.setState({ formError: '' });
    const r = await RDB.api('/v1/founder/community/files', { method: 'POST', body: { title, description, size: file.size, filename: file.name } });
    if (r.status !== 201) {
      const acc = r.data && r.data.accepted ? ' Extensions acceptées : ' + r.data.accepted.join(', ') + '.' : '';
      this.setState({ formError: RDB.errorMessage(r.status, r.data, 'Création impossible.') + acc });
      return;
    }
    form.reset();
    await this.uploadFile('files', r.data.id, file, 'Téléversement de « ' + title + ' »');
  };

  resume = (kind, row) => async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || this.state.upload) return;
    await this.uploadFile(kind, row.id, file, 'Reprise de « ' + row.title + ' »');
  };

  // ---- Édition (formulaires contrôlés) ----------------------------------------------
  startEdit = (kind, row) => {
    const edit = { kind, id: row.id || 0, title: row.title || '', description: row.description || '', module: row.module || (kind === 'guides' ? 'general' : ''),
      position: row.position ?? 0, slug: row.slug || '', summary: row.summary || '', body: row.body || '', version: row.version || '',
      published: kind === 'news' ? !!row.published_at : row.published === 1, is_pinned: row.is_pinned === 1 };
    this.setState({ edit, formError: '', previewOpen: false });
  };
  onEditField = (e) => {
    const t = e.target;
    const value = t.type === 'checkbox' ? t.checked : t.value;
    this.setState((s) => ({ edit: Object.assign({}, s.edit, { [t.name]: value }) }));
  };
  onCancelEdit = () => this.setState({ edit: null, formError: '', previewOpen: false });
  onTogglePreview = () => this.setState((s) => ({ previewOpen: !s.previewOpen }));

  // Un guide ou une annonce s'édite en entier (son corps est chargé à la demande).
  editGuide = async (g) => {
    const r = await RDB.api('/v1/founder/community/guides/' + g.id);
    if (r.status === 200) this.startEdit('guides', r.data.guide); else this.fail(r, 'Chargement impossible.');
  };
  editNews = async (n) => {
    const r = await RDB.api('/v1/founder/community/announcements/' + n.id);
    if (r.status === 200) this.startEdit('news', r.data.announcement); else this.fail(r, 'Chargement impossible.');
  };
  onNewGuide = () => this.startEdit('guides', { module: 'general' });
  onNewNews = () => this.startEdit('news', {});

  save = async (path, body, okMsg, kind) => {
    if (this.state.saving) return;
    this.setState({ saving: true, formError: '' });
    const r = await RDB.api(path, { method: 'POST', body });
    if (r.status === 200 || r.status === 201) {
      this.setState({ saving: false, edit: null, banner: okMsg, previewOpen: false });
      await this.refresh(kind);
      return;
    }
    this.setState({ saving: false, formError: RDB.errorMessage(r.status, r.data, 'Enregistrement impossible.') });
  };
  onSaveVideo = (e) => {
    e.preventDefault();
    const d = this.state.edit;
    this.save('/v1/founder/community/videos/' + d.id, { title: d.title, description: d.description, module: d.module || null, position: Number(d.position) || 0 }, 'Vidéo mise à jour.', 'videos');
  };
  onSaveFile = (e) => {
    e.preventDefault();
    const d = this.state.edit;
    this.save('/v1/founder/community/files/' + d.id, { title: d.title, description: d.description, position: Number(d.position) || 0 }, 'Document mis à jour.', 'files');
  };
  onSaveGuide = (e) => {
    e.preventDefault();
    const d = this.state.edit;
    if (!d.title.trim()) { this.setState({ formError: 'Donnez un titre.' }); return; }
    if (!d.body.trim()) { this.setState({ formError: 'Le contenu est vide.' }); return; }
    const body = { title: d.title, module: d.module, summary: d.summary, body: d.body, published: !!d.published, position: Number(d.position) || 0 };
    if (d.slug.trim()) body.slug = d.slug.trim();
    this.save(d.id ? '/v1/founder/community/guides/' + d.id : '/v1/founder/community/guides', body, d.id ? 'Guide mis à jour.' : 'Guide créé.', 'guides');
  };
  onSaveNews = (e) => {
    e.preventDefault();
    const d = this.state.edit;
    if (!d.title.trim()) { this.setState({ formError: 'Donnez un titre.' }); return; }
    if (!d.body.trim()) { this.setState({ formError: 'Le contenu est vide.' }); return; }
    const body = { title: d.title, version: d.version, body: d.body, published: !!d.published, is_pinned: !!d.is_pinned };
    this.save(d.id ? '/v1/founder/community/announcements/' + d.id : '/v1/founder/community/announcements', body, d.id ? 'Annonce mise à jour.' : 'Annonce créée.', 'news');
  };

  // ---- Actions de liste ---------------------------------------------------------------
  publish = (kind, row, on) => () => this.action('/v1/founder/community/' + kind + '/' + row.id, { published: on }, on ? 'Publié.' : 'Dépublié.', kind);
  remove = (kind, row, refreshKey) => () => {
    if (!window.confirm('Supprimer définitivement « ' + row.title + ' » ?')) return;
    this.action('/v1/founder/community/' + kind + '/' + row.id, null, 'Supprimé.', refreshKey || kind);
  };
  reprocess = (row) => () => this.action('/v1/founder/community/videos/' + row.id + '/reprocess', {}, 'Normalisation relancée.', 'videos');

  renderVals() {
    const s = this.state;
    const STATUS = { uploading: ['Téléversement incomplet', 'cm-tag is-amber'], processing: ['Normalisation en cours', 'cm-tag is-amber'], ready: ['Prête', 'cm-tag is-teal'], failed: ['Échec', 'cm-tag is-red'] };
    const pub = (on) => on ? ['Publié', 'cm-tag is-teal'] : ['Non publié', 'cm-tag is-muted'];
    const videos = s.videos.map((v) => {
      const st = STATUS[v.status] || STATUS.uploading; const p = pub(v.published === 1);
      return {
        id: v.id, title: v.title, statusLabel: st[0], statusCls: st[1], pubLabel: p[0], pubCls: p[1], moduleName: v.module ? RDB.moduleName(v.module) : 'Sans module',
        hasDuration: !!v.duration_s, duration: RDB.fmtDuration(v.duration_s), size: RDB.fmtSize(v.size_bytes || v.expected_size), views: RDB.plural(v.view_count || 0, 'vue', 'vues'),
        hasError: !!v.error, error: v.error || '', isUploading: v.status === 'uploading', received: RDB.fmtSize(v.upload ? v.upload.received_bytes : v.received_bytes) + ' sur ' + RDB.fmtSize(v.expected_size),
        isReady: v.status === 'ready', href: '/communaute/videos?v=' + v.id,
        canPublish: v.status === 'ready' && v.published !== 1, canUnpublish: v.published === 1, canReprocess: v.status === 'failed' && s.ffmpeg,
        onPublish: this.publish('videos', v, true), onUnpublish: this.publish('videos', v, false), onEdit: () => this.startEdit('videos', v),
        onReprocess: this.reprocess(v), onResume: this.resume('videos', v), onDelete: this.remove('videos', v),
      };
    });
    const files = s.files.map((f) => {
      const st = STATUS[f.status] || STATUS.uploading; const p = pub(f.published === 1);
      return {
        id: f.id, title: f.title, name: f.original_name || '', statusLabel: st[0], statusCls: st[1], pubLabel: p[0], pubCls: p[1], kind: String(f.kind || '').toUpperCase(),
        size: RDB.fmtSize(f.size_bytes || f.expected_size), downloads: RDB.plural(f.download_count || 0, 'téléchargement', 'téléchargements'), isImage: f.is_image === true,
        isUploading: f.status === 'uploading', received: RDB.fmtSize(f.upload ? f.upload.received_bytes : f.received_bytes) + ' sur ' + RDB.fmtSize(f.expected_size),
        canPublish: f.status === 'ready' && f.published !== 1, canUnpublish: f.published === 1,
        onPublish: this.publish('files', f, true), onUnpublish: this.publish('files', f, false), onEdit: () => this.startEdit('files', f), onResume: this.resume('files', f), onDelete: this.remove('files', f),
      };
    });
    const guides = s.guides.map((g) => {
      const p = pub(g.published === 1);
      return { id: g.id, title: g.title, slug: g.slug, pubLabel: p[0], pubCls: p[1], moduleName: RDB.moduleName(g.module), updated: RDB.fmtDate(g.updated_at), href: '/communaute/guides?g=' + g.slug, onEdit: () => this.editGuide(g), onDelete: this.remove('guides', g) };
    });
    const news = s.news.map((n) => {
      const p = pub(!!n.published_at);
      return { id: n.id, title: n.title, pubLabel: p[0], pubCls: p[1], version: n.version || '', hasVersion: !!n.version, isPinned: n.is_pinned === 1, date: RDB.fmtDate(n.published_at || n.created_at), href: '/communaute/nouveautes?n=' + n.id, onEdit: () => this.editNews(n), onDelete: this.remove('announcements', n, 'news') };
    });
    const edit = s.edit || { kind: '', id: 0, title: '', description: '', module: '', position: 0, slug: '', summary: '', body: '', version: '', published: false, is_pinned: false };
    const tab = (k) => s.tab === k ? 'cm-tab is-active' : 'cm-tab';
    return Object.assign(RDB.shellVals(this, 'publish'), {
      hasBanner: !!s.banner, banner: s.banner, hasActionError: !!s.actionError, actionError: s.actionError,
      tabVideos: tab('videos'), tabFiles: tab('files'), tabGuides: tab('guides'), tabNews: tab('news'),
      nVideos: String(s.videos.length), nFiles: String(s.files.length), nGuides: String(s.guides.length), nNews: String(s.news.length),
      onTabVideos: this.onTabVideos, onTabFiles: this.onTabFiles, onTabGuides: this.onTabGuides, onTabNews: this.onTabNews,
      viewVideos: s.tab === 'videos', viewFiles: s.tab === 'files', viewGuides: s.tab === 'guides', viewNews: s.tab === 'news',
      uploading: !!s.upload, uploadLabel: s.upload ? s.upload.label : '', uploadPct: s.upload ? String(s.upload.pct) : '0',
      videos, noVideos: videos.length === 0, ffmpegNote: s.ffmpeg ? 'ffmpeg : normalisation et vignettes actives' : 'ffmpeg absent : MP4 H.264 uniquement, sans vignette',
      videoAccept: s.ffmpeg ? '.mp4,.mov,.m4v' : '.mp4', videoHelp: s.ffmpeg ? 'Formats acceptés : MP4, MOV (QuickTime), M4V. La vidéo est normalisée sur le serveur (H.264, vignette).' : 'Format accepté : MP4 encodé en H.264/AAC (ffmpeg n\'est pas installé sur le serveur).',
      files, noFiles: files.length === 0, fileAccept: (s.fileExtensions || []).map((x) => '.' + x).join(','), fileAcceptNote: (s.fileExtensions || []).join(', '),
      guides, noGuides: guides.length === 0, news, noNews: news.length === 0,
      moduleOptions: RDB.moduleList(),
      edit, editingVideo: !!s.edit && s.edit.kind === 'videos', editingFile: !!s.edit && s.edit.kind === 'files', editingGuide: !!s.edit && s.edit.kind === 'guides', editingNews: !!s.edit && s.edit.kind === 'news', notEditing: !s.edit,
      guideFormTitle: edit.id ? 'Modifier le guide' : 'Nouveau guide', newsFormTitle: edit.id ? 'Modifier l\'annonce' : 'Nouvelle annonce',
      previewOpen: s.previewOpen, previewLabel: s.previewOpen ? 'Masquer l\'aperçu' : 'Aperçu', previewBlocks: s.previewOpen ? RDB.parseLite(edit.body) : [],
      hasFormError: !!s.formError, formError: s.formError, saveLabel: s.saving ? 'Enregistrement…' : 'Enregistrer',
      onEditField: this.onEditField, onCancelEdit: this.onCancelEdit, onTogglePreview: this.onTogglePreview,
      onNewVideo: this.onNewVideo, onNewFile: this.onNewFile, onNewGuide: this.onNewGuide, onNewNews: this.onNewNews,
      onSaveVideo: this.onSaveVideo, onSaveFile: this.onSaveFile, onSaveGuide: this.onSaveGuide, onSaveNews: this.onSaveNews,
    });
  }
}
'''

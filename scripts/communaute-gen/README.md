# Générateur des pages `communaute/*.html`

Les dix pages de l'espace communautaire partagent une coquille (head, CSP, en-tête, modale du
pseudo) dupliquée dans chaque fichier, convention du site (pas d'include, pas de build en CI).
Pour ne pas la maintenir dix fois à la main, chaque page est décrite par un module
`page_<nom>.py` (`TITLE`, `DESCRIPTION`, `MAIN`, `SCRIPT`) et assemblée par `shell.py`.

```bash
python3 scripts/communaute-gen/build.py            # régénère les dix pages
python3 scripts/communaute-gen/build.py forum.html # une seule
node scripts/check-dc-pages.mjs                     # puis le vérificateur
```

Modifier une page = modifier son module puis régénérer. Modifier l'en-tête ou la modale =
modifier `shell.py` puis tout régénérer. Les fichiers HTML générés sont ceux publiés.

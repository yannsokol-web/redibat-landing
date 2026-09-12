# Banc d'essai local de l'espace communautaire

Outils de développement (jamais publiés : `scripts/` est retiré du paquet Pages en CI).
Ils rejouent, dans un vrai Chrome headless, la connexion par la page `/espace-client`, puis
des scénarios sur les pages `communaute/` : saisie compatible React (champs contrôlés),
soumissions, téléversement de fichiers, captures d'écran à 1280 et 400 px, relevé des erreurs
de console.

Prérequis : le dépôt `redibat-auth` à côté de celui-ci (ou `REDIBAT_AUTH=/chemin/`),
Node 22 (`/opt/homebrew/opt/node@22/bin` sur le Mac de développement), Google Chrome.

```bash
# 1. API locale (base et médias jetables, cookie sans Secure pour http://localhost)
cd ../redibat-auth && rm -rf /tmp/rdb-local && mkdir -p /tmp/rdb-local/community
PORT=3000 WEB_COOKIE_SECURE=0 DB_PATH=/tmp/rdb-local/test.db COMMUNITY_DIR=/tmp/rdb-local/community \
  JWT_SECRET=$(printf 'k%.0s' $(seq 1 48)) FOUNDER_EMAIL=fondateur@example.test LOGIN_RATE_MAX=500 \
  COMMUNITY_EARLY_BEFORE=2027-01-01 node src/server.js &

# 2. Landing locale : reproduit GitHub Pages (/x -> x.html) et pointe la CSP sur l'API locale
node scripts/communaute-harness/serve.mjs "$PWD" 8100 &

# 3. Comptes et contenus d'essai (fondateur, alice avec licence, bob sans licence)
DB_PATH=/tmp/rdb-local/test.db node scripts/communaute-harness/seed.mjs

# 4. Captures (compte : founder | alice | bob | anon) et scénarios interactifs
node scripts/communaute-harness/shoot.mjs alice /tmp/rdb-shots "/communaute/" "/communaute/forum?t=1"
node scripts/communaute-harness/interact.mjs bob /tmp/rdb-shots scripts/communaute-harness/scenario-bob.json
node scripts/communaute-harness/interact.mjs founder /tmp/rdb-shots scripts/communaute-harness/scenario-founder.json
TOTP_ENC_KEY=<clé de l'API> node scripts/communaute-harness/interact.mjs alice /tmp/rdb-shots scripts/communaute-harness/scenario-2fa.json
node scripts/communaute-harness/interact.mjs anon /tmp/rdb-shots scripts/communaute-harness/scenario-souvenir.json
```

`scenario-2fa.json` calcule les codes TOTP comme le ferait l'application (même `TOTP_ENC_KEY`
que l'API locale) et laisse Alice avec la 2FA désactivée ; `scenario-souvenir.json` éprouve la
case « Se souvenir de moi » (e-mail pré-rempli, cookie persistant ou de navigation).

Les scénarios `scenario-founder.json` attendent deux fichiers factices :
`/tmp/rdb-local/demo-quantitatif.mp4` (signature `ftyp`, 5 Mo) et `/tmp/rdb-local/modele-cctp.pdf`.
Mot de passe des comptes d'essai : `un-mot-de-passe-de-test-solide`.

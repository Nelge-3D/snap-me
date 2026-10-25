# État du projet — Snap Me

Rapport détaillé au 25 octobre 2026, veille/jour de la remise du **Hacktoberfest Hack Day Libreville 2026** (deadline 18h30 WAT).

**Statut global : prêt pour la remise.** Flux complet testé bout en bout, déployé en production, dépôt GitHub public et à jour.

---

## 1. Résumé en une phrase

Snap Me est une web app (Next.js, pas de backend/DB) qui identifie un objet photographié via **Gemma 4** (vision), apprend le mot anglais correspondant avec IPA et phrases d'exemple, le fait écouter via **Kokoro-82M** (TTS 100% navigateur), propose des exercices à trous avec XP, et garde un carnet des snaps passés dans `localStorage`.

---

## 2. Stack technique

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, TypeScript, Tailwind CSS v4 (thème via `@theme inline`, pas de `tailwind.config.js`) |
| Animations | Framer Motion (`framer-motion`, résout vers Motion 14.6.0) |
| IA vision + texte | Google Gemini API (`@google/genai`), modèle **Gemma 4** (`gemma-4-26b-a4b-it`) |
| IA voix | **Kokoro-82M** (`kokoro-js`, modèle ONNX `onnx-community/Kokoro-82M-v1.0-ONNX`), voix `bf_lily`, avec repli sur `window.speechSynthesis` |
| Persistance | `localStorage` uniquement — aucune base de données, aucune authentification (contrainte assumée du brief) |
| Hébergement | Vercel (Hobby + Fluid Compute), région `iad1` |
| Dépôt | [github.com/Nelge-3D/snap-me](https://github.com/Nelge-3D/snap-me) — public |
| Prod | [snap-me-omega.vercel.app](https://snap-me-omega.vercel.app) |

---

## 3. Architecture

```
app/
  page.tsx                  écran principal : capture, résultat, phrases, exercices
  carnet/page.tsx            grille du carnet (suppression par carte)
  api/snap/route.ts          identification (vision, rapide)
  api/snap/details/route.ts  phrases + exercices (texte, en arrière-plan)
  icon.tsx, opengraph-image.tsx   favicon et image OG générés par code (next/og)
  layout.tsx                 layout racine, BottomNav, metadataBase

components/
  Onboarding.tsx       overlay de bienvenue au premier lancement
  BottomNav.tsx         barre de navigation Accueil / Carnet
  LevelSelector.tsx     sélecteur présent / passé / futur
  ExerciseCard.tsx      exercice à trous avec feedback animé
  SpeakButton.tsx        bouton d'écoute
  Sparkle.tsx            icône décorative du logo (ajout du jour)

lib/
  gemma.ts          prompts, sanitisation JSON, retry, appel Gemini
  kokoro.ts          chargement différé du modèle TTS + cache audio par texte
  speak.ts           lecture audio (ne révoque plus l'URL, pour garder le cache)
  compressImage.ts   compression client : 512px pour l'API, 768px pour l'affichage
  storage.ts         XP, niveaux, quota journalier, carnet — tout localStorage
  types.ts           types partagés (IdentifyResult, DetailsResult, Snap, Progress…)
```

---

## 4. Fonctionnalités livrées (par priorité, dans l'ordre de construction)

1. **Capture + identification** — photo → compression → Gemma 4 → mot anglais, mot français, IPA.
2. **Bouton d'écoute** — `speechSynthesis` navigateur en première version.
3. **Kokoro-82M** — remplace `speechSynthesis` comme voix principale, 100% local, fallback conservé.
4. **Exercices à trous + XP** — générés par Gemma 4 en même temps que les phrases.
5. **Quota journalier** — 5 photos/jour, reset paresseux à minuit (pas de timer).
6. **Carnet** — historique des snaps (jusqu'à 50), suppression possible depuis la grille *et* la vue détail.
7. **Progression par temps grammatical** — présent (0 XP) → passé (50 XP) → futur (150 XP), déblocage automatique.

Puis, lors de la passe de polish :

8. **Onboarding** premier lancement (overlay 3 étapes, persistant via `localStorage`).
9. **Animations Framer Motion** — pill coulissante des niveaux, barre de nav active, apparition en cascade des phrases/exercices, shake sur mauvaise réponse, crossfade des messages de chargement.
10. **Thème clair** — bascule du fond sombre initial vers une palette claire, plus lisible en extérieur (contrainte du brief explicitement levée par toi).
11. **Logo avec sparkle** — accent décoratif ambré ajouté au wordmark, au favicon et à l'image Open Graph, conforme aux maquettes de référence envoyées.
12. **Images de référence versionnées** — les 8 maquettes de design sont dans `docs/references/`.
13. **Captures README à jour** — accueil, résultat et exercices retouchés pour montrer le sparkle.

---

## 5. Choix techniques notables et pourquoi

- **Deux appels Gemma séparés** (`/api/snap` puis `/api/snap/details`) : l'identification revient vite (quelques secondes), les phrases/exercices arrivent ensuite en arrière-plan. Pur gain de *vitesse perçue* — la latence totale ne change pas, mais l'utilisateur voit un résultat tout de suite.
- **Image 512px pour l'API, 768px pour l'affichage** : moins de tokens image envoyés à Gemma, sans dégrader la photo affichée/sauvegardée.
- **Cache audio par texte** (`lib/kokoro.ts`) : corrige un vrai bug où cliquer deux fois sur "écouter" relançait toute l'inférence TTS au lieu de rejouer l'audio déjà généré.
- **`maxDuration = 300`** sur les deux routes API : un appel réel avait buté sur l'ancienne limite de 60s ; Vercel Hobby + Fluid Compute autorise bien jusqu'à 300s.
- **Sanitisation stricte du JSON Gemma** + gestion explicite du cas "objet non identifiable" (réponse 422) : évite qu'une sortie mal formée ou un objet ambigu ne casse l'UI.
- **`useSyncExternalStore`** partout où l'état dépend de `localStorage`, pour éviter les hydration mismatches et respecter la règle ESLint `set-state-in-effect`.

---

## 6. Déploiement

- **Dernier commit déployé** : `b1b058a` (captures README mises à jour).
- **Déploiement sparkle logo** : `dpl_FQvFgciieyfB4tU9dULUCKexFnub`, état `READY`, alias `snap-me-omega.vercel.app` confirmé.
- **Variable d'environnement** : `GEMINI_API_KEY` configurée en production sur Vercel.
- **Aucune erreur console** constatée sur la page d'accueil en prod lors de la dernière vérification.

---

## 7. Tests effectués (aujourd'hui)

| Test | Résultat |
|---|---|
| Build production (`next build`) | ✅ compile sans erreur ni warning |
| Lint (`eslint`) | ✅ aucun problème |
| Typecheck (`tsc --noEmit`) | ✅ aucune erreur |
| Parcours complet avec vraie photo (tasse) | ✅ identification → phrases (futur) → exercice +10 XP → audio sans erreur console → sauvegarde carnet |
| Suppression carnet (grille) | ✅ fonctionne, testé deux fois |
| Vue mobile (375×812) | ✅ pas de débordement, nav basse bien positionnée |
| Prod : accueil, `/icon`, `/opengraph-image` | ✅ sparkle visible aux trois endroits |
| Dépôt GitHub | ✅ public, dernier push synchronisé avec prod |

---

## 8. Limites assumées (documentées dans le README)

- Pas de compte ni synchronisation entre appareils — la progression vit dans le navigateur utilisé.
- Carnet plafonné à 50 snaps (limite raisonnable de `localStorage`).
- Un seul objet identifié par photo, même si plusieurs sont visibles.
- Latence Gemma 4 variable, jusqu'à 30-80s selon la charge — acceptable pour un usage quotidien réfléchi, pas pour un usage impatient. Aucune optimisation supplémentaire n'est possible côté API (le "thinking" interne du modèle ne peut pas être désactivé, confirmé par test direct de l'API).

---

## 9. Ce qui reste, si tu veux aller plus loin (non bloquant)

- Nettoyer `public/Photos reference/` (photos de test, actuellement non suivies par git — à garder ou supprimer selon ton choix, elles ne gênent pas le dépôt).
- Suite envisagée listée dans le README : export/import de progression, reconnaissance multi-objets, révision espacée du carnet.

Rien de ce qui précède n'empêche la remise : c'est une liste d'idées, pas un blocage.

---

## 10. Historique des commits (20 derniers)

```
b1b058a Update README screenshots to show the sparkle logo
4cbbcc0 Add sparkle brand accent to logo, commit design reference mockups
c351205 Switch to a light theme, keeping the orange accent
97bdffc Add onboarding, Framer Motion animations, and a bottom nav bar
df2a766 Add a delete button directly on each carnet grid card
ed8116d Update README's image-compression section to match the two-size split
3196ca9 Replace README screenshots with real photos of real objects
285e761 Replace default Next.js favicon with a branded icon + OG image
15c800e Split Gemma call in two to cut perceived wait, cache generated audio
79b114a Raise maxDuration to 300s: one real call just hit the 60s ceiling
0e534e5 Harden the Gemma 4 pipeline against timeouts and malformed output
97774ed Write README for the hackathon submission
975dcf9 Add present/past/future tense progression (priority 7)
6350839 Add offline snap notebook (priority 6)
b4499db Add daily 5-photo quota with lazy midnight reset (priority 5)
27dd549 Add fill-in-the-blank exercises with XP (priority 4)
25efda2 Add Kokoro-82M TTS as primary voice, browser fallback stays behind it
5d16b08 Add listen button with browser speechSynthesis (priority 2)
9dfa21b Add core snap flow: capture, compress, Gemma 4 call, result UI
3bd1cfb Add Gemma 4 vision test script and validate raw JSON output
```

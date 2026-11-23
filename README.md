# Windows 11 Web

Un bureau façon Windows 11 qui tourne dans le navigateur, sans serveur ni installation.

**Applications incluses :** Explorateur de fichiers, Bloc-notes, Calculatrice, Navigateur, Paramètres (thème clair/sombre, arrière-plans).
Les fichiers créés sont enregistrés dans le navigateur (localStorage).

> Ce n'est pas le vrai système Windows : c'est une recréation de l'interface en HTML, CSS et JavaScript.

## Fichiers

- `index.html` : la page
- `style.css` : l'apparence
- `app.js` : fenêtres, menu Démarrer et applications
- `render.yaml` : configuration Render

## Publier sur GitHub

1. Créez un dépôt vide sur github.com (par exemple `windows11-web`).
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Windows 11 Web"
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/windows11-web.git
git push -u origin main
```

Vous pouvez aussi glisser les fichiers directement dans le dépôt depuis le site GitHub (Add file > Upload files).

## Obtenir une URL

**Option A : GitHub Pages (le plus simple)**
Dépôt > Settings > Pages > Branch `main`, dossier `/ (root)` > Save.
L'adresse sera `https://VOTRE-NOM.github.io/windows11-web/`.

**Option B : Render**
1. Sur render.com : New > Static Site, puis connectez le dépôt.
2. Build Command : laissez vide. Publish Directory : `.`
3. Créez le site : l'adresse `https://windows11-web.onrender.com` s'affiche.

## Limite connue

Le Navigateur intégré ne peut pas afficher les sites qui interdisent l'intégration dans une page (Google, YouTube, etc.). Wikipédia fonctionne.

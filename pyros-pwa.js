/* ───────────────────────────────────────────────────────────────
   PYROS — enregistrement du service worker (optionnel)

   Le site fonctionne sans ce fichier. Il sert uniquement a rendre
   la page installable (icone sur l'ecran d'accueil) et consultable
   hors ligne. Le cache est en "reseau d'abord" : tant qu'il y a du
   reseau, c'est toujours la derniere version qui s'affiche.

   Si tu veux le desactiver : supprime la ligne
   <script src="pyros-pwa.js" defer></script> dans index.html
   ─────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function (err) {
      console.warn('[PYROS] service worker non enregistre :', err);
    });
  });

  /* Bouton "Installer l'application" si le navigateur le propose.
     Aucun bouton n'apparait tant que le navigateur ne declenche pas
     l'evenement — c'est lui qui decide de l'eligibilite. */
  var deferred = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    document.documentElement.setAttribute('data-installable', 'true');
  });

  window.pyrosInstall = function () {
    if (!deferred) return false;
    deferred.prompt();
    deferred.userChoice.finally(function () {
      deferred = null;
      document.documentElement.removeAttribute('data-installable');
    });
    return true;
  };

  window.addEventListener('appinstalled', function () {
    deferred = null;
    document.documentElement.removeAttribute('data-installable');
  });
})();

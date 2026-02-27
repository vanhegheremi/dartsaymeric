export function showHome(app) {
  app.innerHTML = `
    <div style="max-width:500px;margin:0 auto;padding:2rem 1rem;text-align:center;">
      <div style="font-size:3.5rem;line-height:1;margin-bottom:0.5rem;">🎯</div>
      <h1 style="font-size:2rem;margin:0 0 0.25rem;">Dart Counter</h1>
      <p style="color:#94a3b8;margin-bottom:2rem;">Compteur de fléchettes</p>

      <div style="display:flex;flex-direction:column;gap:1rem;">
        <button onclick="window.showGameModes()" style="padding:1.5rem;font-size:1.3rem;background:#22c55e;border-radius:16px;">
          🎮 Nouvelle Partie
        </button>
        <button onclick="window.showPlayers()" style="padding:1.5rem;font-size:1.3rem;border-radius:16px;">
          👥 Gérer les Joueurs
        </button>
      </div>
    </div>
  `;
}

function gameCard(onclick, borderColor, titleColor, title, desc) {
  return `
    <div onclick="${onclick}"
         style="background:#1e293b;border:2px solid ${borderColor};border-radius:12px;padding:1.25rem;cursor:pointer;transition:background 0.15s;"
         onmouseenter="this.style.background='${borderColor}22'"
         onmouseleave="this.style.background='#1e293b'">
      <h3 style="color:${titleColor};margin:0 0 0.4rem;font-size:1.1rem;">${title}</h3>
      <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">${desc}</p>
    </div>
  `;
}

export function showGameModes(app) {
  app.innerHTML = `
    <div style="max-width:500px;margin:0 auto;padding:1.5rem 1rem;">
      <h2 style="margin-bottom:1.25rem;text-align:center;">🎮 Choisir un Mode</h2>

      <div style="display:flex;flex-direction:column;gap:0.85rem;">
        ${gameCard("window.newGameX01()",     "#22c55e", "#22c55e", "🔢 501",               "Commence à 501. Premier à atteindre exactement zéro gagne !")}
        ${gameCard("window.newGameATW()",     "#fbbf24", "#fbbf24", "🌍 Around the World",  "Touche les numéros 1→20 puis Bull dans l'ordre. Premier à finir gagne !")}
        ${gameCard("window.newGameCricket()", "#38bdf8", "#38bdf8", "🎯 Cut-Throat Cricket","Ferme les numéros 15–20 & Bull. Le plus petit score gagne !")}
        ${gameCard("window.newGameHalveIt()", "#a78bfa", "#a78bfa", "½ Halve It",           "Rate la cible et ton score est divisé par deux. 12 rounds !")}
      </div>

      <button onclick="window.showHome()" style="margin-top:1.5rem;background:#64748b;width:100%;">
        ← Retour
      </button>
    </div>
  `;
}

export function showHome(app) {
  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto; padding: 2rem 1rem;">
      <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</h1>
      <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Dart Counter</h1>
      <p style="color: #94a3b8; margin-bottom: 2rem;">Compteur de fléchettes</p>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <button
          onclick="window.showGameModes()"
          style="padding: 1.5rem; font-size: 1.3rem; background: #22c55e;">
          🎮 Nouvelle Partie
        </button>

        <button
          onclick="window.showPlayers()"
          style="padding: 1.5rem; font-size: 1.3rem;">
          👥 Gérer les Joueurs
        </button>
      </div>
    </div>
  `;
}

export function showGameModes(app) {
  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto; padding: 2rem 1rem;">
      <h2 style="margin-bottom: 1.5rem;">🎮 Choisir un Mode</h2>

      <div style="display: flex; flex-direction: column; gap: 1rem;">

        <!-- 501 -->
        <div
          onclick="window.newGameX01()"
          style="background: #1e293b; border: 2px solid #22c55e; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease;"
          onmouseover="this.style.background='rgba(34,197,94,0.1)'"
          onmouseout="this.style.background='#1e293b'">
          <h3 style="color: #22c55e; margin: 0 0 0.5rem 0; font-size: 1.2rem;">🔢 501</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Commence à 501. Premier à atteindre exactement zéro gagne !
          </p>
        </div>

        <!-- Cut-Throat Cricket -->
        <div
          onclick="window.newGameCricket()"
          style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease;"
          onmouseover="this.style.background='rgba(56,189,248,0.1)'"
          onmouseout="this.style.background='#1e293b'">
          <h3 style="color: #38bdf8; margin: 0 0 0.5rem 0; font-size: 1.2rem;">🎯 Cut-Throat Cricket</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Ferme les numéros 15–20 & Bull. Le plus petit score gagne !
          </p>
        </div>

        <!-- Halve It -->
        <div
          onclick="window.newGameHalveIt()"
          style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease;"
          onmouseover="this.style.background='rgba(56,189,248,0.1)'"
          onmouseout="this.style.background='#1e293b'">
          <h3 style="color: #38bdf8; margin: 0 0 0.5rem 0; font-size: 1.2rem;">½ Halve It</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Rate la cible et ton score est divisé par deux !
          </p>
        </div>

      </div>

      <button
        onclick="window.showHome()"
        style="margin-top: 2rem; background: #64748b; width: 100%;">
        ← Retour
      </button>
    </div>
  `;
}

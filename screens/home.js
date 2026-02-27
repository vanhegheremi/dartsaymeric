export function showHome(app) {
  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto; padding: 2rem 1rem;">
      <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</h1>
      <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Dart Counter</h1>
      <p style="color: #94a3b8; margin-bottom: 2rem;">Track your dart games</p>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <button 
          onclick="window.showGameModes()" 
          style="padding: 1.5rem; font-size: 1.3rem; background: #22c55e;">
          🎮 New Game
        </button>
        
        <button 
          onclick="window.showPlayers()" 
          style="padding: 1.5rem; font-size: 1.3rem;">
          👥 Manage Players
        </button>
      </div>
    </div>
  `;
}

export function showGameModes(app) {
  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto; padding: 2rem 1rem;">
      <h2 style="margin-bottom: 1.5rem;">🎮 Select Game Mode</h2>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Cut-Throat Cricket -->
        <div 
          onclick="window.newGameCricket()" 
          style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease;"
          onmouseover="this.style.background='rgba(56, 189, 248, 0.1)'"
          onmouseout="this.style.background='#1e293b'">
          <h3 style="color: #38bdf8; margin: 0 0 0.5rem 0; font-size: 1.2rem;">🎯 Cut-Throat Cricket</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Close numbers 15-20 & Bull. Give points to opponents. Lowest score wins!
          </p>
        </div>

        <!-- x01 - Coming Soon -->
        <div 
          style="background: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 1.5rem; opacity: 0.5; cursor: not-allowed;">
          <h3 style="color: #64748b; margin: 0 0 0.5rem 0; font-size: 1.2rem;">🔢 x01 <span style="font-size: 0.8rem;">(Coming Soon)</span></h3>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Start at 501. First to reach exactly zero wins.
          </p>
        </div>

        <!-- Around the Clock - Coming Soon -->
        <div 
          style="background: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 1.5rem; opacity: 0.5; cursor: not-allowed;">
          <h3 style="color: #64748b; margin: 0 0 0.5rem 0; font-size: 1.2rem;">🕐 Around the Clock <span style="font-size: 0.8rem;">(Coming Soon)</span></h3>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Hit numbers 1-20 in order, then bullseye to win.
          </p>
        </div>

        <!-- Halve it - Coming Soon -->
        <div 
          onclick="window.newGameHalveIt()" 
          style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease;"
          onmouseover="this.style.background='rgba(56, 189, 248, 0.1)'"
          onmouseout="this.style.background='#1e293b'">
          <h3 style="color: #38bdf8; margin: 0 0 0.5rem 0; font-size: 1.2rem;">½ Halve it </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0; line-height: 1.5;">
            Hit the target, or your score will be reduced by half.
          </p>
        </div>

      <button 
        onclick="window.showHome()" 
        style="margin-top: 2rem; background: #64748b; width: 100%;">
        ← Back to Home
      </button>
    </div>
  `;
}

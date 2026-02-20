// --- Data Architecture ---
const TM = 200; // Hardcoded TM for Sandbag right now
const percentages = {
  "1": [{p: 0.65, r: 5}, {p: 0.75, r: 5}, {p: 0.85, r: "AMRAP"}],
  "2": [{p: 0.70, r: 3}, {p: 0.80, r: 3}, {p: 0.90, r: "AMRAP"}],
  "3": [{p: 0.75, r: 5}, {p: 0.85, r: 3}, {p: 0.95, r: "AMRAP"}]
};

// The Master Workout Template for Day 1
const workoutTemplate = [
  {
    id: "sandbag",
    name: "Sandbag Over Shoulder",
    type: "531",
    sets: 3
  },
  {
    id: "chest_row",
    name: "Chest-Supported Rows",
    type: "accessory",
    sets: 5,
    targetReps: "10-15",
    targetWeight: "Machine" 
  },
  {
    id: "hammer_curls",
    name: "Heavy Hammer Curls",
    type: "accessory",
    sets: 3,
    targetReps: "10-15",
    targetWeight: "DBs"
  }
  // You can easily add the rest of your circuit here following the same format
];

// --- Core Functions ---
function generateWorkout() {
  const week = document.getElementById('weekSelect').value;
  const container = document.getElementById('workoutContainer');
  container.innerHTML = ''; // Clear existing
  
  // Load saved data if it exists for this week
  const savedData = JSON.parse(localStorage.getItem(`strongman_w${week}`)) || {};

  workoutTemplate.forEach(ex => {
    let cardHTML = `
      <div class="exercise-card">
        <div class="exercise-header">
          <h2 class="exercise-title">${ex.name}</h2>
        </div>
    `;

    for(let s = 0; s < ex.sets; s++) {
      let tWeight = ex.targetWeight;
      let tReps = ex.targetReps;

      // Calculate 5/3/1 math if it's a main lift
      if(ex.type === "531") {
        tWeight = Math.round(TM * percentages[week][s].p);
        tReps = percentages[week][s].r;
      }

      // Check for saved local data
      const savedWeight = savedData[`${ex.id}_w_${s}`] || tWeight;
      const savedReps = savedData[`${ex.id}_r_${s}`] || (tReps === "AMRAP" ? "" : tReps);
      const isCompleted = savedData[`${ex.id}_c_${s}`] ? 'completed' : '';
      const checkIcon = isCompleted ? '✓' : '○';

      cardHTML += `
        <div class="set-row">
          <div class="set-number">${s + 1}</div>
          
          <div class="input-group">
            <span class="input-label">Lbs (${tWeight})</span>
            <input type="number" inputmode="numeric" id="${ex.id}_w_${s}" value="${savedWeight}">
          </div>
          
          <div class="input-group">
            <span class="input-label">Reps (${tReps})</span>
            <input type="number" inputmode="numeric" id="${ex.id}_r_${s}" value="${savedReps}">
          </div>
          
          <button class="check-btn ${isCompleted}" id="${ex.id}_c_${s}" onclick="toggleCheck(this)">${checkIcon}</button>
        </div>
      `;
    }
    cardHTML += `</div>`;
    container.innerHTML += cardHTML;
  });
}

function toggleCheck(btn) {
  btn.classList.toggle('completed');
  btn.innerText = btn.classList.contains('completed') ? '✓' : '○';
  saveWorkout(); // Auto-save when a set is checked
}

function saveWorkout() {
  const week = document.getElementById('weekSelect').value;
  let sessionData = {};

  workoutTemplate.forEach(ex => {
    for(let s = 0; s < ex.sets; s++) {
      sessionData[`${ex.id}_w_${s}`] = document.getElementById(`${ex.id}_w_${s}`).value;
      sessionData[`${ex.id}_r_${s}`] = document.getElementById(`${ex.id}_r_${s}`).value;
      sessionData[`${ex.id}_c_${s}`] = document.getElementById(`${ex.id}_c_${s}`).classList.contains('completed');
    }
  });

  // Save to browser's Local Storage
  localStorage.setItem(`strongman_w${week}`, JSON.stringify(sessionData));
  
  // Brief visual feedback
  const saveBtn = document.querySelector('.btn-primary');
  saveBtn.innerText = "Saved!";
  saveBtn.style.background = "var(--success)";
  setTimeout(() => {
    saveBtn.innerText = "Save Workout";
    saveBtn.style.background = "var(--primary)";
  }, 1500);
}

// Initialize on load
window.onload = generateWorkout;

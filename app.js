// MiMoFit — AI Fitness Planner & Calorie Calculator
// Powered by Xiaomi MiMo V2.5 via Pollinations.ai

const MIMO_API = 'https://text.pollinations.ai/';
const APP_NAME = 'mimofit';

// ========== STATE ==========
let lang = localStorage.getItem('mimofit-lang') || 'en';
let chatHistory = [];

// ========== THEME ==========
function toggleTheme() {
  const html = document.documentElement;
  const cur = html.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('mimofit-theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
}
(function initTheme() {
  const t = localStorage.getItem('mimofit-theme') || 'dark';
  document.documentElement.dataset.theme = t;
  if (t === 'light') document.getElementById('themeBtn').textContent = '🌙 Dark';
})();

// ========== PARTICLES ==========
(function initParticles() {
  const c = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDuration = (8 + Math.random() * 12) + 's';
    s.style.animationDelay = Math.random() * 10 + 's';
    s.style.width = s.style.height = (2 + Math.random() * 3) + 'px';
    c.appendChild(s);
  }
})();

// ========== REVEAL ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0, rootMargin: '0px 0px 60px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
// Safety net
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 1500);

// ========== BODY CALCULATOR ==========
function calculateBody() {
  const gender = document.getElementById('gender').value;
  const age = parseFloat(document.getElementById('age').value);
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const activity = parseFloat(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;

  if (!age || !height || !weight) { alert('Please fill all fields'); return; }

  // BMR (Mifflin-St Jeor)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * activity);
  let target;
  if (goal === 'cut') target = Math.round(tdee * 0.8);
  else if (goal === 'bulk') target = Math.round(tdee * 1.15);
  else target = tdee;

  const bmi = weight / Math.pow(height / 100, 2);
  const bmiRound = Math.round(bmi * 10) / 10;

  // Macros
  let protein, fat, carbs;
  if (goal === 'cut') {
    protein = Math.round(weight * 2.2);
    fat = Math.round(weight * 0.8);
    carbs = Math.round((target - protein * 4 - fat * 9) / 4);
  } else if (goal === 'bulk') {
    protein = Math.round(weight * 2.0);
    fat = Math.round(weight * 1.0);
    carbs = Math.round((target - protein * 4 - fat * 9) / 4);
  } else {
    protein = Math.round(weight * 1.8);
    fat = Math.round(weight * 0.9);
    carbs = Math.round((target - protein * 4 - fat * 9) / 4);
  }
  carbs = Math.max(carbs, 50);

  // BMI category
  let cat, catClass;
  if (bmi < 18.5) { cat = 'Underweight'; catClass = 'warn'; }
  else if (bmi < 25) { cat = 'Normal weight'; catClass = 'good'; }
  else if (bmi < 30) { cat = 'Overweight'; catClass = 'warn'; }
  else { cat = 'Obese'; catClass = 'bad'; }

  // Render
  document.getElementById('resBmi').textContent = bmiRound;
  document.getElementById('resBmi').className = 'stat-value ' + catClass;
  document.getElementById('resBmr').textContent = Math.round(bmr);
  document.getElementById('resTdee').textContent = tdee;
  document.getElementById('resTarget').textContent = target;
  document.getElementById('resTarget').className = 'stat-value ' + (goal === 'cut' ? 'warn' : goal === 'bulk' ? 'good' : 'acc');

  // Gauge
  const pct = Math.min(Math.max((bmi - 16) / (40 - 16) * 100, 0), 100);
  document.getElementById('gaugeMarker').style.left = pct + '%';
  document.getElementById('gaugeValue').textContent = bmiRound;
  document.getElementById('gaugeValue').style.color = catClass === 'good' ? 'var(--good)' : catClass === 'warn' ? 'var(--warn)' : 'var(--bad)';
  document.getElementById('gaugeCategory').textContent = cat;

  // Macros
  document.getElementById('macroProtein').textContent = protein;
  document.getElementById('macroFat').textContent = fat;
  document.getElementById('macroCarbs').textContent = carbs;
  const maxMacro = Math.max(protein, fat, carbs);
  setTimeout(() => {
    document.getElementById('macroProteinBar').style.width = (protein / maxMacro * 100) + '%';
    document.getElementById('macroFatBar').style.width = (fat / maxMacro * 100) + '%';
    document.getElementById('macroCarbsBar').style.width = (carbs / maxMacro * 100) + '%';
  }, 100);

  document.getElementById('bodyResults').style.display = 'block';
  document.getElementById('bodyResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========== FOOD ANALYZER ==========
function analyzeFood(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('foodImg');
    img.src = e.target.result;
    document.getElementById('foodPreview').style.display = 'block';

    // Canvas analysis
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let totalR = 0, totalG = 0, totalB = 0;
      let brightPixels = 0, darkPixels = 0;
      const pixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i]; totalG += data[i+1]; totalB += data[i+2];
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
        if (brightness > 180) brightPixels++;
        if (brightness < 60) darkPixels++;
      }

      const avgR = Math.round(totalR / pixels);
      const avgG = Math.round(totalG / pixels);
      const avgB = Math.round(totalB / pixels);
      const brightness = (avgR + avgG + avgB) / 3;

      // Color-based food heuristics
      let detectedItems = [];
      let totalCal = 0;

      // Warm colors (browns, yellows, oranges) = carbs/grains/meat
      if (avgR > avgG && avgR > avgB && avgR > 100) {
        detectedItems.push({ name: '🍚 Carbs / Grains', cal: 200 });
        totalCal += 200;
      }
      // Green = vegetables
      if (avgG > avgR && avgG > avgB && avgG > 80) {
        detectedItems.push({ name: '🥗 Vegetables / Salad', cal: 80 });
        totalCal += 80;
      }
      // Yellow/orange = protein or fat
      if (avgR > 150 && avgG > 100 && avgB < 100) {
        detectedItems.push({ name: '🍗 Protein (Chicken/Fish)', cal: 250 });
        totalCal += 250;
      }
      // Dark areas = sauce/gravy
      if (darkPixels / pixels > 0.3) {
        detectedItems.push({ name: '🫕 Sauce / Gravy', cal: 60 });
        totalCal += 60;
      }
      // High brightness = white carbs (rice, bread)
      if (brightness > 160) {
        detectedItems.push({ name: '🍞 White Carbs (Rice/Bread)', cal: 180 });
        totalCal += 180;
      }
      // Red tones = tomato/meat
      if (avgR > 140 && avgG < 100 && avgB < 100) {
        detectedItems.push({ name: '🥩 Red Meat / Tomato', cal: 220 });
        totalCal += 220;
      }
      // Fallback
      if (detectedItems.length === 0) {
        detectedItems.push({ name: '🍽️ Mixed Meal', cal: 350 });
        totalCal = 350;
      }

      // Send to MiMo for detailed analysis
      const analysisPrompt = `You are a nutrition expert. Based on this food image color analysis:
- Dominant colors: RGB(${avgR}, ${avgG}, ${avgB})
- Brightness: ${Math.round(brightness)}/255
- Detected likely items: ${detectedItems.map(d => d.name).join(', ')}
- Estimated total calories: ${totalCal} kcal

Provide a brief nutritional analysis with:
1. What this meal likely contains
2. Calorie estimate (kcal)
3. Protein estimate (g)
4. One health tip

Keep it concise, under 100 words total.`;

      fetch(MIMO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [{ role: 'user', content: analysisPrompt }],
          referrer: APP_NAME
        })
      })
      .then(r => r.text())
      .then(aiText => {
        let html = '<div class="food-analysis">';
        detectedItems.forEach(item => {
          html += `<div class="food-item"><span class="food-item-name">${item.name}</span><span class="food-item-cal">${item.cal} kcal</span></div>`;
        });
        html += `<div class="food-total"><span>Estimated Total</span><span class="total-val">${totalCal} kcal</span></div>`;
        html += `<div class="food-tips"><strong>🧠 MiMo Analysis:</strong><br>${aiText.replace(/\n/g, '<br>')}</div>`;
        html += '</div>';
        document.getElementById('foodResults').innerHTML = html;
        document.getElementById('foodResults').style.display = 'block';
      })
      .catch(() => {
        let html = '<div class="food-analysis">';
        detectedItems.forEach(item => {
          html += `<div class="food-item"><span class="food-item-name">${item.name}</span><span class="food-item-cal">${item.cal} kcal</span></div>`;
        });
        html += `<div class="food-total"><span>Estimated Total</span><span class="total-val">${totalCal} kcal</span></div>`;
        html += '<div class="food-tips"><strong>💡 Tip:</strong> For more accurate results, ensure good lighting when taking food photos.</div>';
        html += '</div>';
        document.getElementById('foodResults').innerHTML = html;
        document.getElementById('foodResults').style.display = 'block';
      });
    };
  };
  reader.readAsDataURL(file);
}

// ========== WORKOUT GENERATOR ==========
function generateWorkout() {
  const goal = document.getElementById('workoutGoal').value;
  const days = parseInt(document.getElementById('workoutDays').value);
  const level = document.getElementById('workoutLevel').value;
  const equip = document.getElementById('workoutEquip').value;

  const btn = event.target;
  btn.classList.add('btn-loading');
  btn.textContent = '⏳ Generating...';

  const goalNames = { muscle: 'Hypertrophy', strength: 'Strength', 'fat-loss': 'Fat Loss', endurance: 'Endurance', general: 'General Fitness' };
  const equipNames = { 'full-gym': 'Full Gym', 'home-basic': 'Dumbbells + Bench', 'bodyweight': 'Bodyweight Only' };

  const prompt = `You are an expert fitness coach. Create a ${days}-day workout split for:
- Goal: ${goalNames[goal]}
- Level: ${level}
- Equipment: ${equipNames[equip]}

For each day, provide:
- Day name and focus (e.g. "Day 1: Push (Chest, Shoulders, Triceps)")
- 5-6 exercises with sets × reps
- Rest time between sets

Format STRICTLY as JSON array:
[
  {
    "day": "Day 1",
    "focus": "Push",
    "badge": "push",
    "exercises": [
      {"name": "Bench Press", "sets": "4", "reps": "8-10", "rest": "90s"}
    ]
  }
]

Use badge values: push, pull, legs, cardio, rest, full
Keep it practical and progressive.`;

  fetch(MIMO_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [{ role: 'user', content: prompt }],
      referrer: APP_NAME
    })
  })
  .then(r => r.text())
  .then(text => {
    // Extract JSON from response
    let jsonStr = text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    try {
      const plan = JSON.parse(jsonStr);
      let html = '';
      plan.forEach(day => {
        const badgeClass = 'badge-' + (day.badge || 'push');
        html += `<div class="workout-day">`;
        html += `<h4>${day.day} <span class="badge ${badgeClass}">${day.focus}</span></h4>`;
        day.exercises.forEach(ex => {
          html += `<div class="exercise-row"><span class="exercise-name">${ex.name}</span><span class="exercise-detail">${ex.sets} × ${ex.reps} · Rest ${ex.rest}</span></div>`;
        });
        html += '</div>';
      });
      document.getElementById('workoutResults').innerHTML = html;
      document.getElementById('workoutResults').style.display = 'block';
    } catch(e) {
      // Fallback: render as text
      document.getElementById('workoutResults').innerHTML = `<div class="workout-day"><pre style="white-space:pre-wrap;font-size:13px;color:var(--muted)">${text}</pre></div>`;
      document.getElementById('workoutResults').style.display = 'block';
    }
    btn.classList.remove('btn-loading');
    btn.textContent = '🏋️ Generate Plan';
  })
  .catch(err => {
    document.getElementById('workoutResults').innerHTML = `<div class="workout-day" style="border-color:var(--bad)"><p style="color:var(--bad)">Error: ${err.message}. Please try again.</p></div>`;
    document.getElementById('workoutResults').style.display = 'block';
    btn.classList.remove('btn-loading');
    btn.textContent = '🏋️ Generate Plan';
  });
}

// ========== PROGRESS TRACKER ==========
function getProgress() {
  return JSON.parse(localStorage.getItem('mimofit-progress') || '[]');
}
function saveProgress(data) {
  localStorage.setItem('mimofit-progress', JSON.stringify(data));
}
function logProgress() {
  const exercise = document.getElementById('progExercise').value;
  const weight = parseFloat(document.getElementById('progWeight').value);
  const sets = parseInt(document.getElementById('progSets').value);
  const reps = parseInt(document.getElementById('progReps').value);
  const date = document.getElementById('progDate').value || new Date().toISOString().split('T')[0];

  if (!weight || !sets || !reps) { alert('Please fill all fields'); return; }

  const data = getProgress();
  data.push({ exercise, weight, sets, reps, date, id: Date.now() });
  saveProgress(data);

  // Clear inputs
  document.getElementById('progWeight').value = '';
  document.getElementById('progSets').value = '';
  document.getElementById('progReps').value = '';

  renderProgress();
}
function deleteProgress(id) {
  let data = getProgress();
  data = data.filter(d => d.id !== id);
  saveProgress(data);
  renderProgress();
}
function renderProgress() {
  const data = getProgress();
  if (data.length === 0) {
    document.getElementById('progressTable').innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">No entries yet. Log your first workout!</p>';
    return;
  }

  // Group by exercise
  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.exercise]) grouped[d.exercise] = [];
    grouped[d.exercise].push(d);
  });

  let html = '<table class="progress-table"><thead><tr><th>Date</th><th>Exercise</th><th>Weight</th><th>Sets × Reps</th><th>1RM Est.</th><th>Change</th><th></th></tr></thead><tbody>';

  // Sort by date desc
  data.sort((a, b) => b.date.localeCompare(a.date));
  data.forEach((d, i) => {
    // Epley 1RM
    const orm = Math.round(d.weight * (1 + d.reps / 30));
    // Find previous entry for same exercise
    const prev = data.slice(i + 1).find(p => p.exercise === d.exercise);
    let change = '';
    if (prev) {
      const prevOrm = Math.round(prev.weight * (1 + prev.reps / 30));
      const diff = orm - prevOrm;
      if (diff > 0) change = `<span class="progress-up">+${diff} kg</span>`;
      else if (diff < 0) change = `<span class="progress-down">${diff} kg</span>`;
      else change = '<span style="color:var(--dim)">—</span>';
    }
    html += `<tr>
      <td>${d.date}</td>
      <td><strong>${d.exercise}</strong></td>
      <td style="font-family:var(--mono)">${d.weight} kg</td>
      <td style="font-family:var(--mono)">${d.sets} × ${d.reps}</td>
      <td style="font-family:var(--mono)">${orm} kg</td>
      <td>${change}</td>
      <td><button class="delete-btn" onclick="deleteProgress(${d.id})">✕</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('progressTable').innerHTML = html;
}

// ========== CHAT ==========
function toggleChat() {
  document.getElementById('chatPanel').classList.toggle('open');
}
function quickChat(msg) {
  document.getElementById('chatInput').value = msg;
  sendChat();
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const messagesEl = document.getElementById('chatMessages');
  messagesEl.innerHTML += `<div class="chat-msg user">${escapeHtml(msg)}</div>`;
  input.value = '';
  messagesEl.scrollTop = messagesEl.scrollHeight;

  document.getElementById('chatTyping').classList.add('show');

  chatHistory.push({ role: 'user', content: msg });
  if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

  const systemMsg = { role: 'system', content: 'You are MiMo, a friendly AI fitness assistant. You give concise, practical advice about fitness, nutrition, workouts, recovery, and supplements. Keep responses under 100 words. Use emojis occasionally. Be encouraging and specific.' };

  fetch(MIMO_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [systemMsg, ...chatHistory],
      referrer: APP_NAME
    })
  })
  .then(r => r.text())
  .then(text => {
    document.getElementById('chatTyping').classList.remove('show');
    chatHistory.push({ role: 'assistant', content: text });
    messagesEl.innerHTML += `<div class="chat-msg bot">${text.replace(/\n/g, '<br>')}</div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  })
  .catch(err => {
    document.getElementById('chatTyping').classList.remove('show');
    messagesEl.innerHTML += `<div class="chat-msg bot" style="border-color:var(--bad)">Sorry, I couldn't connect. Please try again.</div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ========== INIT ==========
document.getElementById('progDate').valueAsDate = new Date();
renderProgress();

// Drag and drop
const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    document.getElementById('foodInput').files = e.dataTransfer.files;
    analyzeFood({ target: { files: e.dataTransfer.files } });
  }
});

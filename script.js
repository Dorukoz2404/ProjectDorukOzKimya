// --- GLOBAL ---
let score=0, timeLeft=75, timerInterval;
let selectedElements1=[], selectedElements2=[];
const completedReactions = new Set();
const elements=["H","O","C","N","Na","Cl","K","Ca","Fe","Mg","Zn","S","P","Li","Ag","Cu","Al","Si","Br","I","F","He","B","Ar","Ba","Cr","Pb","Hg","Mn","Co","Ni","Sn","Sr","Ti","V","W","Au","Pt","Se","Cs","Rb","O2"];
const reactions={
  "H,H,O":"H2O (Su)",
  "Na,Cl":"NaCl (Tuz)",
  "C,O,O":"CO2 (Karbondioksit)",
  "Fe,O,O,O":"Fe2O3 (Demir Oksit)",
  "Mg,O":"MgO (Magnezyum Oksit)",
  "K,Cl":"KCl (Potasyum Klorür)",
  "Ca,O":"CaO (Kalsiyum Oksit)",
  "H,H,S":"H2S (Hidrojen Sülfür)"
};
const reactionTypes={
  "H,H,O":"yanma",
  "C,O,O":"yanma",
  "Na,Cl":"asit-baz",
  "K,Cl":"asit-baz",
  "Ca,O":"asit-baz",
  "Mg,O":"asit-baz",
  "Fe,O,O,O":"indirgenme",
  "H,H,S":"indirgenme"
};

const app=document.getElementById("app");
const canvas=document.getElementById("reactionCanvas");
const ctx=canvas.getContext("2d");

// --- CANVAS AYAR ---
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener("resize",resizeCanvas);
resizeCanvas();

// --- START ---
function startApp(){
  selectedElements1=[];
  selectedElements2=[];
  score=0;
  timeLeft=75;
  completedReactions.clear();
  showRulesPage();
}

// --- KURALLAR SAYFASI ---
function showRulesPage(){
  app.innerHTML = `
    <h1>📜 Oyun Kuralları</h1>
    <div class="info-box">
      <p>1️⃣ Süre: 75 saniye boyunca tüm tepkimeleri tahmin etmeye çalışın.</p>
      <p>2️⃣ Puanlama: Doğru tahmin +4, Yanlış tahmin -1, Yanlış kombinasyon -1</p>
      <p>3️⃣ Element Seçimi: Bir elementten birden fazla gerekiyorsa tekrar tıklayarak ekleyebilirsiniz (ör. CO₂ için 2 O)</p>
      <p>4️⃣ Tepkime Türü Tahmini: Doğru → +2, Yanlış → -1, Boş → 0</p>
      <p>5️⃣ Tahmin: Molekül formülü veya açıklaması geçerli, büyük/küçük harf fark etmez</p>
      <p>6️⃣ Aynı kombinasyonu tekrar yapamazsınız</p>
      <p>7️⃣ Molekül animasyonunu izleyebilirsiniz</p>
      <p>8️⃣ Amaç: Doğru tahminlerle maksimum puanı toplamak</p>
    </div>
    <button onclick="showIntroPage1()">Devam Et ➡️</button>
  `;
}

// --- SAYFA 1 ---
function showIntroPage1(){
  app.innerHTML=`<h1>🧪 Kimya Keşifleri: Molekül Ustası</h1>
  <div class="info-box"><p>Kimyasal tepkimeleri keşfetmeye hazır mısın?</p></div>
  <button onclick="showIntroPage2()">Devam Et ➡️</button>`;
}

// --- SAYFA 2 ---
function showIntroPage2(){
  app.innerHTML=`<h1>🔬 Tepkime Örnekleri</h1>
  <div class="info-box">
    <p>🌿 H + O → H₂O</p>
    <p>🧂 Na + Cl → NaCl</p>
    <p>🔥 C + O₂ → CO₂</p>
  </div>
  <button onclick="showVideoPage()">Animasyonu İzle 🎬</button>`;
}

// --- SAYFA 3: VIDEO ---
function showVideoPage(){
  app.innerHTML=`<h1>🎬 Molekül Animasyonu</h1>
  <video id="introVideo" autoplay controls style="width:90%; max-width:600px; border-radius:12px; box-shadow:0 0 15px cyan;">
    <source src="molekul_animasyon.mp4" type="video/mp4">
    Tarayıcınız video etiketini desteklemiyor.
  </video>
  <br><button id="skipBtn" style="margin-top:15px;">Geç ➤</button>`;

  const video=document.getElementById("introVideo");
  const skipBtn=document.getElementById("skipBtn");

  video.addEventListener("ended", startGame);
  skipBtn.addEventListener("click", startGame);
}

// --- OYUN ---
function startGame(){
  app.innerHTML=`
    <h1>⚗️ Tepkime Tahmini</h1>
    <div class="score-timer">
      <div>⏱️ Süre: <span id="timer">${timeLeft}</span> sn</div>
      <div>⭐ Puan: <span id="score">${score}</span></div>
    </div>

    <div class="info-box">
      <h2>1. Tepkime Girişi</h2>
      <div class="molecule" id="input1"></div>
      <button onclick="openElementSelector(1)">+ Element Ekle</button>
    </div>

    <div class="info-box">
      <h2>2. Tepkime Girişi</h2>
      <div class="molecule" id="input2"></div>
      <button onclick="openElementSelector(2)">+ Element Ekle</button>
    </div>

    <div class="info-box">
      <h2>3. Tepkime Sonucu Tahmini</h2>
      <input type="text" id="reactionInput" placeholder="Oluşan bileşiği yaz...">
      <button onclick="checkReaction()">Tahmin Et ⚡</button>
    </div>

    <div class="info-box">
      <h2>4. Tepkime Türü Tahmini</h2>
      <input type="text" id="reactionTypeInput" placeholder="Örn: yanma, asit-baz, indirgenme">
    </div>

    <div class="info-box" id="resultBox"></div>
  `;

  updateMoleculeDisplay();
  startTimer();
}

// --- TIMER ---
function startTimer(){
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    if(timeLeft>0){
      timeLeft--;
      document.getElementById("timer").textContent=timeLeft;
    }else{
      clearInterval(timerInterval);
      gameOver();
    }
  },1000);
}

// --- ELEMENT SEÇİMİ ---
function openElementSelector(slot){
  app.innerHTML=`<h1>🔹 Element Seç</h1>
  <div class="element-selector">
    ${elements.map(el=>`<button class="element-btn" onclick="selectElement('${el}',${slot})">${el}</button>`).join("")}
  </div>
  <button onclick="startGame()">⬅️ Geri Dön</button>`;
}

// --- ELEMENT SEÇ ---
function selectElement(el,slot){
  if(slot===1) selectedElements1.push(el);
  else selectedElements2.push(el);
  startGame();
}

// --- MOLEKÜL GÖSTER ---
function updateMoleculeDisplay(){
  const input1Div=document.getElementById("input1");
  const input2Div=document.getElementById("input2");
  if(input1Div) input1Div.innerHTML=selectedElements1.map((el,idx)=>`${el} <button onclick="removeElement(1,${idx})">X</button>`).join(" ");
  if(input2Div) input2Div.innerHTML=selectedElements2.map((el,idx)=>`${el} <button onclick="removeElement(2,${idx})">X</button>`).join(" ");
}

// --- ELEMENT SİL ---
function removeElement(slot,idx){
  if(slot===1) selectedElements1.splice(idx,1);
  else selectedElements2.splice(idx,1);
  updateMoleculeDisplay();
}

// --- TEPKİME KONTROL ---
function checkReaction(){
  const resultBox = document.getElementById("resultBox");

  const countElements = {};
  [...selectedElements1, ...selectedElements2].forEach(el => {
    countElements[el] = (countElements[el] || 0) + 1;
  });
  const userKey = Object.keys(countElements)
                        .sort()
                        .map(el => Array(countElements[el]).fill(el).join(","))
                        .join(",");

  if(completedReactions.has(userKey)){
    resultBox.innerHTML = `⚠️ Bu tepkimeyi zaten yaptınız!`;
    return;
  }

  completedReactions.add(userKey);

  const userInput = document.getElementById("reactionInput").value.trim().toLowerCase();
  const userType = document.getElementById("reactionTypeInput").value.trim().toLowerCase();

  let found = false;
  for(let key in reactions){
    const reactionKey = key.split(",").sort().join(",");
    if(reactionKey === userKey){
      found = true;

      const parts = reactions[key].split(" ");
      const formula = parts[0].toLowerCase();        
      const name = parts.slice(1).join(" ").toLowerCase().replace(/[()]/g,""); 

      // ✅ Tepkime sonucu kontrol
      if(userInput === formula || userInput === name){
        resultBox.innerHTML = `✅ Doğru! Oluşan bileşik: <b>${reactions[key]}</b>`;
        score += 4;
      } else if(userInput==="") {} // boş → 0
      else {
        resultBox.innerHTML = `❌ Yanlış tahmin! Doğru bileşik: <b>${reactions[key]}</b>`;
        score -= 1;
      }

      // ✅ Tepkime türü kontrol
      const correctType = reactionTypes[key];
      if(userType===correctType){
        score +=2;
      } else if(userType==="") {} // boş → 0
      else {score -=1;}

      document.getElementById("score").textContent = score;

      // ✅ Canvas animasyon
      if(["yanma","indirgenme","asit-baz"].includes(correctType)){
        playReactionAnimation(correctType);
      }

      break;
    }
  }

  if(!found){
    resultBox.innerHTML = `❌ Yanlış kombinasyon! Tekrar dene.`;
    score -= 1;
    document.getElementById("score").textContent = score;
  }
}

// --- CANVAS ANİMASYON ---
function playReactionAnimation(type){
  const particles=[];
  const colors={
    "yanma":"orange",
    "indirgenme":"yellow",
    "asit-baz":"cyan"
  };

  for(let i=0;i<100;i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      dx:(Math.random()-0.5)*4,
      dy:(Math.random()-0.5)*4,
      radius:2+Math.random()*3,
      color:colors[type]
    });
  }

  let duration=0;
  function animate(){
    duration++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x+=p.dx;
      p.y+=p.dy;
      p.radius*=0.96;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
      ctx.fillStyle=p.color;
      ctx.fill();
    });
    if(duration<120){ // ~2 saniye
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }
  animate();
}

// --- GAME OVER ---
function gameOver(){
  app.innerHTML=`<h1>🎉 Süre Doldu!</h1>
  <div class="info-box"><p>Toplam Puanın: <b>${score}</b></p></div>
  <button onclick="startApp()">Yeniden Oyna 🔁</button>`;
}

// --- BAŞLAT ---
startApp();
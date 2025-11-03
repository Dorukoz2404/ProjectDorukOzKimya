// --- GLOBAL ---
let score = 0, timeLeft = 75, timerInterval;
let selectedElements1 = [], selectedElements2 = [];
let selectedReactionType = "";
const completedReactions = new Set();
const playerReactions = [];

// Element ve reaksiyon verileri
const elements = ["H","O","C","N","Na","Cl","K","Ca","Fe","Mg","Zn","S","P","Li","Ag","Cu","Al","Si","Br","I","F","He","B","Ar","Ba","Cr","Pb","Hg","Mn","Co","Ni","Sn","Sr","Ti","V","W","Au","Pt","Se","Cs","Rb"];
const reactions = {
  "H,H,O": {formula:"H2O", name:"Su", type:"Yanma", harmful:false, explanation:"Su tepkimesi zararsızdır."},
  "Na,Cl": {formula:"NaCl", name:"Tuz", type:"Asit-Baz", harmful:false, explanation:"Tuz tepkimesi çevreye zarar vermez."},
  "C,O,O": {formula:"CO2", name:"Karbondioksit", type:"Yanma", harmful:true, explanation:"CO2 atmosfere salınır ve sera etkisine katkı sağlar."},
  "Fe,O,O,O": {formula:"Fe2O3", name:"Demir Oksit", type:"Oksidasyon", harmful:false, explanation:"Demir oksit doğada zararsızdır."},
  "Mg,O": {formula:"MgO", name:"Magnezyum Oksit", type:"Yanma", harmful:false, explanation:"Magnezyum oksit çevreye zarar vermez."},
  "K,Cl": {formula:"KCl", name:"Potasyum Klorür", type:"Asit-Baz", harmful:false, explanation:"Potasyum klorür güvenlidir."},
  "Ca,O": {formula:"CaO", name:"Kalsiyum Oksit", type:"Yanma", harmful:false, explanation:"Kalsiyum oksit zararsızdır."},
  "H,H,S": {formula:"H2S", name:"Hidrojen Sülfür", type:"Yanma", harmful:true, explanation:"H2S toksik gazdır ve çevreye zarar verir."}
};

const app = document.getElementById("app");

// --- START ---
function startApp(){
  selectedElements1 = [];
  selectedElements2 = [];
  selectedReactionType = "";
  score = 0;
  timeLeft = 75;
  completedReactions.clear();
  playerReactions.length = 0;
  showRulesPage();
}

// --- KURALLAR ---
function showRulesPage(){
  app.innerHTML = `
    <h1>📜 Oyun Kuralları</h1>
    <div class="info-box">
      <p>1️⃣ Süre: 75 saniye boyunca tüm tepkimeleri tahmin edin.</p>
      <p>2️⃣ Puanlama: Doğru tahmin +4, Yanlış tahmin -1, Yanlış kombinasyon -1</p>
      <p>3️⃣ Tepkime türünü seçin: Yanma, Asit-Baz, Oksidasyon, vs.</p>
      <p>4️⃣ Elementleri seçip tepkimeyi tahmin edin.</p>
      <p>5️⃣ Aynı kombinasyonu tekrar yapamazsınız.</p>
      <p>6️⃣ Tepkimelerin çevreye etkisi göz önünde bulundurarak yapılması önerilir.</p>
    </div>
    <button onclick="showIntroPage1()">Devam Et ➡️</button>
  `;
}

// --- SAYFA 1 ---
function showIntroPage1(){
  app.innerHTML = `<h1>🧪 Kimya Keşifleri: Molekül Ustası</h1>
    <div class="info-box"><p>Kimyasal tepkimeleri keşfetmeye hazır mısın?</p></div>
    <button onclick="showIntroPage2()">Devam Et ➡️</button>`;
}

// --- SAYFA 2 ---
function showIntroPage2(){
  app.innerHTML = `<h1>🔬 Tepkime Örnekleri</h1>
    <div class="info-box">
      <p>🌿 H + O → H₂O</p>
      <p>🧂 Na + Cl → NaCl</p>
      <p>🔥 C + O → CO2</p>
    </div>
    <button onclick="showVideoPage()">Animasyonu İzle 🎬</button>`;
}

// --- SAYFA 3: VIDEO ---
function showVideoPage(){
  app.innerHTML = `<h1>🎬 Molekül Animasyonu</h1>
    <video id="introVideo" autoplay controls>
      <source src="molekul_animasyon.mp4" type="video/mp4">
      Tarayıcınız video etiketini desteklemiyor.
    </video>
    <br><button id="skipBtn">Geç ➤</button>`;
  const video = document.getElementById("introVideo");
  const skipBtn = document.getElementById("skipBtn");
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
      <h2>3. Tepkime Türü</h2>
      <button onclick="selectReactionType('Yanma')">Yanma</button>
      <button onclick="selectReactionType('Asit-Baz')">Asit-Baz</button>
      <button onclick="selectReactionType('Oksidasyon')">Oksidasyon</button>
    </div>

    <div class="info-box">
      <h2>4. Tepkime Sonucu Tahmini</h2>
      <input type="text" id="reactionInput" placeholder="Oluşan bileşiği yaz...">
      <button onclick="checkReaction()">Tahmin Et ⚡</button>
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
      showPostGameScreen();
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

function selectElement(el,slot){
  if(slot===1) selectedElements1.push(el);
  else selectedElements2.push(el);
  startGame();
}

function updateMoleculeDisplay(){
  const input1Div=document.getElementById("input1");
  const input2Div=document.getElementById("input2");
  if(input1Div) input1Div.innerHTML=selectedElements1.map((el,idx)=>`${el} <button onclick="removeElement(1,${idx})">X</button>`).join(" ");
  if(input2Div) input2Div.innerHTML=selectedElements2.map((el,idx)=>`${el} <button onclick="removeElement(2,${idx})">X</button>`).join(" ");
}

function removeElement(slot,idx){
  if(slot===1) selectedElements1.splice(idx,1);
  else selectedElements2.splice(idx,1);
  updateMoleculeDisplay();
}

function selectReactionType(type){
  selectedReactionType = type;
  alert(`Tepkime türü seçildi: ${type}`);
}

// --- TEPKİME KONTROL ---
function checkReaction(){
  const resultBox = document.getElementById("resultBox");
  const countElements = {};
  [...selectedElements1, ...selectedElements2].forEach(el => {
    countElements[el] = (countElements[el] || 0) + 1;
  });
  const userKey = Object.keys(countElements).sort().map(el=>Array(countElements[el]).fill(el).join(",")).join(",");
  if(completedReactions.has(userKey)){
    resultBox.innerHTML = `⚠️ Bu tepkimeyi zaten yaptınız!`;
    return;
  }
  completedReactions.add(userKey);

  const userInputFormula = document.getElementById("reactionInput").value.trim().toLowerCase();
  let found = false;
  for(let key in reactions){
    const reactionKey = key.split(",").sort().join(",");
    if(reactionKey===userKey){
      found = true;
      const data = reactions[key];
      const correctFormula = (userInputFormula === data.formula.toLowerCase() || userInputFormula === data.name.toLowerCase());
      const correctType = (selectedReactionType === data.type);

      if(correctFormula && correctType){
        resultBox.innerHTML = `✅ Bileşik ve tür doğru! ${data.formula} (${data.name}) - Tür: ${data.type}`;
        score +=4;
      } else if(correctFormula && !correctType){
        resultBox.innerHTML = `⚠️ Bileşik doğru ama tür yanlış! Doğru tür: ${data.type}`;
        score +=3;
      } else {
        resultBox.innerHTML = `❌ Yanlış tahmin! Doğru bileşik: ${data.formula} (${data.name}), Tür: ${data.type}`;
        score -=1;
      }
      playerReactions.push({key, ...data});
      break;
    }
  }
  if(!found){
    resultBox.innerHTML = `❌ Yanlış kombinasyon! Tekrar deneyin.`;
    score -=1;
  }
  document.getElementById("score").textContent = score;
}

// --- OYUN SONU VE ÇEVRE EKRANI ---
function showPostGameScreen(){
  app.innerHTML=`<h1>⏱️ Süre Doldu!</h1>
  <div class="info-box">
    <p>Toplam Puanınız: <b>${score}</b></p>
  </div>`;
  setTimeout(showEnvironmentalImpactScreen, 3000);
}

function showEnvironmentalImpactScreen(){
  let harmfulReactions = playerReactions.filter(r=>r.harmful);
  let html = `<h1>🌍 Çevresel Etki</h1>
    <div class="info-box">`;
  if(harmfulReactions.length===0){
    html += `<p>Tüm yaptığınız tepkimeler çevre için güvenlidir.</p>`;
  } else {
    html += `<p>Yaptığınız bazı tepkimeler çevreye zarar verdi:</p>`;
    harmfulReactions.forEach(r=>{
      html += `<p>⚠️ ${r.formula} (${r.name}) → ${r.explanation} (-1 ceza uygulanabilir)</p>`;
    });
  }
  html += `</div><button onclick="showFinalScore()">Sonucu Göster ➤</button>`;
  app.innerHTML = html;
}

function showFinalScore(){
  app.innerHTML = `<h1>🏁 Oyun Sonucu</h1>
  <div class="info-box">
    <p>Toplam Skorunuz: <b>${score}</b></p>
    <p>Çevreye zararlı tepkimelerden dolayı ceza puanları zaten uygulandı.</p>
  </div>
  <button onclick="startApp()">🔄 Tekrar Oyna</button>`;
}

startApp();

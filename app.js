(() => {
  "use strict";

  const CONFIG = { correctPoints: 10, wrongPenalty: 5, fallDurationMs: 4800, nextItemDelayMs: 700, questionsPerGame: 10 };

  const BINS = {
    plastic_bottle: { name: "ทิ้งขวดพลาสติก", short: "ทิ้งขวดพลาสติก" },
    food: { name: "ขยะเศษอาหาร", short: "เศษอาหาร" },
    glass: { name: "ขยะรีไซเคิล ขวดแก้ว", short: "ขวดแก้ว" },
    cans: { name: "ขยะรีไซเคิล กระป๋อง", short: "กระป๋อง" },
    paper: { name: "ขยะรีไซเคิล กล่องกระดาษ/กระดาษ", short: "กระดาษ" },
    burnable: { name: "ขยะเชื้อเพลิง", short: "เชื้อเพลิง" },
    general: { name: "ขยะทั่วไป", short: "ทั่วไป" },
    hazardous: { name: "ขยะอันตราย", short: "อันตราย" }
  };

  const ITEMS = [
    { id: "glass", name: "ขวดแก้ว", image: "assets/trash_glass.png", bin: "glass", explanation: "ขวดหรือภาชนะแก้วที่สะอาด ไม่มีเศษอาหารหรือของเหลว" },
    { id: "cans", name: "กระป๋องเหล็ก/อะลูมิเนียม", image: "assets/trash_can.png", bin: "cans", explanation: "กระป๋องเครื่องดื่มและกระป๋องอาหาร ล้างให้สะอาดก่อนทิ้ง" },
    { id: "paper", name: "กระดาษเอกสาร", image: "assets/trash_paper.png", bin: "paper", explanation: "กระดาษแห้ง สะอาด รีไซเคิลได้" },
    { id: "plastic_bag", name: "ถุงพลาสติก", image: "assets/trash_plastic_bag.png", bin: "burnable", explanation: "ถุงพลาสติกสะอาด รีไซเคิลยาก เหมาะสำหรับผลิตเชื้อเพลิง" },
    { id: "utensils", name: "หลอด ตะเกียบ ช้อน ส้อม พลาสติก", image: "assets/trash_utensils.png", bin: "burnable", explanation: "พลาสติกใช้แล้ว รีไซเคิลได้ยาก" },
    { id: "tissue", name: "กระดาษทิชชู่", image: "assets/trash_tissue.png", bin: "general", explanation: "กระดาษใช้แล้ว ไม่สามารถรีไซเคิลได้" },
    { id: "food_container", name: "กล่องใส่อาหาร (เทอาหารออกแล้ว)", image: "assets/trash_food_container.png", bin: "burnable", explanation: "ภาชนะพลาสติกหรือโฟมที่เทเศษอาหารออกแล้ว" },
    { id: "battery", name: "ถ่านไฟฉาย", image: "assets/trash_battery.png", bin: "hazardous", explanation: "มีสารเคมี ต้องแยกทิ้งเฉพาะ" },
    { id: "curry_bag_clean", name: "ซองขนม/ซองเครื่องปรุง/ถุงแกง (เทเศษออกแล้ว)", image: "assets/trash_curry_bag_clean.png", bin: "burnable", explanation: "ซองพลาสติกหลายชั้น รีไซเคิลไม่ได้" },
    { id: "food_waste", name: "เศษอาหาร", image: "assets/trash_food_waste.png", bin: "food", explanation: "เศษอาหาร ผัก ผลไม้ และของเหลือจากการรับประทาน" },
    { id: "snack_wrapper", name: "ซองขนม/ซองเครื่องปรุง (เทเศษออกแล้ว)", image: "assets/trash_snack_wrapper.png", bin: "burnable", explanation: "บรรจุภัณฑ์ฟิล์มหลายชั้น รีไซเคิลยาก" },
    { id: "pet_bottle", name: "ขวดน้ำพลาสติก (เทน้ำออกแล้ว)", image: "assets/trash_pet_bottle.png", bin: "plastic_bottle", explanation: "ขวดน้ำดื่มหรือน้ำอัดลม เทน้ำออก บีบแบน และปิดฝา" },
    { id: "milk_bottle", name: "ขวดนมพลาสติก", image: "assets/trash_milk_bottle.png", bin: "plastic_bottle", explanation: "ขวดนม ล้างสะอาด และเทของเหลวออกก่อนทิ้ง" },
    { id: "large_bone", name: "กระดูกชิ้นใหญ่", image: "assets/trash_bone.png", bin: "general", explanation: "ย่อยสลายยาก ไม่ควรทิ้งรวมกับเศษอาหาร" },
    { id: "food_bag_dirty", name: "ถุง/ซองเครื่องปรุง ถุงแกง (มีเศษอาหาร)", image: "assets/trash_food_bag_dirty.png", bin: "general", explanation: "มีการปนเปื้อนของเศษอาหาร ไม่เหมาะนำไปผลิตเชื้อเพลิง" }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const screens = { registration: $("#registrationScreen"), menu: $("#menuScreen"), intro: $("#introScreen"), help: $("#helpScreen"), fall: $("#fallGameScreen"), quiz: $("#quizGameScreen"), result: $("#resultScreen") };

  const state = {
    player: null, muted: false, activeGame: null, pendingGame: null, replayAction: null,
    fall: { items: [], score: 0, completed: 0, wrong: 0, queue: [], current: null, accepting: false, running: false, animationId: null, y: -160, duration: 4800, startedAt: 0 },
    quiz: { items: [], index: 0, score: 0, correct: 0, accepting: false }
  };

  const registrationForm = $("#registrationForm");
  const firstNameInput = $("#firstName");
  const surnameInput = $("#surname");
  const employeeIdInput = $("#employeeId");
  const branchInput = $("#branch");
  const phoneInput = $("#phone");
  const dataConsentInput = $("#dataConsent");
  const registerButton = $("#registerButton");
  const registerError = $("#registerError");
  const reportStatus = $("#reportStatus");
  const resultReportNote = $("#resultReportNote");
  const menuPlayerName = $("#menuPlayerName");
  const fallBestMenu = $("#fallBestMenu");
  const quizBestMenu = $("#quizBestMenu");
  const menuSoundButton = $("#menuSoundButton");
  const fallSoundButton = $("#fallSoundButton");
  const quizSoundButton = $("#quizSoundButton");
  const fallButtons = $$('.bin-button[data-game="fall"]');
  const quizButtons = $$('.bin-button[data-game="quiz"]');
  const REPORT_CONFIG = window.CGQ_CONFIG || {};
  let reportQueueIsSending = false;
  let audioContext = null;

  function isReportApiConfigured() { return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(String(REPORT_CONFIG.API_URL || "").trim()); }
  function createId(prefix = "EVT") { return window.crypto?.randomUUID ? `${prefix}-${window.crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
  function localSessionId() { return `LOCAL-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`; }
  function setReportStatus(type, text) { if (!reportStatus) return; reportStatus.className = `report-status ${type}`; reportStatus.textContent = text; }

  async function apiRequest(payload) {
    if (!isReportApiConfigured()) throw new Error("ยังไม่ได้ตั้งค่า Google Apps Script URL");
    const response = await fetch(REPORT_CONFIG.API_URL, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("ระบบรายงานตอบกลับไม่ถูกต้อง"); }
    if (!data.ok) throw new Error(data.message || "บันทึกข้อมูลไม่สำเร็จ");
    return data;
  }

  function getPendingEvents() { try { return JSON.parse(localStorage.getItem("central_people_pending_events") || "[]"); } catch { return []; } }
  function savePendingEvents(events) { localStorage.setItem("central_people_pending_events", JSON.stringify(events)); }
  function queueReportEvent(payload) {
    if (!isReportApiConfigured() || !state.player?.sessionId) return;
    const queue = getPendingEvents();
    queue.push({ ...payload, sessionId: state.player.sessionId, clientEventId: payload.clientEventId || createId("EVT") });
    savePendingEvents(queue); flushReportQueue();
  }
  async function flushReportQueue() {
    if (reportQueueIsSending || !isReportApiConfigured() || !navigator.onLine) return;
    reportQueueIsSending = true; setReportStatus("syncing", "รายงาน: กำลังบันทึกข้อมูล");
    try {
      let queue = getPendingEvents();
      while (queue.length) {
        try { await apiRequest(queue[0]); queue.shift(); savePendingEvents(queue); }
        catch (error) { console.warn("Report sync paused:", error); break; }
      }
      if (!queue.length) { setReportStatus("online", "รายงาน: บันทึกลง Google Sheets แล้ว"); if (resultReportNote) resultReportNote.textContent = "ผลการเล่นถูกส่งไปยังระบบรายงานแล้ว"; }
      else { setReportStatus("error", "รายงาน: รอส่งข้อมูลเมื่อออนไลน์"); if (resultReportNote) resultReportNote.textContent = "ผลการเล่นถูกเก็บไว้และจะส่งใหม่อัตโนมัติ"; }
    } finally { reportQueueIsSending = false; }
  }
  function reportAnswer(game, item, selectedBin, eventType) { queueReportEvent({ action: "answer", game, itemId: item.id, selectedBin: selectedBin || "", eventType }); }
  function reportGameCompletion(game) { queueReportEvent({ action: "complete", game, clientEventId: createId("COMPLETE") }); }
  async function checkReportConnection() {
    if (!isReportApiConfigured()) { setReportStatus("offline", "รายงาน: ยังไม่เชื่อม Google Sheets"); return; }
    setReportStatus("syncing", "รายงาน: กำลังตรวจสอบการเชื่อมต่อ");
    try { await apiRequest({ action: "health" }); setReportStatus("online", "รายงาน: เชื่อม Google Sheets แล้ว"); flushReportQueue(); }
    catch (error) { setReportStatus("error", "รายงาน: เชื่อมต่อไม่สำเร็จ"); console.warn(error); }
  }
  window.addEventListener("online", () => { checkReportConnection(); flushReportQueue(); });

  function showScreen(name) { Object.entries(screens).forEach(([key, element]) => element.classList.toggle("hidden", key !== name)); }
  function sanitizePhone(value) { return value.replace(/\D/g, "").slice(0, 10); }
  function firstName(name) { return (name || "ผู้เล่น").trim().split(/\s+/)[0]; }
  function loadPlayer() {
    try {
      const raw = sessionStorage.getItem("central_people_player_session");
      if (!raw) return null;
      const player = JSON.parse(raw);
      return player.firstName && player.surname && player.employeeId && player.branch && player.phone && player.sessionId ? player : null;
    } catch { return null; }
  }
  function savePlayer(player) { sessionStorage.setItem("central_people_player_session", JSON.stringify(player)); }
  function updatePlayerUI() { const name = firstName(state.player?.firstName); menuPlayerName.textContent = name; $("#fallPlayerName").textContent = name; $("#quizPlayerName").textContent = name; updateBestScores(); }
  function updateBestScores() { fallBestMenu.textContent = String(getBest("fall")); quizBestMenu.textContent = String(getBest("quiz")); }
  function getBest(mode) { return Number(localStorage.getItem(`central_people_best_${mode}`) || 0); }
  function setBest(mode, score) { const best = Math.max(getBest(mode), score); localStorage.setItem(`central_people_best_${mode}`, String(best)); return best; }

  function setMuted(value) { state.muted = value; const icon = value ? "🔇" : "🔊"; [menuSoundButton, fallSoundButton, quizSoundButton].forEach(button => { button.textContent = icon; button.setAttribute("aria-label", value ? "เปิดเสียง" : "ปิดเสียง"); }); }
  function toggleSound() { setMuted(!state.muted); }
  [menuSoundButton, fallSoundButton, quizSoundButton].forEach(button => button.addEventListener("click", toggleSound));

  function populateBranches() {
    (Array.isArray(REPORT_CONFIG.BRANCHES) ? REPORT_CONFIG.BRANCHES : []).forEach(branch => { const option = document.createElement("option"); option.value = branch; option.textContent = branch; branchInput.appendChild(option); });
  }
  populateBranches();
  phoneInput.addEventListener("input", () => { phoneInput.value = sanitizePhone(phoneInput.value); });

  registrationForm.addEventListener("submit", async event => {
    event.preventDefault(); registerError.textContent = "";
    const firstNameValue = firstNameInput.value.trim();
    const surnameValue = surnameInput.value.trim();
    const employeeId = employeeIdInput.value.trim();
    const selectedBranch = branchInput.value;
    const phone = sanitizePhone(phoneInput.value);
    if (!firstNameValue) { registerError.textContent = "กรุณากรอกชื่อ"; firstNameInput.focus(); return; }
    if (!surnameValue) { registerError.textContent = "กรุณากรอกนามสกุล"; surnameInput.focus(); return; }
    if (!employeeId) { registerError.textContent = "กรุณากรอกรหัสพนักงาน"; employeeIdInput.focus(); return; }
    if (!selectedBranch) { registerError.textContent = "กรุณาเลือกรหัสสาขา"; branchInput.focus(); return; }
    if (phone.length < 9 || phone.length > 10) { registerError.textContent = "กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก"; phoneInput.focus(); return; }
    if (!dataConsentInput.checked) { registerError.textContent = "กรุณายืนยันความยินยอมในการเก็บข้อมูล"; dataConsentInput.focus(); return; }
    registerButton.disabled = true; registerButton.textContent = "กำลังลงทะเบียน...";
    const participantData = { firstName: firstNameValue, surname: surnameValue, employeeId, branch: selectedBranch, phone };
    // ส่งค่าภายในเพื่อให้ทำงานร่วมกับ Apps Script เวอร์ชันเก่าได้
    // แต่ไม่มีช่อง Sustainability Idea แสดงบนหน้าลงทะเบียน
    const registrationPayload = {
      ...participantData,
      sustainabilityIdea: "ไม่ได้เก็บข้อมูลในเวอร์ชันนี้"
    };
    try {
      let sessionId;
      if (isReportApiConfigured()) { const response = await apiRequest({ action: "register", ...registrationPayload }); sessionId = response.sessionId; setReportStatus("online", "รายงาน: ลงทะเบียนสำเร็จ"); }
      else { if (REPORT_CONFIG.REQUIRE_ONLINE_REPORTING) throw new Error("ผู้ดูแลยังไม่ได้เชื่อม Google Sheets กรุณาตั้งค่า config.js"); sessionId = localSessionId(); }
      state.player = { ...participantData, sessionId }; savePlayer(state.player); updatePlayerUI(); showScreen("menu"); flushReportQueue();
    } catch (error) { registerError.textContent = error.message || "ลงทะเบียนไม่สำเร็จ กรุณาลองอีกครั้ง"; }
    finally { registerButton.disabled = false; registerButton.textContent = "ลงทะเบียนและเริ่มเล่น"; }
  });

  $("#changePlayerButton").addEventListener("click", () => { stopAllGames(); sessionStorage.removeItem("central_people_player_session"); state.player = null; registrationForm.reset(); registerError.textContent = ""; showScreen("registration"); });
  $("#howToPlayButton").addEventListener("click", () => showScreen("help"));
  $("#closeHelpButton").addEventListener("click", () => showScreen("menu"));
  $("#openFallGameButton").addEventListener("click", () => openGameIntro("fall"));
  $("#openQuizGameButton").addEventListener("click", () => openGameIntro("quiz"));
  $("#introBackButton").addEventListener("click", returnToMenu);
  $("#introStartButton").addEventListener("click", () => { if (state.pendingGame === "fall") startFallGame(); else if (state.pendingGame === "quiz") startQuizGame(); });
  $("#fallBackButton").addEventListener("click", returnToMenu);
  $("#quizBackButton").addEventListener("click", returnToMenu);
  $("#resultMenuButton").addEventListener("click", returnToMenu);
  $("#resultReplayButton").addEventListener("click", () => { if (typeof state.replayAction === "function") state.replayAction(); });
  fallButtons.forEach(button => button.addEventListener("click", () => chooseFallBin(button.dataset.bin, button)));
  quizButtons.forEach(button => button.addEventListener("click", () => chooseQuizBin(button.dataset.bin, button)));
  $("#quizNextButton").addEventListener("click", nextQuizQuestion);

  document.addEventListener("keydown", event => {
    const keyMap = { "1": "plastic_bottle", "2": "food", "3": "glass", "4": "cans", "5": "paper", "6": "burnable", "7": "general", "8": "hazardous" };
    const bin = keyMap[event.key]; if (!bin) return;
    if (state.activeGame === "fall" && state.fall.accepting) chooseFallBin(bin, fallButtons.find(item => item.dataset.bin === bin));
    else if (state.activeGame === "quiz" && state.quiz.accepting) chooseQuizBin(bin, quizButtons.find(item => item.dataset.bin === bin));
  });

  function openGameIntro(game) {
    stopAllGames(); state.pendingGame = game;
    const fall = game === "fall";
    $("#introMode").textContent = fall ? "GAME 2" : "GAME 1";
    $("#introGameTitle").textContent = fall ? "เกมภารกิจขยะร่วง" : "เกมฝึกเลือกถัง";
    $("#introDescription").textContent = fall ? "ขยะจะร่วงลงมาทีละชิ้น กดเลือกประเภทให้ถูกก่อนขยะตกถึงพื้น" : "ดูภาพขยะทีละข้อ เลือกประเภทให้ถูก แล้วอ่านคำอธิบายสั้น ๆ";
    $("#introTip").textContent = fall ? "😊 แอบใบ้ให้: ขยะสะอาดบางชนิดนำไปรีไซเคิลหรือผลิตเชื้อเพลิงได้" : "📘 คำอธิบายอ้างอิงจากตาราง Trash.pdf";
    showScreen("intro");
  }
  function returnToMenu() { stopAllGames(); updatePlayerUI(); showScreen("menu"); }
  function stopAllGames() { stopFallGame(); state.quiz.accepting = false; state.activeGame = null; clearEffects(fallButtons); clearEffects(quizButtons); }
  function clearEffects(buttons) { buttons.forEach(button => { button.classList.remove("correct-bin", "wrong-bin"); button.disabled = false; }); }
  function shuffle(array) { for (let index = array.length - 1; index > 0; index -= 1) { const randomIndex = Math.floor(Math.random() * (index + 1)); [array[index], array[randomIndex]] = [array[randomIndex], array[index]]; } return array; }
  function selectRoundItems() { return shuffle([...ITEMS]).slice(0, CONFIG.questionsPerGame); }

  function startFallGame() {
    stopAllGames(); state.activeGame = "fall";
    const fall = state.fall; fall.items = selectRoundItems(); fall.score = 0; fall.completed = 0; fall.wrong = 0; fall.queue = [...fall.items]; fall.current = null; fall.accepting = false; fall.running = true; fall.duration = CONFIG.fallDurationMs;
    $("#fallScore").textContent = "0"; $("#fallCompleted").textContent = "0"; $("#fallTotal").textContent = String(fall.items.length); $("#fallFeedback").textContent = ""; updateFallStatus(); clearEffects(fallButtons); showScreen("fall"); window.setTimeout(spawnFallingItem, 350);
  }
  function stopFallGame() { const fall = state.fall; fall.running = false; fall.accepting = false; if (fall.animationId) { cancelAnimationFrame(fall.animationId); fall.animationId = null; } const element = $("#fallingItem"); if (element) { element.classList.add("hidden"); element.classList.remove("fly"); } }
  function spawnFallingItem() {
    const fall = state.fall; if (!fall.running) return; if (fall.completed >= fall.items.length || !fall.queue.length) { finishFallGame(); return; }
    clearEffects(fallButtons); $("#fallFeedback").textContent = ""; fall.current = fall.queue.shift(); fall.accepting = true;
    const element = $("#fallingItem"), image = $("#fallingImage"), label = $("#fallingLabel"); image.src = fall.current.image; image.alt = fall.current.name; label.textContent = fall.current.name; element.classList.remove("hidden", "fly"); element.style.opacity = "1";
    const zone = $("#fallZone"); fall.duration = CONFIG.fallDurationMs; fall.startedAt = performance.now(); fall.y = -160;
    const tick = now => { if (!fall.running || !fall.accepting) return; const ratio = Math.min((now - fall.startedAt) / fall.duration, 1); const maxY = Math.max(70, zone.clientHeight - 120); fall.y = -160 + (maxY + 160) * ratio; element.style.transform = `translate3d(-50%, ${fall.y}px, 0)`; if (ratio >= 1) return missFallingItem(); fall.animationId = requestAnimationFrame(tick); };
    fall.animationId = requestAnimationFrame(tick);
  }
  function chooseFallBin(bin, selectedButton) {
    const fall = state.fall; if (!fall.running || !fall.accepting || !fall.current || !selectedButton) return; fall.accepting = false; if (fall.animationId) { cancelAnimationFrame(fall.animationId); fall.animationId = null; }
    const correctButton = fallButtons.find(button => button.dataset.bin === fall.current.bin); const isCorrect = bin === fall.current.bin;
    if (isCorrect) { fall.score += CONFIG.correctPoints; fall.completed += 1; selectedButton.classList.add("correct-bin"); setFallFeedback(`ถูกต้อง! +${CONFIG.correctPoints} คะแนน`); playCorrectSound(); reportAnswer("game2", fall.current, bin, "answer"); }
    else { fall.score = Math.max(0, fall.score - CONFIG.wrongPenalty); fall.wrong += 1; fall.queue.push(fall.current); selectedButton.classList.add("wrong-bin"); correctButton.classList.add("correct-bin"); setFallFeedback(`ยังไม่ถูก - คำตอบคือ ${BINS[fall.current.bin].name} ชิ้นนี้จะกลับมาใหม่`); playWrongSound(); reportAnswer("game2", fall.current, bin, "answer"); }
    $("#fallScore").textContent = String(fall.score); $("#fallCompleted").textContent = String(fall.completed); updateFallStatus(); animateFallItemIntoBin(correctButton);
    window.setTimeout(() => { if (!fall.running) return; if (fall.completed >= fall.items.length) finishFallGame(); else spawnFallingItem(); }, CONFIG.nextItemDelayMs);
  }
  function missFallingItem() {
    const fall = state.fall; if (!fall.running || !fall.accepting || !fall.current) return; fall.accepting = false; fall.wrong += 1; fall.queue.push(fall.current); const correctButton = fallButtons.find(button => button.dataset.bin === fall.current.bin); correctButton.classList.add("correct-bin"); setFallFeedback(`ยังไม่ได้ตอบ - คำตอบคือ ${BINS[fall.current.bin].name} ชิ้นนี้จะกลับมาใหม่`); playMissSound(); reportAnswer("game2", fall.current, "", "miss"); updateFallStatus(); $("#fallingItem").style.opacity = "0"; window.setTimeout(() => { if (fall.running) spawnFallingItem(); }, CONFIG.nextItemDelayMs);
  }
  function animateFallItemIntoBin(targetButton) { const fall = state.fall, element = $("#fallingItem"); const itemRect = element.getBoundingClientRect(), binRect = targetButton.getBoundingClientRect(); const dx = binRect.left + binRect.width / 2 - (itemRect.left + itemRect.width / 2); const dy = binRect.top + Math.min(34, binRect.height * .2) - (itemRect.top + itemRect.height / 2); element.classList.add("fly"); element.style.transform = `translate3d(calc(-50% + ${dx}px), ${fall.y + dy}px, 0) scale(.28)`; element.style.opacity = ".22"; }
  function setFallFeedback(text) { $("#fallFeedback").textContent = text; }
  function updateFallStatus() { const total = state.fall.items.length || CONFIG.questionsPerGame; const remaining = Math.max(total - state.fall.completed, 0); $("#fallStatus").textContent = remaining ? `เหลือ ${remaining} ชิ้นที่ต้องตอบให้ถูก` : "ตอบถูกครบทุกชิ้นแล้ว!"; }
  function finishFallGame() {
    if (!state.fall.running) return; const score = state.fall.score, wrong = state.fall.wrong, total = state.fall.items.length; stopFallGame(); const best = setBest("fall", score); reportGameCompletion("game2"); const baseMessage = wrong === 0 ? "ตอบถูกครบทุกชิ้นตั้งแต่ครั้งแรก เยี่ยมมาก!" : `ตอบถูกครบ ${total} ชิ้นแล้ว มีคำตอบผิดหรือขยะตก ${wrong} ครั้ง`; const message = `${baseMessage}
แยกขยะในเกมเก่งแล้ว อย่าลืมแยกจริงให้ถูกด้วยน๊า`;
    showResult({ mode: "เกมที่ 2 - เกมภารกิจขยะร่วง", title: "จบเกมที่ 2", message, fraction: `${total}/${total}`, score, best, extraLabel: "ผิด/ตก", extra: wrong, emoji: wrong === 0 ? "🏆" : wrong <= 3 ? "🌟" : "♻️", replay: startFallGame });
  }

  function startQuizGame() { stopAllGames(); state.activeGame = "quiz"; const quiz = state.quiz; quiz.items = selectRoundItems(); quiz.index = 0; quiz.score = 0; quiz.correct = 0; quiz.accepting = true; $("#quizScore").textContent = "0"; $("#quizTotal").textContent = String(quiz.items.length); $("#quizFeedback").classList.add("hidden"); $("#quizNextButton").classList.add("hidden"); clearEffects(quizButtons); showScreen("quiz"); renderQuizQuestion(); }
  function renderQuizQuestion() {
    const quiz = state.quiz, item = quiz.items[quiz.index]; quiz.accepting = true; clearEffects(quizButtons); quizButtons.forEach(button => button.disabled = false); $("#quizNumber").textContent = String(quiz.index + 1); $("#quizProgress").style.width = `${((quiz.index + 1) / quiz.items.length) * 100}%`; $("#quizImage").src = item.image; $("#quizImage").alt = item.name; $("#quizItemName").textContent = item.name; const feedback = $("#quizFeedback"); feedback.className = "quiz-feedback hidden"; $("#quizFeedbackTitle").textContent = ""; $("#quizExplanation").textContent = ""; $("#quizNextButton").classList.add("hidden");
  }
  function chooseQuizBin(bin, selectedButton) {
    const quiz = state.quiz; if (!quiz.accepting || !selectedButton) return; quiz.accepting = false; const item = quiz.items[quiz.index], isCorrect = bin === item.bin, correctButton = quizButtons.find(button => button.dataset.bin === item.bin); quizButtons.forEach(button => button.disabled = true); const feedback = $("#quizFeedback"); feedback.classList.remove("hidden");
    if (isCorrect) { quiz.score += CONFIG.correctPoints; quiz.correct += 1; selectedButton.classList.add("correct-bin"); feedback.classList.add("correct"); $("#quizFeedbackTitle").textContent = `ถูกต้อง! ${BINS[item.bin].name}`; playCorrectSound(); }
    else { selectedButton.classList.add("wrong-bin"); correctButton.classList.add("correct-bin"); feedback.classList.add("wrong"); $("#quizFeedbackTitle").textContent = `ยังไม่ถูก - คำตอบคือ ${BINS[item.bin].name}`; playWrongSound(); }
    reportAnswer("game1", item, bin, "answer"); $("#quizExplanation").textContent = item.explanation; $("#quizScore").textContent = String(quiz.score); const nextButton = $("#quizNextButton"); nextButton.textContent = quiz.index === quiz.items.length - 1 ? "ดูผลคะแนน" : "ข้อต่อไป"; nextButton.classList.remove("hidden");
  }
  function nextQuizQuestion() { const quiz = state.quiz; if (quiz.index >= quiz.items.length - 1) return finishQuizGame(); quiz.index += 1; renderQuizQuestion(); }
  function finishQuizGame() {
    const quiz = state.quiz, score = quiz.score, correct = quiz.correct, total = quiz.items.length; quiz.accepting = false; const best = setBest("quiz", score); reportGameCompletion("game1"); const baseMessage = correct === total ? "ตอบถูกครบทุกข้อ เยี่ยมมาก!" : correct >= 7 ? "เข้าใจการแยกขยะได้ดีมาก" : correct >= 5 ? "ทำได้ดี ลองอ่านคำอธิบายแล้วเล่นอีกครั้ง" : "ลองฝึกอีกครั้งเพื่อจำประเภทขยะให้แม่นขึ้น"; const message = `${baseMessage}
แยกขยะในเกมเก่งแล้ว อย่าลืมแยกจริงให้ถูกด้วยน๊า`;
    showResult({ mode: "เกมที่ 1 - เกมฝึกเลือกถัง", title: "จบเกมที่ 1", message, fraction: `${correct}/${total}`, score, best, extraLabel: "ตอบถูก", extra: `${correct}/${total}`, emoji: correct === total ? "🏆" : correct >= 7 ? "🌟" : "📚", replay: startQuizGame });
  }

  function showResult(data) { state.activeGame = null; resultReportNote.textContent = isReportApiConfigured() ? "กำลังส่งผลการเล่นไปยังระบบรายงาน..." : "โหมดทดลอง: คะแนนยังไม่ได้ส่งไป Google Sheets"; state.replayAction = data.replay; $("#resultMode").textContent = data.mode; $("#resultTitle").textContent = data.title; $("#resultFraction").textContent = data.fraction; $("#resultMessage").textContent = data.message; $("#resultScore").textContent = String(data.score); $("#resultBest").textContent = String(data.best); $("#resultExtraLabel").textContent = data.extraLabel; $("#resultExtra").textContent = String(data.extra); $("#resultEmoji").textContent = data.emoji; updateBestScores(); showScreen("result"); }

  function playCorrectSound() { playTone(660, .11, "sine"); window.setTimeout(() => playTone(880, .12, "sine"), 85); }
  function playWrongSound() { playTone(190, .2, "sawtooth"); }
  function playMissSound() { playTone(145, .26, "square"); }
  function playTone(frequency, duration, type) { if (state.muted) return; try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(); oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.0001, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration); oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration + .03); } catch {} }
  function preloadGameImages() { ITEMS.forEach(item => { const image = new Image(); image.src = item.image; }); Object.values(BINS).forEach(() => {}); }

  preloadGameImages(); state.player = loadPlayer(); setMuted(false); checkReportConnection();
  if (state.player) { updatePlayerUI(); showScreen("menu"); flushReportQueue(); } else showScreen("registration");
})();

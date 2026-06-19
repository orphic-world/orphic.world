const stemMap = {
  PianoFX: "music/PianoFX.mp3",
  Guitar: "music/Guitar.mp3",
  Bass: "music/Bass.mp3",
  Drum1: "music/Drum1.mp3",
  Drum2: "music/Drum2.mp3",
  Pad: "music/Pad.mp3",
  Lead: "music/Lead.mp3",
};

let audioCtx = null;
let stemsLoaded = false;
let stemsStarted = false;

const stemBuffers = {};
const stemGains = {};
const activeStems = new Set();

let currentWord = null;

const popupVideo = document.getElementById("popupVideo");

/* 스템 파일 미리 불러오기 */
async function loadStems() {
  if (stemsLoaded) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  for (const [key, src] of Object.entries(stemMap)) {
    try {
      const response = await fetch(src + "?v=4");

      if (!response.ok) {
        console.error("스템 파일 로드 실패:", key, src);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(audioCtx.destination);

      stemBuffers[key] = audioBuffer;
      stemGains[key] = gainNode;

      console.log("스템 로드 성공:", key);
    } catch (error) {
      console.error("스템 디코딩 실패:", key, src, error);
    }
  }

  stemsLoaded = true;
}

/* 모든 스템을 같은 오디오 시계로 동시에 시작 */
async function startAllStems() {
  await loadStems();

  if (!audioCtx) {
    console.error("AudioContext 없음");
    return;
  }

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  if (stemsStarted) return;

  const startAt = audioCtx.currentTime + 0.1;

  for (const [key, buffer] of Object.entries(stemBuffers)) {
    const gain = stemGains[key];
    if (!gain) continue;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(startAt, 0);

    console.log("스템 시작:", key);
  }

  stemsStarted = true;
}

/* 단어 클릭 시 스템 볼륨만 켜고 끄기 */
async function playSound(key, clickedWord) {
  console.log("clicked:", key);

  if (key === "world") {
    popupVideo.classList.add("show");
    popupVideo.currentTime = 0;

    popupVideo.play().catch((error) => {
      console.error("영상 재생 실패:", error);
    });

    clickedWord.classList.add("playing");
    return;
  }

  popupVideo.pause();
  popupVideo.currentTime = 0;
  popupVideo.classList.remove("show");

  if (!stemMap[key]) {
    console.error("해당 스템 없음:", key);
    return;
  }

  await startAllStems();

  const gain = stemGains[key];

  if (!gain) {
    console.error("Gain 없음. 파일 로드/디코딩 실패 가능:", key);
    return;
  }

  if (activeStems.has(key)) {
    gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);
    activeStems.delete(key);
    clickedWord.classList.remove("playing");
    return;
  }

  gain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
  activeStems.add(key);
  clickedWord.classList.add("playing");
}

/* 단어 클릭 */
document.querySelectorAll(".word").forEach((word) => {
  word.addEventListener("click", (event) => {
    event.stopPropagation();
    playSound(word.dataset.sound, word);
  });
});

/* 네비 */
const navTrigger = document.getElementById("navTrigger");
const infoImage = document.getElementById("infoImage");

navTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  infoImage.classList.toggle("show");
});

infoImage.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  infoImage.classList.remove("show");
});

/* LP 재생 버튼 */
const btn = document.getElementById("playBtn");
const icon = document.getElementById("playIcon");
const audio = document.getElementById("bgm");

let playing = false;

btn.addEventListener("click", () => {
  if (!playing) {
    audio.play().catch((error) => {
      console.error("BGM 재생 실패:", error);
    });
    icon.textContent = "❚❚";
  } else {
    audio.pause();
    icon.textContent = "▶";
  }

  playing = !playing;
});

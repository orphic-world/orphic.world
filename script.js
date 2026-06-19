const soundMap = {
  forget: "music/oblivion.mp3",
  time: "music/time.mp3",
  burden: "music/무거운책임.mp3",
  empty: "music/빈자리.mp3",
  memory: "music/memory.mp3",
  fade: "music/빛바래야.mp3",
  recall: "music/remember.mp3",
  grapefruit: "music/red.mp3",
  apple: "music/summer.mp3",
};

let currentAudio = null;
let currentWord = null;

const popupVideo = document.getElementById("popupVideo");

/* 사운드 재생 */
function playSound(key, clickedWord) {
  // 기존 재생 중인 단어 표시 제거
  if (currentWord) {
    currentWord.classList.remove("playing");
  }

  currentWord = clickedWord;
  currentWord.classList.add("playing");

  // 세상은 영상만 재생
  if (key === "world") {
    // 기존 오디오 멈춤
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    popupVideo.classList.add("show");
    popupVideo.currentTime = 0;

    popupVideo.play().catch((error) => {
      console.error("영상 재생 실패:", error);
    });

    return;
  }

  // 세상이 아닌 단어를 누르면 영상 닫기
  popupVideo.pause();
  popupVideo.currentTime = 0;
  popupVideo.classList.remove("show");

  const src = soundMap[key];
  if (!src) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(src);

  currentAudio.play().catch((error) => {
    console.error("오디오 재생 실패:", error);
  });

  currentAudio.addEventListener("ended", () => {
    if (currentWord) {
      currentWord.classList.remove("playing");
      currentWord = null;
    }
  });
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

/* 009 클릭 */
navTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  infoImage.classList.toggle("show");
});

/* 네비 클릭 시 유지 */
infoImage.addEventListener("click", (e) => {
  e.stopPropagation();
});

/* 바깥 클릭 닫기 */
document.addEventListener("click", () => {
  infoImage.classList.remove("show");
});

const btn = document.getElementById("playBtn");
const icon = document.getElementById("playIcon");
const audio = document.getElementById("bgm");

let playing = false;

btn.addEventListener("click", () => {
  if (!playing) {
    audio.play();
    icon.textContent = "❚❚";
  } else {
    audio.pause();
    icon.textContent = "▶";
  }

  playing = !playing;
});


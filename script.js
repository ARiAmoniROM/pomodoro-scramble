const workTimeDisplay = document.getElementById('workTimeDisplay');
const restTimeDisplay = document.getElementById('restTimeDisplay');
const currentPomodoroCount = document.getElementById('currentPomodoroCount');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');
const historyContainer = document.getElementById('historyContainer');
const body = document.body;
const feedbackIcon = document.getElementById('feedbackIcon');
const longPressIndicator = document.getElementById('longPressIndicator');
const modeToggleButton = document.getElementById('modeToggleButton');
const workLabel = document.getElementById('workLabel');
const restLabel = document.getElementById('restLabel');

let startTime = null;
let intervalId = null;
let workTime = 0;
let restTime = 0;
let totalWorkTime = 0;
let totalRestTime = 0;
let isTimerRunning = false;
let isWorkTime = true; // true: 作業時間, false: 休憩時間
let pomodoroCount = 0;
let history = [];
let firstStart = true; // 最初のタイマー開始を判定するフラグ
const POMODORO_EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const MAX_POMODORO = 10; // ポモドーロ数の上限
const PROGRESS_BAR_LENGTH = 10;

const formatTime = ms => new Date(ms).toISOString().slice(14, 19);
const updateDisplay = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    let currentSeparator = '';
    totalSeparator = POMODORO_EMOJIS[pomodoroCount] || ""; // ポモドーロ数は休憩後の作業開始時に更新

    if (!isTimerRunning) {
        currentSeparator = '⏸️';
    } else {
        currentSeparator = isWorkTime ? '🔥' : '☕️';
    }

    if (isWorkTime && isTimerRunning) {
        workTime += elapsed;
        totalWorkTime += elapsed;
    } else if (!isWorkTime && isTimerRunning) {
        restTime += elapsed;
        totalRestTime += elapsed;
    }

    workTimeDisplay.textContent = formatTime(workTime);
    restTimeDisplay.textContent = formatTime(restTime);
    currentPomodoroCount.textContent = currentSeparator;
    totalTimeDisplay.textContent = `${formatTime(totalWorkTime)} ${totalSeparator} ${formatTime(totalRestTime)}`;
    startTime = now;
};
const startTimer = () => {
    if (!isTimerRunning) {
        startTime = Date.now();
        intervalId = setInterval(updateDisplay, 1000);
        isTimerRunning = true;
        if (firstStart) {
            pomodoroCount = 1; // 最初のタイマー開始時にカウントを1にする
            updateTotalSeparator();
            firstStart = false;
        }
    }
};
const stopTimer = () => {
    if (isTimerRunning) {
        clearInterval(intervalId);
        intervalId = null;
        isTimerRunning = false;
        updateDisplay();
    }
};
const toggleTimer = () => isTimerRunning ? stopTimer() : startTimer();
const toggleMode = (manual = true) => {
    if (manual) {
        currentPomodoroCount.textContent = '🔄'; // モード切り替え開始時に 🔄 を表示
        setTimeout(() => {
            if (isWorkTime) { // 作業から休憩に移る時
                if (pomodoroCount === MAX_POMODORO) {
                    stopTimer();
                    alert("Good job!"); // ポップアップ表示
                }
                history.push({ work: formatTime(workTime), rest: formatTime(restTime), count: POMODORO_EMOJIS[pomodoroCount] || "" });
                renderHistory();
                workTime = 0;
                restTime = 0;
            } else { // 休憩から作業に戻る時
                if (pomodoroCount < MAX_POMODORO) {
                    pomodoroCount++;
                    updateTotalSeparator();
                }
            }
            isWorkTime = !isWorkTime;
            updateToggleButtonState();
            currentPomodoroCount.textContent = isWorkTime ? '🔥' : '☕️';
            if (!isTimerRunning) {
                currentPomodoroCount.textContent = '⏸️';
            }
        }, 1000);
        startTimer(); // モード切り替え時に自動で開始
    }
};
const renderHistory = () => {
    historyContainer.innerHTML = '';
    history.slice().reverse().forEach(item => {
        const logItem = document.createElement('div');
        logItem.textContent = `${item.work} ${item.count} ${item.rest}`;
        historyContainer.appendChild(logItem);
    });
};
const resetAll = () => {
    stopTimer();
    workTime = 0;
    restTime = 0;
    totalWorkTime = 0;
    totalRestTime = 0;
    pomodoroCount = 0;
    history = [];
    isWorkTime = true;
    firstStart = true;
    updateToggleButtonState();
    updateDisplay();
    renderHistory();
    updateTotalSeparator();
    currentPomodoroCount.textContent = '▶️';
};

const updateToggleButtonState = () => {
    if (isWorkTime) {
        modeToggleButton.classList.remove('rest-mode');
        workLabel.classList.add('active');
        restLabel.classList.remove('active');
    } else {
        modeToggleButton.classList.add('rest-mode');
        workLabel.classList.remove('active');
        restLabel.classList.add('active');
    }
};

const updateTotalSeparator = () => {
    totalSeparator = POMODORO_EMOJIS[pomodoroCount] || "";
    totalTimeDisplay.textContent = `${formatTime(totalWorkTime)} ${totalSeparator} ${formatTime(totalRestTime)}`;
};

modeToggleButton.addEventListener('click', () => {
    stopTimer(); // 切り替え前にタイマーを停止
    toggleMode();
});

workLabel.addEventListener('click', () => {
    if (!isWorkTime) {
        stopTimer();
        toggleMode();
    }
});

restLabel.addEventListener('click', () => {
    if (isWorkTime) {
        stopTimer();
        toggleMode();
    }
});

// シングルタップでタイマーの開始/一時停止
currentPomodoroCount.addEventListener('click', () => {
    const wasRunning = isTimerRunning; // 現在のタイマーの状態を保存
    toggleTimer();
    if (startTime === null) {
        startTime = Date.now();
    }
    if (!wasRunning && isTimerRunning) { // 一時停止から再生に切り替わった場合
        currentPomodoroCount.textContent = '▶️';
        setTimeout(() => {
            currentPomodoroCount.textContent = isWorkTime ? '🔥' : '☕️';
            if (!isTimerRunning) {
                currentPomodoroCount.textContent = '⏸️';
            }
        }, 1000);
    } else { // 再生から一時停止、または初期状態の場合
        currentPomodoroCount.textContent = isTimerRunning ? (isWorkTime ? '🔥' : '☕️') : '⏸️';
    }
});

// 初期化
updateToggleButtonState();
updateDisplay();
updateTotalSeparator();
currentPomodoroCount.textContent = '▶️';
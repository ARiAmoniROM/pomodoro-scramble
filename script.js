const workTimeDisplay = document.getElementById('workTimeDisplay');
const restTimeDisplay = document.getElementById('restTimeDisplay');
const currentPomodoroCount = document.getElementById('currentPomodoroCount');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');
const historyContainer = document.getElementById('historyContainer');
const body = document.body;
const modeToggleButton = document.getElementById('modeToggleButton');
const workLabel = document.getElementById('workLabel');
const restLabel = document.getElementById('restLabel');
const originalTitle = document.title;

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
let isFinished = false; // おつかれさま処理が完了したかどうかを示すフラグ
const POMODORO_EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const MAX_POMODORO = 10; // ポモドーロ数の上限
const PROGRESS_BAR_LENGTH = 10;

const formatTime = ms => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    const formattedHours = String(hours).padStart(2, '0'); // hours を2桁でゼロ埋め
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`; // 常に HH:MM:SS 形式
};

const getModeIcon = (iconType) => {
    switch (iconType) {
        case 'work':
            return '🍅';
        case 'rest':
            return '🫠';
        case 'play':
            return '▶️';
        case 'pause':
            return '⏸️';
        case 'loading':
            return '🔄';
        case 'next':
            return '⏭';
        default:
            return ''; // デフォルトは空文字
    }
};

const updateTitle = () => {
    if (pomodoroCount === 0) {
        document.title = originalTitle; // 0 ポモドーロ目の場合は元のタイトルを表示
    } else {
        const displayTime = isWorkTime ? formatTime(workTime) : formatTime(restTime);
        const modeEmoji = isWorkTime ? getModeIcon('work') : getModeIcon('rest');
        document.title = `${modeEmoji}${displayTime}`; // タイトルを更新
    }
};

const updateDisplay = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    let currentSeparator = '';
    totalSeparator = POMODORO_EMOJIS[pomodoroCount] || ""; // ポモドーロ数は休憩後の作業開始時に更新

    if (!isTimerRunning) {
        currentSeparator = getModeIcon('pause'); // 関数を使用
    } else {
        currentSeparator = isWorkTime ? getModeIcon('work') : getModeIcon('rest'); // 関数を使用
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
    currentPomodoroCount.textContent = isFinished ? getModeIcon('next') : currentSeparator; // 完了後は ⏭ を表示
    totalTimeDisplay.textContent = `${formatTime(totalWorkTime)} ${totalSeparator} ${formatTime(totalRestTime)}`;
    document.title = `${isWorkTime ? getModeIcon('work') : getModeIcon('rest')} ${formatTime(isWorkTime ? workTime : restTime)}`;
    startTime = now;
    updateTitle(); // タイトル更新関数を呼び出し
};
const startTimer = () => {
    if (!isTimerRunning && !isFinished) {
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
const toggleTimer = () => {
    if (!isFinished) {
        isTimerRunning ? stopTimer() : startTimer();
    }
};
const toggleMode = (manual = true) => {
    if (manual && !isFinished) {
        currentPomodoroCount.textContent = getModeIcon('loading'); // 関数を使用
        setTimeout(() => {
            if (isWorkTime) { // 作業から休憩に移る時
                if (pomodoroCount === MAX_POMODORO) {
                    stopTimer();
                    alert("Well done."); // ポップアップ表示 (より穏やかな表現に変更)
                    isFinished = true; // 完了フラグを立てる
                    currentPomodoroCount.textContent = getModeIcon('next'); // 関数を使用
                }
            } else { // 休憩から作業に戻る時
                if (pomodoroCount < MAX_POMODORO) {
                    history.push({ work: formatTime(workTime), rest: formatTime(restTime), count: POMODORO_EMOJIS[pomodoroCount] || "" });
                    renderHistory();
                    workTime = 0;
                    restTime = 0;
                    pomodoroCount++;
                    updateTotalSeparator();
                }
            }
            isWorkTime = !isWorkTime;
            updateToggleButtonState();
            currentPomodoroCount.textContent = isFinished ? getModeIcon('next') : (isWorkTime ? getModeIcon('work') : getModeIcon('rest')); // 関数を使用
            if (!isTimerRunning) {
                currentPomodoroCount.textContent = isFinished ? getModeIcon('next') : getModeIcon('pause'); // 関数を使用
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
    isFinished = false; // リセット時に完了フラグを戻す
    updateToggleButtonState();
    updateDisplay();
    renderHistory();
    updateTotalSeparator();
    currentPomodoroCount.textContent = getModeIcon('play');
};

const updateToggleButtonState = () => {
    if (!isFinished) {
        if (isWorkTime) {
            modeToggleButton.classList.remove('rest-mode');
            workLabel.classList.add('active');
            restLabel.classList.remove('active');
        } else {
            modeToggleButton.classList.add('rest-mode');
            workLabel.classList.remove('active');
            restLabel.classList.add('active');
        }
    } else {
        modeToggleButton.classList.add('disabled'); // 完了後はトグルボタンを操作不可にするCSSクラスを追加
        workLabel.classList.remove('active');
        restLabel.classList.remove('active');
        workLabel.classList.add('disabled'); // ラベルも操作不可にするCSSクラスを追加
        restLabel.classList.add('disabled'); // ラベルも操作不可にするCSSクラスを追加
    }
};

const updateTotalSeparator = () => {
    totalSeparator = POMODORO_EMOJIS[pomodoroCount] || "";
    const totalWorkTimeFormatted = formatTime(totalWorkTime);
    const totalRestTimeFormatted = formatTime(totalRestTime);
    totalTimeDisplay.innerHTML = `<span>${totalWorkTimeFormatted}</span> <span>${totalSeparator}</span> <span>${totalRestTimeFormatted}</span>`;
};

modeToggleButton.addEventListener('click', () => {
    if (pomodoroCount === 0) {
        // 0 ポモドーロ目の場合は何もしない
        return;
    }
    stopTimer(); // 切り替え前にタイマーを停止
    toggleMode();
});

workLabel.addEventListener('click', () => {
    if (!isWorkTime && !isFinished) {
        stopTimer();
        toggleMode();
    }
});

restLabel.addEventListener('click', () => {
    if (isWorkTime && !isFinished) {
        stopTimer();
        toggleMode();
    }
});

// シングルタップでタイマーの開始/一時停止
currentPomodoroCount.addEventListener('click', () => {
    if (isFinished) {
        resetAll();
    } else {
        const wasRunning = isTimerRunning; // 現在のタイマーの状態を保存
        toggleTimer();
        if (startTime === null) {
            startTime = Date.now();
        }
        if (!wasRunning && isTimerRunning) { // 一時停止から再生に切り替わった場合
            currentPomodoroCount.textContent = getModeIcon('play'); // 関数を使用
            setTimeout(() => {
                currentPomodoroCount.textContent = isWorkTime ? getModeIcon('work') : getModeIcon('rest'); // 関数を使用
                if (!isTimerRunning) {
                    currentPomodoroCount.textContent = getModeIcon('pause'); // 関数を使用
                }
            }, 1000);
        } else { // 再生から一時停止、または初期状態の場合
            currentPomodoroCount.textContent = isTimerRunning ? (isWorkTime ? getModeIcon('work') : getModeIcon('rest')) : getModeIcon('pause'); // 関数を使用
        }
    }
});

// 初期化
updateToggleButtonState();
updateDisplay();
updateTotalSeparator();
updateTitle();
currentPomodoroCount.textContent = getModeIcon('play');
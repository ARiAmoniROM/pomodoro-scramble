const workDisplay = document.getElementById('work');
const restDisplay = document.getElementById('rest');
const toggleSpan = document.getElementById('toggle');
const currentWorkTimeDisplay = document.getElementById('currentWorkTime');
const currentRestTimeDisplay = document.getElementById('currentRestTime');
const currentPomodoroCount = document.getElementById('currentPomodoroCount');
const historyContainer = document.getElementById('historyContainer');

let startTime = null;
let intervalId = null;
let workTime = 0;
let restTime = 0;
let totalWorkTime = 0;
let totalRestTime = 0;
let isTimerRunning = false;
let isWorkTime = true;
let pomodoroCount = 0;
let history = [];
let isFinished = false;
const POMODORO_EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const MAX_POMODORO = 10; // ポモドーロ数の上限
const PROGRESS_BAR_LENGTH = 10;

const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedHours = String(hours);

    return { hours, minutes, seconds, formattedHours, formattedMinutes, formattedSeconds };
};

const formatDisplay = (timeObj, format) => {
    switch (format) {
        case 'HH:MM:SS':
            return `${timeObj.formattedHours.padStart(2, '0')}:${timeObj.formattedMinutes.padStart(2, '0')}:${timeObj.formattedSeconds.padStart(2, '0')}`;
        case 'H:MM:SS':
            return `${timeObj.hours}:${timeObj.formattedMinutes}:${timeObj.formattedSeconds}`;
        case 'MM:SS':
            return `${timeObj.formattedMinutes}:${timeObj.formattedSeconds}`;
        default:
            return '';
    }
};

const getFormat = (ms1, ms2) => {
    const time1 = formatTime(ms1);
    const time2 = formatTime(ms2);
    const maxHours = Math.max(time1.hours, time2.hours);

    if (maxHours >= 10) {
        return 'HH:MM:SS';
    } else if (maxHours >= 1) {
        return 'H:MM:SS';
    } else {
        return 'MM:SS';
    }
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
        case 'timer':
            return '⏰';
        default:
            return ''; // デフォルトは空文字
    }
};

const updateTitle = () => {
    const currentTime = isWorkTime ? workTime : restTime;
    const formattedCurrentTime = formatDisplay(
        formatTime(currentTime),
        currentTime >= 36000000 ? 'HH:MM:SS' : (currentTime >= 3600000 ? 'H:MM:SS' : 'MM:SS')
    );
    const modeEmoji = isWorkTime ? getModeIcon('work') : getModeIcon('rest');
    document.title = `${modeEmoji}${formattedCurrentTime}`;
};

const updateDisplay = () => {
    const now = Date.now();
    const elapsed = now - startTime;

    if (isWorkTime && isTimerRunning) {
        workTime += elapsed;
        totalWorkTime += elapsed;
    } else if (!isWorkTime && isTimerRunning) {
        restTime += elapsed;
        totalRestTime += elapsed;
    }

    const currentFormat = getFormat(workTime, restTime);
    currentWorkTimeDisplay.textContent = formatDisplay(formatTime(workTime), currentFormat);
    currentRestTimeDisplay.textContent = formatDisplay(formatTime(restTime), currentFormat);

    const totalFormat = getFormat(totalWorkTime, totalRestTime);
    workDisplay.textContent = formatDisplay(formatTime(totalWorkTime), totalFormat);
    restDisplay.textContent = formatDisplay(formatTime(totalRestTime), totalFormat);
    if (isFinished) {
        toggleSpan.textContent = getModeIcon('timer');
    } else if (isTimerRunning) {
        currentPomodoroCount.textContent = POMODORO_EMOJIS[pomodoroCount] || "";
    } else {
        currentPomodoroCount.textContent = getModeIcon('pause');
    }

    startTime = now;
    updateTitle();
};

const startTimer = () => {
    if (!isTimerRunning && !isFinished) {
        startTime = Date.now();
        intervalId = setInterval(updateDisplay, 1000);
        isTimerRunning = true;
        currentPomodoroCount.textContent = getModeIcon('play');
        if (pomodoroCount === 0) {
            pomodoroCount = 1;
            toggleSpan.textContent = getModeIcon('work');
            updateDisplay();
        }
        setTimeout(() => {
            currentPomodoroCount.textContent = POMODORO_EMOJIS[pomodoroCount] || "";
        }, 1000);
    }
};

const stopTimer = () => {
    if (isTimerRunning) {
        clearInterval(intervalId);
        intervalId = null;
        isTimerRunning = false;
        currentPomodoroCount.textContent = getModeIcon('pause');
        setTimeout(() => {
            currentPomodoroCount.textContent = POMODORO_EMOJIS[pomodoroCount] || getModeIcon('pause');
        }, 1000);
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
        toggleSpan.textContent = getModeIcon('loading');
        setTimeout(() => {
            if (isWorkTime && pomodoroCount === MAX_POMODORO && !isFinished) {
                stopTimer();
                alert("Well done.");
                isFinished = true;
                toggleSpan.textContent = getModeIcon('timer');
                return;
            } else if (!isWorkTime && pomodoroCount < MAX_POMODORO) {
                const format = getFormat(workTime, restTime);
                history.push({
                    work: formatDisplay(formatTime(workTime), format),
                    rest: formatDisplay(formatTime(restTime), format),
                    count: POMODORO_EMOJIS[pomodoroCount] || ""
                });
                renderHistory();
                workTime = 0;
                restTime = 0;
                pomodoroCount++;
            }
            isWorkTime = !isWorkTime;
            updateToggleButtonState();
            const modeIcon = isWorkTime ? getModeIcon('work') : getModeIcon('rest');
            toggleSpan.textContent = modeIcon;
            if (!isTimerRunning && !isFinished) {
                currentPomodoroCount.textContent = getModeIcon('play');
            } else if (!isFinished) {
                currentPomodoroCount.textContent = POMODORO_EMOJIS[pomodoroCount] || "";
            }
        }, 1000);
        startTimer();
    }
};

const renderHistory = () => {
    historyContainer.innerHTML = '';
    history.slice().reverse().forEach(item => {
        const logItem = document.createElement('div');
        logItem.innerHTML = `
            <span class="work-time">${item.work}</span>
            <span class="pomodoro-emoji">${item.count}</span>
            <span class="rest-time">${item.rest}</span>
        `;
        historyContainer.appendChild(logItem);
    });
};

const updateToggleButtonState = () => {
    toggleSpan.classList.remove('rest-mode', 'disabled');
    workDisplay.classList.remove('active', 'disabled');
    restDisplay.classList.remove('active', 'disabled');

    if (isFinished) {
        toggleSpan.textContent = getModeIcon('timer');
        toggleSpan.classList.add('disabled');
        workDisplay.classList.add('disabled');
        restDisplay.classList.add('disabled');
        workDisplay.classList.remove('active');
        restDisplay.classList.remove('active');
        return;
    }
    
    toggleSpan.textContent = isWorkTime ? getModeIcon('work') : getModeIcon('rest');
    if (!isWorkTime) {
        toggleSpan.classList.add('rest-mode');
    }
    workDisplay.classList.add('active');
    restDisplay.classList.remove('active');
    workDisplay.classList.remove('active');
    restDisplay.classList.add('active');
};

toggleSpan.addEventListener('click', () => {
    if (pomodoroCount === 0) {
        return;
    }
    stopTimer();
    toggleMode();
});

currentPomodoroCount.addEventListener('click', () => {
    toggleTimer();
});
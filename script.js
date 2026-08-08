import tracks from './tracks.js';
(function () {
    let currentTrackIndex = 0;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let isAnswered = false;
    let timerInterval = null;
    let secondsLeft = 25;
    const totalTracks = tracks.length;

    // DOM
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const currentTrackNumber = document.getElementById('currentTrackNumber');
    const totalTracksSpan = document.getElementById('totalTracks');
    const timerDisplay = document.getElementById('timerDisplay');
    const progressBar = document.getElementById('progressBar');
    const optionsList = document.getElementById('optionsList');
    const nextButtonWrapper = document.getElementById('nextButtonWrapper');
    const nextTrackBtn = document.getElementById('nextTrackBtn');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const correctCountSpan = document.getElementById('correctCount');
    const wrongCountSpan = document.getElementById('wrongCount');
    const trackTitleHint = document.getElementById('trackTitleHint');

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function updateStats() {
        scoreDisplay.textContent = score;
        correctCountSpan.textContent = correctCount;
        wrongCountSpan.textContent = wrongCount;
        nextButtonWrapper.classList.remove('d-none');
    }

    function clearTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer() {
        clearTimer();
        secondsLeft = 25;
        timerDisplay.textContent = `0:${secondsLeft.toString().padStart(2, '0')}`;
        progressBar.style.width = '100%';

        timerInterval = setInterval(() => {
            secondsLeft -= 1;
            timerDisplay.textContent = `0:${secondsLeft.toString().padStart(2, '0')}`;
            const percent = (secondsLeft / 25) * 100;
            progressBar.style.width = `${Math.max(0, percent)}%`;

            if (secondsLeft <= 0) {
                clearTimer();
                if (!isAnswered) {
                    const currentTrack = tracks[currentTrackIndex];
                    const allOptions = document.querySelectorAll('.option-btn');
                    allOptions.forEach((btn, idx) => {
                        btn.classList.add('disabled-btn');
                        if (idx === currentTrack.correct) {
                            btn.classList.add('correct');
                        }
                    });
                    wrongCount += 1;
                    isAnswered = true;
                    audioPlayer.pause();
                }
            }
        }, 1000);
    }

    function loadTrack(index) {
        clearTimer();
        isAnswered = false;

        const track = tracks[index];
        if (!track) return;

        audioSource.src = track.audio;
        audioPlayer.load();
        // Автозапуск с небольшой задержкой (чтобы браузер разрешил)
        setTimeout(() => {
            audioPlayer.play().catch(e => console.log('Автовоспроизведение заблокировано, нажмите play'));
        }, 100);

        trackTitleHint.textContent = 'Прослушайте фрагмент классики';
        currentTrackNumber.textContent = index + 1;
        totalTracksSpan.textContent = totalTracks;

        const shuffledOptions = shuffleArray([...track.options]);
        optionsList.innerHTML = '';
        shuffledOptions.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="badge bg-secondary bg-opacity-25 me-1">${String.fromCharCode(65 + idx)}</span> ${opt}`;
            btn.dataset.optionText = opt;
            btn.addEventListener('click', (e) => handleOptionClick(e, track));
            optionsList.appendChild(btn);
        });

        progressBar.style.width = '100%';
        timerDisplay.textContent = '0:25';
        startTimer();

        document.querySelectorAll('.option-btn').forEach(b => {
            b.classList.remove('correct', 'wrong', 'disabled-btn');
        });
    }

    function handleOptionClick(e, track) {
        if (isAnswered) return;
        const btn = e.currentTarget;
        const selectedText = btn.dataset.optionText;
        const correctAnswer = track.options[track.correct];
        const isCorrect = (selectedText === correctAnswer);

        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(b => b.classList.add('disabled-btn'));

        allOptions.forEach((b) => {
            const text = b.dataset.optionText;
            if (text === correctAnswer) {
                b.classList.add('correct');
            } else if (text === selectedText && !isCorrect) {
                b.classList.add('wrong');
            }
        });

        if (isCorrect) {
            score += 10;
            correctCount += 1;
            trackTitleHint.textContent = `✅ ${track.artist} — ${track.title}`;
        } else {
            wrongCount += 1;
            trackTitleHint.textContent = track.error;
        }

        isAnswered = true;
        clearTimer();
        audioPlayer.pause();
        updateStats();
    }

    function goToNextTrack() {
        clearTimer();
        if (currentTrackIndex < totalTracks - 1) {
            currentTrackIndex += 1;
            loadTrack(currentTrackIndex);
        } else {
            audioPlayer.pause();
            optionsList.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem; color: #f5c542;"></i>
                <h5 class="mt-3">🎉 Квиз завершён!</h5>
                <p class="hint-text">Набрано очков: <strong>${score}</strong> · Правильных: ${correctCount} · Неправильных: ${wrongCount}</p>
                <button class="btn btn-glow mt-2" id="restartFromFinishBtn"><i class="bi bi-arrow-repeat me-2"></i>Играть снова</button>
            </div>
            `;
            nextButtonWrapper.classList.add('d-none');
            document.getElementById('restartFromFinishBtn')?.addEventListener('click', restartQuiz);
            trackTitleHint.textContent = '🏁 Квиз завершён';
        }
    }

    function restartQuiz() {
        clearTimer();
        audioPlayer.pause();
        currentTrackIndex = 0;
        score = 0;
        correctCount = 0;
        wrongCount = 0;
        isAnswered = false;

        updateStats();
        loadTrack(0);
        nextTrackBtn.innerHTML = '<i class="bi bi-skip-forward-fill me-2"></i>Следующий трек';
        trackTitleHint.textContent = 'Прослушайте фрагмент классики';
    }

    function init() {
        totalTracksSpan.textContent = totalTracks;
        loadTrack(0);
        nextTrackBtn.addEventListener('click', goToNextTrack);
        updateStats();
    }
    init();
    document.addEventListener('click', function (e) {
        if (e.target.id === 'restartFromFinishBtn') {
            restartQuiz();
        }
    });
})();
// --- GLOBAL STATE ---
let isPaused = false;
let lastJobCount = 0;

// --- 1. TIMER & RELOAD LOGIC ---
function startTimer(duration) {
	let timeLeft = duration;

	const timerEl = document.createElement('div');
	timerEl.id = 'reload-countdown';

	const timeSpan = document.createElement('span');
	timeSpan.id = 'timer-text';
	timeSpan.textContent = `Next Reload: ${timeLeft}s`;

	const btn = document.createElement('button');
	btn.className = 'pause-btn';
	btn.textContent = 'Pause';

	btn.onclick = () => {
		isPaused = !isPaused;
		btn.textContent = isPaused ? 'Resume' : 'Pause';
		btn.classList.toggle('paused', isPaused);
	};

	timerEl.appendChild(timeSpan);
	timerEl.appendChild(btn);
	document.body.appendChild(timerEl);

	setInterval(() => {
		if (!isPaused) {
			timeLeft--;
			timeSpan.textContent = `Next Reload: ${timeLeft}s`;

			if (timeLeft <= 10) timerEl.classList.add('low-time');

			if (timeLeft <= 0) {
				location.reload();
			}
		}
	}, 1000);
}

// --- 2. NOTIFICATION LOGIC ---
function showToast(message) {
	let container = document.getElementById('toast-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'toast-container';
		document.body.appendChild(container);
	}

	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.innerHTML = `<span>${message}</span><button class="toast-close">×</button>`;

	toast.querySelector('.toast-close').onclick = () => toast.remove();
	container.appendChild(toast);

	// Auto-remove after 30 seconds
	setTimeout(() => {
		if (toast.parentElement) {
			toast.style.opacity = '0';
			toast.style.transition = 'opacity 0.5s ease';
			setTimeout(() => toast.remove(), 500);
		}
	}, 30000);
}

function playAlert() {
	try {
		const audioContext = new (
			window.AudioContext || window.webkitAudioContext
		)();
		const duration = 1.0;
		const gap = 0.5;

		for (let i = 0; i < 3; i++) {
			const startTime = audioContext.currentTime + i * (duration + gap);
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime(880, startTime);

			gainNode.gain.setValueAtTime(0, startTime);
			gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
			gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

			oscillator.start(startTime);
			oscillator.stop(startTime + duration);
		}
	} catch (e) {
		console.error('Audio play failed:', e);
	}
}

// --- 3. THE OBSERVER (VISIBLE JOB DETECTION) ---
function checkForJobs() {
	const allSummaryRows = document.querySelectorAll(
		'table.jobList.fullwidth tr.summary',
	);

	const visibleJobs = Array.from(allSummaryRows).filter(row => {
		return row.offsetWidth > 0 && row.offsetHeight > 0;
	});

	const currentVisibleCount = visibleJobs.length;
	console.log(
		`Current jobs visible: ${currentVisibleCount} (Previous: ${lastJobCount})`,
	);

	// Only trigger if count increased
	if (currentVisibleCount > lastJobCount) {
		const msg = `${currentVisibleCount} JOB(S) AVAILABLE!`;

		console.log(msg);

		// visual alerts
		showToast(`🚨 ${msg}`);
		playAlert();

		// Windows desktop notification
		chrome.runtime.sendMessage({
			type: 'TRIGGER_NOTIFICATION',
			message: msg,
		});

		visibleJobs.forEach(row => {
			row.classList.add('animate-flash');
		});

		// Auto-pause timer so you don't lose the job during a reload
		isPaused = true;
		const pauseBtn = document.querySelector('.pause-btn');
		if (pauseBtn) {
			pauseBtn.textContent = 'Resume';
			pauseBtn.classList.add('paused');
		}
	}
	lastJobCount = currentVisibleCount;
}

function initObserver() {
	const tableContainer =
		document.querySelector('.jobList.fullwidth') || document.body;

	if (tableContainer) {
		// 1. Check immediately for jobs already on the page
		checkForJobs();

		// 2. Then observe for any dynamic updates
		const observer = new MutationObserver(() => {
			checkForJobs();
		});

		observer.observe(tableContainer, { childList: true, subtree: true });
		console.log('Monitoring table...');
	} else {
		setTimeout(initObserver, 2000);
	}
}

// --- 4. STARTUP ---
chrome.storage.local.get(['reloadTime'], result => {
	let userTime = parseInt(result.reloadTime) || 45;
	startTimer(userTime);

	if (
		document.readyState === 'complete' ||
		document.readyState === 'interactive'
	) {
		initObserver();
	} else {
		window.addEventListener('load', initObserver);
	}
});

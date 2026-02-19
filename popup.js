document.addEventListener('DOMContentLoaded', () => {
	const input = document.getElementById('timeInput');
	const btn = document.getElementById('saveBtn');

	// Load current saved value
	chrome.storage.local.get(['reloadTime'], res => {
		if (res.reloadTime) input.value = res.reloadTime;
	});

	btn.onclick = () => {
		const seconds = input.value;
		chrome.storage.local.set({ reloadTime: seconds }, () => {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				if (tabs[0] && tabs[0].url.includes('frontlineeducation.com')) {
					chrome.tabs.reload(tabs[0].id);
					window.close(); // Close popup after saving
				} else {
					alert(
						'Settings saved! Note: Navigate to Frontline to see the timer.',
					);
				}
			});
		});
	};
});

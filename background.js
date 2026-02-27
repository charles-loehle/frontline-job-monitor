// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'TRIGGER_NOTIFICATION') {
		// We store the tab ID in the notification ID so we know exactly where to go back to
		const targetTabId = sender.tab.id.toString();

		chrome.notifications.create(targetTabId, {
			type: 'basic',
			iconUrl: 'icon128.png',
			title: 'New Job Found!',
			message: request.message,
			priority: 2,
			requireInteraction: true,
		});
	}
});

chrome.notifications.onClicked.addListener(notificationId => {
	// Convert the ID back to a number
	const tabId = parseInt(notificationId);

	if (!isNaN(tabId)) {
		// 1. Switch to the tab
		chrome.tabs.update(tabId, { active: true }, tab => {
			if (chrome.runtime.lastError) {
				console.error('Tab might have been closed:', chrome.runtime.lastError);
				return;
			}
			// 2. Bring the window to the front
			chrome.windows.update(tab.windowId, { focused: true });
		});

		// 3. Clear the notification
		chrome.notifications.clear(notificationId);
	}
});

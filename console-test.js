/**
 * SCRIPTS TO RUN IN BROWSER CONSOLE TO TEST FUNCTIONALITY
 */

/* Run the Test Script
Copy and paste this code into the console and hit Enter:
*/
(function () {
	// 1. Target the specific Frontline table
	const targetTable = document.querySelector('table.jobList.fullwidth');

	if (!targetTable) {
		console.error(
			"Target table 'table.jobList.fullwidth' not found on this page.",
		);
		return;
	}

	let tbody = targetTable.querySelector('tbody');
	if (!tbody) {
		tbody = document.createElement('tbody');
		targetTable.appendChild(tbody);
	}

	// 2. Reset count for clean testing
	lastJobCount = 0;

	// 3. Create the fake job row
	const fakeJob = document.createElement('tr');
	fakeJob.className = 'summary';
	fakeJob.innerHTML = `
        <td colspan="5" style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107;">
            <strong>DEBUG TEST: Fake Job Successfully Injected into jobList!</strong>
        </td>
    `;

	// 4. Inject
	console.log('Injecting job into table.jobList...');
	tbody.appendChild(fakeJob);
})();

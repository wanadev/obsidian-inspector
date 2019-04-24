function initialize() {
	createListeners();
};

// Injecting invader.js script into visited webpage
function injectScript() {
	let s = document.createElement('script');
	s.src = chrome.runtime.getURL('js/invader.js');
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
};

function createListeners() {
	let details = null;

	// Wait for popup_open event to inject script into visited webpage
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			sendResponse(true);
			if(request.query == "popup_open"){
				injectScript();
			}
		}
	);
};

initialize();
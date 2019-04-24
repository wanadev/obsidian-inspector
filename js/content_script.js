function initialize() {
	injectScript();
	createListeners();
};

function injectScript() {
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL('js/invader.js');
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
};

function createListeners() {
	var details = null;

	document.addEventListener('obsidianDetails', (e) => {
		details = e.detail;
	});

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if(request.query == "obsidianDetails"){
				sendResponse({"details" : details});
			}
			/*if(request.query == "popup_open"){
				sendResponse({"details" : details});
			}*/
			return true;
		}
	);
};

initialize();


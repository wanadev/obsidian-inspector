chrome.tabs.query({active: true, currentWindow: true},
	function(tabs) { // Send message to content_script when opening popup to retrieve data
		chrome.tabs.sendMessage(tabs[0].id, {query: "popup_open"}, function(response) {
			console.log(response)
		});
	}
);

function createListeners() {
	// Listen for event with data from injected script
	chrome.runtime.onMessageExternal.addListener(
		function(request, sender, sendResponse) {
			if (request.query == "obsidianDetails"){
				buildPopup(request.details);
			}
		}
	);
};

// Build popup UI from data
function buildPopup(data) {
	console.log("Building popup...", data);
	document.getElementById('name').innerHTML = data.name;

	let modDrowdown = createDropdown(data.modules, "Modules");
	document.getElementById('modules').appendChild(modDrowdown);

	let eventsDrowdown = createDropdown(data.events, "Events");
	document.getElementById('events').appendChild(eventsDrowdown);

	let configDrowdown = createDropdown(data.config, "Configurations");
	document.getElementById('configs').appendChild(configDrowdown);

	if(data.structures){
		let structuresDrowdown = createDropdown(data.structures, "Structures");
		document.getElementById('structures').appendChild(structuresDrowdown);
	}

	if(data.history){
		let historyDrowdown = createDropdown(data.history, "History");
		document.getElementById('history').appendChild(historyDrowdown);
	}

	if(data.stonejs){
		let stonejsDrowdown = createDropdown(data.stonejs, "stonejs");
		document.getElementById('stonejs').appendChild(stonejsDrowdown);
	}

	createDropdownsListeners();

	console.log("Done!");
};

function createDropdown(data, title) {
	let ul = document.createElement("UL");
	ul.classList.add("topUL");
	let li = document.createElement("LI");
	let span = document.createElement("SPAN");
	span.classList.add("caret");
	span.innerHTML = title;
	if(Array.isArray(data)){
		span.innerHTML += "(" + data.length + ")";
	}
	li.appendChild(span);
	ul.appendChild(li);

	let ul2 = createUL(data);
	li.appendChild(ul2);

	return ul;
};

function createUL(data) {
	let ul = document.createElement("UL");
	ul.classList.add("subUL");
	ul.classList.add("nested");

	if(Array.isArray(data)) {
		if(data.length !== 0 && typeof data[0] === "object" && data[0] !== null){
			for(let i = 0; i < data.length; i++) {
				ul = createUL(data[i]);
			}
		} else if(data.length !== 0) {
			for(let i = 0; i < data.length; i++) {
				let li = document.createElement('LI');
				li.innerHTML = "<span class='property'>" + data[i] + "</span>";
				ul.appendChild(li);
			}
		} else {
			let li = document.createElement('LI');
			li.innerHTML = "<span class='property'>" + data[i] + "</span><span class='data'>[]</span>";
			ul.appendChild(li);
		}
		
	} else if((typeof data === "object") && (data !== null)){
		for(let dat in data) {
			let li2 = document.createElement('LI');
			ul.appendChild(li2);
			let span = document.createElement("SPAN");
			span.classList.add("caret");
			span.innerHTML = "<span class='property'>" + dat + "</span>";
			li2.appendChild(span);

			if((typeof data[dat] === "object") && (data[dat] !== null)){
				if(isEmpty(data[dat])) {
					if(Array.isArray(data[dat])){
						span.innerHTML = span.innerHTML + " : <span class='data'>[]</span>";
					} else {
						span.innerHTML = span.innerHTML + " : <span class='data'>{}</span>";
					}
					span.classList.remove("caret");
				} else {
					let subUl = createUL(data[dat]);
					li2.appendChild(subUl);
				}
			} else {
				span.innerHTML = span.innerHTML + " : <span class='data'>" + data[dat] + "</span>";
				span.classList.remove("caret");
			}			
		}
	}

	return ul;
};

function isEmpty(obj) {
	for(let key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
};

function createDropdownsListeners() {
	let toggler = document.getElementsByClassName("caret");
	let i;

	for (i = 0; i < toggler.length; i++) {
		toggler[i].addEventListener("click", function() {
			this.parentElement.querySelector(".nested").classList.toggle("active");
			this.classList.toggle("caret-down");
		});
	}
};

createListeners();
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
	var body = document.body;
	document.getElementById('name').innerHTML = data.name;

	let modDrowdown = createDropdown(data.modules, "Modules");
	body.appendChild(modDrowdown);

	let eventsDrowdown = createDropdown(data.events, "Events");
	body.appendChild(eventsDrowdown);

	let configDrowdown = createDropdown(data.config, "Configurations");
	body.appendChild(configDrowdown);

	if(data.structures){
		let structuresDrowdown = createDropdown(data.structures, "Structures");
		body.appendChild(structuresDrowdown);
	}

	if(data.history){
		let historyDrowdown = createDropdown(data.history, "History");
		body.appendChild(historyDrowdown);
	}

	if(data.stonejs){
		let stonejsDrowdown = createDropdown(data.stonejs, "stonejs");
		body.appendChild(stonejsDrowdown);
	}

	if(data.vuejs){
		let vuejsDrowdown = createDropdown(data.vuejs, "vuejs");
		body.appendChild(vuejsDrowdown);
	}

	createDropdownsListeners();

	console.log("Done!");
};

function createDropdown(data, title) {
	let div = document.createElement("div");
	div.id = title.toLowerCase();
	let ul = document.createElement("ul");
	ul.classList.add("topUL");
	let li = document.createElement("li");
	let span = document.createElement("span");
	span.classList.add("caret");
	span.innerHTML = title;
	if(Array.isArray(data)){
		span.innerHTML += "(" + data.length + ")";
	}
	li.appendChild(span);
	ul.appendChild(li);

	let ul2 = createUL(data, title);
	li.appendChild(ul2);
	div.appendChild(ul);

	return div;
};

function createUL(data, title) {
	let ul = document.createElement("ul");
	ul.classList.add("nested");

	if(Array.isArray(data)) {
		if(data.length !== 0 && typeof data[0] === "object" && data[0] !== null){
			for(let i = 0; i < data.length; i++) {
				ul = createUL(data[i], title);
			}
		} else if(data.length !== 0) {
			for(let i = 0; i < data.length; i++) {
				let li = document.createElement('li');
				li.innerHTML = "<span class='property'>" + data[i] + "</span>";
				ul.appendChild(li);
			}
		}
	} else if((typeof data === "object") && (data !== null)){
		for(let dat in data) {
			let li2 = document.createElement('li');
			ul.appendChild(li2);
			let span = document.createElement("span");
			span.classList.add("caret");
			span.innerHTML = "<span class='property'>" + dat + "</span>";
			li2.appendChild(span);

			if((typeof data[dat] === "object") && (data[dat] !== null)){
				if(isObjectEmpty(data[dat])) {
					if(Array.isArray(data[dat])){
						span.innerHTML = span.innerHTML + " : <span class='data'>[]</span>";
					} else {
						span.innerHTML = span.innerHTML + " : <span class='data'>{}</span>";
					}
					span.classList.remove("caret");
				} else {
					let subUl = createUL(data[dat], title);
					li2.appendChild(subUl);
				}
			} else {
				if(isColor(data[dat])){
					li2.removeChild(li2.firstChild);
					span = createColorSquare(data[dat], dat);
					li2.appendChild(span);
				} else {
					span.innerHTML = span.innerHTML + " : <span class='data'>" + data[dat] + "</span>";
					span.classList.remove("caret");
				}
			}			
		}
	}

	return ul;
};

function isObjectEmpty(obj) {
	for(let key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
};

function createColorSquare(color, name){
	let container = document.createElement("span");
	let prop = document.createElement("span");
	prop.classList.add("property");
	prop.innerHTML = name + " : ";
	let data = document.createElement("span");
	data.classList.add("colorSquare");
	data.innerHTML = " ";
	data.style.backgroundColor = color;
	let afterData = document.createElement("span");
	afterData.innerHTML = " " + color;
	
	container.append(prop);
	container.append(data);
	container.append(afterData);
	return container;
};

function isColor(color) {

	if(typeof color !== "string"){
		return false;
	}

	color = color.replace(/\s/g, '');
	color = color.toLowerCase();

	let isColor = false;
	let regExps = { // TODO figure out why hsl and hsla are not working
		hex : /^#?([a-f\d]{3}|[a-f\d]{6})$/,
		rgb: /^rgb\((0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d)\)$/,
		hsl: /^hsl\((0|360|35\d|3[0-4]\d|[12]\d\d|0?\d?\d),(0|100|\d{1,2})%,(0|100|\d{1,2})%\)$/,
		hsla: /^hsla\((0|360|35\d|3[0-4]\d|[12]\d\d|0?\d?\d),(0|100|\d{1,2})%,(0|100|\d{1,2})%,(0?\.\d|1(\.0)?)\)$/,
		rgba: /^rgba\((0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0?\.\d|1(\.0)?)\)$/
	};

	for(let reg in regExps) {
		let re = new RegExp(regExps[reg]);
		if(re.test(color)){
			isColor = true;
		}
	}

	return isColor;
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
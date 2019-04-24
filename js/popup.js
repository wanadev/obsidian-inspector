chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Send message to content_script when opening popup to retrieve data
	chrome.tabs.sendMessage(tabs[0].id, {query: "obsidianDetails"}, function(response) {
		buildPopup(response.details)
	});
});
/*
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Send message to content_script when opening popup to retrieve data
	chrome.tabs.sendMessage(tabs[0].id, {query: "popup_open"}, function(response) {
		//buildPopup(response.details)
	});
});*/

function buildPopup(data) {
	document.getElementById('name').innerHTML = data.name;

	var modDrowdown = createDropdown(data.modules, "Modules");
	document.getElementById('modules').appendChild(modDrowdown);

	var eventsDrowdown = createDropdown(data.events, "Events");
	document.getElementById('events').appendChild(eventsDrowdown);

	var configDrowdown = createDropdown(data.config, "Configurations");
	document.getElementById('configs').appendChild(configDrowdown);

	createListeners();
};

function createDropdown(data, title) {
	let ul = document.createElement("UL");
	ul.classList.add("topUL");
	let li = document.createElement("LI");
	let span = document.createElement("SPAN");
	span.classList.add("caret");
	span.innerHTML = title;
	li.appendChild(span);
	ul.appendChild(li);

	var ul2 = createUL(data);
	li.appendChild(ul2);

	return ul;
};

function createUL(data) {
	let ul = document.createElement("UL");
	ul.classList.add("subUL");
	ul.classList.add("nested");

	if(Array.isArray(data)) {
		for(let i = 0; i < data.length; i++) {
			var li = document.createElement('LI');
			li.innerHTML = "<span class='property'>" + data[i] + "</span>";
			ul.appendChild(li);
		}
	} else if((typeof data === "object") && (data !== null)){
		for(var dat in data) {
			let li2 = document.createElement('LI');
			ul.appendChild(li2);
			let span = document.createElement("SPAN");
			span.classList.add("caret");
			span.innerHTML = "<span class='property'>" + dat + "</span>";
			li2.appendChild(span);

			if((typeof data[dat] === "object") && (data[dat] !== null)){
				if(isEmpty(data[dat])) {
					span.innerHTML = span.innerHTML + " : <span class='data'>{}</span>";
					span.classList.remove("caret");
				} else {
					var subUl = createUL(data[dat]);
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
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function createListeners() {
	var toggler = document.getElementsByClassName("caret");
	var i;

	for (i = 0; i < toggler.length; i++) {
		toggler[i].addEventListener("click", function() {
			this.parentElement.querySelector(".nested").classList.toggle("active");
			this.classList.toggle("caret-down");
		});
	}
};


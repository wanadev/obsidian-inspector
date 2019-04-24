setTimeout(function() {
	let app = window.app; // get app data from window (thanks to Obsidian debug mode which stores the app in global window)
	let data = {};
	console.log(app);

	data.name = app.name;

	let moduleKeys = Object.keys(app.modules);
	let modules = [];
	for(let i = 0; i < moduleKeys.length; i++) {
		modules.push(moduleKeys[i]);
	}
	data.modules = modules;

	let eventSymbols = Object.getOwnPropertySymbols(app.events);
	let eventsObj = app.events[eventSymbols[0]];
	let eventKeys = Object.keys(eventsObj);
	let events = [];
	for(let i = 0; i < eventKeys.length; i++) {
		events.push(eventKeys[i]);
	}
	data.events = events;

	let configSymbols = Object.getOwnPropertySymbols(app.config);
	baseConfigObj = app.config[configSymbols[2]];
	customConfigObj = app.config[configSymbols[3]];
	let config = {
		'base' : baseConfigObj,
		'custom' : customConfigObj
	};

	data.config = config;

	let editorExtensionId = "hbnecabohpdlalamamfokccklhojjcdi";

	chrome.runtime.sendMessage(editorExtensionId ,{query: "obsidianDetails", details: data}, function(response) {}); // Send data back to popup.js

}, 0);
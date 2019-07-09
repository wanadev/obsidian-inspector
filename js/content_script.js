function initialize() {
	createListeners();
};

function createListeners() {
	let details = null;

	// Wait for popup_open event to inject script into visited webpage
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			sendResponse("Gathering data...");
			if(request.query == "popup_open"){
				executeInPage(getData, false, chrome.runtime.id);
			}
		}
	);
};

// Function to inject on obsidian page to retrive data
function getData(extensionId) {
	if(!window.app){
		chrome.runtime.sendMessage(document.scripts.obsInspector.dataset.dataId ,{query: "obsidianDetails", details: "noObsidian"}, function(response) {}); // Send data back to popup.js
		return;
	}
	let app = window.app; // get app data from window (thanks to Obsidian debug mode which stores the app in global window)
	console.log(app); 
	
	let data = {};

	data.name = app.name; // Get app's name

	// Retrieve installed modules
	let moduleKeys = Object.keys(app.modules); // Get installed modules
	let modules = [];
	for(let i = 0; i < moduleKeys.length; i++) {
		modules.push(moduleKeys[i]);
	}
	data.modules = modules;

	// Retrieve registered events
	let eventSymbols = Object.getOwnPropertySymbols(app.events); // Get registered events
	let eventsObj = app.events[eventSymbols[0]];
	let eventKeys = Object.keys(eventsObj);
	let events = [];
	for(let i = 0; i < eventKeys.length; i++) {
		events.push(eventKeys[i]);
	}
	data.events = events;

	// Retrieve configurations infos
	let configSymbols = Object.getOwnPropertySymbols(app.config);  // Get app's configs
	baseConfigObj = app.config[configSymbols[2]];
	customConfigObj = app.config[configSymbols[3]];
	let config = {
		'base' : baseConfigObj,
		'custom' : customConfigObj
	};
	data.config = config;

	// Retrieve dataStore infos if dataStore module is installed
	if(app.modules.dataStore){
		let structuresElements = app.modules.dataStore.listEntities();
		let structures = {};
		for(let i = 0; i < structuresElements.length; i++) {
			if(structuresElements[i].name){
				structures[structuresElements[i].name] = structuresElements[i].serialize();
			} else {
				structures[structuresElements[i].id] = structuresElements[i].serialize();
			}
		}
		data.structures = structures;
	}

	// Retrieve history infos if history module is installed
	if(app.modules.history) {
		let history = {};
		history.maxLength = app.modules.history.maxLength;
		history.pointer = app.modules.history.pointer;
		history.snapshots = {};
		for(let i = 0; i < app.modules.history.snapshots.length; i++){
			history.snapshots[i] = app.modules.history.snapshots[i];
		}
		data.history = history;
	}

	// Retrieve stonejs infos if stonejs module is installed
	if(app.modules.stonejs){
		let stonejs = {};
		stonejs.locale = app.modules.stonejs.getLocale();
		stonejs.catalogs = app.modules.stonejs.listCatalogs();
		stonejs.guessedUserLanguage = app.modules.stonejs.guessUserLanguage();
		data.stonejs = stonejs;
	}

	if (app.modules.vuejs) {
		let vuejs = {};
		let keys = Object.keys(app.modules.vuejs.data);
		for(let i = 0; i < keys.length; i++) {
			if(keys[i] === "modules") {
				vuejs.modules = {};
				for(let j = 0; j < app.modules.vuejs.data.modules.length; j++) {
					vuejs.modules[app.modules.vuejs.data.modules[j].name] = {};
					let kekeys = Object.keys(app.modules.vuejs.data.modules[j]);
					for(let k = 0; k < kekeys.length; k++) {
						if(kekeys[k] === "methods") {
							vuejs.modules[app.modules.vuejs.data.modules[j].name].methods = [];
							let methodKeys = Object.keys(app.modules.vuejs.data.modules[j].methods);
							for(let m = 0; m < methodKeys.length; m++) {
								vuejs.modules[app.modules.vuejs.data.modules[j].name].methods.push(app.modules.vuejs.data.modules[j].methods[methodKeys[m]].name);
							}
						} else {
							vuejs.modules[app.modules.vuejs.data.modules[j].name][kekeys[k]] = app.modules.vuejs.data.modules[j][kekeys[k]];
						}
					}
				}
			} else {
				vuejs[keys[i]] = app.modules.vuejs.data[keys[i]];
			}
		}
		
		data.vuejs = vuejs;
	}

	//console.log("DATA", data);

	// Send back all gathered infos to extension's popup.js
	chrome.runtime.sendMessage(document.scripts.obsInspector.dataset.dataId ,{query: "obsidianDetails", details: data}, function(response) {}); // Send data back to popup.js
};

// Executes passed function into page by stringifing it and injecting it as a script with provided arguments
function executeInPage(functionToRunInPage, leaveInPage, id) {
   
    function convertToText(args) {
       
        var asText = '';
        var level = 0;
        function lineSeparator(adj, isntLast) {
            level += adj - ((typeof isntLast === 'undefined' || isntLast) ? 0 : 1);
            asText += (isntLast ? ',' : '') +'\n'+ (new Array(level * 2 + 1)).join('');
        }
        function recurseObject(obj) {
            if (Array.isArray(obj)) {
                asText += '[';
                lineSeparator(1);
                obj.forEach(function(value, index, array) {
                    recurseObject(value);
                    lineSeparator(0, index !== array.length - 1);
                });
                asText += ']';
            } else if (obj === null) {
                asText +='null';
            } else if (obj === void(0)) {
                asText +='void(0)';
            } else if (Number.isNaN(obj)) {
                asText +='Number.NaN';
            } else if (obj === 1/0) {
                asText +='1/0';
            } else if (obj === 1/-0) {
                asText +='1/-0';
            } else if (obj instanceof RegExp || typeof obj === 'function') {
                asText +=  obj.toString();
            } else if (obj instanceof Date) {
                asText += 'new Date("' + obj.toJSON() + '")';
            } else if (typeof obj === 'object') {
                asText += '{';
                lineSeparator(1);
                Object.keys(obj).forEach(function(prop, index, array) {
                    asText += JSON.stringify(prop) + ': ';
                    recurseObject(obj[prop]);
                    lineSeparator(0, index !== array.length - 1);
                });
                asText += '}';
            } else if (['boolean', 'number', 'string'].indexOf(typeof obj) > -1) {
                asText += JSON.stringify(obj);
            } else {
                console.log('Didn\'t handle: typeof obj:', typeof obj, '::  obj:', obj);
            }
        }
        recurseObject(args);
        return asText;
    }
    var newScript = document.createElement('script');
    if(typeof id === 'string' && id) {
        newScript.id = "obsInspector";
        newScript.dataset.dataId = id;
    }
    var args = [];
    for(var index = 3;index < arguments.length; index++){
        args.push(arguments[index]);
    }
    newScript.textContent = '(' + functionToRunInPage.toString() + ').apply(null,' + convertToText(args) + ");";
    (document.head || document.documentElement).appendChild(newScript);
    if(!leaveInPage) {
        document.head.removeChild(newScript);
    }
    return newScript;
};

initialize();
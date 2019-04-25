function initialize() {
	createListeners();
};

function createListeners() {
	let details = null;

	// Wait for popup_open event to inject script into visited webpage
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			sendResponse("OK");
			if(request.query == "popup_open"){
				executeInPage(getData, false, chrome.runtime.id);
			}
		}
	);
};

// Function to inject on obsidian page to retrive data
function getData(extensionId) {
	let app = window.app; // get app data from window (thanks to Obsidian debug mode which stores the app in global window)
	let data = {};

	data.name = app.name; // Get app's name

	let moduleKeys = Object.keys(app.modules); // Get installed modules
	let modules = [];
	for(let i = 0; i < moduleKeys.length; i++) {
		modules.push(moduleKeys[i]);
	}
	data.modules = modules;

	let eventSymbols = Object.getOwnPropertySymbols(app.events); // Get registered events
	let eventsObj = app.events[eventSymbols[0]];
	let eventKeys = Object.keys(eventsObj);
	let events = [];
	for(let i = 0; i < eventKeys.length; i++) {
		events.push(eventKeys[i]);
	}
	data.events = events;

	let configSymbols = Object.getOwnPropertySymbols(app.config);  // Get app's configs
	baseConfigObj = app.config[configSymbols[2]];
	customConfigObj = app.config[configSymbols[3]];
	let config = {
		'base' : baseConfigObj,
		'custom' : customConfigObj
	};

	data.config = config;

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
    for(var index=3;index<arguments.length;index++){
        args.push(arguments[index]);
    }
    newScript.textContent = '(' + functionToRunInPage.toString() + ').apply(null,'
                            + convertToText(args) + ");";
    (document.head || document.documentElement).appendChild(newScript);
    if(!leaveInPage) {
        document.head.removeChild(newScript);
    }
    return newScript;
};

initialize();
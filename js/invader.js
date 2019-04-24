setTimeout(function() {    
    var app = window.app;
    var data = {};
    console.log(app);
    console.log(app.config);

    data.name = app.name;

    var moduleKeys = Object.keys(app.modules);
    var modules = [];
    for(var i = 0; i < moduleKeys.length; i++) {
    	console.log(moduleKeys[i]);
    	modules.push(moduleKeys[i]);
    }
    data.modules = modules;

    var eventSymbols = Object.getOwnPropertySymbols(app.events);
    var eventsObj = app.events[eventSymbols[0]];
    var eventKeys = Object.keys(eventsObj);
    var events = [];
    for(var i = 0; i < eventKeys.length; i++) {
    	events.push(eventKeys[i]);
    }
    data.events = events;

    var configSymbols = Object.getOwnPropertySymbols(app.config);
	baseConfigObj = app.config[configSymbols[2]];
	customConfigObj = app.config[configSymbols[3]];
	var config = {
		'base' : baseConfigObj,
		'custom' : customConfigObj
	};

	data.config = config;

    document.dispatchEvent(new CustomEvent('obsidianDetails', {
        'detail': data
    }));
}, 0);
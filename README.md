# Obsidian Inspector (browser extension) - Easily inspect Obsidian Framework

## Features

* Installed modules
* Registered events
* Configurations
* Structures (if dataStore module is installed)
* History (if history module is installed)
	- maxLength
	- pointer
	- snapshots
* Stonejs (if stonejs module is installed)
	- locale
	- registered catalogs

## Building

* Install packages with `npm install`
* `grunt build` to update *release* folder

## Installation

### Google Chrome

* *Google Chrome* -> *More tools* -> *Extensions* -> *Activate Developer Mode* -> *Load Unpacked Extension* and select the *release* folder.

### Mozilla Firefox

* Navigate to *about:debugging*, click on *Load Temporary Add-on* and select the *manifest.json* file.

## Creating package

* `grunt pack` creates two archives (chrome and firefox packages) in `build/`


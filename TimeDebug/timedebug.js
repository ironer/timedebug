/**
 * Copyright (c) 2013 Stefan Fiedler & Michal Kovar
 * Object for TimeDebug GUI
 * @author: Stefan Fiedler (http://ironer.cz)
 * used sources: Seznam's JAK library (http://seznam.cz)
 */

// TODO: animace pro dokonceni title action
// TODO: vyexportovat nastaveni do konzole
// TODO: nacist nastaveni z konzole

// TODO: ulozit serii testu v TimeDebugu
// TODO: vyplivnout vystup do iframe nebo dalsiho okna

var td = {};

td.local = false;
td.get = '';
td.post = [];
td.maxUrlLength = 1000;

td.logView = JAK.gel('logView');
td.logWrapper = td.logView.parentNode;
td.logContainer = td.logWrapper.parentNode;
td.logRows = [];
td.logRowsChosen = [];
td.logRowActive = null;
td.logRowActiveId = 0;
td.dumps = [];
td.indexes = [];
td.response = null;
td.hash2Id = {};
td.hash2LogId = {};
td.oldRequest = '[]';
td.allowClick = true;
td.clickTimeout = null;

td.tdContainer = JAK.mel('div', {'id': 'tdContainer'});
td.tdOuterWrapper = JAK.mel('div', {'id': 'tdOuterWrapper'});
td.tdInnerWrapper = JAK.mel('div', {'id': 'tdInnerWrapper'});
td.tdView = JAK.mel('pre', {id: 'tdView'});
td.tdFullWidth = false;
td.tdWidth = 400;
td.wrapperWidth = null;
td.wrapperHeight = null;

td.control = JAK.cel('div', 'nd-control');
td.controlSpaceX = 0;
td.help = '';

td.visibleTitles = [];
td.activeTitle = null;
td.scrollTitle = null;
td.titleShowData = {'timeout': null, 'element': null, 'tar': null, 'left': 0, 'top': 0};
td.titleHideTimeout = null;
td.hide = [0, JAK.mel('div', {'id': 'tdTitleMask'}), JAK.mel('pre', {'id': 'tdNoTitles', 'innerHTML': 'Titulky vypnuty'})];

td.viewSize = JAK.DOM.getDocSize();
td.spaceX = 0;
td.spaceY = 0;
td.zIndexMax = 100;

td.actionData = {'element': null, 'listeners': []};

td.tdConsole = null;
td.consoleConfig = {'x': 600, 'y': 340};
td.textareaTimeout = null;
td.consoleHoverTimeout = null;
td.changes = [];
td.results = [];
td.fullResults = [];
td.tdChangeList = JAK.mel('div', {'id': 'tdChangeList'});
td.deleteChange = JAK.mel('div', {'id': 'tdDeleteChange', 'innerHTML': 'X', 'showLogRow': true});
td.hoveredChange = null;
td.noContainerChangeIndex = 65535;

td.tdHashEl = null;
td.tdAnchor = JAK.mel('a', {'name': 'tdAnchor'});
td.logAnchor = JAK.mel('a', {'name': 'logAnchor', 'id': 'logAnchor'});
td.setLocHashTimeout = null;
td.locationHashes = [];

td.encodeChars = {'&': '&amp;', '<': '&lt;', '>': '&gt;'};

td.jsonReplaces = {
	"string": [[/^(\w*)$/, '"$1"']],
	"dblquotes": [[/"/g, '\\"']],
	"quotes": [[/'/g, '"']],
	"commas": ['fixCommas'],
	"numbers": ['fixNumbers'],
	"objects": ['fixObjects'],
	"keys": [[/(\{\s*|,\s*)([^\{\}\[\]'",:\s]*)(?=\s*:)/gm, '$1"$2"']],
	"constants": [[/\b(true|false|null)\b/gi, function(w) { return w.toLowerCase(); }]]
};

td.jsonRepairs = [
	["constants"],
	["string"],
	["commas", "numbers"],
	["dblquotes", "quotes", "commas", "numbers"],
	["keys"],
	["dblquotes", "quotes", "keys", "constants"],
	["quotes", "keys", "constants"],
	["objects", "keys", "constants"],
	["objects", "keys", "commas", "numbers", "constants"],
	["dblquotes", "quotes", "objects", "keys", "constants"],
	["quotes", "objects", "keys", "constants"],
	["dblquotes", "quotes", "objects", "keys", "commas", "constants", "numbers"],
	["quotes", "objects", "keys", "commas", "constants", "numbers"]
];

td.keyChanges = {
	"'": ["'", "'"], '"': ['"', '"'],
	'[': ['[', ']'], ']': ['[', ']'],
	'(': ['(', ')'], ')': ['(', ')'],
	'{': ['{', '}'], '}': ['{', '}']
};

td.consoleSelects = {"]": "[", "}": "{"};

td.init = function(logId) {
	JAK.DOM.addClass(document.body.parentNode, 'nd-td' + (td.local ? ' nd-local' : ''));
	document.body.style.marginLeft = td.tdContainer.style.width = td.control.style.left = td.tdWidth + 'px';
	td.viewSize = JAK.DOM.getDocSize();

	var el, i, j, k, l, elements, tdIndex;
	var logNodes = td.logView.childNodes;

	for (i = 0, j = logNodes.length; i < j; ++i) {
		if (logNodes[i].nodeType === 1 && logNodes[i].tagName.toLowerCase() === 'pre') {
			if (JAK.DOM.hasClass(logNodes[i], 'nd-dump')) {
				td.hash2Id[logNodes[i].hash = logNodes[i].getAttribute('data-hash')] = logNodes[i].id;
				logNodes[i].runtime = logNodes[i].getAttribute('data-runtime');
				logNodes[i].onmousedown = td.changeVar;
				td.setTitles(logNodes[i]);
			} else if (JAK.DOM.hasClass(logNodes[i], 'nd-log')) {
				td.logRows.push(logNodes[i]);
				td.hash2Id[logNodes[i].hash = logNodes[i].getAttribute('data-hash')] = logNodes[i].id;
				td.hash2LogId[logNodes[i].hash] = logNodes[i].logId = td.logRows.length;
				logNodes[i].runtime = logNodes[i].getAttribute('data-runtime');
				logNodes[i].logTitle = logNodes[i].getAttribute('data-title');
				logNodes[i].onclick = td.logClick;
				td.setTitles(logNodes[i]);
				elements = logNodes[i].getElementsByTagName('a');
				for (k = elements.length; k-- > 0;) elements[k].onclick = JAK.Events.stopEvent;
			} else if (JAK.DOM.hasClass(logNodes[i], 'nd-view-dump')) {
				td.dumps.push(logNodes[i]);
				logNodes[i].objects = [];
				logNodes[i].oriId = logNodes[i].id;
				td.setTitles(logNodes[i]);
				elements = logNodes[i].childNodes;
				for (k = elements.length; k-- > 0;) {
					if (elements[k].nodeType === 1 && (tdIndex = elements[k].getAttribute('data-tdindex')) !== false) {
						tdIndex = parseInt(tdIndex);
						logNodes[i].objects[tdIndex] = elements[k];
						elements[k].tdIndex = tdIndex;
					}
				}
			}
		}
	}

	for (i = 0, j = td.logRows.length, l = -1; i < j; ++i, l = k) {
		if ((k = td.indexes[i]) !== l) {
			el = td.dumps[k];
			el.logRow = td.logRows[i];
			td.tdInnerWrapper.appendChild(el);
		}
	}

	td.logRowsChosen.length = td.logRows.length;

	td.tdInnerWrapper.appendChild(td.tdView);
	td.tdOuterWrapper.appendChild(td.tdInnerWrapper);
	td.tdContainer.appendChild(td.tdOuterWrapper);
	document.body.insertBefore(td.tdContainer, document.body.childNodes[0]);

	td.control.innerHTML = '<span class="nd-titled"><span id="controlTitle" class="nd-title"><strong class="nd-inner">'
		+ '<hr><div class="nd-menu">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
		+ (td.local ? '<span id="tdMenuSend"><b>odeslat</b></span>&nbsp;&nbsp;&nbsp;&nbsp;' : '')
		+ '<span id="tdMenuRestore">obnovit</span>&nbsp;&nbsp;&nbsp;&nbsp;'
		+ '<span class="nd-titled"><span id="helpTitle" class="nd-title"><strong class="nd-inner">'
		+ td.help
		+ '</strong></span>napoveda</span>'
		+ '     |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="tdMenuSave">ulozit</span>'
		+ '&nbsp;&nbsp;&nbsp;&nbsp;<span class="nd-titled"><span id="saveTitle" class="nd-title"></span>nahrat</span>'
		+ '     |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>export</span>'
		+ '&nbsp;&nbsp;&nbsp;&nbsp;<span>import</span>'
		+ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><hr>'
		+ '</strong></span>*</span>';

	document.body.appendChild(td.control);
	td.control.controlTitle = JAK.gel('controlTitle');
	td.control.helpTitle = JAK.gel('helpTitle');
	td.control.saveTitle = JAK.gel('saveTitle');
	td.control.saveTitle.appendChild(td.control.saveTitle.tdInner = JAK.cel('strong', 'nd-inner'));
	td.loadSavesInner();
	JAK.Events.addListener(td.control.saveTitle.tdInner, 'mousedown', td, td.saveAction);

	JAK.Events.addListener(td.control, 'mousedown', td, td.logAction);
	td.controlSpaceX = td.control.clientWidth + JAK.DOM.scrollbarWidth();
	td.control.controlTitle.appendChild(td.tdChangeList);
	if (td.local) JAK.Events.addListener(JAK.gel('tdMenuSend'), 'mousedown', td, td.sendChanges);
	JAK.Events.addListener(JAK.gel('tdMenuSave'), 'mousedown', td, td.saveState);

	JAK.Events.addListener(JAK.gel('tdMenuRestore'), 'mousedown', td, td.reloadPage);
	td.showDump(logId);
	JAK.Events.addListener(window, 'resize', td, td.windowResize);
	JAK.Events.addListener(document, 'contextmenu', td, td.tdStop);
	JAK.Events.addListener(td.tdInnerWrapper, 'mousedown', td, td.changeVar);

	if (window.addEventListener) {
		window.addEventListener('DOMMouseScroll', td.mouseWheel, false);
		if (JAK.Browser.client === 'gecko') window.addEventListener('MozMousePixelScroll', td.ffPreventWheelDouble, false);
	}
	window.onmousewheel = document.onmousewheel = td.mouseWheel;
	document.onkeydown = td.readKeyDown;
	document.onmouseup = td.noRightClickSelection;

	if (td.response.length) {
		td.setChangesData(td.response);
		td.oldRequest = JSON.stringify(td.getChangesData());
	}
	td.setTitles(td.control);
	if (localStorage.tdLastRequest) td.loadLastRequest();
};

td.loadLastRequest = function() {
	var lastRequest = JSON.parse(b62s.decompress(b62s.base32kTo8(localStorage.tdLastRequest)));
	delete(localStorage.tdLastRequest);

	td.setTdData(lastRequest['config']);
	td.setTitlesData(lastRequest['titles']);
	if (lastRequest['changes']) td.updateChangesData(lastRequest['changes']);
};

td.ffPreventWheelDouble = function(e) {
	if (td.scrollTitle === null || td.scrollTitle.clientHeight === td.scrollTitle.scrollHeight) return true;
	td.tdStop(e);
	return false;
};

td.mouseWheel = function(e) {
	if (td.scrollTitle === null || td.scrollTitle.clientHeight === td.scrollTitle.scrollHeight) return true;
	td.tdStop(e);
	var delta = 0;

	if (e.wheelDelta) delta = (e.wheelDelta > 0 ? -1 : 16);
	else if (e.detail) delta = (e.detail < 0 ? -1 : 16);

	td.scrollTitle.scrollTop = Math.max(0, 16 * parseInt((td.scrollTitle.scrollTop + delta) / 16));
	return false;
};

td.noRightClickSelection = function(e) {
	if (td.tdConsole !== null || e.button !== JAK.Browser.mouse.right) return true;

	if (window.getSelection) {
		if (window.getSelection().empty) {
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {
		document.selection.empty();
	}

	return false;
};

td.changeVar = function(e) {
	if (!td.local || e.shiftKey || e.ctrlKey || e.metaKey || e.button !== JAK.Browser.mouse.right) return true;

	var tar = td.getTargetElement(e);

	td.tdStop(e);

	if (e.altKey) {
		if (JAK.DOM.hasClass(tar, 'nd-array')) {
			if (JAK.DOM.hasClass(tar, 'nd-top')) td.hideTitle(td.activeTitle);
			td.consoleOpen(tar, td.saveArrayAdd);
		} else if (td.isArrayElement(tar)) {
			if (tar.change && tar.change.data.type === 2) return false;
			td.saveVarChange(2, tar);
		}
	} else if (JAK.DOM.hasClass(tar, 'nd-key')) {
		if (tar.change && tar.change.data.type === 2 && tar.oriTitle) tar.title = tar.oriTitle;
		td.consoleOpen(tar, td.saveVarChange);
	} else if (JAK.DOM.hasClass(tar, 'nd-top')) {
		td.hideTitle(td.activeTitle);
		td.consoleOpen(tar, td.saveVarChange);
	}

	return false;
};

td.isArrayElement = function(el) {
	var key;
	return JAK.DOM.hasClass(el, 'nd-key') && (key = el.parentNode.getAttribute('data-pk')) && !(key[0] % 2);
};

td.switchFullHeight = function(result, force) {
	force = force || 0;

	if (!result.fullHeight && force !== 1) {
		td.fullResults.push(result);
		result.fullHeight = true;
		JAK.DOM.addClass(result, 'nd-fullheight');
	} else if (result.fullHeight && force !== 2) {
		td.fullResults.splice(td.fullResults.indexOf(result), 1);
		result.fullHeight = false;
		JAK.DOM.removeClass(result, 'nd-fullheight');
	}
};

td.changeAction = function(e, el) {
	if (!td.local || e.ctrlKey || e.metaKey) return true;

	if (el.res && e.button === JAK.Browser.mouse.left) {
		if (e.altKey) td.switchFullHeight(el);
		return true;
	}

	var hashes = [], tar = td.getTargetElement(e);

	if (e.button === JAK.Browser.mouse.right) {
		td.tdStop(e);

		if (tar.id === 'tdDeleteChange') {
			if (!e.altKey) return false;
			this.deleteMe = true;

			td.updateChangeList();
			return false;
		} else if (e.altKey) {
			if (this.data.type !== 2 && this.varEl && td.isArrayElement(this.varEl)) td.saveVarChange(2, this.varEl);
			return false;
		}

		if (this.logRow) td.showLog(true, this.logRow);
		if (this.varEl) {
			if (this.data.type === 2 && this.varEl.oriTitle) this.varEl.title = this.varEl.oriTitle;
			td.consoleOpen(this.varEl, td.editVarChange);
		}
		return false;
	} else if (e.button === JAK.Browser.mouse.left && !e.altKey) {
		JAK.Events.cancelDef(e);

		if (JAK.DOM.hasClass(tar, 'nd-ori-var')) return true;
		if (tar.id === 'tdDeleteChange') {
			tar.showLogRow = !tar.showLogRow;
			td.checkDeleteChange();
			return true;
		}
		if (e.shiftKey) {
			if (this.data.type === 2) return true;
			var jsonString, formatedJson, update = false;
			if (!this.valid) {
				this.varEl.title = this.title = jsonString = JSON.stringify(this.data.value);
				this.valid = update = true;
			}
			if (!this.formated) {
				if ((formatedJson = td.formatJson(this.data.value)) === false) {
					this.formated = false;
				} else {
					this.varEl.title = this.title = jsonString = formatedJson;
					this.formated = update = true;
				}
			}
			if (!update) return true;
			if (this.data.type % 2) this.data.type = this.valid && jsonString[0] === '{' ? 3 : 1;
			td.updateChangeList(this);
			return true;
		}
		if (this.logRow) {
			td.showLog(true, this.logRow);

			if (td.tdFullWidth) {
				if (this.varEl) hashes.push([td.tdInnerWrapper, 'tdAnchor', td.tdContainer, 200]);
			} else {
				if (this.varEl) hashes.push([td.tdInnerWrapper, 'tdAnchor', td.tdContainer, 100]);
				hashes.push([td.logWrapper, 'logAnchor', td.logContainer, 100]);
			}
		} else {
			if (this.varEl) hashes.push([td.logWrapper, 'tdAnchor', td.logContainer, 100]);
		}
		td.setLocationHashes(true, hashes);
	}
	return true;
};

td.formatJson = function(json) {
	var text = JSON.stringify(json);
	var escaped = false, retVal = '';

	var quotes = {'"': false};
	var nested = {'[': 0, '{': 0};
	var ends = {']': '[', '}': '{'};

	for (var i = 0, j = text.length; i < j; ++i) {
		if (escaped) escaped = false;
		else if (text[i] === '\\') escaped = true;
		else if (quotes.hasOwnProperty(text[i])) quotes[text[i]] = !quotes[text[i]];
		else if (!quotes['"']) {
			if (nested.hasOwnProperty(text[i])) {
				++nested[text[i]];
				retVal += text[i] + '\n' + td.padJson(nested);
				continue;
			} else if (ends.hasOwnProperty(text[i])) {
				if (--nested[ends[text[i]]] < 0) return false;
				retVal += '\n' + td.padJson(nested) + text[i];
				continue;
			} else if (text[i] === ',') {
				retVal += text[i] + '\n' + td.padJson(nested);
				continue;
			} else if (text[i] === ':') {
				retVal += text[i] + ' ';
				continue;
			}
		}
		retVal += text[i];
	}

	if (nested['['] || nested['{'] || quotes['"']) return false;
	return retVal;
};

td.padJson = function(nested) {
	var retVal = '';
	for (var i = nested['['] + nested['{']; i-- > 0;) {
		retVal += '\t';
	}
	return retVal;
};

td.setLocationHashes = function(e, hashes) {
	var i;
	if (td.setLocHashTimeout) {
		window.clearTimeout(td.setLocHashTimeout);
		td.setLocHashTimeout = null;
	}
	if (e === true) {
		if (hashes) {
			td.locationHashes = hashes;
			td.setLocHashTimeout = window.setTimeout(td.setLocationHashes, 1);
		}
	} else if (i = (hashes = td.locationHashes).length) {
		while (i-- > 0) {
			hashes[i][0].style.height = (2 * hashes[i][0].clientHeight) + 'px';
			window.location.replace('#' + hashes[i][1]);
			hashes[i][2].scrollTop -= hashes[i][3];
			hashes[i][0].removeAttribute('style');
		}
		td.locationHashes.length = 0;
		window.location.replace('#');
	}
};

td.printPath = function(change) {
	var path = change.data.path.split('§');
	var i, j = path.length, k, close = '', key, retKey, retVal = '', elStart = '', elEnd = '';

	if (path[0] === 'log') {
		retVal = '<b>' + td.hash2Id[path[1]] + '</b>(' + path[i = 2] + ') ';
	} else if (path[0] === 'dump') {
		retVal = '<b>' + td.hash2Id[path[i = 1]] + '</b> ';
	} else return '';

	while (++i < j) {
		if (path[i][0] === '*') {
			k = parseInt(path[i][1]);
			retKey = '<b class="nd-reflection">' + (key = path[i].substring(2)) + '</b>';
			elStart = '<i class="nd-private">';
			elEnd = '</i>';
		} else if (path[i][0] === '#') {
			k = parseInt(path[i][1]);
			retKey = '<b class="nd-array-access">' + (key = path[i].substring(2)) + '</b>';
			elStart = '<i class="nd-private">';
			elEnd = '</i>';
		} else {
			k = parseInt(path[i][0]);
			retKey = elStart + (key = path[i].substring(1) || 'array') + elEnd;
			elStart = '';
			elEnd = '';
		}
		if (k > 6) break;

		retVal += !close || key == parseInt(key) ? retKey + close : "'" + retKey + "'" + close;

		if (k % 2) {
			retVal += '.'; close = "";
		} else {
			retVal += "["; close = "]";
		}
	}

	if (k === 9) retVal += '<i>(' + retKey + ')</i>';
	else retVal += !close || key == parseInt(key) ? retKey + close : "'" + retKey + "'" + close;

	if (change.data.type % 2) retVal += change.valid && typeof change.data.value === 'object' ? ' += ' : '[] = ';
	else if (change.data.type) retVal += ' <b class="nd-unset">(un$et)</b>';
	else retVal += ' = ';

	return retVal;
};

td.updateChangeList = function(el) {
	var change;
	var i = td.changes.length, j;
	if (el) el.lastChange = true;

	td.changes.sort(function(b, a) {
		return (parseFloat(a.runtime) - parseFloat(b.runtime)) ||
			(a.index.parentPrefix !== b.index.parentPrefix ? a.index.parentPrefix > b.index.parentPrefix :
				(a.index.parentIndex - b.index.parentIndex || a.index.changeIndex - b.index.changeIndex));
	});

	while (i-- > 0) {
		change = td.changes[i];
		if (change.deleteMe === true) {
			change.style.display = 'none';
			if (change.logRow && change.logRow.changedVarEls && (j = change.logRow.changedVarEls.indexOf(change.varEl)) !== -1) {
				change.logRow.changedVarEls.splice(j, 1);
			}
			if (change.listeners.length) JAK.Events.removeListeners(change.listeners);
			if (change.varEl) {
				td.deactivateChange(true, change);
				if (change.varEl.hideEl) change.varEl.hideEl.removeAttribute('style');
				change.varEl.parentNode.removeChild(change.varEl);
			}
			td.changes.splice(i, 1);
			continue;
		}

		change.innerHTML = '<span class="nd-time' + (typeof change.data.res !== 'undefined' ? ' nd-res nd-restype' + change.data.res + '">' : '">')
				+ '[' + change.runtime + ']</span> ' + td.printPath(change);

		if (change.data.type !== 2) {
			change.appendChild(JAK.mel('span', {
				'className': (change.valid ? 'nd-valid-json' : 'nd-invalid-json') + (change.formated ? ' nd-formated' : ''),
				'title': change.varEl ? change.varEl.title : td.formatJson(change.data.value),
				'innerHTML': JSON.stringify(change.data.value)
			}));
		}

		if (change.data.oriVar) { change.appendChild(change.data.oriVar); change.style.paddingRight = '16px'; }
		else change.removeAttribute('style');

		if (change.lastChange) {
			change.id = 'tdLastChange';
			change.lastChange = false;
		} else if (el) change.removeAttribute('id');

		td.tdChangeList.appendChild(change);
	}
	td.changes.reverse();

	var title = td.control.controlTitle;

	if (title.style.display !== 'block') return false;

	td.recalcControlSize();
	td.titleAutosize(title);

	return true;
};

td.parseJson = function(text) {
	var i = 0, j = td.jsonRepairs.length, retObj = td.testJson(text);
	if (retObj.status && (retObj.valid = true)) return retObj;

	for (;i < j; ++i) {
		if ((retObj = td.testJson(text, td.jsonRepairs[i])).status) return (retObj.valid = false) || retObj;
	}
	return {'status': false};
};

td.testJson = function(text, tests) {
	tests = tests || [];
	var i, j = tests.length, k, l, json, test;

	if (!j) {
		try {
			json = JSON.parse(text);
			return {'status': true, 'json': json};
		} catch(e) { return {'status': false} }
	}

	for (i = 0; i < j; ++i) {
		for (k = 0, l = (test = td.jsonReplaces[tests[i]]).length; k < l; ++k) {
			if (test[k] === 'fixCommas') text = td.jsonFixCommas(text);
			else if (test[k] === 'fixNumbers') text = td.jsonFixNumbers(text);
			else if (test[k] === 'fixObjects') text = td.jsonFixObjects(text);
			else text = text.replace(test[k][0], test[k][1]);
		}
		try {
			json = JSON.parse(text);
			return {'status': true, 'json': json};
		} catch(e) {}
	}

	return {'status': false};
};

td.jsonFixCommas = function(text) {
	var retVal = '', escaped = false, nested = false;

	for (var i = 0, j = text.length; i < j; ++i) {
		if (escaped) escaped = false;
		else if (text[i] === '\\') escaped = true;
		else if (text[i] === "'" || text[i] === '"') nested = !nested;
		else if (!nested && text[i] === ',' && text.slice(i).match(/^,\s*(?:\]|\})/m)) continue;
		retVal += text[i];
	}

	return nested ? text : retVal;
};

td.jsonFixNumbers = function(text) {
	var retVal = '', escaped = false, nested = false, replace;

	for (var i = 0, j = text.length; i < j;) {
		if (escaped) escaped = false;
		else if (text[i] === '\\') escaped = true;
		else if (text[i] === "'" || text[i] === '"') nested = !nested;
		else if (!nested && '0123456789'.indexOf(text[i]) !== -1 && (replace = text.slice(i).match(/^\d+,\d+/))) {
			retVal += replace[0].replace(',', '.');
			i += replace[0].length;
			continue;
		}
		retVal += text[i];
		++i;
	}

	return nested ? text : retVal;
};

td.jsonFixObjects = function(text) {
	var retVal = '', nested = 0, arrayLevels = [], escaped = false, ch;
	var quotes = {"'": false, '"': false};

	for (var i = 0, j = text.length; i < j; ++i) {
		ch = text[i];
		if (escaped) escaped = false;
		else if (text[i] === '\\') escaped = true;
		else if (quotes.hasOwnProperty(text[i])) quotes[text[i]] = !quotes[text[i]];
		else if (!quotes["'"] && !quotes['"']) {
			if (text[i] === '[' && (arrayLevels[++nested] = (td.findNearestChar(text, ':', i + 1) !== false))) ch = '{';
			else if (text[i] === ']' && arrayLevels[nested--]) ch = '}';
		}
		retVal += ch;
	}

	return nested ? text : retVal;
};

td.sumNested = function(nested) {
	nested = nested || {};
	var retVal = 0;
	for (var i in nested) {
		if (nested.hasOwnProperty(i)) retVal += nested[i];
	}
	return retVal;
};

td.noQuotes = function(quotes) {
	var retVal = false;
	for (var i in quotes) {
		if (quotes.hasOwnProperty(i)) retVal = retVal || quotes[i];
		if (retVal) break;
	}
	return !retVal;
};

td.findNearestChar = function(text, chars, index, rev, quotes) {
	index = index || 0;
	rev = rev || false;
	quotes = quotes || {"'": false, '"': false};

	var nested = {'[': 0, '{': 0};
	var ends = {']': '[', '}': '{'};
	var escaped = false;
	var found = [];
	var i, j, k;

	if (rev) {
		for (i = 0, j = text.length; i < j; ++i) {
			if (i === index) {
				var indexLevel = td.sumNested(nested);
				for (k = found.length; k-- > 0;) {
					if (found[k].level === indexLevel) return found[k].index;
					else if (found[k].level < indexLevel) return false;
				}
				return false;
			} else if (escaped) escaped = false;
			else if (text[i] === '\\') escaped = true;
			else if (quotes.hasOwnProperty(text[i])) quotes[text[i]] = !quotes[text[i]];
			else if (i < index && td.noQuotes(quotes)) {
				if (nested.hasOwnProperty(text[i])) ++nested[text[i]];
				else if (ends.hasOwnProperty(text[i]) && --nested[ends[text[i]]] < 0) return false;
				if (chars.indexOf(text[i]) !== -1) found.push({'index': i, 'level': td.sumNested(nested)});
			}
		}
	} else {
		for (i = 0, j = text.length; i < j; ++i) {
			if (escaped) escaped = false;
			else if (text[i] === '\\') escaped = true;
			else if (quotes.hasOwnProperty(text[i])) quotes[text[i]] = !quotes[text[i]];
			else if (i >= index && td.noQuotes(quotes)) {
				if (chars.indexOf(text[i]) !== -1 && !td.sumNested(nested)) return i;
				else if (nested.hasOwnProperty(text[i])) ++nested[text[i]];
				else if (ends.hasOwnProperty(text[i]) && --nested[ends[text[i]]] < 0) return false;
			}
		}
	}

	return false;
};

td.getVarData = function(el) {
	var revPath = [];
	var key = el.getAttribute('data-pk') || '8';
	var privateVar = key[0] === '7';
	var logRow = false;
	var i = -1;

	if (JAK.DOM.hasClass(el, 'nd-top')) {
		revPath.push('9' + el.className.split(' ')[0].split('-')[1]);
		while ((el = el.parentNode) && el.tagName.toLowerCase() !== 'pre') {}
		revPath.push(el.hash, 'dump');
	} else {
		if (JAK.DOM.hasClass(el, 'nd-key')) revPath.push(key + el.innerHTML);
		else if (JAK.DOM.hasClass(el, 'nd-array')) {
			revPath.push(key);
			if (JAK.DOM.hasClass(el.parentNode, 'nd-toggle')) el = el.parentNode;
		} else return false;

		while ((el = el.parentNode) && el.tagName.toLowerCase() === 'div' && null !== (key = el.getAttribute('data-pk'))) {
			if (parseInt(key[0]) % 2 && (++i + 1) && privateVar) {
				revPath.push((i ? '#' : '*') + key);
				privateVar = false;
			} else {
				revPath.push(key);
			}
			if (key[0] === '3' || key[0] === '4') privateVar = true;
		}
		if (JAK.DOM.hasClass(el, 'nd-dump')) {
			revPath.push(el.hash, 'dump');
		} else {
			revPath.push(el.tdIndex, td.logRowActive.hash, 'log');
			logRow = td.logRowActive;
		}
	}

	return {'path': revPath.reverse().join('§'), 'container': el, 'logRow': logRow};
};

td.saveVarChange = function(type, varEl) {
	type = type || 0;
	varEl = varEl || td.tdConsole.varEl;
	var varData = td.getVarData(varEl);
	if (varData === false) return false;

	var change, value = '', valid = false, formated = false, areaVal = '', update = true;

	if (type !== 2) {
		areaVal = td.tdConsole.area.value;
		var parsedJson = td.parseJson(areaVal);

		if (parsedJson.status) {
			value = parsedJson.json;
			valid = parsedJson.valid;
			formated = valid && (areaVal === td.formatJson(value));
			if (type % 2) type = valid && JSON.stringify(value)[0] === '{' ? 3 : 1;
		} else {
			value = areaVal;
			formated = valid = false;
		}

		td.consoleClose();
	}

	if (change = varEl.change) {
		if (change.data.type === type && (type === 2  || (change.valid === valid && change.formated === formated &&
				JSON.stringify(change.data.value) === JSON.stringify(value)))) {
			update = false;
		} else {
			change.data.type = type;
			if (type !== 2) {
				change.data.value = value;
				change.valid = valid;
				change.formated = formated;
			}
		}
	} else {
		varEl = td.duplicateNode(varEl);
		change = td.createChange({'path': varData.path, 'value': value, 'type': type}, varData.container, varEl, varData.logRow);
		change.valid = valid;
		change.formated = formated;
	}

	if (update || (type !== 2 && varEl.title !== areaVal)) {
		if (type === 2) {
			varEl.oriTitle = varEl.title;
			JAK.DOM.addClass(varEl, 'nd-var-unset');
		} else JAK.DOM.removeClass(varEl, 'nd-var-unset');

		varEl.title = areaVal;
		td.updateChangeList(change);
	}
	return true;
};

td.editVarChange = function() {
	return td.saveVarChange(td.tdConsole.varEl.change.data.type % 2 ? td.tdConsole.varEl.change.data.type : 0);
};

td.saveArrayAdd = function() {
	return td.saveVarChange(1);
};

td.createChange = function(data, container, varEl, logRow) {
	container = container || null;
	varEl = varEl || null;
	logRow = logRow || false;

	var change = JAK.mel('pre', {'className': 'nd-change'}), changeEls, i, j, k, key = [], resEl;
	change.data = data;
	td.changes.push(change);

	change.varEl = varEl;
	change.listeners = [
		JAK.Events.addListener(change, 'mouseover', change, td.activateChange),
		JAK.Events.addListener(change, 'mouseout', change, td.deactivateChange),
		JAK.Events.addListener(change, 'mousedown', change, td.changeAction)
	];

	if (logRow) {
		change.logRow = logRow;
		change.runtime = logRow.runtime;
		change.listeners.push(JAK.Events.addListener(change, 'mouseover', change.logRow, td.showLog));
		key = change.logRow.id.split('_');

		if (container && varEl) {
			if (typeof logRow.changedVarEls === 'undefined') logRow.changedVarEls = [varEl];
			else logRow.changedVarEls.push(varEl);

			JAK.DOM.addClass(varEl, 'nd-var-change');
			changeEls = JAK.DOM.getElementsByClass('nd-var-change', container.parentNode);
			for (i = 0, j = changeEls.length, k = 0; i < j; ++i) {
				if (change.logRow.changedVarEls.indexOf(changeEls[i]) !== -1) {
					changeEls[i].parentPrefix = key[0];
					changeEls[i].parentIndex = ~~key[1];
					changeEls[i].changeIndex = k++;
				}
			}
			change.index = change.varEl;
		}
	} else if (container) {
		change.runtime = container.runtime;
		key = container.id.split('_');

		if (varEl) {
			JAK.DOM.addClass(varEl, 'nd-var-change');
			changeEls = JAK.DOM.getElementsByClass('nd-var-change', container);
			for (i = 0, j = changeEls.length; i < j; ++i) {
				changeEls[i].parentPrefix = key[0];
				changeEls[i].parentIndex = ~~key[1];
				changeEls[i].changeIndex = i;
			}
			change.index = change.varEl;
		}
	} else change.runtime = ' N/A ';

	if (varEl) {
		varEl.change = change;
		change.listeners.push(JAK.Events.addListener(varEl, 'mouseover', varEl, td.hoverChange));
		change.listeners.push(JAK.Events.addListener(varEl, 'mouseout', varEl, td.unhoverChange));
	} else change.index = {
		'parentPrefix': key[0] || 'zzzzz',
		'parentIndex': ~~key[1] || 65535,
		'changeIndex': typeof data.resId === 'undefined' ? ++td.noContainerChangeIndex : 32767 + ~~data.resId.split('_').reverse()[0]
	};

	if (data.resId) {
		if (resEl = JAK.gel(data.resId)) {
			change.resEl = resEl;
			resEl.change = change;
			resEl.res = data.res;
			td.results.push(resEl);
			change.listeners.push(JAK.Events.addListener(resEl, 'mouseover', resEl, td.hoverChange));
			change.listeners.push(JAK.Events.addListener(resEl, 'mouseout', resEl, td.unhoverChange));
			change.listeners.push(JAK.Events.addListener(resEl, 'mousedown', change, td.changeAction));
		} else data.resId = null;
	}

	return change;
};

td.duplicateNode = function(varEl) {
	var newEl = varEl.cloneNode(true);
	newEl.hideEl = varEl;
	varEl.parentNode.insertBefore(newEl, varEl);
	varEl.style.display = 'none';
	return newEl;
};

td.checkDeleteChange = function() {
	if (td.deleteChange.showLogRow === true) JAK.DOM.addClass(td.deleteChange, 'nd-underline');
	else JAK.DOM.removeClass(td.deleteChange, 'nd-underline');
	return td.deleteChange;
};

td.activateChange = function(e, change) {
	if (e === true) td.hoveredChange = change;
	else if (td.actionData.element !== null) return false;
	else td.hoveredChange = this;

	if (td.hoveredChange.varEl) {
		td.tdHashEl = td.hoveredChange.varEl;
		td.tdHashEl.parentNode.insertBefore(td.tdAnchor, td.tdHashEl);
		JAK.DOM.addClass(td.tdHashEl, 'nd-hovered');
	}
	if (td.hoveredChange.resEl) JAK.DOM.addClass(td.hoveredChange.resEl, 'nd-hovered');

	td.hoveredChange.appendChild(td.checkDeleteChange());
	return true;
};

td.deactivateChange = function(e, change) {
	if (e !== true) change = this;

	if (change.varEl) {
		if (change.varEl === td.tdHashEl) td.tdHashEl = null;
		JAK.DOM.removeClass(change.varEl, 'nd-hovered');
	}
	if (change.resEl) JAK.DOM.removeClass(change.resEl, 'nd-hovered');
	if (this === td.hoveredChange) td.hoveredChange = null;
	return true;
};

td.hoverChange = function() {
	if (td.actionData.element !== null) return false;
	JAK.DOM.addClass(this.change, 'nd-hovered');
	if (this.res) {
		if (this.change.varEl) JAK.DOM.addClass(this.change.varEl, 'nd-hovered');
	} else if (this.change.resEl) JAK.DOM.addClass(this.change.resEl, 'nd-hovered');
	return true;
};

td.unhoverChange = function() {
	JAK.DOM.removeClass(this.change, 'nd-hovered');
	if (this.res) {
		if (this.change.varEl) JAK.DOM.removeClass(this.change.varEl, 'nd-hovered');
	} else if (this.change.resEl) JAK.DOM.removeClass(this.change.resEl, 'nd-hovered');
	return true;
};

td.consoleHover = function(areaClass) {
	if (td.consoleHoverTimeout) {
		window.clearTimeout(td.consoleHoverTimeout);
		td.consoleHoverTimeout = null;
	}

	if (areaClass) {
		td.tdConsole.area.className = areaClass;
		td.consoleHoverTimeout = window.setTimeout(td.consoleHover, 400);
	} else td.tdConsole.area.removeAttribute('class');
};

td.consoleAction = function(e) {
	if (e.button === JAK.Browser.mouse.left && (e.ctrlKey || e.metaKey)) {
		td.tdStop(e);

		if (e.shiftKey && !e.altKey) {
			var parsed = td.parseJson(this.value);
			if (parsed.status) {
				var formated = td.formatJson(parsed.json);
				if (formated === this.value) return false;
				if (!parsed.valid) td.consoleHover('nd-area-parsed');
				td.areaWrite(this, td.formatJson(parsed.json), this.selectionStart);
			} else td.consoleHover('nd-area-error');
		} else if (!e.shiftKey && e.altKey) {
			var cc = td.consoleConfig;
			if (typeof cc.oriX !== 'undefined') {
				cc.x = cc.oriX;
				cc.y = cc.oriY;
			}
			JAK.DOM.setStyle(this, {'width': cc.x + 'px', 'height': cc.y + 'px'});
		}
		return false;
	}
	return true;
};

td.consoleOpen = function(el, callback) {
	td.tdConsole = JAK.mel('div', {'id':'tdConsole'});
	td.tdConsole.mask = JAK.mel('div', {'id':'tdConsoleMask'});

	var attribs = {id:'tdConsoleArea'};
	if (el.areaValue) attribs.value = el.areaValue;
	else if (el.title) {
		attribs.value = td.tdConsole.mask.title = el.title;
		el.title = null;
	}

	td.tdConsole.area = JAK.mel('textarea', attribs, {'width': td.consoleConfig.x + 'px',
		'height': td.consoleConfig.y + 'px'});
	td.tdConsole.appendChild(td.tdConsole.mask);
	td.tdConsole.appendChild(td.tdConsole.area);
	td.tdConsole.varEl = el;
	document.body.appendChild(td.tdConsole);

	td.tdConsole.listeners = [
		JAK.Events.addListener(td.tdConsole.area, 'keypress', td.tdConsole.area, td.readConsoleKeyPress),
		JAK.Events.addListener(td.tdConsole.area, 'mousedown', td.tdConsole.area, td.consoleAction),
		JAK.Events.addListener(td.tdConsole.mask, 'mousedown', td.tdConsole.mask, td.catchMask)
	];

	td.tdConsole.callback = callback || td.tdStop;
	td.textareaTimeout = window.setTimeout(td.textareaFocus, 1);

	if (el.change) {
		JAK.DOM.addClass(el.change, 'nd-edited');
		if (el.change.resEl) JAK.DOM.addClass(el.change.resEl, 'nd-edited');
	} else if (!el.areaValue) JAK.DOM.addClass(el, 'nd-edited');
};

td.textareaFocus = function() {
	if (td.textareaTimeout) {
		window.clearTimeout(td.textareaTimeout);
		td.textareaTimeout = null;
	}
	td.tdConsole.area.focus();
	td.tdConsole.area.select();
};

td.catchMask = function(e) {
	td.tdStop(e);

	if (e.button === JAK.Browser.mouse.right && this.title === td.tdConsole.area.value) td.consoleClose();
	else td.tdConsole.area.focus();

	return false;
};

td.consoleClose = function() {
	var varEl = td.tdConsole.varEl;
	JAK.DOM.removeClass(varEl, 'nd-hovered nd-edited');
	if (varEl.change) {
		JAK.DOM.removeClass(varEl.change, 'nd-hovered nd-edited');
		if (varEl.change.resEl) JAK.DOM.removeClass(varEl.change.resEl, 'nd-hovered nd-edited');
	}

	if (td.tdConsole.listeners) {
		JAK.Events.removeListeners(td.tdConsole.listeners);
		td.tdConsole.listeners = null;
	}

	var cc = td.consoleConfig;
	if (typeof cc.oriX === 'undefined') {
		cc.oriX = cc.x;
		cc.oriY = cc.y;
	}

	cc.x = td.tdConsole.area.offsetWidth - 8;
	cc.y = td.tdConsole.area.clientHeight;

	if (td.tdConsole.mask.title) varEl.title = td.tdConsole.mask.title;
	document.body.removeChild(td.tdConsole);
	td.tdConsole = null;
	return false;
};

td.logAction = function(e) {
	if ((e.altKey ? e.shiftKey || td.tdFullWidth : !e.shiftKey) || e.ctrlKey || e.metaKey || e.button !== JAK.Browser.mouse.left) return true;

	td.tdStop(e);
	var el = td.control;

	if (e.altKey) {
		td.actionData.startX = e.screenX;
		td.actionData.width = td.tdWidth;
		td.actionData.element = el;

		td.actionData.listeners.push(
				JAK.Events.addListener(document, 'mousemove', td, td.logResizing),
				JAK.Events.addListener(document, 'mouseup', td, td.endLogResize),
				JAK.Events.addListener(el, 'selectstart', td, td.tdStop),
				JAK.Events.addListener(el, 'dragstart', td, td.tdStop)
		);

		document.body.focus();
	} else td.switchFullWidth();

	return false;
};

td.switchFullWidth = function(force) {
	force = force || 0;

	if (!td.tdFullWidth && force !== 1) {
		td.tdFullWidth = true;
		JAK.DOM.addClass(document.body.parentNode, 'nd-fullscreen');

		document.body.style.marginLeft = td.control.style.left = 0;
		td.tdContainer.style.width = '100%';
		td.logContainer.style.width = td.tdContainer.clientWidth + 'px';
		td.logRowActive.style.width = (td.tdContainer.clientWidth - 48) + 'px';
	} else if (td.tdFullWidth && force !== 2) {
		td.tdFullWidth = false;
		JAK.DOM.removeClass(document.body.parentNode, 'nd-fullscreen');

		document.body.style.marginLeft = td.tdContainer.style.width = td.control.style.left = td.tdWidth + 'px';
		td.logContainer.style.width = 'auto';
		td.logRowActive.removeAttribute('style');
	} else return false;

	td.tdResizeWrapper();
	return true;
};

td.logResizing = function(e) {
	if (e.button === JAK.Browser.mouse.left) {
		td.tdWidth = Math.max(0, Math.min(td.viewSize.width - td.controlSpaceX, td.actionData.width + e.screenX - td.actionData.startX));
		document.body.style.marginLeft = td.tdContainer.style.width = td.actionData.element.style.left = td.tdWidth + 'px';
		td.tdResizeWrapper();
	} else {
		td.endLogResize();
	}
};

td.endLogResize = function() {
	JAK.Events.removeListeners(td.actionData.listeners);
	td.actionData.listeners.length = 0;
	td.actionData.element = null;
};

td.showVarChanges = function(varEls) {
	for (var i = varEls.length; i-- > 0;) {
		varEls[i].style.display = 'inline';
		varEls[i].hideEl.style.display = 'none';
	}
};

td.hideVarChanges = function(varEls) {
	for (var i = varEls.length; i-- > 0;) {
		varEls[i].style.display = 'none';
		varEls[i].hideEl.style.display = 'inline';
		if (varEls[i] === td.tdHashEl) td.deactivateChange(true, varEls[i].change);
	}
};

td.showDump = function(id) {
	if (td.logRowActiveId === (id = id || 0)) return false;
	if (td.logRowActive) {
		JAK.DOM.removeClass(td.logRowActive, 'nd-active');
		td.logRowActive.removeAttribute('style');
		if (td.logRowActive.changedVarEls) td.hideVarChanges(td.logRowActive.changedVarEls);
	}

	JAK.DOM.addClass(td.logRowActive = td.logRows[id - 1], 'nd-active');
	if (td.logRowActive.changedVarEls) td.showVarChanges(td.logRowActive.changedVarEls);
	td.logRowActive.parentNode.insertBefore(td.logAnchor, td.logRowActive);
	if (td.hoveredChange && td.hoveredChange.logRow === td.logRowActive) td.activateChange(true, td.hoveredChange);

	document.title = '[' + td.logRowActive.runtime + ' ms] ' + td.logRowActive.id + '::' + td.logRowActive.logTitle;

	if (td.indexes[td.logRowActiveId - 1] !== td.indexes[id - 1]) {
		(td.tdView.oriId && (td.tdView.id = td.tdView.oriId)) || td.tdInnerWrapper.removeChild(td.tdView);

		td.tdView = td.dumps[td.indexes[id - 1]];
		td.tdView.id = 'tdView';
		td.tdResizeWrapper();
	}

	if (td.tdFullWidth) td.logRowActive.style.width = (td.tdContainer.clientWidth - 48) + 'px';
	td.logRowActiveId = id;

	return true;
};

td.setTitles = function(container) {
	var titleSpan, titleStrong, titleStrongs;

	titleStrongs = container.getElementsByTagName('strong');
	for (var i = titleStrongs.length; i-- > 0;) {
		if (JAK.DOM.hasClass(titleStrong = titleStrongs[i], 'nd-inner')) {
			titleSpan = titleStrong.parentNode.parentNode;
			titleSpan.tdTitle = titleStrong.parentNode;
			titleSpan.tdTitle.tdInner = titleStrong;
			titleSpan.tdTitle.data = {'left': null, 'top': null, 'width': null, 'height': null};

			JAK.Events.addListener(titleSpan, 'mousemove', titleSpan, td.showTimer);
			JAK.Events.addListener(titleSpan, 'mouseout', titleSpan, td.hideTimer);
			JAK.Events.addListener(titleSpan, 'click', titleSpan, td.pinTitle);
			JAK.Events.addListener(titleSpan.tdTitle, 'mousemove', titleSpan.tdTitle, td.hoverTitle);
			JAK.Events.addListener(titleSpan.tdTitle, 'mousedown', titleSpan.tdTitle, td.titleAction);
		}
	}
};

td.showTimer = function(e) {
	if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || td.actionData.element !== null || td.tdConsole !== null || td.hide[0] === 2) {
		return false;
	}

	td.tdStop(e);

	if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}

	td.titleShowData.left = e.pageX || e.clientX;
	td.titleShowData.top = e.pageY || e.clientY;

	if (td.activeTitle === null && td.titleShowData.timeout !== null) return false;

	td.titleShowData.element = this;
	td.titleShowData.tar = JAK.Events.getTarget(e);

	if (td.activeTitle !== null) {
		td.showTitle();
	} else if (td.titleShowData.timeout === null) {
		td.titleShowData.timeout = window.setTimeout(td.showTitle, 100);
	}

	return true;
};

td.showTitle = function() {
	var el = td.titleShowData.element;
	var tar = td.titleShowData.tar;

	if (td.titleShowData.timeout !== null) {
		window.clearTimeout(td.titleShowData.timeout);
		td.titleShowData.timeout = null;
	}

	if (td.activeTitle && td.activeTitle !== el.tdTitle) {
		td.hideTitle();
	} else if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}

	if (td.activeTitle === null && el.tdTitle.style.display !== 'block') {
		td.displayTitle(el.tdTitle);
		td.keepMaxZIndex(el.tdTitle);
		td.scrollTitle = td.activeTitle = el.tdTitle;
	} else if (tar.nodeType === 1 && JAK.DOM.hasClass(tar, 'nd-titled')) {
		td.scrollTitle = el.tdTitle;
		if (el.tdTitle.style.zIndex < td.zIndexMax) td.keepMaxZIndex(el.tdTitle);
	}

	if (td.activeTitle === null) return false;

	td.activeTitle.style.left = (td.activeTitle.data.left = (td.titleShowData.left) + 20) + 'px';
	td.activeTitle.style.top = (td.activeTitle.data.top = (td.titleShowData.top) - 5) + 'px';

	td.titleAutosize();

	return false;
};

td.displayTitle = function(title) {
	if (title.style.display === 'block' || td.visibleTitles.indexOf(title) !== -1) return false;

	var tdParents, tdTitleRows;
	title.style.display = 'block';

	if (!title.hasOwnProperty('oriWidth')) {
		if ((tdParents = td.getParents(title)).length) title.parents = tdParents;
		title.style.position = 'fixed';
		title.oriWidth = title.clientWidth;
		title.oriHeight = title.clientHeight;
		tdTitleRows = title.tdInner.childNodes;
		for (var i = 0, j = tdTitleRows.length, c = 1; i < j; ++i) {
			if (tdTitleRows[i].nodeType === 1 && tdTitleRows[i].tagName.toLowerCase() === 'i' && ++c % 2) {
				tdTitleRows[i].className = "nd-even";
			}
		}
		if (title.id === 'controlTitle') {
			title.menuWidth = title.oriWidth;
			title.menuHeight = title.oriHeight;
			td.tdChangeList.style.display = 'block';
		}
	}

	if (title.id === 'controlTitle') td.recalcControlSize();
	else if (title.id === 'saveTitle') td.recalcSaveSize();

	if (tdParents = tdParents || title.parents) {
		for (var k = tdParents.length; k-- > 0;) {
			if (tdParents[k].hasOwnProperty('activeChilds')) {
				tdParents[k].activeChilds.push(title);
			} else tdParents[k].activeChilds = [title];
		}
	}

	td.visibleTitles.push(title);
	return true;
};

td.recalcControlSize = function() {
	var title = td.control.controlTitle;
	title.style.width = title.style.height = 'auto';
	title.oriWidth = Math.max(title.menuWidth, td.tdChangeList.clientWidth);
	title.oriHeight = title.menuHeight + (title.changesHeight = td.tdChangeList.clientHeight);
};

td.recalcSaveSize = function() {
	var title = td.control.saveTitle;
	title.style.width = title.style.height = 'auto';
	title.oriWidth = title.offsetWidth;
	title.oriHeight = title.scrollHeight;
};

td.removeFromParents = function(el) {
	for (var i = el.parents.length, j; i-- > 0;) {
		for (j = el.parents[i].activeChilds.length; j-- > 0;) {
			if (el.parents[i].activeChilds[j] === el) {
				el.parents[i].activeChilds.splice(j, 1);
				break;
			}
		}
	}
};

td.getParents = function(el) {
	if (!el) return [];
	var tag, parents = [];

	while ((tag = (el = el.parentNode).tagName.toLowerCase()) !== 'body') {
		if (tag === 'span' && JAK.DOM.hasClass(el, 'nd-title')) parents.push(el);
	}
	return parents;
};

td.getMaxZIndex = function() {
	for (var retVal = 100, i = td.visibleTitles.length; i-- > 0;) {
		retVal = Math.max(retVal, td.visibleTitles[i].style.zIndex);
	}
	return td.zIndexMax = retVal;
};

td.keepMaxZIndex = function(el) {
	var i, j, maxChildZIndex = 0;
	if (parseInt(el.style.zIndex) === td.zIndexMax) return false;

	if (el.activeChilds) {
		for (i = el.activeChilds.length; i-- > 0;) maxChildZIndex = Math.max(el.activeChilds[i].style.zIndex, maxChildZIndex);
		if (maxChildZIndex === td.zIndexMax) return false;
	}

	if (el.parents && parseInt(el.parents[0].style.zIndex) !== td.zIndexMax) {
		for (i = el.parents.length; i-- > 0;) el.parents[i].style.zIndex = ++td.zIndexMax;
	}
	el.style.zIndex = ++td.zIndexMax;

	if (td.zIndexMax > td.visibleTitles.length + 1000) {
		td.visibleTitles.sort(function(a, b) { return parseInt(a.style.zIndex) - parseInt(b.style.zIndex); });
		for (i = 0, j = td.visibleTitles.length; i < j;) td.visibleTitles[i].style.zIndex = ++i + 100;
		td.zIndexMax = j + 100;
	}
	return true;
};

td.hoverTitle = function(e) {
	e = e || window.event;
	if (td.hide[0] === 2 || td.actionData.element !== null) return true;

	var tar = td.getTargetElement(e);

	if (parseInt(this.style.zIndex) === td.zIndexMax || JAK.DOM.hasClass(tar, 'nd-titled') || td.titleHideTimeout !== null) return true;

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	if (this.activeChilds) {
		var i, maxChildZIndex = 0;
		for (i = this.activeChilds.length; i-- > 0;) maxChildZIndex = Math.max(this.activeChilds[i].style.zIndex, maxChildZIndex);
		if (maxChildZIndex === td.zIndexMax) return true;
	}

	td.keepMaxZIndex(this);

	return false;
};

td.titleAction = function(e) {
	if (!this.pinned || e.button !== JAK.Browser.mouse.left) return true;

	JAK.Events.stopEvent(e);

	if (this.style.zIndex < td.zIndexMax) td.keepMaxZIndex(this);

	if (e.altKey) {
		if (!e.ctrlKey && !e.metaKey) {
			if (e.shiftKey) td.hideTitle(this);
			else td.startTitleDrag(e, this);
		} else if (!e.shiftKey) {
			this.data.width = this.data.height = null;
			td.titleAutosize(this);
		} else return true;
	} else if (e.shiftKey) return true;
	else if (e.ctrlKey || e.metaKey) {
		td.startTitleResize(e, this)
	} else return true;

	JAK.Events.cancelDef(e);
	return false;
};

td.startTitleResize = function(e, el) {
	td.actionData.startX = e.screenX;
	td.actionData.startY = e.screenY;
	td.actionData.width = (el.tdWidth === 'auto' ? el.offsetWidth : el.tdWidth);
	td.actionData.height = (el.tdHeight === 'auto' ? el.clientHeight : el.tdHeight);
	td.actionData.element = el;

	td.actionData.listeners.push(
			JAK.Events.addListener(document, 'mousemove', td, td.titleResizing),
			JAK.Events.addListener(document, 'mouseup', td, td.endTitleAction),
			JAK.Events.addListener(el, 'selectstart', td, td.tdStop),
			JAK.Events.addListener(el, 'dragstart', td, td.tdStop)
	);

	document.body.focus();
};

td.titleResizing = function(e) {
	var el = td.actionData.element;

	if (e.button === JAK.Browser.mouse.left) {
		el.data.width = el.tdWidth = Math.max(Math.min(td.viewSize.width - el.data.left - 20, td.actionData.width + e.screenX - td.actionData.startX), 16);
		el.data.height = el.tdHeight = 16 * parseInt(Math.max(Math.min(td.viewSize.height - el.data.top - 35, td.actionData.height + e.screenY - td.actionData.startY), 16) / 16);
		JAK.DOM.setStyle(el, {'width': el.tdWidth + 'px', 'height': el.tdHeight + 'px'});
	} else {
		td.endTitleAction();
	}
};

td.startTitleDrag = function(e, el) {
	td.actionData.startX = e.screenX;
	td.actionData.startY = e.screenY;
	td.actionData.offsetX = el.data.left;
	td.actionData.offsetY = el.data.top;
	td.actionData.element = el;

	td.actionData.listeners.push(
			JAK.Events.addListener(document, 'mousemove', td, td.titleDragging),
			JAK.Events.addListener(document, 'mouseup', td, td.endTitleAction),
			JAK.Events.addListener(el, 'selectstart', td, td.tdStop),
			JAK.Events.addListener(el, 'dragstart', td, td.tdStop)
	);

	document.body.focus();
};

td.titleDragging = function(e) {
	var el = td.actionData.element;

	if (e.button === JAK.Browser.mouse.left) {
		el.data.left = Math.max(Math.min(td.viewSize.width - 36, td.actionData.offsetX + e.screenX - td.actionData.startX), 0);
		el.data.top = Math.max(Math.min(td.viewSize.height - 51, td.actionData.offsetY + e.screenY - td.actionData.startY), 0);
		JAK.DOM.setStyle(el, {'left': el.data.left + 'px', 'top': el.data.top + 'px'});
		td.titleAutosize(el);
	} else {
		td.endTitleAction();
	}
};

td.endTitleAction = function() {
	var el = td.actionData.element;

	if (el !== null) {
		JAK.Events.removeListeners(td.actionData.listeners);
		td.actionData.listeners.length = 0;
		td.actionData.element = null;
	}
};

td.tdStop = function(e) {
	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);
	return false;
};

td.titleAutosize = function(el) {
	el = el || td.activeTitle;

	var tdCheckWidthDif = false;
	var tdWidthDif;
	td.spaceX = Math.max(td.viewSize.width - el.data.left - 20, 0);
	td.spaceY = 16 * parseInt(Math.max(td.viewSize.height - el.data.top - 35, 0) / 16);

	if (el.data.width !== null) {
		el.style.width = (td.spaceX < el.data.width ? el.tdWidth = td.spaceX : el.tdWidth = el.data.width) + 'px';
	} else if (td.spaceX < el.oriWidth) {
		el.style.width = (el.tdWidth = td.spaceX) + 'px';
	} else {
		el.style.width = el.tdWidth = 'auto';
		tdCheckWidthDif = true;
	}

	if (el.data.height !== null) {
		el.style.height = (td.spaceY < el.data.height ? el.tdHeight = td.spaceY : el.tdHeight = el.data.height) + 'px';
	} else if (td.spaceY < (el.changesHeight || 0) + el.tdInner.clientHeight || td.spaceY < el.oriHeight) {
		el.style.height = (el.tdHeight = td.spaceY) + 'px';
		if (tdCheckWidthDif && (tdWidthDif = Math.max(el.oriWidth - el.clientWidth, 0))) {
			el.style.width = (el.tdWidth = Math.min(el.oriWidth + tdWidthDif + 1, td.spaceX)) + 'px';
		}
	} else {
		el.style.height = el.tdHeight = 'auto';
	}
	return true;
};

td.hideTimer = function() {
	if (td.titleShowData.timeout !== null) {
		window.clearTimeout(td.titleShowData.timeout);
		td.titleShowData.timeout = null;
	}

	td.scrollTitle = null;

	if (td.activeTitle !== this.tdTitle || td.actionData.element !== null) return false;

	if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}

	td.titleHideTimeout = window.setTimeout(td.hideTitle, 300);
	return true;
};

td.hideTitle = function(el) {
	var index;

	if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}

	if (el && el.pinned) {
		el.pinned = false;
		JAK.DOM.removeClass(el, 'nd-pinned');
	} else if ((el = td.activeTitle) !== null) {
		td.activeTitle = null;
	} else return false;

	if ((index = td.visibleTitles.indexOf(el)) !== -1) td.visibleTitles.splice(index, 1);
	if (parseInt(el.style.zIndex) === td.zIndexMax) td.getMaxZIndex();
	if (el.parents) td.removeFromParents(el);
	if (el.activeChilds && el.activeChilds.length) {
		for (index = el.activeChilds.length; index-- > 0;) td.hideTitle(el.activeChilds[index]);
	}
	JAK.DOM.setStyle(el, {'display': 'none', 'zIndex': 99});
	el.data.left = el.data.top = null;

	return true;
};

td.pinTitle = function(e) {
	JAK.Events.stopEvent(e);

	if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || e.button !== JAK.Browser.mouse.left || td.hide[0] === 2) return false;

	if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}

	var tar = td.getTargetElement(e);

	if (!JAK.DOM.hasClass(tar, 'nd-titled')) return false;

	if (td.activeTitle && td.activeTitle !== tar.tdTitle) td.hideTitle();

	if (td.activeTitle === null) {
		td.activeTitle = tar.tdTitle;
		td.activeTitle.pinned = false;
		JAK.DOM.removeClass(td.activeTitle, 'nd-pinned');
	} else {
		td.activeTitle.pinned = true;
		JAK.DOM.addClass(td.activeTitle, 'nd-pinned');
		td.activeTitle = null;
	}
	return false;
};

td.showLog = function(e, el) {
	if (e === true) td.showDump(el.logId);
	else if (td.actionData.element !== null) return false;
	else if (td.deleteChange.showLogRow === true) td.showDump(this.logId);
	return true;
};

td.logClick = function(e) {
	var id = parseInt(this.logId);

	if (e.altKey) {
	} else if (e.ctrlKey || e.metaKey) {
		td.logRowsChosen[id - 1] = !td.logRowsChosen[id - 1];
		if (td.logRowsChosen[id - 1]) JAK.DOM.addClass(td.logRows[id - 1], 'nd-chosen');
		else JAK.DOM.removeClass(td.logRows[id - 1], 'nd-chosen');
	} else if (e.shiftKey) {
		var unset = false;
		if (JAK.DOM.hasClass(this, 'nd-chosen')) unset = true;
		for (var i = Math.min(td.logRowActiveId, id), j = Math.max(td.logRowActiveId, id); i <= j; ++i) {
			if (unset) {
				td.logRowsChosen[i - 1] = false;
				JAK.DOM.removeClass(td.logRows[i - 1], 'nd-chosen');
			} else {
				td.logRowsChosen[i - 1] = true;
				JAK.DOM.addClass(td.logRows[i - 1], 'nd-chosen');
			}
		}
	} else {
		td.showDump(id);
	}
	return false;
};

td.readConsoleKeyPress = function(e) {
	var key = String.fromCharCode(e.which);

	if (this.selectedText) td.unselectConsole();

	if (e.ctrlKey || e.metaKey) {
		if (key == 'd') return td.duplicateText(e, this);
		else if (key == 'y') return td.removeRows(e, this);
		else if (key == 'b') return td.selectBlock(e, this);
	} else if (this.selectionStart === this.selectionEnd) {
		if (td.consoleSelects[key]) td.selectConsole(e, this, key);
	} else if (td.keyChanges[key]) return td.wrapSelection(e, this, key);

	return true;
};

td.readKeyDown = function(e) {
	var i, j, tdNext;

	if (e.shiftKey) {
		if (e.keyCode === 13 && td.tdConsole) return td.tdConsole.callback();
	} else if (e.altKey) {
		if (e.keyCode === 32 && !td.tdConsole && td.results.length) {
			j = (i = td.results.length) === td.fullResults.length ? 1 : 2;
			while (i-- > 0) td.switchFullHeight(td.results[i], j);
		}
	} else if (!e.ctrlKey && !e.metaKey) {
		if (e.keyCode === 38 && !td.tdConsole && td.logRowActiveId > 1) {
			tdNext = td.logRowsSelected() ? td.getPreviousLogRow() : td.logRowActiveId - 1;
			if (tdNext === td.logRowActiveId) return true;
			td.showDump(tdNext);
			if (!td.tdFullWidth) {
				td.setLocationHashes(true, [[td.logWrapper, 'logAnchor', td.logContainer, 100]]);
			}
			return false;
		} else if (e.keyCode === 40 && !td.tdConsole && td.logRowActiveId < td.indexes.length) {
			td.logView.blur();
			tdNext = td.logRowsSelected() ? td.getNextLogRow() : td.logRowActiveId + 1;
			if (tdNext === td.logRowActiveId) return true;
			td.showDump(tdNext);
			if (!td.tdFullWidth) {
				td.setLocationHashes(true, [[td.logWrapper, 'logAnchor', td.logContainer, 100]]);
			}
			return false;
		} else if (e.keyCode === 37 && td.activeTitle) {
				td.activeTitle.scrollTop = 16 * parseInt((td.activeTitle.scrollTop - 16) / 16);
				return false;
		} else if (e.keyCode === 39 && td.activeTitle) {
				td.activeTitle.scrollTop = 16 * parseInt((td.activeTitle.scrollTop + 16) / 16);
				return false;
		} else if (e.keyCode === 27) {
			if (td.tdConsole) return td.consoleClose();
			if (!(td.visibleTitles.length - (td.activeTitle === null ? 0 : 1)) || !confirm('Opravdu resetovat nastaveni titulku?')) {
				return true;
			}
			td.hideAllTitles();
			return false;
		} else if (e.keyCode === 13 && td.tdConsole) {
			JAK.Events.stopEvent(e);
		} else if (e.keyCode === 32 && !td.tdConsole) {
			td.switchTitleHide();
			return false;
		} else if (e.keyCode === 9 && td.tdConsole) {
			JAK.Events.cancelDef(e);
			JAK.Events.stopEvent(e);
			var area = td.tdConsole.area, start = area.selectionStart;
			if (area.selectedText) td.unselectConsole();
			td.areaWrite(area, area.value.slice(0, start) + '\t' + area.value.slice(start), start + 1);
			return false;
		}
	}
	return true;
};

td.hideAllTitles = function() {
	var i, title;

	if (td.titleHideTimeout) {
		window.clearTimeout(td.titleHideTimeout);
		td.titleHideTimeout = null;
	}
	for (i = td.visibleTitles.length; i-- > 0;) {
		title = td.visibleTitles[i];
		JAK.DOM.setStyle(title, {'display': 'none', 'zIndex': 99});
		JAK.DOM.removeClass(title, 'nd-pinned');
		title.pinned = false;
		title.data.left = title.data.top = title.data.width = title.data.height = null;
	}

	td.visibleTitles.length = 0;
	td.zIndexMax = 100;
	td.scrollTitle = td.activeTitle = null;
};

td.switchTitleHide = function(force) {
	if (typeof force === 'undefined') td.hide[0] = ++td.hide[0] % 3;
	else if (td.hide[0] === ~~force) return false;
	else td.hide[0] = ~~force;

	var i;

	if (td.hide[0] === 1) {
		document.body.appendChild(td.hide[1]);
	} else if (td.hide[0] === 2) {
		for (i = td.visibleTitles.length; i-- > 0;) td.visibleTitles[i].style.display = 'none';
		document.body.removeChild(td.hide[1]);
		document.body.appendChild(td.hide[2]);
	} else {
		for (i = td.visibleTitles.length; i-- > 0;) td.visibleTitles[i].style.display = 'block';
		document.body.removeChild(td.hide[2]);
	}

	return true;
};

td.windowResize = function() {
	td.tdResizeWrapper();
	td.viewSize = JAK.DOM.getDocSize();
	if (td.tdFullWidth) {
		td.logContainer.style.width = td.tdContainer.clientWidth + 'px';
		td.logRowActive.style.width = (td.tdContainer.clientWidth - 48) + 'px';
	}
	for (var i = td.visibleTitles.length; i-- > 0;) td.titleAutosize(td.visibleTitles[i]);
};

td.tdResizeWrapper = function() {
	var viewWidth = td.tdView.clientWidth;
	var viewHeight = td.tdView.clientHeight;
	if (viewWidth > td.tdOuterWrapper.clientWidth) td.tdOuterWrapper.style.width = td.wrapperWidth = viewWidth + 'px';
	if (viewHeight > td.tdOuterWrapper.clientHeight) td.tdOuterWrapper.style.height = td.wrapperHeight = viewHeight + 'px';
	if (td.tdContainer.clientWidth > td.tdOuterWrapper.clientWidth) {
		td.wrapperWidth = null;
		td.tdOuterWrapper.style.width = '100%';
	}
};

td.logRowsSelected = function() {
	for (var i = td.logRowsChosen.length; i-- > 0;) {
		if (td.logRowsChosen[i]) return true;
	}
	return false;
};

td.getPreviousLogRow = function() {
	for (var i = td.logRowActiveId; --i > 0;) {
		if (td.logRowsChosen[i - 1]) return i;
	}
	return td.logRowActiveId;
};

td.getNextLogRow = function() {
	for (var i = td.logRowActiveId, j = td.logRowsChosen.length; i++ < j;) {
		if (td.logRowsChosen[i - 1]) return i;
	}
	return td.logRowActiveId;
};

td.htmlEncode = function(text) {
	for (var retVal = '', i = 0, j = text.length; i < j; ++i) retVal += td.encodeChars[text[i]] || text[i];
	return retVal;
};

td.getTitlesData = function() {
	var i, j, titlesData = [], title;
	for (i = 0, j = td.visibleTitles.length; i < j; ++i) {
		if ((title = td.visibleTitles[i]).pinned) {
			titlesData.push({
				'id': title.id,
				'data': JSON.parse(JSON.stringify(title.data)),
				'scrollTop': parseInt(title.scrollTop),
				'zIndex': parseInt(title.style.zIndex)
			});
		}
	}
	return titlesData;
};

td.setTitlesData = function(titlesData) {
	var i, j, title;

	td.hideAllTitles();

	for (i = 0, j = titlesData.length; i < j; ++i) {
		if (title = JAK.gel(titlesData[i]['id'])) {
			title.data = titlesData[i]['data'];
			td.displayTitle(title);
			JAK.DOM.addClass(title, 'nd-pinned');
			title.pinned = true;
			title.style.zIndex = titlesData[i]['zIndex'];
			if (title.data['left'] !== null) title.style.left = title.data['left'] + 'px';
			if (title.data['top'] !== null) title.style.top = title.data['top'] + 'px';
			if (title.data['width'] !== null) title.style.width = title.data['width'] + 'px';
			if (title.data['height'] !== null) title.style.height = title.data['height'] + 'px';
			td.titleAutosize(title);
			title.scrollTop = titlesData[i]['scrollTop'];
		}
	}

	td.getMaxZIndex();
	return true;
};

td.getChangesData = function(allData) {
	var i, j, change, changesData = [], changeData;
	for (i = 0, j = td.changes.length; i < j; ++i) {
		change = td.changes[i];
		changeData = [
			change.data.path,
			change.data.type === 2 ? '' : (change.data.type === 3 ? JSON.stringify(change.data.value) : change.data.value),
			change.data.type,
			(td.changes[i].resEl ? td.changes[i].resEl.fullHeight : change.data.fullHeight) ? 1 : 0
		];
		if (allData) changeData.push(change.varEl ? change.varEl.title : '', change.valid, change.formated);
		changesData.push(changeData);
	}
	return changesData;
};

td.updateChangesData = function(changesData) {
	var i, j, change, loadChanges = [], keepChanges = [];
	for (i = 0, j = changesData.length; i < j; ++i) {
		if (change = td.getSameChange(changesData[i])) {
			if (change.varEl) change.varEl.title = changesData[i][4];
			change.data.type = changesData[i][2];
			change.data.value = change.data.type === 3 ? JSON.parse(changesData[i][1]) : changesData[i][1];
			change.valid = changesData[i][5];
			change.formated = changesData[i][6];
			keepChanges.push(change);
		} else {
			loadChanges.push({
				'path': changesData[i][0],
				'value': changesData[i][1],
				'type': changesData[i][2],
				'valid': changesData[i][5],
				'formated': changesData[i][6]
			});
		}
	}
	for (i = td.changes.length; i-- > 0;) if (keepChanges.indexOf(td.changes[i]) === -1) td.changes[i].deleteMe = true;
	td.setChangesData(loadChanges);
};

td.getSameChange = function(changeData) {
	var i = td.changes.length, matches = {};
	while (i-- > 0) matches[td.changes[i].data.type % 2  + '§' + td.changes[i].data.path] = td.changes[i];
	if (matches[i = changeData[2] % 2 + '§' + changeData[0]]) return matches[i];
	return false;
};

td.setChangesData = function(changesData) {
	var path, log, container, varEl, change;
	for (var i = 0, j = changesData.length; i < j; ++i) {
		path = changesData[i].path.split('§');
		log = container = varEl = null;

		if (changesData[i].res === 0 || changesData[i].res === 7) {
		} else if (path[0] === 'log') {
			log = JAK.gel(td.hash2Id[path[1]]);
			container = td.dumps[td.indexes[log.logId - 1]].objects[parseInt(path[2])];
			varEl = td.findVarEl(container, path.slice(3), changesData[i].type);
		} else {
			container = JAK.gel(td.hash2Id[path[1]]);
			varEl = td.findVarEl(container, path.slice(2), changesData[i].type);
		}

		if (changesData[i].type === 3) changesData[i].value = JSON.parse(changesData[i].value);

		if (changesData[i].oriVar) changesData[i].oriVar = td.createOriVar(changesData[i].oriVar, changesData[i].res % 2);

		if (varEl) {
			varEl = td.duplicateNode(varEl);
			varEl.title = td.formatJson(changesData[i].value);
		}

		change = td.createChange(changesData[i], container, varEl, log);
		change.valid = typeof changesData[i].valid !== 'undefined' ? changesData[i].valid : true;
		change.formated = typeof changesData[i].formated !== 'undefined' ? changesData[i].formated : true;
		if (change.resEl && changesData[i].fullHeight === 1) td.switchFullHeight(change.resEl, 2);
	}
	td.updateChangeList();
};

td.createOriVar = function(oriVar, changed) {
	var el = JAK.mel('div', {'className': 'nd-titled nd-ori-var' + (changed ? ' nd-changed' : '')});
	el.innerHTML = oriVar + '$';
	return el;
};

td.findVarEl = function(el, path, type) {
	if (typeof path[0] === 'undefined') return false;
	var i = 0, j, child;

	if (path[0][0] === '#' || path[0][0] === '*') path[0] = path[0].slice(1);
	var step = parseInt(path[0][0]);

	if (step === 9) return JAK.DOM.getElementsByClass('nd-top', el)[0] || null;
	else if (step >= 7) {
		if (type % 2) {
			for (j = el.childNodes.length; i < j; ++i) {
				child = el.childNodes[i];
				if (child.nodeType === 1) {
					if (JAK.DOM.hasClass(child, 'nd-toggle')) child = child.firstChild;
					if (child.className === 'nd-array' && child.getAttribute('data-pk') === path[0]) return child;
				}
			}
		} else {
			for (j = el.childNodes.length; i < j; ++i) {
				if (el.childNodes[i].nodeType === 1 && el.childNodes[i].className === 'nd-key' && el.childNodes[i].innerHTML === path[0].slice(1)) {
					return el.childNodes[i];
				}
			}
		}
	} else {
		for (j = el.childNodes.length; i < j; ++i) {
			if (el.childNodes[i].nodeType === 1 && el.childNodes[i].getAttribute('data-pk') === path[0]) {
				return td.findVarEl(el.childNodes[i], path.slice(1), type);
			}
		}
	}
	return false;
};

td.getTdData = function(allData) {
	var tdData = {
		'tdWidth': td.tdWidth,
		'tdFullWidth': td.tdFullWidth,
		'logRowActiveHash': td.logRowActive === null ? '' : td.logRowActive.hash,
		'logRowsChosenHashes': [],
		'showLogRow': td.deleteChange.showLogRow,
		'consoleConfig': td.consoleConfig,
		'hide': td.hide[0]
	};

	if (allData) {
		tdData.url = window.location.protocol + '//' + window.location.host + window.location.pathname;
		tdData.get = td.get;
		tdData.post = td.post;
		tdData.oldRequest = JSON.parse(td.oldRequest);
	}

	for (var i = 0, j = td.logRows.length; i < j; ++i) if (td.logRowsChosen[i]) tdData.logRowsChosenHashes.push(td.logRows[i].hash);

	tdData.styles = [{'el': 'tdOuterWrapper', 'css': {'width': td.wrapperWidth, 'height': td.wrapperHeight}}];

	tdData.scrolls = [
		{'el': 'tdContainer', 'scrollLeft': td.tdContainer.scrollLeft, 'scrollTop': td.tdContainer.scrollTop},
		{'el': 'logContainer', 'scrollLeft': td.logContainer.scrollLeft, 'scrollTop': td.logContainer.scrollTop}
	];

	return tdData;
};

td.setTdData = function(tdData) {
	document.body.style.marginLeft = td.tdContainer.style.width = td.control.style.left = (td.tdWidth = tdData['tdWidth']) + 'px';

	td.switchFullWidth(tdData['tdFullWidth'] ? 2 : 1);

	var i, logId, rec;
	if (logId = td.hash2LogId[tdData['logRowActiveHash']]) td.showDump(logId);

	for (i = td.logRows.length; i-- > 0;) {
		if (td.logRowsChosen[i]) {
			td.logRowsChosen[i] = false;
			JAK.DOM.removeClass(td.logRows[i], 'nd-chosen');
		}
	}
	for (i = tdData['logRowsChosenHashes'].length; i-- > 0;) {
		if (logId = td.hash2LogId[tdData['logRowsChosenHashes'][i]]) {
			td.logRowsChosen[logId - 1] = true;
			JAK.DOM.addClass(td.logRows[logId - 1], 'nd-chosen');
		}
	}

	td.deleteChange.showLogRow = tdData['showLogRow'];
	td.checkDeleteChange();

	td.consoleConfig = tdData['consoleConfig'];

	td.switchTitleHide(tdData['hide']);

	for (i = tdData['styles'].length; i-- > 0;) JAK.DOM.setStyle(td[tdData['styles'][i]['el']], tdData['styles'][i]['css']);

	for (i = tdData['scrolls'].length; i-- > 0;) {
		rec = tdData['scrolls'][i];
		td[rec['el']].scrollLeft = rec['scrollLeft'];
		td[rec['el']].scrollTop = rec['scrollTop'];
	}

	td.windowResize();
};

td.sendChanges = function(e) {
	td.tdStop(e);

	if (!td.allowClick || td.tdConsole !== null || td.actionData.element !== null || e.button !== JAK.Browser.mouse.left) return false;

	td.disableClick();
	if (td.activeTitle !== null) td.hideTitle();

	td.sendData(td.getChangesData(), null, '', e.shiftKey, e.ctrlKey || e.metaKey);
	return false;
};

td.sendData = function(data, lastRequest, url, _blank, forcePost) {
	data = data || [];
	_blank = !!_blank;

	var i, j, dataBase62 = b62s.base8To62(b62s.compress(JSON.stringify(data)));

	var newLoc = {
		'url': url || window.location.protocol + '//' + window.location.host + window.location.pathname,
		'sendGet': (td.get ? '?' + td.get + '&' : '?') + 'tdRequest=' + dataBase62,
		'postGet': td.get ? '?' + td.get : '',
		'hashGet': (td.get ? '?' + td.get + '&' : '?') + 'tdHash='
	};

	localStorage.tdLastRequest = b62s.base8To32k(b62s.compress(JSON.stringify(
		lastRequest || {'config': td.getTdData(), 'titles': td.getTitlesData()}
	)));

	if (td.post.length || forcePost) {
		var req = JAK.mel('form', {'action': newLoc.url + newLoc.postGet, 'method': 'post'}, {'display': 'none'});
		if (_blank) req.target = '_blank';

		for (i = 0, j = td.post.length; i < j; ++i) {
			req.appendChild(JAK.mel('textarea', {'name': td.post[i][0], 'value': td.post[i][1]}));
		}
		req.appendChild(JAK.mel('textarea', {'name': 'tdRequest', 'value': dataBase62}));

		td.logView.appendChild(req);
		req.submit();
	} else if ((url = newLoc.url + newLoc.sendGet).length <= td.maxUrlLength) {
		window.open(url, _blank ? '_blank' : '_self');
	} else {
		var ajax = {'url': newLoc.url + newLoc.postGet, 'hashUrl': newLoc.url + newLoc.hashGet, 'target': _blank ? '_blank' : '_self'};
		ajax.req = function() {
			var rq = new JAK.Request(JAK.Request.TEXT, {method: "post"});
			rq.setCallback(ajax, "_resp");
			rq.send(ajax.url, {'tdcache': dataBase62});
		};

		ajax._resp = function(reply, status) {
			var error = 'Zvolte "odeslat" se stisknutou klavesou Ctrl/Cmd pro vynuceni odeslani zmen POSTem.\n\n';
			if (status == 200 && reply) {
				if (reply[0] === '0') error += 'Chyba cache na serveru:\n\n' + reply.slice(1);
				else {
					window.open(this.hashUrl + reply.slice(1), this.target);
					return true;
				}
			} else {
				error += 'Seznam zmen je prilis dlouhy pro odeslani GETem a cachovani POSTem pres AJAX nebylo uspesne.';
			}
			alert(error);
			return false;
		};

		ajax.req();
	}
	return false;
};

td.reloadPage = function(e) {
	if (!td.allowClick || td.tdConsole !== null || td.actionData.element !== null || e.button !== JAK.Browser.mouse.left) return false;

	td.disableClick();
	if (td.activeTitle !== null) td.hideTitle();

	var i, j, newLoc = [window.location.protocol + '//' + window.location.host + window.location.pathname];
	if (td.get) newLoc.push(td.get);

	if (td.post.length && !e.ctrlKey && !e.metaKey) {
		var req = JAK.mel('form', {'action': newLoc.join('?'), method:'post'}, {'display': 'none'});
		if (e.shiftKey) req.target = '_blank';

		for (i = 0, j = td.post.length; i < j; ++i) {
			req.appendChild(JAK.mel('textarea', {'name': td.post[i][0], 'value': td.post[i][1]}));
		}

		td.logView.appendChild(req);
		req.submit();
	} else {
		window.open(newLoc.join('?'), e.shiftKey ? '_blank' : '_self');
	}

	return true;
};

td.disableClick = function() {
	if (td.clickTimeout) {
		window.clearTimeout(td.clickTimeout);
		td.clickTimeout = null;
	}
	td.allowClick = false;
	td.clickTimeout = window.setTimeout(td.enableClick, 1000);
};

td.enableClick = function() {
	if (td.clickTimeout) {
		window.clearTimeout(td.clickTimeout);
		td.clickTimeout = null;
	}
	td.allowClick = true;
};

td.getRows = function(el, start, end) {
	var i = el.value.indexOf('\n', end || start);
	return [start - el.value.slice(0, start).split('\n').reverse()[0].length, i === -1 ? el.value.length : i];
};

td.duplicateText = function(e, el) {
	var start = el.selectionStart, end = el.selectionEnd;

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	if (start === end || el.value.slice(start, end).indexOf('\n') !== -1) {
		var rows = td.getRows(el, start, end);
		td.areaWrite(el, el.value.slice(0, rows[1]) + '\n' + el.value.slice(rows[0]), start, end);
	} else td.areaWrite(el, el.value.slice(0, end) + el.value.slice(start), start, end);

	return false;
};

td.removeRows = function(e, el) {
	var rows = td.getRows(el, el.selectionStart, el.selectionEnd);

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	td.areaWrite(el, el.value.slice(0, rows[0]) + el.value.slice(rows[1] + 1), rows[0]);

	return false;
};

td.getBlock = function(el, index) {
	var blockStart, i = td.findNearestChar(el.value, '[{', index, true, {'"': false});
	blockStart = i === false ? 0 : i;

	var blockEnd, j = td.findNearestChar(el.value, ']}', index, false, {'"': false});
	blockEnd = j === false ? el.value.length : j + 1;

	return [blockStart, blockEnd];
};

td.selectBlock = function(e, el) {
	var start = el.selectionStart, end = el.selectionEnd;
	var i, j, s, longest = [start, end];

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	var rows = el.value.slice(start, end).split('\n');
	var checkPoints = [end];

	for (i = 0, j = rows.length, s = start; i < j; ++i) {
		checkPoints.push(s);
		s += rows[i].length + 1;
	}

	for (i = 0, j = checkPoints.length; i < j; ++i) {
		s = td.getBlock(el, checkPoints[i]);
		if (s[1] - s[0] > longest[1] - longest[0]) longest = s;
	}

	el.selectionStart = longest[0];
	el.selectionEnd = longest[1];
	return false;
};

td.selectConsole = function(e, el, key) {
	var end = el.selectionEnd;
	var text = el.value.slice(0, end) + key + el.value.slice(end);
	var start = td.findNearestChar(text, td.consoleSelects[key], end, true, {'"': false});

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	if (start === false) td.areaWrite(el, text, end + 1);
	else {
		td.areaWrite(el, text, start, end + 1);
		td.unselectConsole(el.selectedText = true);
	}

	return false;
};

td.unselectConsole = function(wait) {
	if (td.consoleSelectTimeout) {
		window.clearTimeout(td.consoleSelectTimeout);
		td.consoleSelectTimeout = null;
	}
	if (td.tdConsole === null) return false;

	if (wait) td.consoleSelectTimeout = window.setTimeout(td.unselectConsole, 1000);
	else {
		td.tdConsole.area.selectionStart = td.tdConsole.area.selectionEnd;
		td.tdConsole.area.selectedText = false;
	}
	return true;
};

td.wrapSelection = function(e, el, key) {
	var start = el.selectionStart, end = el.selectionEnd;

	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);

	var swap = td.keyChanges[key];
	var retVal = el.value.slice(0, start) + swap[0];

	if (end - start > 1 && (key === "'" || key === '"')
			&& ((el.value[start] === '"' && el.value[end - 1] === '"') || (el.value[start] === "'" && el.value[end - 1] === "'"))) {
		td.areaWrite(el, retVal + el.value.slice(start + 1, end - 1) + swap[1] + el.value.slice(end), start + 1, end - 1);
	} else td.areaWrite(el, retVal + el.value.slice(start, end) + swap[1] + el.value.slice(end), start + 1, end + 1);

	return false;
};

td.areaWrite = function(el, text, start, end) {
	start = start || 0;
	end = end || start;
	var top = el.scrollTop;

	el.value = text;
	el.selectionStart = start;
	el.selectionEnd = end;
	el.scrollTop = top;
};

td.saveState = function(e) {
	td.tdStop(e);

	var config = td.getTdData(true);
	var flags = (config.get ? 'G' : ' ') + (config.post.length ? 'P' : ' ') + (config.oldRequest.length ? 'C' : ' ');
	var name = td.newSaveName(flags, config.url.match(/^https?:\/\/(.*?)\/?$/)[1]);

	localStorage[name] = b62s.base8To32k(b62s.compress(JSON.stringify({
		'changes': td.getChangesData(true),
		'config': config,
		'titles': td.getTitlesData()
	})));

	td.loadSavesInner();
	return false;
};

td.newSaveName = function(flags, name) {
	var i = '', key = 'td§[' + (new Date()).format('y-m-d H:i:s') + ']§' + (flags || '   ') + '§' + (name || 'TimeDebug');
	while (typeof localStorage[key + i] !== 'undefined') i = ' ' + ((~~i || 1) + 1);
	return key + i;
};

td.loadSavesInner = function() {
	var i, saves = [], rec, rowData, title = td.control.saveTitle;
	for (var record in localStorage) {
		if (localStorage.hasOwnProperty(record) && record.slice(0, 4) === 'td§[') {
			rec = record.slice(3).split('§');
			rowData = {
				'className': 'nd nd-save',
				'record': record,
				'prefixValue': 'td§' + rec[0] + '§' + rec[1] + '§',
				'areaValue': rec[2],
				'innerHTML': rec[0] + ' <b class="nd-flags">(' + rec[1] + ')</b> <b>' + td.htmlEncode(rec[2]) + '</b>'
			};
			saves.push(rowData);
		}
	}

	if (!saves.length) title.tdInner.innerHTML = '<pre class="nd nd-nosave">No saves</pre>';
	else {
		JAK.DOM.clear(title.tdInner);
		saves.sort(function(a, b) { return a.record < b.record; });
		for (i = saves.length; i-- > 0;) title.tdInner.appendChild(JAK.mel('pre', saves[i]));
	}

	if (title.style.display !== 'block') return false;

	td.recalcSaveSize();
	td.titleAutosize(title);

	return true;
};

td.saveAction = function(e) {
	td.tdStop(e);

	if (!td.allowClick || td.tdConsole !== null || td.actionData.element !== null) return false;
	var tar = td.getTargetElement(e);
	if (!JAK.DOM.hasClass(tar, 'nd-save')) return false;

	if (e.button === JAK.Browser.mouse.right) {
		if (e.altKey) td.deleteRecord(tar.record);
		else td.consoleOpen(tar, td.changeSaveName);
	} else if (e.button === JAK.Browser.mouse.left) {
		td.disableClick();
		td.loadState(tar.record, e.altKey, e.shiftKey, e.ctrlKey || e.metaKey);
	}
	return false;
};

td.deleteRecord = function(id) {
	if (typeof localStorage[id] !== 'undefined') delete localStorage[id];
	td.loadSavesInner();
	return true;
};

td.getTargetElement = function(e) {
	var tar = JAK.Events.getTarget(e);
	if (tar.tagName.toLowerCase() === 'b') tar = tar.parentNode;
	return tar;
};

td.changeSaveName = function() {
	var changedName, tar = td.tdConsole.varEl;
	if (!(changedName = td.tdConsole.area.value.replace(/[\n\r]/g, ''))) return false;

	td.consoleClose();
	if (changedName === tar.areaValue) return true;

	localStorage[tar.prefixValue + changedName] = localStorage[tar.record];
	delete localStorage[tar.record];

	td.loadSavesInner();
	return true;
};

td.loadState = function(id, current, _blank, forcePost) {
	if (!localStorage[id]) {
		td.loadSavesInner();
		alert('V localStorage nelze najit pozadovany zaznam s klicem: ' + id);
		return true;
	}

	var data;

	try {
		if (data = JSON.parse(b62s.decompress(b62s.base32kTo8(localStorage[id])))) {
			td.get = data.config.get;
			td.post = data.config.post;
			td.sendData(
				data.config.oldRequest,
				data,
				current ? '' : data.config.url,
				_blank,
				forcePost
			);
		} else {
			td.deleteRecord(id);
			alert('Zaznam v localStorage s klicem: ' + id + ' je prazdny a byl smazan.');
			return true;
		}
	} catch(e) {
		td.deleteRecord(id);
		alert('Zaznam v localStorage s klicem: ' + id + ' je vadny a byl smazan.');
		return true;
	}

	return true;
};

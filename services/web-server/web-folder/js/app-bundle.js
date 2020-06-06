var app_bundle = (function (exports, Handlebars) {
	'use strict';

	function ajaxGet(path, data, opts) {
	    return _ajax('GET', path, data, opts);
	}
	function ajaxPost(path, data, opts) {
	    return _ajax('POST', path, data, opts);
	}
	function ajaxPut(path, data, opts) {
	    return _ajax('PUT', path, data, opts);
	}
	function ajaxDelete(path, data) {
	    return _ajax('DELETE', path, data, null);
	}
	function ajaxPatch(path, data) {
	    return _ajax('PATCH', path, data, null);
	}
	function getData(result, nullOnFail = false) {
	    if (!result || !result.success) {
	        if (nullOnFail) {
	            return null;
	        }
	        else {
	            throw result;
	        }
	    }
	    else {
	        return result.data;
	    }
	}
	var defaultOpts = {
	    contentType: "application/json"
	};
	function _ajax(type, path, data, opts) {
	    opts = Object.assign({}, defaultOpts, opts);
	    var asBody = (opts.asBody == null && (type === 'POST' || type === 'PUT' || type === 'PATCH'));
	    return new Promise(function (resolve, reject) {
	        var xhr = new XMLHttpRequest();
	        var url = path;
	        if (data && !asBody) {
	            url += "?" + param(data);
	        }
	        xhr.open(type, url);
	        xhr.setRequestHeader("Content-Type", opts.contentType);
	        xhr.onload = function () {
	            if (xhr.status === 200) {
	                try {
	                    var response = xhr.responseText;
	                    var result;
	                    if (opts.contentType === "application/json" || opts.contentType.startsWith("multipart/form-data")) {
	                        result = JSON.parse(response);
	                    }
	                    else if (opts.contentType === "application/xml") {
	                        result = new DOMParser().parseFromString(response, "application/xml");
	                    }
	                    resolve(result);
	                }
	                catch (ex) {
	                    reject("Cannot do ajax request to '" + url + "' because \n\t" + ex);
	                }
	            }
	            else {
	                handleError(xhr, url, reject);
	            }
	        };
	        xhr.onerror = function () {
	            handleError(xhr, url, reject);
	        };
	        if (asBody) {
	            if (opts.contentType.startsWith("multipart/form-data")) {
	                console.log(`send with formData`);
	                var formData = new FormData();
	                for (var k in data) {
	                    formData.append(k, data[k]);
	                }
	                xhr.send(formData);
	            }
	            else {
	                const xhrData = JSON.stringify(data);
	                xhr.send(xhrData);
	            }
	        }
	        else {
	            xhr.send();
	        }
	    });
	}
	function handleError(xhr, url, reject) {
	    if (xhr.responseText && xhr.responseText.startsWith('{')) {
	        const obj = JSON.parse(xhr.responseText);
	        reject(obj);
	    }
	    else {
	        reject("xhr.status '" + xhr.status + "' for ajax " + url);
	    }
	}
	function param(obj) {
	    var encodedString = '';
	    for (var prop in obj) {
	        if (obj.hasOwnProperty(prop)) {
	            if (encodedString.length > 0) {
	                encodedString += '&';
	            }
	            let val = obj[prop];
	            if (val == null) {
	                continue;
	            }
	            if (typeof val === 'object' || val instanceof Array) {
	                val = JSON.stringify(val);
	            }
	            encodedString += prop + '=' + encodeURIComponent(val);
	        }
	    }
	    return encodedString;
	}

	function val(rootObj, pathToValue, value) {
	    const setMode = (typeof value !== "undefined");
	    if (!rootObj) {
	        return rootObj;
	    }
	    if (!pathToValue) {
	        return rootObj;
	    }
	    const names = (pathToValue instanceof Array) ? pathToValue : pathToValue.split(".");
	    let name, currentNode = rootObj, currentIsMap, nextNode;
	    let i = 0, l = names.length, lIdx = l - 1;
	    for (i; i < l; i++) {
	        name = names[i];
	        currentIsMap = (currentNode instanceof Map);
	        nextNode = currentIsMap ? currentNode.get(name) : currentNode[name];
	        if (setMode) {
	            if (i === lIdx) {
	                if (currentIsMap) {
	                    currentNode.set(name, value);
	                }
	                else {
	                    currentNode[name] = value;
	                }
	                currentNode = value;
	            }
	            else {
	                if (typeof nextNode === "undefined") {
	                    nextNode = {};
	                }
	                currentNode[name] = nextNode;
	                currentNode = nextNode;
	            }
	        }
	        else {
	            currentNode = nextNode;
	            if (typeof currentNode === "undefined") {
	                currentNode = undefined;
	                break;
	            }
	        }
	    }
	    if (setMode) {
	        return rootObj;
	    }
	    else {
	        return currentNode;
	    }
	}
	function ensureMap(obj, propName) {
	    return _ensure(obj, propName, Map);
	}
	function ensureSet(obj, propName) {
	    return _ensure(obj, propName, Set);
	}
	function ensureArray(obj, propName) {
	    return _ensure(obj, propName, Array);
	}
	function _ensure(obj, propName, type) {
	    const isMap = (obj instanceof Map);
	    let v = (isMap) ? obj.get(propName) : obj[propName];
	    if (v == null) {
	        v = (type == null) ? {} : (type === Array) ? [] : (new type);
	        if (isMap) {
	            obj.set(propName, v);
	        }
	        else {
	            obj[propName] = v;
	        }
	    }
	    return v;
	}
	function asArray(value) {
	    if (value != null) {
	        if (value instanceof Array) {
	            return value;
	        }
	        else if (value.constructor && value.constructor.name === "NodeList") {
	            return Array.prototype.slice.call(value);
	        }
	        else if (value.toString() === "[object Arguments]") {
	            return Array.prototype.slice.call(value);
	        }
	        else {
	            return [value];
	        }
	    }
	    return [];
	}
	const emptyArray = Object.freeze([]);
	function asNodeArray(value) {
	    if (value != null) {
	        if (value instanceof Array) {
	            return value;
	        }
	        else if (value.constructor && value.constructor.name === "NodeList") {
	            return Array.prototype.slice.call(value);
	        }
	        else {
	            return [value];
	        }
	    }
	    return emptyArray;
	}
	function splitAndTrim(str, sep) {
	    if (str == null) {
	        return [];
	    }
	    if (str.indexOf(sep) === -1) {
	        return [str.trim()];
	    }
	    return str.split(sep).map(trim);
	}
	function trim(str) {
	    return str.trim();
	}

	function addOnEvents(target, source) {
	    return Object.assign(target || {}, source);
	}
	function on(els, types, arg1, arg2, arg3) {
	    let opts;
	    let listener;
	    let selector;
	    if (arg1 instanceof Function) {
	        listener = arg1;
	        opts = arg2;
	    }
	    else {
	        selector = arg1;
	        listener = arg2;
	        opts = arg3;
	    }
	    let eventOptions;
	    if (opts && (opts.passive != null || opts.capture != null)) {
	        eventOptions = {};
	        if (opts.passive != null) {
	            eventOptions.passive = opts.passive;
	        }
	        if (opts.capture != null) {
	            eventOptions.capture = opts.capture;
	        }
	    }
	    if (els == null) {
	        return;
	    }
	    const typeArray = splitAndTrim(types, ",");
	    typeArray.forEach(function (type) {
	        const typeSelectorKey = buildTypeSelectorKey(type, selector);
	        asNodeArray(els).forEach(function (el) {
	            let _listener = listener;
	            if (selector) {
	                _listener = function (evt) {
	                    let tgt = null;
	                    const target = evt.target;
	                    const currentTarget = evt.currentTarget;
	                    const ctx = (opts) ? opts.ctx : null;
	                    if (target && target.matches(selector)) {
	                        evt.selectTarget = target;
	                        listener.call(ctx, evt);
	                    }
	                    else {
	                        tgt = evt.target.parentNode;
	                        while (tgt !== null && tgt !== currentTarget && tgt !== document) {
	                            if (tgt.matches(selector)) {
	                                evt.selectTarget = tgt;
	                                listener.call(ctx, evt);
	                                tgt = null;
	                                break;
	                            }
	                            tgt = tgt.parentNode;
	                        }
	                    }
	                };
	            }
	            else if (opts && opts.ctx) {
	                _listener = function (evt) {
	                    listener.call(opts.ctx, evt);
	                };
	            }
	            const listenerRef = {
	                type: type,
	                listener: listener,
	                _listener: _listener,
	            };
	            if (selector) {
	                listenerRef.selector = selector;
	            }
	            if (opts && opts.ns) {
	                listenerRef.ns = opts.ns;
	                let listenerRefSetByNs = ensureMap(el, "listenerRefsByNs");
	                let listenerRefSet = ensureSet(listenerRefSetByNs, opts.ns);
	                listenerRefSet.add(listenerRef);
	            }
	            let listenerDic = ensureMap(el, "listenerDic");
	            let listenerRefByListener = ensureMap(listenerDic, typeSelectorKey);
	            listenerRefByListener.set(listener, listenerRef);
	            el.addEventListener(type, _listener, eventOptions);
	        });
	    });
	}
	function off(els, type_or_opts, selector_or_listener, maybe_listener) {
	    if (els == null) {
	        return;
	    }
	    const opts = (type_or_opts && type_or_opts.ns) ? type_or_opts : null;
	    const type = (opts === null) ? type_or_opts : null;
	    let selector = null;
	    let listener;
	    const tof = typeof selector_or_listener;
	    if (tof === 'function') {
	        selector = null;
	        listener = selector_or_listener;
	    }
	    else if (tof === 'string') {
	        selector = selector_or_listener;
	        listener = maybe_listener;
	    }
	    if (opts && opts.ns) {
	        const ns = opts.ns;
	        asNodeArray(els).forEach(function (el) {
	            const listenerDic = el.listenerDic;
	            const listenerRefsByNs = el.listenerRefsByNs;
	            let listenerRefSet;
	            if (listenerRefsByNs && listenerDic) {
	                listenerRefSet = listenerRefsByNs.get(ns);
	                if (listenerRefSet) {
	                    listenerRefSet.forEach(function (listenerRef) {
	                        el.removeEventListener(listenerRef.type, listenerRef._listener);
	                        const typeSelectorKey = buildTypeSelectorKey(listenerRef.type, listenerRef.selector);
	                        const listenerRefMapByListener = listenerDic.get(typeSelectorKey);
	                        if (listenerRefMapByListener && listenerRefMapByListener.has(listenerRef.listener)) {
	                            listenerRefMapByListener.delete(listenerRef.listener);
	                        }
	                        else {
	                            console.log("INTERNAL ERROR should have a listener in el.listenerDic for " + typeSelectorKey);
	                        }
	                    });
	                    listenerRefsByNs.delete(ns);
	                }
	            }
	        });
	        return;
	    }
	    const typeSelectorKey = buildTypeSelectorKey(type, selector);
	    asNodeArray(els).forEach(function (el) {
	        const listenerRefMapByListener = (el.listenerDic) ? el.listenerDic.get(typeSelectorKey) : null;
	        if (!listenerRefMapByListener) {
	            console.log("WARNING - Cannot do .off() since this type-selector '" + typeSelectorKey +
	                "' event was not bound with .on(). We will add support for this later.");
	            return;
	        }
	        if (typeof listener === "undefined" && type) {
	            listenerRefMapByListener.forEach(function (listenerRef) {
	                el.removeEventListener(type, listenerRef._listener);
	            });
	            el.listenerDic.delete(typeSelectorKey);
	        }
	        else {
	            const listenerRef = (listener) ? listenerRefMapByListener.get(listener) : null;
	            if (!listenerRef) {
	                console.log("WARNING - Cannot do .off() since no listenerRef for " + typeSelectorKey +
	                    " and function \n" + listener + "\n were found. Probably was not registered via on()");
	                return;
	            }
	            el.removeEventListener(type, listenerRef._listener);
	            listenerRefMapByListener.delete(listener);
	        }
	    });
	}
	const customDefaultProps = {
	    bubbles: true,
	    cancelable: true
	};
	function trigger(els, type, evtInit) {
	    if (els == null) {
	        return;
	    }
	    asNodeArray(els).forEach(function (el) {
	        const evt = new CustomEvent(type, Object.assign({}, customDefaultProps, { selectTarget: el }, evtInit));
	        el.dispatchEvent(evt);
	    });
	}
	function bindOnEvents(el, eventDics, opts) {
	    eventDics = (eventDics instanceof Array) ? eventDics : [eventDics];
	    for (const eventDic of eventDics) {
	        for (const selector in eventDic) {
	            bindOnEvent(el, selector, eventDic[selector], opts);
	        }
	    }
	}
	function bindOnEvent(el, typeAndSelector, fn, opts) {
	    let selectorSplitted = typeAndSelector.trim().split(";");
	    let type = selectorSplitted[0].trim();
	    let selector = null;
	    if (selectorSplitted.length > 1) {
	        selector = selectorSplitted[1].trim();
	    }
	    on(el, type, selector, fn, opts);
	}
	function buildTypeSelectorKey(type, selector) {
	    return (selector) ? (type + "--" + selector) : type;
	}

	function bindHubEvents(bindings, opts) {
	    const bindingList = (bindings instanceof Array) ? bindings : [bindings];
	    for (const bindings of bindingList) {
	        const infoList = listHubInfos(bindings);
	        infoList.forEach(function (info) {
	            info.hub.sub(info.topics, info.labels, info.fun, opts);
	        });
	    }
	}
	function unbindHubEvents(bindings, nsObject) {
	    const bindingList = (bindings instanceof Array) ? bindings : [bindings];
	    bindingList.forEach(function (hubEvents) {
	        const infoList = listHubInfos(hubEvents);
	        infoList.forEach(function (info) {
	            info.hub.unsub(nsObject);
	        });
	    });
	}
	function listHubInfos(hubEvents) {
	    const infoList = [];
	    for (const key in hubEvents) {
	        const val = hubEvents[key];
	        if (val instanceof Function) {
	            infoList.push(getHubInfo(key, null, val));
	        }
	        else {
	            const _hub = hub(key);
	            for (const key2 in val) {
	                infoList.push(getHubInfo(key2, _hub, val[key2]));
	            }
	        }
	    }
	    return infoList;
	}
	function getHubInfo(str, _hub, fun) {
	    const a = splitAndTrim(str, ";");
	    const topicIdx = (_hub) ? 0 : 1;
	    _hub = (!_hub) ? hub(a[0]) : _hub;
	    const info = {
	        topics: a[topicIdx],
	        fun: fun,
	        hub: _hub
	    };
	    if (a.length > topicIdx + 1) {
	        info.labels = a[topicIdx + 1];
	    }
	    return info;
	}
	function hub(name) {
	    if (name == null) {
	        throw new Error('dom-native INVALID API CALLS: hub(name) require a name (no name was given).');
	    }
	    let hub = hubDic.get(name);
	    if (hub === undefined) {
	        hub = new HubImpl(name);
	        hubDic.set(name, hub);
	        hubDataDic.set(name, new HubData(name));
	    }
	    return hub;
	}
	const hubDic = new Map();
	const hubDataDic = new Map();
	class HubImpl {
	    constructor(name) {
	        this.name = name;
	    }
	    sub(topics, labels_or_handler, handler_or_opts, opts) {
	        let labels;
	        let handler;
	        if (labels_or_handler instanceof Function) {
	            labels = null;
	            handler = labels_or_handler;
	            opts = handler_or_opts;
	        }
	        else {
	            labels = labels_or_handler;
	            handler = handler_or_opts;
	        }
	        const topicArray = splitAndTrim(topics, ",");
	        const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;
	        opts = makeOpts(opts);
	        const hubData = hubDataDic.get(this.name);
	        hubData.addEvent(topicArray, labelArray, handler, opts);
	    }
	    unsub(ns) {
	        const hubData = hubDataDic.get(this.name);
	        hubData.removeRefsForNs(ns.ns);
	    }
	    pub(topics, labels, data) {
	        if (typeof data === "undefined") {
	            data = labels;
	            labels = null;
	        }
	        const topicArray = splitAndTrim(topics, ",");
	        const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;
	        const hubData = hubDataDic.get(this.name);
	        const hasLabels = (labels != null && labels.length > 0);
	        if (hasLabels) {
	            hubData.getRefs(topicArray, labelArray).forEach(function (ref) {
	                invokeRef(ref, data);
	            });
	        }
	        hubData.getRefs(topicArray, null).forEach(function (ref) {
	            if (hasLabels) {
	                labelArray.forEach(function (label) {
	                    invokeRef(ref, data, label);
	                });
	            }
	            else {
	                invokeRef(ref, data);
	            }
	        });
	    }
	    deleteHub() {
	        hubDic.delete(this.name);
	        hubDataDic.delete(this.name);
	    }
	}
	class HubData {
	    constructor(name) {
	        this.refsByNs = new Map();
	        this.refsByTopic = new Map();
	        this.refsByTopicLabel = new Map();
	        this.name = name;
	    }
	    addEvent(topics, labels, fun, opts) {
	        const refs = buildRefs(topics, labels, fun, opts);
	        const refsByNs = this.refsByNs;
	        const refsByTopic = this.refsByTopic;
	        const refsByTopicLabel = this.refsByTopicLabel;
	        refs.forEach(function (ref) {
	            if (ref.ns != null) {
	                ensureArray(refsByNs, ref.ns).push(ref);
	            }
	            if (ref.label != null) {
	                ensureArray(refsByTopicLabel, buildTopicLabelKey(ref.topic, ref.label)).push(ref);
	            }
	            else {
	                ensureArray(refsByTopic, ref.topic).push(ref);
	            }
	        });
	    }
	    ;
	    getRefs(topics, labels) {
	        const refs = [];
	        const refsByTopic = this.refsByTopic;
	        const refsByTopicLabel = this.refsByTopicLabel;
	        topics.forEach(function (topic) {
	            if (labels == null || labels.length === 0) {
	                const topicRefs = refsByTopic.get(topic);
	                if (topicRefs) {
	                    refs.push.apply(refs, topicRefs);
	                }
	            }
	            else {
	                labels.forEach(function (label) {
	                    const topicLabelRefs = refsByTopicLabel.get(buildTopicLabelKey(topic, label));
	                    if (topicLabelRefs) {
	                        refs.push.apply(refs, topicLabelRefs);
	                    }
	                });
	            }
	        });
	        return refs;
	    }
	    ;
	    removeRefsForNs(ns) {
	        const refsByTopic = this.refsByTopic;
	        const refsByTopicLabel = this.refsByTopicLabel;
	        const refsByNs = this.refsByNs;
	        const refs = this.refsByNs.get(ns);
	        if (refs != null) {
	            refs.forEach(function (ref) {
	                let refList;
	                if (ref.label != null) {
	                    const topicLabelKey = buildTopicLabelKey(ref.topic, ref.label);
	                    refList = refsByTopicLabel.get(topicLabelKey);
	                }
	                else {
	                    refList = refsByTopic.get(ref.topic);
	                }
	                let idx;
	                while ((idx = refList.indexOf(ref)) !== -1) {
	                    refList.splice(idx, 1);
	                }
	            });
	            refsByNs.delete(ns);
	        }
	    }
	    ;
	}
	function buildRefs(topics, labels, fun, opts) {
	    let refs = [];
	    topics.forEach(function (topic) {
	        if (labels == null || labels.length === 0) {
	            refs.push({
	                topic: topic,
	                fun: fun,
	                ns: opts.ns,
	                ctx: opts.ctx
	            });
	        }
	        else {
	            labels.forEach(function (label) {
	                refs.push({
	                    topic: topic,
	                    label: label,
	                    fun: fun,
	                    ns: opts.ns,
	                    ctx: opts.ctx
	                });
	            });
	        }
	    });
	    return refs;
	}
	const emptyOpts = {};
	function makeOpts(opts) {
	    if (opts == null) {
	        opts = emptyOpts;
	    }
	    else {
	        if (typeof opts === "string") {
	            opts = { ns: opts };
	        }
	    }
	    return opts;
	}
	function buildTopicLabelKey(topic, label) {
	    return topic + "-!-" + label;
	}
	function invokeRef(ref, data, label) {
	    const info = {
	        topic: ref.topic,
	        label: ref.label || label,
	        ns: ref.ns
	    };
	    ref.fun.call(ref.ctx, data, info);
	}

	const onEventsByConstructor = new Map();
	const hasOnWinEvent = new Map();
	const hasOnDocEvent = new Map();
	function onEvent(type, selector) {
	    return _onDOMEvent(null, type, selector);
	}
	function _onDOMEvent(evtTarget, type, selector) {
	    return function (target, propertyKey, descriptor) {
	        const fn = descriptor.value;
	        const clazz = target.constructor;
	        let onEvents = onEventsByConstructor.get(clazz);
	        if (onEvents == null) {
	            onEvents = [];
	            onEventsByConstructor.set(clazz, onEvents);
	        }
	        const onEvent = {
	            target: evtTarget,
	            name: propertyKey,
	            type: type,
	            selector: selector || null
	        };
	        onEvents.push(onEvent);
	    };
	}
	function bindOnEventsDecorators() {
	    let clazz = this.constructor;
	    const topClazz = clazz;
	    let setHasDocEvent = !hasOnDocEvent.has(topClazz);
	    let setHasWinEvent = !hasOnWinEvent.has(topClazz);
	    const fnNameBoundSet = new Set();
	    const opts = { ...this._nsObj, ctx: this };
	    while (clazz !== HTMLElement) {
	        const onEvents = onEventsByConstructor.get(clazz);
	        if (onEvents) {
	            for (const onEvent of onEvents) {
	                const fnName = onEvent.name;
	                if (!fnNameBoundSet.has(fnName)) {
	                    const fn = this[fnName];
	                    if (setHasDocEvent && onEvent.target === document) {
	                        hasOnDocEvent.set(topClazz, true);
	                        setHasDocEvent = false;
	                    }
	                    if (setHasWinEvent && onEvent.target === window) {
	                        hasOnWinEvent.set(topClazz, true);
	                        setHasWinEvent = false;
	                    }
	                    const target = onEvent.target || this;
	                    on(target, onEvent.type, onEvent.selector, fn, opts);
	                    fnNameBoundSet.add(fnName);
	                }
	            }
	        }
	        clazz = Object.getPrototypeOf(clazz);
	    }
	    if (setHasDocEvent) {
	        hasOnDocEvent.set(topClazz, false);
	    }
	    if (setHasWinEvent) {
	        hasOnWinEvent.set(topClazz, false);
	    }
	}
	function unbindOnEventsDecorators() {
	    const clazz = this.constructor;
	    if (hasOnDocEvent.get(clazz)) {
	        off(document, this._nsObj);
	    }
	    if (hasOnWinEvent.get(clazz)) {
	        off(window, this._nsObj);
	    }
	}

	const onHubEventByConstructor = new Map();
	function onHub(hubName, topic, label) {
	    return function (target, propertyKey, descriptor) {
	        const clazz = target.constructor;
	        let onEvents = onHubEventByConstructor.get(clazz);
	        if (onEvents == null) {
	            onEvents = [];
	            onHubEventByConstructor.set(clazz, onEvents);
	        }
	        const onEvent = {
	            methodName: propertyKey,
	            hubName,
	            topic,
	            label
	        };
	        onEvents.push(onEvent);
	    };
	}
	function bindOnHubDecorators() {
	    let clazz = this.constructor;
	    const fnNameBoundSet = new Set();
	    const opts = { ...this._nsObj, ctx: this };
	    while (clazz !== HTMLElement) {
	        const onEvents = onHubEventByConstructor.get(clazz);
	        if (onEvents) {
	            for (const onEvent of onEvents) {
	                const fnName = onEvent.methodName;
	                if (!fnNameBoundSet.has(fnName)) {
	                    const fn = this[fnName];
	                    const h = hub(onEvent.hubName);
	                    h.sub(onEvent.topic, onEvent.label, fn, opts);
	                    fnNameBoundSet.add(fnName);
	                }
	            }
	        }
	        clazz = Object.getPrototypeOf(clazz);
	    }
	}
	function unbindOnHubDecorators() {
	    let clazz = this.constructor;
	    const fnNameBoundSet = new Set();
	    const unboundHubNames = new Set();
	    const nsObj = this._nsObj;
	    while (clazz !== HTMLElement) {
	        const onEvents = onHubEventByConstructor.get(clazz);
	        if (onEvents) {
	            for (const onEvent of onEvents) {
	                const hubName = onEvent.hubName;
	                const fnName = onEvent.methodName;
	                if (!fnNameBoundSet.has(fnName) && !unboundHubNames.has(hubName)) {
	                    const h = hub(hubName);
	                    h.unsub(nsObj);
	                    unboundHubNames.add(hubName);
	                    fnNameBoundSet.add(fnName);
	                }
	            }
	        }
	        clazz = Object.getPrototypeOf(clazz);
	    }
	}

	let c_seq = 0;
	class BaseHTMLElement extends HTMLElement {
	    constructor() {
	        super();
	        this._init = false;
	        this.uid = 'c_uid_' + c_seq++;
	        this._nsObj = { ns: this.uid };
	    }
	    get initialized() { return this._init; }
	    init() { }
	    connectedCallback() {
	        if (!this._init) {
	            bindComponentEvents.call(this);
	            bindOnEventsDecorators.call(this);
	            bindOnHubDecorators.call(this);
	            this.init();
	            this._init = true;
	        }
	        if (this.preDisplay) {
	            requestAnimationFrame(() => { this.preDisplay(); });
	        }
	        if (this.postDisplay) {
	            requestAnimationFrame(() => { requestAnimationFrame(() => { this.postDisplay(); }); });
	        }
	    }
	    disconnectedCallback() {
	        if (this.docEvents) {
	            off(document, this._nsObj);
	        }
	        if (this.winEvents) {
	            off(window, this._nsObj);
	        }
	        if (this.hubEvents) {
	            unbindHubEvents(this.hubEvents, this._nsObj);
	        }
	        unbindOnEventsDecorators.call(this);
	        unbindOnHubDecorators.call(this);
	    }
	    attributeChangedCallback(attrName, oldVal, newVal) { }
	}
	function bindComponentEvents() {
	    const opts = { ns: this._nsObj.ns, ctx: this };
	    if (this.events) {
	        bindOnEvents(this, this.events, opts);
	    }
	    if (this.docEvents) {
	        bindOnEvents(document, this.docEvents, opts);
	    }
	    if (this.winEvents) {
	        bindOnEvents(window, this.winEvents, opts);
	    }
	    if (this.hubEvents) {
	        bindHubEvents(this.hubEvents, opts);
	    }
	}

	function first(el_or_selector, selector) {
	    if (!selector && typeof el_or_selector !== "string") {
	        const el = el_or_selector;
	        const firstElementChild = el.firstElementChild;
	        if (!firstElementChild && el.firstChild) {
	            if (el.firstChild.nodeType === 1) {
	                return el.firstChild;
	            }
	            else {
	                return next(el.firstChild);
	            }
	        }
	        return firstElementChild;
	    }
	    else {
	        return _execQuerySelector(false, el_or_selector, selector);
	    }
	}
	function all(el, selector) {
	    const nodeList = _execQuerySelector(true, el, selector);
	    return (nodeList != null) ? asNodeArray(nodeList) : [];
	}
	function next(el, selector) {
	    return _sibling(true, el, selector);
	}
	function closest(el, selector) {
	    return (el) ? el.closest(selector) : null;
	}
	function append(refEl, newEl, position) {
	    let parentEl;
	    let nextSibling = null;
	    let result;
	    if (typeof newEl === 'string') {
	        newEl = frag(newEl);
	    }
	    if (newEl instanceof Array) {
	        result = newEl;
	        const fragment = document.createDocumentFragment();
	        for (const elItem of newEl) {
	            fragment.appendChild(elItem);
	        }
	        newEl = fragment;
	    }
	    else if (newEl instanceof DocumentFragment) {
	        result = [...newEl.children];
	    }
	    else {
	        result = newEl;
	    }
	    position = (position) ? position : "last";
	    if (position === "last" || position === "first" || position === "empty") {
	        parentEl = refEl;
	    }
	    else if (position === "before" || position === "after") {
	        parentEl = refEl.parentNode;
	        if (!parentEl) {
	            throw new Error("dom-native ERROR - The referenceElement " + refEl + " does not have a parentNode. Cannot insert " + position);
	        }
	    }
	    if (position === "first") {
	        nextSibling = first(refEl);
	    }
	    else if (position === "before") {
	        nextSibling = refEl;
	    }
	    else if (position === "after") {
	        nextSibling = next(refEl);
	    }
	    if (nextSibling) {
	        parentEl.insertBefore(newEl, nextSibling);
	    }
	    else {
	        if (position === "empty") {
	            if (parentEl instanceof HTMLElement) {
	                parentEl.innerHTML = '';
	            }
	            else if (parentEl instanceof DocumentFragment) {
	                while (parentEl.lastChild) {
	                    parentEl.removeChild(parentEl.lastChild);
	                }
	            }
	        }
	        parentEl.appendChild(newEl);
	    }
	    return result;
	}
	function frag(html) {
	    html = (html) ? html.trim() : null;
	    const template = document.createElement("template");
	    if (html) {
	        template.innerHTML = html;
	    }
	    return template.content;
	}
	function style(el, style) {
	    if (el == null)
	        return el;
	    if (el instanceof HTMLElement) {
	        _styleEl(el, style);
	    }
	    else if (el instanceof Array) {
	        for (const elItem of el) {
	            _styleEl(elItem, style);
	        }
	    }
	    return el;
	}
	function _styleEl(el, style) {
	    for (const name of Object.keys(style)) {
	        el.style[name] = style[name];
	    }
	}
	function className(els, keyValues) {
	    if (els instanceof Array) {
	        for (const el of els) {
	            _setClassName(el, keyValues);
	        }
	    }
	    else {
	        _setClassName(els, keyValues);
	    }
	    return els;
	}
	function _setClassName(el, keyValues) {
	    for (const name of Object.keys(keyValues)) {
	        const val = keyValues[name];
	        if (val === null || val === false) {
	            el.classList.remove(name);
	        }
	        else if (val !== undefined) {
	            el.classList.add(name);
	        }
	    }
	}
	function attr(els, arg, val) {
	    if (val !== undefined) {
	        if (typeof arg !== 'string') {
	            throw new Error(`attr - attr(els, name, value) must have name as string and not: ${arg}`);
	        }
	        const name = arg;
	        if (els instanceof Array) {
	            for (const el of els) {
	                _setAttribute(el, name, val);
	            }
	        }
	        else {
	            _setAttribute(els, name, val);
	        }
	        return els;
	    }
	    else if (typeof arg === 'string' || arg instanceof Array) {
	        return _attrGet(els, arg);
	    }
	    else {
	        return _attrSet(els, arg);
	    }
	}
	function _attrSet(els, arg) {
	    if (els instanceof Array) {
	        for (const el of els) {
	            _setAttributes(el, arg);
	        }
	    }
	    else {
	        _setAttributes(els, arg);
	    }
	    return els;
	}
	function _setAttributes(el, nameValueObject) {
	    for (const name of Object.keys(nameValueObject)) {
	        _setAttribute(el, name, nameValueObject[name]);
	    }
	}
	function _setAttribute(el, name, val) {
	    const txtVal = (typeof val !== 'boolean') ? val : (val === true) ? '' : null;
	    if (txtVal !== null) {
	        el.setAttribute(name, txtVal);
	    }
	    else {
	        el.removeAttribute(name);
	    }
	}
	function _attrGet(els, arg) {
	    if (els instanceof Array) {
	        const ells = els;
	        return ells.map(el => {
	            const r = _getAttrEl(el, arg);
	            return r;
	        });
	    }
	    else {
	        const r = _getAttrEl(els, arg);
	        return r;
	    }
	}
	function _getAttrEl(el, names) {
	    if (names instanceof Array) {
	        return names.map(n => { return el.getAttribute(n); });
	    }
	    else {
	        return el.getAttribute(names);
	    }
	}
	function elem(...names) {
	    if (names.length === 1) {
	        return document.createElement(names[0]);
	    }
	    else {
	        return names.map(n => { return document.createElement(n); });
	    }
	}
	function _sibling(next, el, selector) {
	    const sibling = (next) ? 'nextSibling' : 'previousSibling';
	    let tmpEl = (el) ? el[sibling] : null;
	    while (tmpEl != null && tmpEl != document) {
	        if (tmpEl.nodeType === 1 && (!selector || tmpEl.matches(selector))) {
	            return tmpEl;
	        }
	        tmpEl = tmpEl[sibling];
	    }
	    return null;
	}
	function _execQuerySelector(all, elOrSelector, selector) {
	    let el = null;
	    if (elOrSelector == null) {
	        return null;
	    }
	    if (typeof selector === "undefined") {
	        selector = elOrSelector;
	        el = document;
	    }
	    else {
	        el = elOrSelector;
	    }
	    return (all) ? el.querySelectorAll(selector) : el.querySelector(selector);
	}

	const _pushers = [
	    ["input[type='checkbox'], input[type='radio']", function (value) {
	            const iptValue = this.value || "on";
	            if (value instanceof Array) {
	                if (value.indexOf(iptValue) > -1) {
	                    this.checked = true;
	                }
	            }
	            else if ((iptValue === "on" && value) || iptValue === value) {
	                this.checked = true;
	            }
	        }],
	    ["input", function (value) {
	            this.value = value;
	        }],
	    ["select", function (value) {
	            this.value = value;
	        }],
	    ["textarea", function (value) {
	            this.value = value;
	        }],
	    ["*", function (value) {
	            this.innerHTML = value;
	        }]
	];
	const _pullers = [
	    ["input[type='checkbox'], input[type='radio']", function (existingValue) {
	            const iptValue = this.value || "on";
	            let newValue;
	            if (this.checked) {
	                newValue = (iptValue && iptValue !== "on") ? iptValue : true;
	                if (typeof existingValue !== "undefined") {
	                    const values = asArray(existingValue);
	                    values.push(newValue);
	                    newValue = values;
	                }
	            }
	            return newValue;
	        }],
	    ["input, select", function (existingValue) {
	            return this.value;
	        }],
	    ["textarea", function (existingValue) {
	            return this.value;
	        }],
	    ["*", function (existingValue) {
	            return this.innerHTML;
	        }]
	];
	function pusher(selector, pusherFn) {
	    _pushers.unshift([selector, pusherFn]);
	}
	function puller(selector, pullerFn) {
	    _pullers.unshift([selector, pullerFn]);
	}
	function push(el, selector_or_data, data) {
	    let selector;
	    if (data == null) {
	        selector = ".dx";
	        data = selector_or_data;
	    }
	    else {
	        selector = selector_or_data;
	    }
	    const dxEls = all(el, selector);
	    dxEls.forEach(function (dxEl) {
	        const propPath = getPropPath(dxEl);
	        if (!propPath) {
	            return;
	        }
	        const value = val(data, propPath);
	        if (typeof value !== 'undefined') {
	            let i = 0, pusherSelector, fun, l = _pushers.length;
	            for (; i < l; i++) {
	                pusherSelector = _pushers[i][0];
	                if (dxEl && dxEl.matches(pusherSelector)) {
	                    fun = _pushers[i][1];
	                    fun.call(dxEl, value);
	                    break;
	                }
	            }
	        }
	    });
	}
	function pull(el, selector) {
	    const obj = {};
	    selector = (selector) ? selector : ".dx";
	    const dxEls = all(el, selector);
	    dxEls.forEach(function (dxEl) {
	        let propPath = getPropPath(dxEl);
	        let i = 0, pullerSelector, fun, l = _pullers.length;
	        for (; i < l; i++) {
	            pullerSelector = _pullers[i][0];
	            if (dxEl && dxEl.matches(pullerSelector)) {
	                fun = _pullers[i][1];
	                const existingValue = val(obj, propPath);
	                const value = fun.call(dxEl, existingValue);
	                if (typeof value !== "undefined") {
	                    val(obj, propPath, value);
	                }
	                break;
	            }
	        }
	    });
	    return obj;
	}
	function getPropPath(dxEl) {
	    let path = null;
	    let i = 0, classes = dxEl.classList, l = dxEl.classList.length, name;
	    for (; i < l; i++) {
	        name = classes[i];
	        if (name.indexOf("dx-") === 0) {
	            path = name.split("-").slice(1).join(".");
	            break;
	        }
	    }
	    if (!path) {
	        path = dxEl.getAttribute("data-dx");
	    }
	    if (!path) {
	        path = dxEl.getAttribute("name");
	    }
	    return path;
	}

	function customElement(tagName) {
	    return function (target) {
	        customElements.define(tagName, target);
	    };
	}

	const dcoHub = hub('dcoHub');
	class BaseDco {
	    constructor(type) {
	        this._entityType = type;
	    }
	    async get(id) {
	        const result = await ajaxGet(`/api/dse/${this._entityType}/${id}`);
	        if (result.success) {
	            return result.data;
	        }
	        else {
	            throw result;
	        }
	    }
	    async list(filter) {
	        const result = await ajaxGet(`/api/dse/${this._entityType}`, filter);
	        if (result.success) {
	            return result.data;
	        }
	        else {
	            throw result;
	        }
	    }
	    async create(props) {
	        const result = await ajaxPost(`/api/dse/${this._entityType}`, props);
	        const entity = result.data;
	        if (result.success) {
	            dcoHub.pub(this._entityType, 'create', entity);
	            return entity;
	        }
	        else {
	            throw result;
	        }
	    }
	    async update(id, props) {
	        const result = await ajaxPatch(`/api/dse/${this._entityType}/${id}`, props);
	        const entity = result.data;
	        if (result.success) {
	            dcoHub.pub(this._entityType, 'update', entity);
	            return entity;
	        }
	        else {
	            throw result;
	        }
	    }
	    async remove(id) {
	        const result = await ajaxDelete(`/api/dse/${this._entityType}/${id}`);
	        if (result.success) {
	            dcoHub.pub(this._entityType, 'remove', id);
	            return true;
	        }
	        else {
	            throw result;
	        }
	    }
	}

	const projectDco = new BaseDco('Project');

	Handlebars.registerHelper("echo", function (cond, val) {
	    return (cond) ? val : "";
	});
	Handlebars.registerHelper("incl", function (templateName, data, options) {
	    var params = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
	    if (params.length == 1) {
	        params = params[0];
	    }
	    var tmpl = Handlebars.templates[templateName];
	    var html = tmpl(params);
	    return html;
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	function __decorate$1(decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	function css(els, keyValues) {
	    if (els instanceof Array) {
	        for (const el of els) {
	            _setCss(el, keyValues);
	        }
	    }
	    else {
	        _setCss(els, keyValues);
	    }
	    return els;
	}
	function _setCss(el, keyValues) {
	    for (const name of Object.keys(keyValues)) {
	        const val = keyValues[name];
	        if (val === null || val === false) {
	            el.classList.remove(name);
	        }
	        else if (val !== undefined) {
	            el.classList.add(name);
	        }
	    }
	}

	if (window.__decorate == null) {
	    window.__decorate = __decorate$1;
	}
	class BaseFieldElement extends BaseHTMLElement {
	    static get observedAttributes() { return ['disabled', 'readonly', 'placeholder', 'ico-lead']; }
	    get readonly() { return this.hasAttribute('readonly'); }
	    ;
	    set readonly(v) { attr(this, 'readonly', (v) ? '' : null); }
	    ;
	    get disabled() { return this.hasAttribute('disabled'); }
	    ;
	    set disabled(v) { attr(this, 'disabled', (v) ? '' : null); }
	    ;
	    get name() { return attr(this, 'name'); }
	    ;
	    set name(v) { attr(this, 'name', v); }
	    ;
	    get placeholder() { return attr(this, 'placeholder'); }
	    ;
	    set placeholder(v) { attr(this, 'placeholder', v); }
	    ;
	    get icoLead() { return attr(this, 'ico-lead'); }
	    ;
	    get icoTrail() { return attr(this, 'ico-trail'); }
	    ;
	    get noValue() { return this.classList.contains('no-value'); }
	    ;
	    set noValue(v) { css(this, { 'no-value': v }); }
	    ;
	    init() {
	        super.init();
	        this.classList.add('d-field');
	        const [name, label] = attr(this, ['name', 'label']);
	        if (!label) {
	            this.classList.add('no-label');
	        }
	        if (name && name.length > 0) {
	            this.classList.add('dx');
	        }
	    }
	    attributeChangedCallback(attrName, oldVal, newVal) {
	        super.attributeChangedCallback(attrName, oldVal, newVal);
	    }
	    triggerChange() {
	        if (this.initialized) {
	            const value = this.value;
	            const name = this.name;
	            trigger(this, "CHANGE", { detail: { name, value } });
	        }
	    }
	}
	pusher('.d-field', function (val) {
	    this.value = val;
	});
	puller('.d-field', function () {
	    return this.value;
	});

	function htmlSvgSymbol(name) {
	    var html = ['<svg class="symbol ' + name + '">'];
	    html.push('<use xlink:href="#' + name + '"></use>');
	    html.push('</svg>');
	    return html.join('\n');
	}
	let SymbolElement = (() => {
	    let SymbolElement = class SymbolElement extends BaseHTMLElement {
	        static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['name']); }
	        get name() { var _a; return (_a = this.getAttribute('name')) !== null && _a !== void 0 ? _a : ''; }
	        init() {
	            super.init();
	            this.refresh();
	        }
	        attributeChangedCallback(attrName, oldVal, newVal) {
	            super.attributeChangedCallback(attrName, oldVal, newVal);
	            switch (attrName) {
	                case 'name':
	                    if (oldVal !== newVal) {
	                        this.classList.remove(oldVal);
	                        this.refresh();
	                    }
	                    break;
	            }
	        }
	        refresh() {
	            const name = this.name;
	            if (name) {
	                this.classList.add(name);
	                this.innerHTML = htmlSvgSymbol(name);
	            }
	        }
	    };
	    SymbolElement = __decorate([
	        customElement('d-symbol')
	    ], SymbolElement);
	    return SymbolElement;
	})();
	let IcoElement = (() => {
	    var IcoElement_1;
	    let IcoElement = IcoElement_1 = class IcoElement extends SymbolElement {
	        get name() { return IcoElement_1.prefix + super.name; }
	    };
	    IcoElement.prefix = '';
	    IcoElement = IcoElement_1 = __decorate([
	        customElement('d-ico')
	    ], IcoElement);
	    return IcoElement;
	})();

	class BaseToggleElement extends BaseFieldElement {
	    static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['checked']); }
	    get checked() { return this.hasAttribute('checked'); }
	    set checked(v) { attr(this, { checked: v }); }
	    get value() {
	        const attrValue = attr(this, 'value');
	        const checked = this.checked;
	        if (attrValue) {
	            return (checked) ? attrValue : false;
	        }
	        else {
	            return checked;
	        }
	    }
	    set value(v) {
	        if (typeof v === 'boolean') {
	            this.checked = v;
	        }
	        else {
	            const attrValue = attr(this, 'value');
	            if (attrValue) {
	                this.checked = (attrValue === v);
	            }
	            else {
	                console.log(`Warning - d-check - Tries to set a non boolean value '${v}' to checkElement.value which do not have a attribute value to match with. Skipping. `);
	            }
	        }
	    }
	    init() {
	        super.init();
	        const content = document.createDocumentFragment();
	        const label = attr(this, 'label');
	        if (label != null) {
	            this.labelEl = elem('label');
	            this.labelEl.textContent = label;
	            content.appendChild(this.labelEl);
	        }
	        const iptContent = this.renderIptContent();
	        this.iptEl = attr(elem('div'), { class: 'd-ipt' });
	        this.iptEl.innerHTML = iptContent;
	        content.append(this.iptEl);
	        this.appendChild(content);
	        on(this, 'click', (evt) => {
	            if (!this.disabled && !this.readonly) {
	                this.handleClick();
	            }
	        });
	    }
	    attributeChangedCallback(name, oldVal, newVal) {
	        super.attributeChangedCallback(name, oldVal, newVal);
	        if (this.initialized) {
	            switch (name) {
	                case 'checked':
	                    if (oldVal !== newVal) {
	                        const iptContent = this.renderIptContent();
	                        if (iptContent) {
	                            this.iptEl.innerHTML = iptContent;
	                        }
	                        this.triggerChange();
	                    }
	                    break;
	            }
	        }
	    }
	}

	let CheckElement = (() => {
	    let CheckElement = class CheckElement extends BaseToggleElement {
	        handleClick() {
	            this.checked = !this.checked;
	        }
	        renderIptContent() {
	            if (!this.iptEl) {
	                return htmlSvgSymbol('d-ico-check');
	            }
	            else {
	                return undefined;
	            }
	        }
	    };
	    CheckElement = __decorate([
	        customElement("d-check")
	    ], CheckElement);
	    return CheckElement;
	})();

	class BaseInputElement extends BaseFieldElement {
	    get focused() { return this.classList.contains('focused'); }
	    ;
	    set focused(b) { css(this, { focused: b }); }
	    ;
	    init() {
	        super.init();
	        const content = document.createDocumentFragment();
	        const icoLead = this.icoLead;
	        if (icoLead) {
	            const icoEl = attr(elem('d-ico'), { 'name': icoLead, 'class': 'lead' });
	            content.appendChild(icoEl);
	        }
	        this.inputEl = this.createIptEl();
	        this.inputEl.classList.add('d-ipt');
	        content.appendChild(this.inputEl);
	        const [label, labelTrail, textTrail] = attr(this, ['label', 'label-trail', 'text-trail']);
	        if (label) {
	            this.labelEl = elem('label');
	            this.labelEl.textContent = label;
	            content.appendChild(this.labelEl);
	        }
	        if (labelTrail) {
	            const labelTrailEl = attr(elem('label'), { 'class': 'label-trail' });
	            labelTrailEl.textContent = labelTrail;
	            content.appendChild(labelTrailEl);
	        }
	        if (textTrail) {
	            const textTrailEl = attr(elem('div'), { 'class': 'text-trail' });
	            textTrailEl.textContent = textTrail;
	            content.appendChild(textTrailEl);
	        }
	        const icoTrail = this.icoTrail;
	        if (icoTrail) {
	            const icoEl = attr(elem('d-ico'), { 'name': icoTrail, 'class': 'trail' });
	            content.appendChild(icoEl);
	        }
	        content.appendChild(attr(elem('div'), { class: 'box' }));
	        const [readonly, disabled, placeholder] = attr(this, ['readonly', 'disabled', 'placeholder']);
	        attr(this.inputEl, { readonly, disabled, placeholder });
	        const value = this.getInitialValue();
	        this.value = value;
	        append(this, content, 'empty');
	        this.noValue = (!value);
	        on(this, 'focusin, focusout, change', '.d-ipt', (evt) => {
	            const m_input = this;
	            switch (evt.type) {
	                case 'focusin':
	                    m_input.focused = true;
	                    break;
	                case 'focusout':
	                    m_input.focused = false;
	                    break;
	                case 'change':
	                    this.value = this.inputEl.value;
	                    break;
	            }
	        });
	        on(this, 'click', 'label', (evt) => {
	            this.inputEl.focus();
	        });
	    }
	    attributeChangedCallback(name, oldVal, newVal) {
	        super.attributeChangedCallback(name, oldVal, newVal);
	        if (this.initialized) {
	            switch (name) {
	                case 'readonly':
	                    attr(this.inputEl, { readonly: newVal });
	                    break;
	                case 'disabled':
	                    attr(this.inputEl, { disabled: newVal });
	                    break;
	                case 'placeholder':
	                    attr(this.inputEl, { placeholder: newVal });
	                    break;
	            }
	        }
	    }
	    focus() {
	        var _a;
	        (_a = this.inputEl) === null || _a === void 0 ? void 0 : _a.focus();
	    }
	}

	let InputElement = (() => {
	    let InputElement = class InputElement extends BaseInputElement {
	        static get observedAttributes() { return BaseInputElement.observedAttributes.concat(['password']); }
	        get value() { return this.inputEl.value; }
	        ;
	        set value(val) {
	            const inputEl = this.inputEl;
	            const old = inputEl.value;
	            if (val !== old) {
	                inputEl.value = val;
	            }
	            const newVal = this.value;
	            this.noValue = (!(newVal && newVal.length > 0));
	            this.triggerChange();
	        }
	        ;
	        createIptEl() {
	            const type = this.hasAttribute('password') ? 'password' : 'text';
	            const el = elem('input');
	            if (type != null) {
	                el.setAttribute('type', type);
	            }
	            return el;
	        }
	        getInitialValue() {
	            return attr(this, 'value');
	        }
	    };
	    InputElement = __decorate([
	        customElement("d-input")
	    ], InputElement);
	    return InputElement;
	})();

	let OptionsElement = (() => {
	    let OptionsElement = class OptionsElement extends BaseFieldElement {
	        get value() {
	            const selEl = first('.d-ipt > div.sel');
	            return (selEl) ? selEl.getAttribute('data-val') : null;
	        }
	        set value(val) {
	            val = (typeof val !== 'string' && val != null) ? '' + val : val;
	            const old = this.value;
	            const items = all(this, '.d-ipt > div');
	            for (const item of items) {
	                if (item.getAttribute('data-val') === val) {
	                    item.classList.add('sel');
	                }
	                else {
	                    item.classList.remove('sel');
	                }
	            }
	            if (val !== old) {
	                this.triggerChange();
	            }
	        }
	        init() {
	            super.init();
	            const [options, value] = attr(this, ['options', 'value']);
	            let html = '<div class="d-ipt">';
	            if (options) {
	                for (const line of options.split(',')) {
	                    let [val, label] = line.split(':');
	                    val = val.trim();
	                    label = label.trim();
	                    const sel = (value == val) ? 'sel' : '';
	                    html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
	                }
	                html += '</div>';
	                this.innerHTML = html;
	            }
	            on(this, 'click', '.d-ipt > div', (evt) => {
	                const clickedItem = evt.selectTarget;
	                const val = clickedItem.getAttribute('data-val');
	                this.value = val;
	                this.triggerChange();
	            });
	        }
	    };
	    OptionsElement = __decorate([
	        customElement('d-options')
	    ], OptionsElement);
	    return OptionsElement;
	})();

	let RadioElement = (() => {
	    let RadioElement = class RadioElement extends BaseToggleElement {
	        constructor() {
	            super(...arguments);
	            this.ignoreGroup = false;
	        }
	        get checked() { return this.hasAttribute('checked'); }
	        set checked(v) {
	            if (!this.ignoreGroup) {
	                const container = this.parentElement;
	                if (container) {
	                    const radios = all(container, `d-radio[name=${this.name}]`);
	                    for (const radio of radios) {
	                        if (radio != this && radio.checked) {
	                            radio.ignoreGroup = true;
	                            radio.checked = false;
	                            radio.ignoreGroup = false;
	                        }
	                    }
	                }
	            }
	            attr(this, { checked: v });
	        }
	        get value() {
	            if (this.checked) {
	                return super.value;
	            }
	            else {
	                return undefined;
	            }
	        }
	        set value(v) { super.value = v; }
	        ;
	        renderIptContent() {
	            const icoName = (this.checked) ? 'd-ico-radio-on' : 'd-ico-radio-off';
	            return htmlSvgSymbol(icoName);
	        }
	        handleClick() {
	            if (!this.checked) {
	                this.checked = !this.checked;
	            }
	        }
	    };
	    RadioElement = __decorate([
	        customElement("d-radio")
	    ], RadioElement);
	    return RadioElement;
	})();

	let SelectElement = (() => {
	    let SelectElement = class SelectElement extends BaseFieldElement {
	        constructor() {
	            super(...arguments);
	            this.popupShowing = false;
	            this.options = [];
	        }
	        static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(); }
	        get value() {
	            return this.getAttribute('value');
	        }
	        set value(v) {
	            attr(this, 'value', v);
	            this.refresh();
	        }
	        get popupCss() { return attr(this, 'popup-css'); }
	        get popupStyle() { return attr(this, 'popup-style'); }
	        triggerData(sendData) {
	            trigger(this, 'D-DATA', { detail: sendData });
	        }
	        init() {
	            super.init();
	            const [label, value] = attr(this, ['label', 'value']);
	            const firstElement = this.firstElementChild;
	            let content = null;
	            if (firstElement && firstElement.tagName === "OPTION") {
	                this.options = all(this, 'option').map(option => { return { content: option.innerHTML, value: option.getAttribute('value') }; });
	            }
	            else {
	                content = (firstElement) ? firstElement.textContent : (this.firstChild) ? this.firstChild.textContent : null;
	                if (content) {
	                    if (value != null) {
	                        this.options.push({ value, content });
	                    }
	                    else {
	                        this.placeholder = content;
	                    }
	                }
	            }
	            let tmp = frag(`<label></label><div class="d-ipt"></div><d-ico class="chevron" name="d-ico-chevron-down"></d-ico><div class="box"></div>`);
	            let els = [...tmp.children];
	            [this.labelEl, this.iptEl] = [...tmp.children];
	            this.labelEl.textContent = label;
	            this.innerHTML = '';
	            const icoLead = this.icoLead;
	            if (icoLead) {
	                const icoEl = attr(elem('d-ico'), { 'name': icoLead, 'class': 'lead' });
	                append(tmp, icoEl, 'first');
	            }
	            this.appendChild(tmp);
	            this.refresh();
	            on(this, 'click', (evt) => {
	                if (!this.popupShowing && !this.disabled && !this.readonly) {
	                    const popupCss = this.popupCss;
	                    const cssAttr = (popupCss) ? ` class="${popupCss}" ` : '';
	                    const popupStyle = this.popupStyle;
	                    const styleAttr = (popupStyle) ? ` style="${popupStyle}" ` : '';
	                    let popupFrag = frag(`<d-select-popup${cssAttr}${styleAttr}></d-select-popup>`).firstElementChild;
	                    popupFrag._options = this.options;
	                    popupFrag._select = this;
	                    const popup = first('body').appendChild(popupFrag);
	                    this.classList.add('focused');
	                    this.popupShowing = true;
	                    on(popup, 'SELECT, CANCELED', (evt) => {
	                        if (evt.type === 'SELECT') {
	                            this.value = evt.detail.value;
	                            this.triggerChange();
	                            this.refresh();
	                        }
	                        this.classList.remove('focused');
	                        this.popupShowing = false;
	                    });
	                    this.triggerData((options) => {
	                        this.options = options;
	                        popup.options = options;
	                    });
	                }
	            });
	        }
	        refresh() {
	            const val = this.value;
	            this.noValue = (val == null || val === '');
	            if (this.noValue) {
	                let text = this.placeholder;
	                if (text) {
	                    this.iptEl.innerHTML = text;
	                }
	                else {
	                    this.iptEl.innerHTML = '';
	                }
	            }
	            else {
	                const option = this.options.find(o => (o.value === val));
	                if ((option == null || option.value == null) && this.placeholder != null) {
	                    this.iptEl.textContent = this.placeholder;
	                }
	                else if (option) {
	                    this.iptEl.innerHTML = option.content;
	                }
	            }
	        }
	    };
	    SelectElement = __decorate([
	        customElement('d-select')
	    ], SelectElement);
	    return SelectElement;
	})();
	let SelectPopupElement = (() => {
	    let SelectPopupElement = class SelectPopupElement extends BaseHTMLElement {
	        get options() { return this._options; }
	        ;
	        set options(val) {
	            this._options = val;
	            if (this.initialized) {
	                this.render();
	            }
	        }
	        init() {
	            super.init();
	            this.render();
	            on(this, 'click', 'li', (evt) => {
	                const li = evt.selectTarget;
	                const value = attr(li, 'data-val');
	                trigger(this, 'SELECT', { detail: { value } });
	                this.remove();
	            });
	        }
	        disconnectedCallback() {
	            super.disconnectedCallback();
	            off(document, { ns: this.uid });
	        }
	        preDisplay() {
	            const emRect = this._select.getBoundingClientRect();
	            const currentStyle = this.style;
	            const newStyle = {
	                top: currentStyle.top || window.scrollY + emRect.top + emRect.height + 4 + 'px',
	                left: currentStyle.left || window.scrollX + emRect.left + 'px',
	                width: currentStyle.width || emRect.width + 'px'
	            };
	            style(this, newStyle);
	        }
	        postDisplay() {
	            on(document, 'click', (evt) => {
	                const target = evt.target;
	                if (target.closest('d-select-popup') !== this) {
	                    this.remove();
	                    trigger(this, 'CANCELED');
	                }
	            }, { ns: this.uid });
	        }
	        render() {
	            const selectVal = this._select.value;
	            let html = `\n<ul>`;
	            for (const item of this._options) {
	                const attrCss = (item.value === selectVal) ? 'class="sel"' : '';
	                const attrVal = (item.value) ? `data-val="${item.value}"` : '';
	                html += `\n  <li ${attrVal} ${attrCss}>${item.content}</li>`;
	            }
	            html += `\n</ul>`;
	            this.innerHTML = html;
	        }
	    };
	    SelectPopupElement = __decorate([
	        customElement('d-select-popup')
	    ], SelectPopupElement);
	    return SelectPopupElement;
	})();

	let TextElement = (() => {
	    let TextElement = class TextElement extends BaseInputElement {
	        get value() { return this.inputEl.value; }
	        ;
	        set value(val) {
	            const inputEl = this.inputEl;
	            const old = inputEl.value;
	            if (val !== old) {
	                this.inputEl.value = val;
	            }
	            const newVal = this.value;
	            this.noValue = (!(newVal && newVal.length > 0));
	            this.triggerChange();
	        }
	        ;
	        createIptEl() {
	            const el = elem('textarea');
	            return el;
	        }
	        getInitialValue() {
	            return this.textContent;
	        }
	    };
	    TextElement = __decorate([
	        customElement("d-text")
	    ], TextElement);
	    return TextElement;
	})();

	class Symbols {
	    constructor(doc) {
	        this.doc = doc;
	    }
	    load() {
	        document.addEventListener("DOMContentLoaded", async (event) => {
	            document.head.append(frag(this.doc));
	        });
	    }
	}

	const SVG_SYMBOLS = `
<svg xmlns="http://www.w3.org/2000/svg" style="width:0; height:0; visibility:hidden; display:none">
<symbol id="d-ico-check" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/check" fill-rule="nonzero"> <polygon id="Path" points="8.2255884 16.7829562 3.58145537 12.1388232 2 13.7091416 8.2255884 19.93473 21.59 6.57031836 20.0196816 5"/> </g> </g></symbol>
<symbol id="d-ico-chevron-down" viewBox="0 0 16 16"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/chevron-down" fill-rule="nonzero"> <polygon id="Shape" points="3.41 5 8 9.59 12.59 5 14 6.42 8 12.42 2 6.42"/> </g> </g></symbol>
<symbol id="d-ico-chevron-right" viewBox="0 0 16 16"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/chevron-right"> <polygon id="Shape" transform="translate(8.500000, 8.000000) rotate(-90.000000) translate(-8.500000, -8.000000) " points="3.91 4.5 8.5 8.83018868 13.09 4.5 14.5 5.83962264 8.5 11.5 2.5 5.83962264"/> </g> </g></symbol>
<symbol id="d-ico-fav" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/fav" fill-rule="nonzero"> <path d="M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.04 L12,21.35 Z" id="Path"/> </g> </g></symbol>
<symbol id="d-ico-radio-off" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/radio-off" fill-rule="nonzero"> <path d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 Z" id="Oval"/> </g> </g></symbol>
<symbol id="d-ico-radio-on" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/radio-on" fill-rule="nonzero"> <path d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 Z M12,7 C14.7614237,7 17,9.23857625 17,12 C17,14.7614237 14.7614237,17 12,17 C9.23857625,17 7,14.7614237 7,12 C7,9.23857625 9.23857625,7 12,7 Z" id="Oval"/> </g> </g></symbol>
<symbol id="d-ico-star" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/star" fill-rule="nonzero"> <path d="M14.81,8.62 L12.92,4.17 C12.58,3.36 11.42,3.36 11.08,4.17 L9.19,8.63 L4.36,9.04 C3.48,9.11 3.12,10.21 3.79,10.79 L7.46,13.97 L6.36,18.69 C6.16,19.55 7.09,20.23 7.85,19.77 L12,17.27 L16.15,19.78 C16.91,20.24 17.84,19.56 17.64,18.7 L16.54,13.97 L20.21,10.79 C20.88,10.21 20.53,9.11 19.65,9.04 L14.81,8.62 Z" id="Shape"/> </g> </g></symbol>
<symbol id="d-ico-triangle-down" viewBox="0 0 16 16"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/triangle-down" fill-rule="nonzero"> <polygon id="Shape" points="14 6 8 12 2 6"/> </g> </g></symbol>
<symbol id="d-ico-visible" viewBox="0 0 24 24"><g id="ico/" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="d-ico/visible" fill-rule="nonzero"> <path d="M12,4.5 C7,4.5 2.73,7.61 1,12 C2.73,16.39 7,19.5 12,19.5 C17,19.5 21.27,16.39 23,12 C21.27,7.61 17,4.5 12,4.5 Z M12,17 C9.24,17 7,14.76 7,12 C7,9.24 9.24,7 12,7 C14.76,7 17,9.24 17,12 C17,14.76 14.76,17 12,17 Z M12,9 C10.34,9 9,10.34 9,12 C9,13.66 10.34,15 12,15 C13.66,15 15,13.66 15,12 C15,10.34 13.66,9 12,9 Z" id="Shape"/> </g> </g></symbol>
</svg>
`;
	const symbols = new Symbols(SVG_SYMBOLS);

	async function login(username, pwd) {
	    const r = await ajaxPost('/api/login', { username, pwd });
	    return r;
	}
	async function logoff() {
	    const r = await ajaxPost('/api/logoff');
	    return r;
	}
	async function getUserContext() {
	    const ucResult = await ajaxGet('/api/user-context');
	    return (ucResult && ucResult.success) ? ucResult.data : null;
	}
	async function getGoogleOAuthUrl() {
	    const result = await ajaxGet('/google_oauth_url');
	    const data = getData(result, true);
	    if (data && data.url) {
	        return data.url;
	    }
	    else {
	        return null;
	    }
	}

	window.__version__ = "DROP-002-SNAPSHOT";
	symbols.load();
	const svgSymbolsPromise = ajaxGet("/svg/sprite.svg", null, { contentType: "application/xml" });
	document.addEventListener("DOMContentLoaded", function (event) {
	    svgSymbolsPromise.then(function (xmlDoc) {
	        const firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0];
	        const h = document.querySelector("head");
	        if (h != null) {
	            h.appendChild(firstChildElement);
	        }
	        trigger(document, "APP_LOADED");
	    });
	});
	on(document, 'APP_LOADED', async function () {
	    const uc = await getUserContext();
	    if (!uc) {
	        document.body.innerHTML = '<v-login></v-login>';
	    }
	    else {
	        document.body.innerHTML = '<v-main></v-main>';
	        const mainView = first(document.body);
	        mainView.userContext = uc;
	    }
	});

	function render(templateName, data) {
	    return frag(renderAsString(templateName, data));
	}
	function renderAsString(templateName, data) {
	    var tmpl = Handlebars.templates[templateName];
	    if (!tmpl) {
	        throw "Not template found in pre-compiled and in DOM for " + templateName;
	    }
	    return tmpl(data);
	}

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var dist = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toUuid = exports.shortUuid = exports.wait = exports.equal = exports.split = exports.pick = exports.omit = exports.asArray = exports.asNum = exports.pruneIn = exports.prune = exports.pruneNil = exports.pruneEmpty = exports.isString = exports.isEmpty = exports.isObject = exports.isNil = void 0;
	//#region    ---------- Helpers ---------- 
	const TYPE_OFFSET = 8;
	const TYPE_STRING = 'String]'; // '[object String]'
	const TYPE_NUMBER = 'Number]'; // '[object Number]'
	const TYPE_OBJECT = 'Object]'; // '[object Object]'
	const TYPE_REGEXP = 'RegExp]'; // '[object RegExp]'
	const TYPE_ARRAY = 'Array]'; // '[object Array]'
	const TYPE_DATE = 'Date]'; // '[object Date]
	const TYPE_MAP = 'Map]'; // '[object Map]'
	const TYPE_SET = 'Set]'; // '[object Set]'
	const toType = Object.prototype.toString; // to call as toType(obj).substring(TYPE_OFFSET)
	//#endregion ---------- /Helpers ---------- 
	//#region    ---------- is... ---------- 
	function isNil(obj) {
	    if (obj == null || Number.isNaN(obj))
	        return true;
	    return false;
	}
	exports.isNil = isNil;
	function isObject(obj) {
	    return toType.call(obj).substring(TYPE_OFFSET) === TYPE_OBJECT;
	}
	exports.isObject = isObject;
	function isEmpty(obj) {
	    if (obj == null)
	        return true;
	    const type = toType.call(obj).substring(TYPE_OFFSET);
	    if (type === TYPE_ARRAY) {
	        return (obj.length === 0);
	    }
	    else if (type === TYPE_STRING) {
	        if (obj.length === 0)
	            return true;
	        // needs to do the trim now
	        return (obj.trim().length === 0);
	    }
	    else if (type === TYPE_OBJECT) {
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop))
	                return false;
	        }
	        return true;
	    }
	    if (Number.isNaN(obj))
	        return true;
	    return false;
	}
	exports.isEmpty = isEmpty;
	function isString(val) {
	    return toType.call(val).substring(TYPE_OFFSET) === TYPE_STRING;
	}
	exports.isString = isString;
	function pruneEmpty(obj, ...additionalExcludes) {
	    return _prune(obj, isEmpty, additionalExcludes);
	}
	exports.pruneEmpty = pruneEmpty;
	function pruneNil(obj, ...additionalExcludes) {
	    return _prune(obj, isNil, additionalExcludes);
	}
	exports.pruneNil = pruneNil;
	const isUndefined = (v) => v === undefined;
	function prune(obj, ...additionalExcludes) {
	    return _prune(obj, isUndefined, additionalExcludes);
	}
	exports.prune = prune;
	function _prune(obj, is, excludeVals) {
	    if (obj == null)
	        return obj;
	    const excludeValSet = (excludeVals) ? new Set(excludeVals) : null;
	    if (obj instanceof Array) {
	        return obj.filter(v => !(is(v) || (excludeValSet === null || excludeValSet === void 0 ? void 0 : excludeValSet.has(v))));
	    }
	    else {
	        const prunedObj = {};
	        for (const k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                const v = obj[k];
	                if (!(is(v) || (excludeValSet === null || excludeValSet === void 0 ? void 0 : excludeValSet.has(v)))) {
	                    prunedObj[k] = v;
	                }
	            }
	        }
	        return prunedObj;
	    }
	}
	//#endregion ---------- /prune ----------
	//#region    ---------- pruneIn ---------- 
	function pruneIn(obj) {
	    if (obj == null)
	        return obj;
	    if (obj instanceof Array) {
	        let i = obj.length;
	        while (i--) {
	            if (obj[i] === undefined) {
	                obj.splice(i, 1);
	            }
	        }
	    }
	    else {
	        for (const k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                const v = obj[k];
	                if (v === undefined) {
	                    delete obj[k];
	                }
	            }
	        }
	    }
	    return obj;
	}
	exports.pruneIn = pruneIn;
	function asNum(val, alt) {
	    if (val == null) {
	        return alt !== null && alt !== void 0 ? alt : val;
	    }
	    const _alt = (alt != null) ? alt : null;
	    const type = toType.call(val).substring(TYPE_OFFSET);
	    // take the string value of val if exist (preserve null or undefined)
	    // first if null, return as is
	    if (val == null) {
	        return _alt;
	    }
	    // if it is a string, return the parsed string (return null | number)
	    if (type === TYPE_STRING) {
	        return _asNum(val, _alt);
	    }
	    else if (type === TYPE_NUMBER) {
	        return !Number.isNaN(val) ? val : _alt;
	    }
	    // at this point vals is an array or array of array
	    // if empty array return empty array
	    if (type === TYPE_ARRAY) {
	        const vals = val;
	        if (vals.length === 0) {
	            return []; // return empty array
	        }
	        // determine if we have array or array of array base on arguments. 
	        // Assume that types were respected, and that first element of the array is representative of the sequence.
	        const is2d = (vals[0] instanceof Array);
	        // Note: here ts needs little help.
	        return (is2d) ? val.map(items => { return items.map(item => _asNum(item, _alt)); }) : val.map(item => _asNum(item, _alt));
	    }
	    else {
	        // We do not know what it is, might be an object
	        return null;
	    }
	}
	exports.asNum = asNum;
	function _asNum(str, alt) {
	    if (str == null) {
	        return alt;
	    }
	    const r = Number(str);
	    const is_number = !Number.isNaN(r);
	    const is_zero = r === 0;
	    // Note: trying to push as late as possible the str.strim in case we have 0 (because Number(' ') === 0, which we do not want)
	    return (!is_zero && is_number || is_zero && str.trim().length > 0) ? r : alt;
	}
	function asArray(a) {
	    if (a == null)
	        return a;
	    return (a instanceof Array) ? a : [a];
	}
	exports.asArray = asArray;
	//#endregion ---------- /asArray ----------
	//#region    ---------- omit ---------- 
	// 
	/**
	 * Omit properties by name.
	 * Thanks to: https://stackoverflow.com/a/53968837
	 * For now, loosen up internal typing (i.e. ret: any, excludeSet Set<string>)
	 */
	function omit(obj, ...keys) {
	    let ret = {};
	    const excludeSet = new Set(keys);
	    // TS-NOTE: Set<K> makes the obj[key] type check fail, so, loosen up typing here.
	    for (let key in obj) {
	        if (!excludeSet.has(key)) {
	            ret[key] = obj[key];
	        }
	    }
	    return ret;
	}
	exports.omit = omit;
	//#endregion ---------- /omit ---------- 
	//#region    ---------- pick ---------- 
	function pick(obj, ...keys) {
	    if (obj == null)
	        return obj;
	    let ret = {};
	    for (let key of keys) {
	        ret[key] = obj[key];
	    }
	    return ret;
	}
	exports.pick = pick;
	function split(str, delim = ',') {
	    if (str == null)
	        return str;
	    const r = [];
	    const strs = str.split(delim);
	    for (let v of strs) {
	        v = v.trim();
	        if (v.length > 0)
	            r.push(v);
	    }
	    return r;
	}
	exports.split = split;
	//#endregion ---------- /split ---------- 
	//#region    ---------- equal ---------- 
	// inspired from: https://github.com/epoberezkin/fast-deep-equal/
	const hasOwnProp = Object.prototype.hasOwnProperty;
	function equal(a, b) {
	    // take care of same ref, and boolean, and string match
	    if (a === b)
	        return true;
	    const aType = toType.call(a).substring(TYPE_OFFSET);
	    const bType = toType.call(b).substring(TYPE_OFFSET);
	    if (aType !== bType)
	        return false;
	    // array
	    if (aType === TYPE_ARRAY) {
	        let length = a.length;
	        if (length != b.length)
	            return false;
	        for (let i = length; i-- !== 0;) {
	            if (!equal(a[i], b[i]))
	                return false;
	        }
	        return true;
	    }
	    // date
	    if (aType === TYPE_DATE) {
	        return a.getTime() == b.getTime();
	    }
	    // regex
	    if (aType === TYPE_REGEXP) {
	        return a.toString() == b.toString();
	    }
	    // Map
	    if (aType === TYPE_MAP) {
	        if (a.size !== b.size)
	            return false;
	        for (let i of a.entries())
	            if (!b.has(i[0]))
	                return false;
	        for (let i of a.entries())
	            if (!equal(i[1], b.get(i[0])))
	                return false;
	        return true;
	    }
	    // Set
	    if (aType === TYPE_SET) {
	        if (a.size !== b.size)
	            return false;
	        for (let i of a.entries())
	            if (!b.has(i[0]))
	                return false;
	        return true;
	    }
	    // check object 
	    if (aType === TYPE_OBJECT) {
	        let aKeys = Object.keys(a);
	        let length = aKeys.length;
	        if (length !== Object.keys(b).length)
	            return false;
	        for (let i = length; i-- !== 0;)
	            if (!hasOwnProp.call(b, aKeys[i]))
	                return false;
	        for (let i = length; i-- !== 0;) {
	            let key = aKeys[i];
	            if (!equal(a[key], b[key]))
	                return false;
	        }
	        return true;
	    }
	    // (trick from https://github.com/epoberezkin/fast-deep-equal/, because if a NaN a !== a !!!)
	    // true if both NaN, false otherwise
	    return a !== a && b !== b;
	}
	exports.equal = equal;
	//#endregion ---------- /equal ---------- 
	//#region    ---------- wait ---------- 
	async function wait(ms) {
	    return new Promise(function (resolve) {
	        setTimeout(() => { resolve(); }, ms);
	    });
	}
	exports.wait = wait;
	//#endregion ---------- /wait ----------
	//#region    ---------- uuid ---------- 
	const BASE_58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; // Bitcoin base58
	const BASE_16 = '0123456789abcdef';
	/**
	 * B58 (bitcoin alphabet) encode a UUID.
	 * from: b455d83b-a89e-4e40-b50a-876f6363c79d
	 * to:   PGaVHxohT51pMVaYme2Qd2
	 * (base on any-base code)
	 *
	 * @param uuid
	 */
	function shortUuid(uuid) {
	    const uuidStr = uuid.replace(/-/g, '');
	    return encode(BASE_16, BASE_58, uuidStr);
	}
	exports.shortUuid = shortUuid;
	function toUuid(b58) {
	    const str = encode(BASE_58, BASE_16, b58).padStart(32, '0');
	    return `${str.substring(0, 8)}-${str.substring(8, 12)}-${str.substring(12, 16)}-${str.substring(16, 20)}-${str.substring(20, 32)}`;
	}
	exports.toUuid = toUuid;
	/**
	 *
	 * Code mostly from https://github.com/HarasimowiczKamil/any-base#readme
	 */
	function encode(srcAlphabet, dstAlphabet, str) {
	    const numberMap = []; // can be array here (was {} in any-base, perhaps for perf? to test ?)
	    const fromBase = srcAlphabet.length;
	    const toBase = dstAlphabet.length;
	    let i, divide, newlen, length = str.length, result = '';
	    if (srcAlphabet === dstAlphabet) {
	        return str;
	    }
	    for (i = 0; i < length; i++) {
	        numberMap[i] = srcAlphabet.indexOf(str[i]);
	    }
	    do {
	        divide = 0;
	        newlen = 0;
	        for (i = 0; i < length; i++) {
	            divide = divide * fromBase + numberMap[i];
	            if (divide >= toBase) {
	                numberMap[newlen++] = parseInt('' + (divide / toBase), 10);
	                divide = divide % toBase;
	            }
	            else if (newlen > 0) {
	                numberMap[newlen++] = 0;
	            }
	        }
	        length = newlen;
	        result = dstAlphabet.slice(divide, divide + 1).concat(result);
	    } while (newlen !== 0);
	    return result;
	}
	//#endregion ---------- /uuid ----------
	});

	var index = /*@__PURE__*/unwrapExports(dist);

	const routeHub = hub("routeHub");
	let _routeInfo = null;
	function initRoute() {
	    triggerRouteChange();
	}
	function pathAt(idx) {
	    return getRouteInfo().pathAt(idx);
	}
	function paths() {
	    return getRouteInfo().paths().slice();
	}
	function pathAsNum(idx) {
	    return getRouteInfo().pathAsNum(idx);
	}
	function param$1(name) {
	    return getRouteInfo().param(name);
	}
	function pushPath(path) {
	    history.pushState('', document.title, path);
	    _routeInfo = null;
	    triggerRouteChange();
	}
	class RouteInfo {
	    constructor(data) {
	        this._data = data;
	    }
	    pathAt(idx) {
	        return (this._data.paths.length > idx) ? this._data.paths[idx] : null;
	    }
	    ;
	    pathAsNum(idx) {
	        let num = this.pathAt(idx);
	        return index.asNum(num);
	    }
	    ;
	    paths() {
	        return this._data.paths;
	    }
	    hash() {
	        return this._data.hash;
	    }
	    param(name) {
	        return this._data.params.get(name);
	    }
	}
	document.addEventListener('DOMContentLoaded', function (event) {
	    on(document, 'click', 'a', function (evt) {
	        const a = evt.selectTarget;
	        const href = a.getAttribute('href');
	        if (href) {
	            if (href.startsWith('http') || a.classList.contains('reload-link')) {
	                return;
	            }
	            evt.preventDefault();
	            pushPath(href);
	        }
	    });
	    on(window, 'popstate', function () {
	        _routeInfo = null;
	        triggerRouteChange();
	    });
	    on(window, 'hashchange', function () {
	        _routeInfo = null;
	        triggerRouteChange();
	    });
	});
	function triggerRouteChange() {
	    routeHub.pub('CHANGE', '');
	}
	function getRouteInfo() {
	    if (!_routeInfo) {
	        _routeInfo = buildRouteInfo();
	    }
	    return _routeInfo;
	}
	function buildRouteInfo() {
	    let hash = window.location.hash;
	    let pathname = window.location.pathname;
	    if (pathname.endsWith('/')) {
	        pathname = pathname.substring(0, pathname.length - 1);
	    }
	    const paths = pathname.split('/').slice(1);
	    const url = new URL(window.location.href);
	    const params = url.searchParams;
	    return new RouteInfo({ paths, hash, params });
	}

	function guard(val, message) {
	    if (val == null) {
	        throw new Error(message);
	    }
	    return val;
	}
	function isNum(n) {
	    return !isNaN(parseFloat(n)) && isFinite(n);
	}
	function dic(arr, keyName) {
	    return arr.reduce(function (map, item) {
	        var key = item[keyName];
	        map[key] = item;
	        return map;
	    }, {});
	}
	function ensureArray$1(a) {
	    return (a instanceof Array) ? a : [a];
	}
	function entityRef(el, type) {
	    const selector = (type != null) ? ("[data-entity='" + type + "']") : "[data-entity]";
	    const entityEl = closest(el, selector);
	    if (entityEl) {
	        const entity = {};
	        entity.el = entityEl;
	        entity.type = entityEl.getAttribute("data-entity");
	        entity.id = index.asNum(attr(entityEl, 'data-entity-id'));
	        return entity;
	    }
	    return null;
	}
	function randomString(length) {
	    length = length || 6;
	    const arr = [];
	    for (let i = 0; i < length; i++) {
	        arr.push(parseInt((Math.random() * 10).toString()));
	    }
	    return arr.join("");
	}
	function buildTimeVal(time) {
	    let timeVal = time ? time : 0;
	    let timeStr = "";
	    if (timeVal > 60) {
	        let mVal = parseInt((timeVal / 60).toFixed(0));
	        let sVal = timeVal % 60;
	        if (mVal > 60) {
	            let hVal = parseInt((mVal / 60).toFixed(0));
	            let hmVal = mVal % 60;
	            timeStr = hVal + "h" + hmVal + "m";
	        }
	        else {
	            timeStr = mVal + "m" + sVal + "s";
	        }
	    }
	    else {
	        timeStr = timeVal + "s";
	    }
	    return timeStr;
	}
	const lumaCache = new Map();
	function getLuma(c) {
	    if (c.startsWith("#")) {
	        c = c.substring(1);
	    }
	    let luma = lumaCache.get(c);
	    if (luma == null) {
	        const rgb = parseInt(c, 16);
	        const r = (rgb >> 16) & 0xff;
	        const g = (rgb >> 8) & 0xff;
	        const b = (rgb >> 0) & 0xff;
	        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	        lumaCache.set(c, luma);
	    }
	    return luma;
	}

	class BaseViewElement extends BaseHTMLElement {
	    constructor() {
	        super(...arguments);
	        this.currentPaths = {};
	    }
	    hasNewPathAt(idx, defaultPath) {
	        const path = pathAt(idx) || defaultPath;
	        const currentPath = this.currentPaths[idx];
	        if (path !== currentPath) {
	            this.currentPaths[idx] = path;
	            return path;
	        }
	        else {
	            return null;
	        }
	    }
	    resetNewPathAt(idx) {
	        delete this.currentPaths[idx];
	    }
	}

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	function __decorate$2(decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	exports.LoginView = class LoginView extends BaseViewElement {
	    get fieldset() { return first(this, 'section.content'); }
	    ;
	    get footerMessage() { return first(this, 'footer .message'); }
	    ;
	    get googleLink() { return first(this, 'a.google-oauth'); }
	    ;
	    get mode() {
	        if (this.classList.contains('login-mode')) {
	            return 'login';
	        }
	        else {
	            return 'register';
	        }
	    }
	    set mode(m) {
	        if ('login' === m) {
	            this.classList.remove('register-mode');
	            this.classList.add('login-mode');
	        }
	        else {
	            this.classList.add('register-mode');
	            this.classList.remove('login-mode');
	        }
	    }
	    set message(txt) {
	        if (txt != null) {
	            this.footerMessage.textContent = txt;
	            this.classList.add('has-message');
	        }
	        else {
	            if (this.classList.contains('has-message')) {
	                this.footerMessage.textContent = '';
	                this.classList.remove('has-message');
	            }
	        }
	    }
	    headerClicked(evt) {
	        const mode = this.mode;
	        if (mode == 'login') {
	            this.doLogin();
	        }
	        else if (mode == 'register') {
	            this.doRegister();
	        }
	        else {
	            console.log(`ERROR - NOP - Mode '${mode}' unknown. Ignoring`);
	        }
	    }
	    _keyup(evt) {
	        this.message = null;
	        if ('Enter' === evt.key) {
	            const mode = this.mode;
	            if ('login' === mode) {
	                this.doLogin();
	            }
	            else {
	                this.doRegister();
	            }
	        }
	    }
	    toRegisterMode() {
	        this.mode = 'register';
	    }
	    toLoginMode() {
	        this.mode = 'login';
	    }
	    init() {
	        super.init();
	        this.innerHTML = _render();
	        this.mode = 'login';
	    }
	    async postDisplay() {
	        style(this.googleLink, { opacity: '0.5' });
	        const oauthUrl = await getGoogleOAuthUrl();
	        if (oauthUrl) {
	            this.googleLink.setAttribute('href', oauthUrl);
	            style(this.googleLink, { opacity: '' });
	        }
	    }
	    async doLogin() {
	        const data = pull(this.fieldset);
	        try {
	            const result = await login(data.username, data.pwd);
	            if (result.success) {
	                window.location.href = '/';
	                return;
	            }
	            else {
	                this.message = result.error.message;
	            }
	        }
	        catch (ex) {
	            this.message = ex.error.message;
	        }
	    }
	    async doRegister() {
	        const data = pull(this.fieldset);
	        try {
	            const result = await ajaxPost('/api/register', data);
	        }
	        catch (ex) {
	            console.log('error register', ex);
	            this.footerMessage.textContent = ex.error || ex.message;
	        }
	    }
	};
	__decorate$2([
	    onEvent('click', 'button.do')
	], exports.LoginView.prototype, "headerClicked", null);
	__decorate$2([
	    onEvent('keyup', 'input')
	], exports.LoginView.prototype, "_keyup", null);
	__decorate$2([
	    onEvent('click', '.to-register')
	], exports.LoginView.prototype, "toRegisterMode", null);
	__decorate$2([
	    onEvent('click', '.to-login')
	], exports.LoginView.prototype, "toLoginMode", null);
	exports.LoginView = __decorate$2([
	    customElement('v-login')
	], exports.LoginView);
	function _render() {
	    return `
	<div class="dialog">
		<header>CLOUD-STARTER</header>
		<section class="content">
			<d-input name="username" placeholder="username"></d-input>
			<d-input name="pwd" password placeholder="password"></d-input>
			<d-input name="repeat-pwd" placeholder="Repeat Password" class="for-register"></d-input>
			<div></div>
			<button class="do high for-login">Login</button>
			<button class="do high for-register">Register</button>
		</section>
		<footer>
			<div class="message"></div>
			<a class="high to-register for-login">Register</a>
			<a class="high to-login for-register">Login</a>
			<span class="line"></span>
			<a class="high google-oauth">Google Login</a>
		</footer>
	</div>`;
	}

	const defaultPath = "";
	const tagNameByPath = {
	    "": 'v-projects',
	    "_spec": 'v-spec-main',
	};
	exports.MainView = class MainView extends BaseViewElement {
	    constructor() {
	        super(...arguments);
	        this._userMenuShowing = false;
	    }
	    get mainEl() { return first(this, 'main'); }
	    ;
	    get headerAsideEl() { return first(this, 'header aside'); }
	    get userMenuEl() { return first(this, 'header aside c-menu'); }
	    ;
	    set userContext(v) {
	        this._userContext = v;
	        push(this.headerAsideEl, { name: this._userContext.name });
	    }
	    clickToToggleUserMenuOff(evt) {
	        const target = evt.target;
	        if (this._userMenuShowing && target.closest('aside') !== this.headerAsideEl) {
	            this.userMenuEl.classList.add("display-none");
	            this._userMenuShowing = false;
	        }
	    }
	    clickToToogleUserMenuOn(evt) {
	        evt.cancelBubble = true;
	        if (this.userMenuEl.classList.contains('display-none')) {
	            this.userMenuEl.classList.remove('display-none');
	            this._userMenuShowing = true;
	        }
	        else {
	            this.userMenuEl.classList.add('display-none');
	            this._userMenuShowing = false;
	        }
	    }
	    async clickToLogoff() {
	        await logoff();
	        window.location.href = '/';
	    }
	    routChange() {
	        this.refresh();
	    }
	    init() {
	        super.init();
	        this.innerHTML = _render$1();
	        this.refresh();
	    }
	    refresh() {
	        const newPath = this.hasNewPathAt(0, defaultPath);
	        if (newPath != null) {
	            const tagName = tagNameByPath[newPath];
	            this.mainEl.innerHTML = `<${tagName}></${tagName}>`;
	        }
	    }
	};
	__decorate$2([
	    onEvent('click')
	], exports.MainView.prototype, "clickToToggleUserMenuOff", null);
	__decorate$2([
	    onEvent('click', '.toogle-user-menu')
	], exports.MainView.prototype, "clickToToogleUserMenuOn", null);
	__decorate$2([
	    onEvent('click', '.do-logoff')
	], exports.MainView.prototype, "clickToLogoff", null);
	__decorate$2([
	    onHub('routeHub', 'CHANGE')
	], exports.MainView.prototype, "routChange", null);
	exports.MainView = __decorate$2([
	    customElement('v-main')
	], exports.MainView);
	function _render$1() {
	    return `
	<header>
		<c-ico class="to-menu">menu</c-ico>
		<h3>CLOUD STARTER</h3>
		<aside class="toogle-user-menu">
			<c-ico>user</c-ico>
			<div class="dx dx-name">Some name</div>
			<c-menu class="display-none">
					<div class="do-logoff">Logoff</div>
					<a href="#profile">Profile</a>
			</c-menu>
		</aside>
	</header>
	
	<v-nav></v-nav>

	<main>
	</main>
	<footer>
		some footer
	</footer>
	<div class="__version__">${window.__version__}</div>
	`;
	}

	const defaultPath$1 = '';
	exports.NavView = class NavView extends BaseViewElement {
	    routeChange() {
	        this.refresh();
	    }
	    init() {
	        super.init();
	        this.innerHTML = _render$2();
	        this.refresh();
	    }
	    refresh() {
	        let path0 = pathAt(0);
	        path0 = (!path0) ? defaultPath$1 : path0;
	        for (const a of all(this, 'a')) {
	            let href = a.getAttribute('href');
	            let linkPath0 = (href) ? href.split('/')[1] : undefined;
	            linkPath0 = (!linkPath0) ? '' : linkPath0;
	            if (linkPath0 === path0) {
	                a.classList.add('sel');
	            }
	            else if (a.classList.contains('sel')) {
	                a.classList.remove('sel');
	            }
	        }
	    }
	};
	__decorate$2([
	    onHub('routeHub', 'CHANGE')
	], exports.NavView.prototype, "routeChange", null);
	exports.NavView = __decorate$2([
	    customElement('v-nav')
	], exports.NavView);
	function _render$2() {
	    return `	<a href="/">
		<c-ico>home</c-ico><span class='bar'></span> <span class='label'>Home</span>
	</a>`;
	}

	exports.ProjectsView = class ProjectsView extends BaseViewElement {
	    clickAddProject() {
	        const dAddProject = elem('d-add-project');
	        document.body.append(dAddProject);
	        on(dAddProject, 'ADD_PROJECT', (evt) => {
	            projectDco.create(evt.detail);
	        });
	    }
	    async onProjectChange() {
	        const projects = await projectDco.list();
	        this.refresh(projects);
	    }
	    async init() {
	        super.init();
	        this.refresh([]);
	        this.refresh();
	    }
	    async refresh(projects) {
	        if (projects == null) {
	            projects = await projectDco.list();
	        }
	        this.innerHTML = _render$3(projects);
	    }
	};
	__decorate$2([
	    onEvent('click', '.project-add')
	], exports.ProjectsView.prototype, "clickAddProject", null);
	__decorate$2([
	    onHub('dcoHub', 'Project', 'create, update')
	], exports.ProjectsView.prototype, "onProjectChange", null);
	exports.ProjectsView = __decorate$2([
	    customElement('v-projects')
	], exports.ProjectsView);
	function _render$3(projects = []) {
	    let html = `	<header><h1>PROJECTS</h1></header>
	<section>
		<div class="card project-add">
			<c-symbol>ico-add</c-symbol>
			<h3>Add New Project</h3>
		</div>
	`;
	    for (const p of projects) {
	        html += `	<div class="card project">
		<header><h2>${p.name}</h2></header>
	</div>	`;
	    }
	    html += `</section>`;
	    return html;
	}

	class BaseDialog extends BaseHTMLElement {
	    get dialogEl() { return first(this, '.dialog'); }
	    ;
	    get headerEl() { return first(this, '.dialog > header'); }
	    ;
	    get contentEl() { return first(this, '.dialog > section.dialog-content'); }
	    ;
	    get footerEl() { return first(this, '.dialog > footer'); }
	    ;
	    set opts(v) {
	    }
	    ;
	    set title(title) {
	        const titleEl = first(this, '.dialog > header > .title');
	        if (titleEl) {
	            titleEl.textContent = title;
	        }
	        else {
	            console.log('ERROR - cannot set title before element has been initialized');
	        }
	    }
	    set content(content) {
	        const contentEl = this.contentEl;
	        if (contentEl) {
	            contentEl.innerHTML = '';
	            contentEl.appendChild(content);
	        }
	        else {
	            console.log('ERROR - cannot set content before element has been initialized');
	        }
	    }
	    set footer(footer) {
	        const footerEl = this.footerEl;
	        if (!footerEl) {
	            console.log('ERROR - cannot set footer before element has been initialized');
	            return;
	        }
	        footerEl.innerHTML = '';
	        if (footer === false) {
	            footerEl.style.display = 'none';
	            return;
	        }
	        if (footer instanceof HTMLElement || footer instanceof DocumentFragment) {
	            append(footerEl, footer, 'empty');
	        }
	        else if (typeof footer === 'object') {
	            const html = [];
	            if (footer.extra) {
	                const label = (typeof footer.extra === 'string') ? footer.extra : "delete";
	                html.push(`<button class="do-extra">${label}</button>`);
	                html.push(`<div class="spacer"></div>`);
	            }
	            if (footer.cancel) {
	                const label = (typeof footer.cancel === 'string') ? footer.cancel : "Cancel";
	                html.push(`<button class="do-cancel">${label}</button>`);
	            }
	            if (footer.ok) {
	                const label = (typeof footer.ok === 'string') ? footer.ok : "OK";
	                html.push(`<button class="do-ok medium">${label}</button>`);
	            }
	            const htmlStr = html.join('\n');
	            const f = frag(htmlStr);
	            footerEl.appendChild(f);
	        }
	        footerEl.style.display = '';
	        footerEl.classList.remove('hide');
	    }
	    async doCancel() {
	        trigger(this, 'CANCEL');
	        this.doClose();
	    }
	    async doOk() {
	        trigger(this, 'OK');
	        this.doClose();
	    }
	    async doExtra() {
	        trigger(this, 'EXTRA');
	        this.doClose();
	    }
	    doClose() {
	        this.remove();
	    }
	    init() {
	        super.init();
	        this.classList.add('d-base-dialog');
	        this.innerHTML = render$1();
	    }
	}
	__decorate$2([
	    onEvent('click', '.do-cancel')
	], BaseDialog.prototype, "doCancel", null);
	__decorate$2([
	    onEvent('click', '.do-ok')
	], BaseDialog.prototype, "doOk", null);
	__decorate$2([
	    onEvent('click', '.do-extra')
	], BaseDialog.prototype, "doExtra", null);
	__decorate$2([
	    onEvent('click', '.do-close')
	], BaseDialog.prototype, "doClose", null);
	function render$1() {
	    return `<div class="dialog">
		<header><span class="title"></span><c-ico class="action do-close">close</c-ico></header>
		<section class="dialog-content"></section>
		<div class="msg hide"></div>
		<footer class="hide"></footer>		
	</div>`;
	}

	let AddProjectDialog = class AddProjectDialog extends BaseDialog {
	    onOK() {
	        const data = pull(this.contentEl);
	        console.log('->>> ', data);
	        trigger(this, 'ADD_PROJECT', { detail: data });
	    }
	    init() {
	        super.init();
	        this.title = 'Add Project';
	        this.content = frag('<d-input name="name" label="Project Name"></d-input>');
	        this.footer = { ok: 'Add Project', cancel: true };
	    }
	};
	__decorate$2([
	    onEvent('OK')
	], AddProjectDialog.prototype, "onOK", null);
	AddProjectDialog = __decorate$2([
	    customElement('d-add-project')
	], AddProjectDialog);

	async function wait(ms) {
	    return new Promise(function (resolve) {
	        setTimeout(() => { resolve(); }, ms);
	    });
	}

	class BaseSpecView extends BaseHTMLElement {
	    init() {
	        super.init();
	        this.innerHTML = '';
	        this.appendChild(render(this.tagName.toLowerCase()));
	    }
	}
	let SpecTypoView = class SpecTypoView extends BaseSpecView {
	};
	SpecTypoView = __decorate$2([
	    customElement('spec-typo')
	], SpecTypoView);
	let DialogTwo = class DialogTwo extends BaseDialog {
	    init() {
	        super.init();
	        this.title = 'Dialog 2';
	        this.content = frag('<div>Dialog 2 Content</div>');
	        this.footer = true;
	    }
	};
	DialogTwo = __decorate$2([
	    customElement('dialog-two')
	], DialogTwo);
	let SpecDialogsView = class SpecDialogsView extends BaseSpecView {
	    showDialog() {
	        document.body.appendChild(elem('dialog-two'));
	    }
	};
	__decorate$2([
	    onEvent('click', '.show-dialog2')
	], SpecDialogsView.prototype, "showDialog", null);
	SpecDialogsView = __decorate$2([
	    customElement('spec-dialogs')
	], SpecDialogsView);
	let SpecCardsView = class SpecCardsView extends BaseSpecView {
	};
	SpecCardsView = __decorate$2([
	    customElement('spec-cards')
	], SpecCardsView);
	let SpecButtonsView = class SpecButtonsView extends BaseSpecView {
	};
	SpecButtonsView = __decorate$2([
	    customElement('spec-buttons')
	], SpecButtonsView);

	let SpecControlsView = class SpecControlsView extends BaseSpecView {
	    constructor() {
	        super(...arguments);
	        this.events = addOnEvents(this.events, {
	            'CHANGE; .c-field': async (evt) => {
	                console.log('.c-field CHANGE evt.detail', evt.detail);
	            },
	            'DATA; c-select[name="fieldK"]': async (evt) => {
	                await wait(1000);
	                const data = [
	                    { value: '0', content: 'value 0' },
	                    { value: 'K', content: 'value K' },
	                    { value: '1', content: 'value 1' }
	                ];
	                for (let i = 2; i < 30; i++) {
	                    data.push({ value: `${i}`, content: `value ${i}` });
	                }
	                evt.detail.sendData(data);
	            },
	            'click; .spec-inputs .do-push': async (evt) => {
	                const container = evt.selectTarget.closest('.card');
	                const beforeData = pull(container);
	                console.log('Before Push Data:', beforeData);
	                const data = {
	                    fieldA: null,
	                    fieldB: 123,
	                    fieldC: true,
	                    fieldD: false
	                };
	                push(container, data);
	                const afterData = pull(container);
	                console.log('After Push Data:', afterData);
	            },
	            'click; .spec-checks .do-push': async (evt) => {
	                const container = evt.selectTarget.closest('.card');
	                const beforeData = pull(container);
	                console.log('Before Push Data:', beforeData);
	                const data = {
	                    fieldD: false,
	                    fieldE: true,
	                    fieldF: 'value F'
	                };
	                push(container, data);
	                const afterData = pull(container);
	                console.log('After Push Data:', afterData);
	            },
	            'click; .spec-options .do-push': async (evt) => {
	                const container = evt.selectTarget.closest('.card');
	                const beforeData = pull(container);
	                console.log('Before Push Data:', beforeData);
	                const data = {
	                    state: '1'
	                };
	                push(container, data);
	                const afterData = pull(container);
	                console.log('After Push Data:', afterData);
	            }
	        });
	    }
	};
	SpecControlsView = __decorate$2([
	    customElement('spec-controls')
	], SpecControlsView);

	const tagNameByName = {
	    'typo': 'spec-typo',
	    'controls': 'spec-controls',
	    'cards': 'spec-cards',
	    'buttons': 'spec-buttons',
	    'dialogs': 'spec-dialogs',
	};

	const defaultPath$2 = 'typo';
	exports.SpecMainView = class SpecMainView extends BaseViewElement {
	    get contentEl() { return first(this, 'section.content'); }
	    routChange() {
	        this.refresh();
	    }
	    init() {
	        super.init();
	        this.innerHTML = _render$4();
	        this.refresh();
	    }
	    refresh() {
	        const newPath = this.hasNewPathAt(1, defaultPath$2);
	        if (newPath != null) {
	            const tagName = tagNameByName[newPath];
	            this.contentEl.innerHTML = `<${tagName}></${tagName}>`;
	            const href = `/_spec/${newPath}`;
	            for (const tab of all(this, '.tab-bar a')) {
	                const tabHref = tab.getAttribute('href');
	                if (tab.classList.contains('sel') && tabHref !== href) {
	                    tab.classList.remove('sel');
	                }
	                else if (tabHref === href) {
	                    tab.classList.add('sel');
	                }
	            }
	        }
	    }
	};
	__decorate$2([
	    onHub('routeHub', 'CHANGE')
	], exports.SpecMainView.prototype, "routChange", null);
	exports.SpecMainView = __decorate$2([
	    customElement('v-spec-main')
	], exports.SpecMainView);
	function _render$4() {
	    let html = '<div class="tab-bar">';
	    for (const name of Object.keys(tagNameByName)) {
	        html += `<a href="/_spec/${name}">${name}</a>`;
	    }
	    html += `</div>
	<section class="content">
	</section>`;
	    return html;
	}

	function htmlSvgSymbol$1(name) {
	    var html = ['<svg class="symbol ' + name + '">'];
	    html.push('<use xlink:href="#' + name + '"></use>');
	    html.push('</svg>');
	    return html.join('\n');
	}
	class IcoElement$1 extends BaseHTMLElement {
	    init() {
	        const tc = this.textContent;
	        let name = (tc) ? tc.trim() : null;
	        if (name) {
	            name = 'ico-' + name;
	            this.classList.add(name);
	            this.innerHTML = htmlSvgSymbol$1(name);
	        }
	    }
	}
	customElements.define("c-ico", IcoElement$1);
	class SymbolElement$1 extends BaseHTMLElement {
	    init() {
	        let tc = this.textContent;
	        let name = (tc) ? tc.trim() : null;
	        if (name) {
	            this.classList.add(name);
	            this.innerHTML = htmlSvgSymbol$1(name);
	        }
	    }
	}
	customElements.define("c-symbol", SymbolElement$1);

	class CheckElement$1 extends BaseFieldElement {
	    static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['checked']); }
	    get checked() { return this.hasAttribute('checked'); }
	    set checked(v) { attr(this, { checked: v }); }
	    get value() {
	        const attrValue = attr(this, 'value');
	        const checked = this.checked;
	        if (attrValue) {
	            return (checked) ? attrValue : false;
	        }
	        else {
	            return checked;
	        }
	    }
	    set value(v) {
	        if (typeof v === 'boolean') {
	            this.checked = v;
	        }
	        else {
	            const attrValue = attr(this, 'value');
	            if (attrValue) {
	                this.checked = (attrValue === v);
	            }
	            else {
	                console.log(`Warning - c-check - Tries to set a non boolean value '${v}' to checkElement.value which do not have a attribute value to match with. Skipping. `);
	            }
	        }
	    }
	    init() {
	        super.init();
	        this.refresh();
	        on(this, 'click', (evt) => {
	            this.checked = !this.checked;
	        });
	    }
	    attributeChangedCallback(name, oldVal, newVal) {
	        super.attributeChangedCallback(name, oldVal, newVal);
	        if (this.initialized) {
	            switch (name) {
	                case 'checked':
	                    if (oldVal !== newVal) {
	                        this.refresh();
	                        this.triggerChange();
	                    }
	                    break;
	            }
	        }
	    }
	    refresh() {
	        if (this.checked) {
	            this.innerHTML = htmlSvgSymbol$1('ico-check-on');
	        }
	        else {
	            this.innerHTML = htmlSvgSymbol$1('ico-check-off');
	        }
	    }
	}
	customElements.define("c-check", CheckElement$1);

	class InputElement$1 extends BaseFieldElement {
	    static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['password']); }
	    get focused() { return this.classList.contains('focused'); }
	    ;
	    set focused(b) { className(this, { focused: b }); }
	    ;
	    get value() { return this.inputEl.value; }
	    ;
	    set value(val) {
	        const inputEl = this.inputEl;
	        const old = inputEl.value;
	        if (val !== old) {
	            inputEl.value = val;
	        }
	        const newVal = this.value;
	        this.noValue = (!(newVal && newVal.length > 0));
	        this.triggerChange();
	    }
	    ;
	    init() {
	        super.init();
	        let [label, value] = attr(this, ['label', 'value']);
	        const type = this.hasAttribute('password') ? 'password' : 'text';
	        const tmp = frag('<label></label><input>');
	        [this.labelEl, this.inputEl] = [...tmp.children];
	        this.labelEl.textContent = label;
	        const [readonly, disabled, placeholder] = attr(this, ['readonly', 'disabled', 'placeholder']);
	        attr(this.inputEl, { type, value, readonly, disabled, placeholder });
	        this.appendChild(tmp);
	        this.noValue = (!value);
	        on(this, 'focusin, focusout, change', 'c-input > input', (evt) => {
	            const c_input = this;
	            switch (evt.type) {
	                case 'focusin':
	                    c_input.focused = true;
	                    break;
	                case 'focusout':
	                    c_input.focused = false;
	                    break;
	                case 'change':
	                    this.value = this.inputEl.value;
	                    break;
	            }
	        });
	        on(this, 'click', 'label', (evt) => {
	            this.inputEl.focus();
	        });
	    }
	    attributeChangedCallback(name, oldVal, newVal) {
	        super.attributeChangedCallback(name, oldVal, newVal);
	        if (this.initialized) {
	            switch (name) {
	                case 'readonly':
	                    attr(this.inputEl, { readonly: newVal });
	                    break;
	                case 'disabled':
	                    attr(this.inputEl, { disabled: newVal });
	                    break;
	                case 'placeholder':
	                    attr(this.inputEl, { placeholder: newVal });
	                    break;
	            }
	        }
	    }
	}
	customElements.define("c-input", InputElement$1);

	class MenuElement extends BaseHTMLElement {
	}
	customElements.define("c-menu", MenuElement);

	class OptionsElement$1 extends BaseFieldElement {
	    get value() {
	        const selEl = first('c-options > div.sel');
	        return (selEl) ? selEl.getAttribute('data-val') : null;
	    }
	    set value(val) {
	        val = (typeof val !== 'string' && val != null) ? '' + val : val;
	        const old = this.value;
	        const items = all(this, 'c-options > div');
	        for (const item of items) {
	            if (item.getAttribute('data-val') === val) {
	                item.classList.add('sel');
	            }
	            else {
	                item.classList.remove('sel');
	            }
	        }
	        if (val !== old) {
	            this.triggerChange();
	        }
	    }
	    init() {
	        super.init();
	        const [options, value] = attr(this, ['options', 'value']);
	        let html = '';
	        if (options) {
	            for (const line of options.split(',')) {
	                let [val, label] = line.split(':');
	                val = val.trim();
	                label = label.trim();
	                const sel = (value == val) ? 'sel' : '';
	                html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
	            }
	            this.innerHTML = html;
	        }
	        on(this, 'click', 'c-options > div', (evt) => {
	            const clickedItem = evt.selectTarget;
	            const val = clickedItem.getAttribute('data-val');
	            this.value = val;
	            this.triggerChange();
	        });
	    }
	}
	customElements.define("c-options", OptionsElement$1);

	class SelectElement$1 extends BaseFieldElement {
	    constructor() {
	        super(...arguments);
	        this.options = [];
	    }
	    static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(); }
	    get value() {
	        return this.getAttribute('value');
	    }
	    set value(v) {
	        attr(this, 'value', v);
	        this.refresh();
	    }
	    triggerData(sendData) {
	        trigger(this, 'DATA', { detail: { sendData } });
	    }
	    init() {
	        super.init();
	        const [label, value] = attr(this, ['label', 'value']);
	        const firstElement = this.firstElementChild;
	        let content = null;
	        if (firstElement && firstElement.tagName === "OPTION") {
	            this.options = all(this, 'option').map(option => { return { content: option.innerHTML, value: option.getAttribute('value') }; });
	        }
	        else {
	            content = (firstElement) ? firstElement.textContent : (this.firstChild) ? this.firstChild.textContent : null;
	            if (content) {
	                if (value != null) {
	                    this.options.push({ value, content });
	                }
	                else {
	                    this.placeholder = content;
	                }
	            }
	        }
	        let tmp = frag(`<label></label><div></div><c-ico>chevron-down</c-ico>`);
	        [this.labelEl, this.contentEl] = [...tmp.children];
	        this.labelEl.textContent = label;
	        this.innerHTML = '';
	        this.appendChild(tmp);
	        this.refresh();
	        on(this, 'click', (evt) => {
	            if (!this.disabled && !this.readonly) {
	                let popupFrag = frag('<c-select-popup></c-select-popup>').firstElementChild;
	                popupFrag._options = this.options;
	                popupFrag._select = this;
	                const popup = first('body').appendChild(popupFrag);
	                on(popup, 'SELECT', (evt) => {
	                    this.value = evt.detail.value;
	                    this.triggerChange();
	                    this.refresh();
	                });
	                this.triggerData((options) => {
	                    this.options = options;
	                    popup.options = options;
	                });
	            }
	        });
	    }
	    refresh() {
	        const val = this.value;
	        const placeholder = this.placeholder;
	        const option = this.options.find(o => (o.value === val));
	        if ((option == null || option.value == null) && placeholder != null) {
	            this.contentEl.textContent = placeholder;
	        }
	        else if (option) {
	            this.contentEl.innerHTML = option.content;
	        }
	        this.noValue = (val == null);
	    }
	}
	customElements.define("c-select", SelectElement$1);
	class SelectPopupElement$1 extends BaseFieldElement {
	    get value() {
	        throw new Error('Method not implemented.');
	    }
	    set value(val) {
	        throw new Error('Method not implemented.');
	    }
	    get options() { return this._options; }
	    ;
	    set options(val) {
	        this._options = val;
	        if (this.initialized) {
	            this.render();
	        }
	    }
	    init() {
	        super.init();
	        this.render();
	        const emRect = this._select.getBoundingClientRect();
	        style(this, {
	            top: emRect.top + emRect.height + 4 + 'px',
	            left: emRect.left + 'px',
	            width: emRect.width + 'px'
	        });
	        on(this, 'click', 'li', (evt) => {
	            const li = evt.selectTarget;
	            const value = attr(li, 'data-val');
	            trigger(this, 'SELECT', { detail: { value } });
	            this.remove();
	        });
	        setTimeout(() => {
	            on(document, 'click', (evt) => {
	                const target = evt.target;
	                if (target.closest('c-select-popup') !== this) {
	                    this.remove();
	                }
	            }, { ns: this.uid });
	        }, 10);
	    }
	    disconnectedCallback() {
	        super.disconnectedCallback();
	        off(document, { ns: this.uid });
	    }
	    render() {
	        const selectVal = this._select.value;
	        let html = `\n<ul>`;
	        for (const item of this._options) {
	            const attrCss = (item.value === selectVal) ? 'class="sel"' : '';
	            const attrVal = (item.value) ? `data-val="${item.value}"` : '';
	            html += `\n  <li ${attrVal} ${attrCss}>${item.content}</li>`;
	        }
	        html += `\n</ul>`;
	        this.innerHTML = html;
	    }
	}
	customElements.define("c-select-popup", SelectPopupElement$1);

	exports.BaseDco = BaseDco;
	exports.BaseDialog = BaseDialog;
	exports.BaseSpecView = BaseSpecView;
	exports.BaseViewElement = BaseViewElement;
	exports.InputElement = InputElement$1;
	exports.RouteInfo = RouteInfo;
	exports.ajaxDelete = ajaxDelete;
	exports.ajaxGet = ajaxGet;
	exports.ajaxPatch = ajaxPatch;
	exports.ajaxPost = ajaxPost;
	exports.ajaxPut = ajaxPut;
	exports.buildTimeVal = buildTimeVal;
	exports.dcoHub = dcoHub;
	exports.dic = dic;
	exports.ensureArray = ensureArray$1;
	exports.entityRef = entityRef;
	exports.getData = getData;
	exports.getGoogleOAuthUrl = getGoogleOAuthUrl;
	exports.getLuma = getLuma;
	exports.getUserContext = getUserContext;
	exports.guard = guard;
	exports.htmlSvgSymbol = htmlSvgSymbol$1;
	exports.initRoute = initRoute;
	exports.isNum = isNum;
	exports.login = login;
	exports.logoff = logoff;
	exports.param = param$1;
	exports.pathAsNum = pathAsNum;
	exports.pathAt = pathAt;
	exports.paths = paths;
	exports.projectDco = projectDco;
	exports.pushPath = pushPath;
	exports.randomString = randomString;
	exports.render = render;
	exports.renderAsString = renderAsString;
	exports.tagNameByName = tagNameByName;

	return exports;

}({}, window.Handlebars));
//# sourceMappingURL=app-bundle.js.map

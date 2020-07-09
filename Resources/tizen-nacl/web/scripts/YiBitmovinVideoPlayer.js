/**
 * @file YiBitmovinVideoPlayer.js
 * @brief JavaScript class for wrapping the Bitmovin MSE/EME video player.
 */

"use strict";

class CYIBitmovinVideoPlayerVersion {
    constructor(version) {
        const self = this;

        const _properties = { };

        Object.defineProperty(self, "major", {
            enumerable: true,
            get() {
                return _properties.major;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(isNaN(newValue) || newValue < 0) {
                    throw CYIUtilities.createError("Invalid major version value: \"" + CYIUtilities.toString(value) + "\".");
                }

                _properties.major = newValue;
            }
        });

        Object.defineProperty(self, "minor", {
            enumerable: true,
            get() {
                return _properties.minor;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(isNaN(newValue) || newValue < 0) {
                    throw CYIUtilities.createError("Invalid minor version value: \"" + CYIUtilities.toString(value) + "\".");
                }

                _properties.minor = newValue;
            }
        });

        Object.defineProperty(self, "patch", {
            enumerable: true,
            get() {
                return _properties.patch;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(isNaN(newValue) || newValue < 0) {
                    throw CYIUtilities.createError("Invalid patch version value: \"" + CYIUtilities.toString(value) + "\".");
                }

                _properties.patch = newValue;
            }
        });

        Object.defineProperty(self, "version", {
            enumerable: true,
            configurable: true,
            get() {
                return _properties.major + "." + _properties.minor + "." + _properties.patch;
            },
            set(value) {
                const newValue = CYIUtilities.trimString(value);

                if(CYIUtilities.isEmptyString(newValue)) {
                    throw CYIUtilities.createError("Invalid version value: \"" + CYIUtilities.toString(value) + "\".");
                }

                const rawVersionData = newValue.match(CYIBitmovinVideoPlayerVersion.PlayerVersionRegex);

                if(CYIUtilities.isInvalid(rawVersionData)) {
                    throw CYIUtilities.createError("Invalid version: \"" + newValue + "\".");
                }

                _properties.major = rawVersionData[2];
                _properties.minor = rawVersionData[3];
                _properties.patch = rawVersionData[4];
            }
        });

        Object.defineProperty(self, "full", {
            enumerable: true,
            configurable: true,
            get() {
                return self.version;
            }
        });

        self.version = version;
    }

    static isExtendedBy(playerClass) {
        if(!(playerClass instanceof Object)) {
            return false;
        }

        let playerClassPrototype = null;

        if(playerClass instanceof Function) {
            playerClassPrototype = playerClass.prototype;
        }
        else {
            playerClassPrototype = playerClass.constructor.prototype;
        }

        return playerClassPrototype instanceof CYIBitmovinVideoPlayer;
    }

    static isVideoPlayerVersion(value) {
        return value instanceof CYIBitmovinVideoPlayerVersion;
    }
}

class CYIBitmovinVideoPlayerState {
    constructor(id, attributeName, displayName) {
        const self = this;

        if(CYIUtilities.isObject(id)) {
            const data = id;
            id = data.id;
            attributeName = data.attributeName;
            displayName = data.displayName;
        }

        const _properties = {
            transitionStates: []
        };

        Object.defineProperty(self, "id", {
            enumerable: true,
            get() {
                return _properties.id;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(isNaN(newValue)) {
                    throw CYIUtilities.createError("Invalid id value, expected integer.");
                }

                _properties.id = newValue;
            }
        });

        Object.defineProperty(self, "attributeName", {
            enumerable: true,
            get() {
                return _properties.attributeName;
            },
            set(value) {
                const newValue = CYIUtilities.trimString(value);

                if(CYIUtilities.isEmptyString(newValue)) {
                    throw CYIUtilities.createError("Invalid attribute name, expected non-empty string.");
                }

                _properties.attributeName = newValue;
            }
        });

        Object.defineProperty(self, "displayName", {
            enumerable: true,
            get() {
                return _properties.displayName;
            },
            set(value) {
                const newValue = CYIUtilities.trimString(value);

                if(CYIUtilities.isEmptyString(newValue)) {
                    throw CYIUtilities.createError("Invalid display name, expected non-empty string.");
                }

                _properties.displayName = newValue;
            }
        });

        Object.defineProperty(self, "transitionStates", {
            enumerable: true,
            get() {
                return _properties.transitionStates;
            },
            set(value) {
                if(!Array.isArray(value)) {
                    throw CYIUtilities.createError("Invalid transition states collection!");
                }

                for(let i = 0; i < value.length; i++) {
                    const state = value[i];

                    if(!CYIBitmovinVideoPlayerState.isBitmovinVideoPlayerState(state) || state.id < 0) {
                        throw CYIUtilities.createError("Invalid transition state at index " + i + "!");
                    }

                    if(self.id === state.id) {
                        throw CYIUtilities.createError("Transition state at index " + i + " must have a different id from the current state.");
                    }

                    for(let j = i + 1; j < value.length; j++) {
                        if(value[i].id === value[j].id) {
                            throw CYIUtilities.createError("Duplicate transition state with id: " + value[i].id + " found at index " + j + ".");
                        }
                    }
                }

                _properties.transitionStates.length = 0;
                Array.prototype.push.apply(_properties.transitionStates, value);
            }
        });

        self.id = id;
        self.attributeName = attributeName;

        if(CYIUtilities.isEmptyString(displayName)) {
            self.displayName = self.attributeName;
        }
        else {
            self.displayName = displayName;
        }
    }

    static isExtendedBy(videoPlayerStateClass) {
        if(!(videoPlayerStateClass instanceof Object)) {
            return false;
        }

        let videoPlayerStateClassPrototype = null;

        if(videoPlayerStateClass instanceof Function) {
            videoPlayerStateClassPrototype = videoPlayerStateClass.prototype;
        }
        else {
            videoPlayerStateClassPrototype = videoPlayerStateClass.constructor.prototype;
        }

        return videoPlayerStateClassPrototype instanceof CYIBitmovinVideoPlayerState;
    }

    numberOfTransitionStates() {
        const self = this;

        return self.transitionStates.length;
    }

    hasTransitionState(state) {
        const self = this;

        return self.indexOfTransitionState(state) !== -1;
    }

    indexOfTransitionState(state) {
        const self = this;

        if(!CYIBitmovinVideoPlayerState.isBitmovinVideoPlayerState(state)) {
            return -1;
        }

        for(let i = 0; i < self.transitionStates.length; i++) {
            if(self.transitionStates[i].id === state.id) {
                return i;
            }
        }

        return -1;
    }

    indexOfTransitionStateWithId(id) {
        const self = this;

        id = CYIUtilities.parseInteger(id);

        if(isNaN(id)) {
            return -1;
        }

        for(let i = 0; i < self.transitionStates.length; i++) {
            if(self.transitionStates[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    canTransitionTo(state) {
        const self = this;

        if(!CYIBitmovinVideoPlayerState.isBitmovinVideoPlayerState(state) || !state.isValid() || self.id === state.id) {
            return false;
        }

        return self.hasTransitionState(state);
    }

    getTransitionStateWithId(id) {
        const self = this;

        const transitionStateIndex = self.indexOfTransitionStateWithId(id);

        if(transitionStateIndex === -1) {
            return null;
        }

        return self.transitionStates[transitionStateIndex];
    }

    getTransitionStateAtIndex(index) {
        const self = this;

        index = CYIUtilities.parseInteger(index);

        if(isNaN(index) || index < 0 || index >= self.transitionStates.length) {
            return null;
        }

        return self.transitionStates[index];
    }

    addTransitionState(state) {
        const self = this;

        if(!CYIBitmovinVideoPlayerState.isValid(state) || self.id === state.id || self.hasTransitionState(state)) {
            return false;
        }

        self.transitionStates.push(state);

        return true;
    }

    removeTransitionState(state) {
        const self = this;

        const transitionStateIndex = self.indexOfTransitionState(state);

        if(transitionStateIndex === -1) {
            return false;
        }

        self.transitionStates.splice(transitionStateIndex, 1);

        return true;
    }

    removeTransitionStateWithId(id) {
        const self = this;

        const transitionStateIndex = self.indexOfTransitionStateWithId(id);

        if(transitionStateIndex === -1) {
            return false;
        }

        self.transitionStates.splice(transitionStateIndex, 1);

        return true;
    }

    removeTransitionStateAtIndex(index) {
        const self = this;

        index = CYIUtilities.parseInteger(index);

        if(isNaN(index) || index < 0 || index >= self.transitionStates.length) {
            return false;
        }

        self.transitionStates.splice(index, 1);

        return true
    }

    clearTransitionStates() {
        const self = this;

        self.transitionStates.length = 0;
    }

    equals(value) {
        const self = this;

        if(!CYIBitmovinVideoPlayerState.isBitmovinVideoPlayerState(value)) {
            return false;
        }

        return self.id === value.id;
    }

    toString() {
        const self = this;

        return self.displayName + " Video Player State";
    }

    static isBitmovinVideoPlayerState(value) {
        return value instanceof CYIBitmovinVideoPlayerState;
    }

    isValid() {
        const self = this;

        return self.id >= 0;
    }

    static isValid(value) {
        return (CYIBitmovinVideoPlayerState.isBitmovinVideoPlayerState(value) || CYIBitmovinVideoPlayerState.isExtendedBy(value)) &&
               value.isValid();
    }
}

class CYIBitmovinVideoPlayerStreamFormat {
    constructor(streamFormat, drmTypes) {
        const self = this;

        const _properties = {
            format: null,
            drmTypes: []
        }

        Object.defineProperty(self, "format", {
            enumerable: true,
            get() {
                return _properties.format;
            },
            set(value) {
                _properties.format = CYIUtilities.trimString(value);
            }
        });

        Object.defineProperty(self, "drmTypes", {
            enumerable: true,
            get() {
                return _properties.drmTypes;
            },
            set(value) {
                _properties.drmTypes.length = 0;

                if(CYIUtilities.isNonEmptyArray(value)) {
                    for(let i = 0; i < value.length; i++) {
                        const formattedDRMType = CYIUtilities.trimString(value[i]);

                        if(CYIUtilities.isEmptyString(formattedDRMType)) {
                            continue;
                        }

                        for(let i = 0; i < _properties.drmTypes.length; i++) {
                            if(CYIUtilities.equalsIgnoreCase(_properties.drmTypes[i], formattedDRMType)) {
                                continue;
                            }
                        }

                        if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
                            continue;
                        }

                        _properties.drmTypes.push(formattedDRMType);
                    }
                }
            }
        });

        self.format = streamFormat;
        self.drmTypes = drmTypes;
    }

    numberOfDRMTypes() {
        const self = this;

        return self.drmTypes.length;
    }

    hasDRMType(drmType) {
        const self = this;

        return self.indexOfDRMType(drmType) !== -1;
    }

    indexOfDRMType(drmType) {
        const self = this;

        const formattedDRMType = CYIUtilities.trimString(drmType);

        if(CYIUtilities.isEmptyString(formattedDRMType)) {
            return -1;
        }

        for(let i = 0; i < self.drmTypes.length; i++) {
            if(CYIUtilities.equalsIgnoreCase(self.drmTypes[i], formattedDRMType)) {
                return i;
            }
        }

        return -1;
    }

    addDRMType(drmType) {
        const self = this;

        if(self.hasDRMType(drmType)) {
            return false;
        }

        const formattedDRMType = CYIUtilities.trimString(drmType);

        if(CYIUtilities.isEmptyString(formattedDRMType)) {
            return false;
        }

        if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
            return false;
        }

        self.drmTypes.push(formattedDRMType);

        return true;
    }

    addDRMTypes(drmTypes) {
        const self = this;

        if(CYIUtilities.isNonEmptyArray(drmTypes)) {
            for(let i = 0; i < drmTypes.length; i++) {
                self.addDRMType(drmTypes[i]);
            }
        }
    }

    removeDRMType(drmType) {
        const self = this;

        const drmTypeIndex = self.indexOfDRMType(drmType);

        if(drmTypeIndex === -1) {
            return false;
        }

        self.drmTypes.splice(drmTypeIndex, 1);

        return true;
    }

    clearDRMTypes() {
        const self = this;

        self.drmTypes.length = 0;
    }

    equals(value) {
        const self = this;

        if(!self.isValid() || !CYIBitmovinVideoPlayerStreamFormat.isValid(value)) {
            return false;
        }

        return CYIUtilities.equalsIgnoreCase(self.format, value.format);
    }

    toString() {
        const self = this;

        return (CYIUtilities.isNonEmptyString(self.format) ? self.format : "Invalid") + (CYIUtilities.isNonEmptyArray(self.drmTypes) ? " (" + self.drmTypes.join(", ") + ")" : "");
    }

    static isStreamFormat(value) {
        return value instanceof CYIBitmovinVideoPlayerStreamFormat;
    }

    isValid() {
        const self = this;

        return Array.isArray(self.drmTypes);
    }

    static isValid(value) {
        return CYIBitmovinVideoPlayerStreamFormat.isStreamFormat(value) &&
               value.isValid();
    }
}

class CYIRectangle {
    constructor(x, y, width, height) {
        const self = this;

        const _properties = { };

        if(CYIUtilities.isObject(x)) {
            const data = x;
            x = data.x;
            y = data.y;
            width = data.width;
            height = data.height;
        }

        Object.defineProperty(self, "x", {
            enumerable: true,
            get() {
                return _properties.x;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!Number.isInteger(newValue)) {
                    throw CYIUtilities.createError("Invalid rectangle x value: " + CYIUtilities.toString(value));
                }

                _properties.x = newValue;
            }
        });

        Object.defineProperty(self, "y", {
            enumerable: true,
            get() {
                return _properties.y;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!Number.isInteger(newValue)) {
                    throw CYIUtilities.createError("Invalid rectangle y value: " + CYIUtilities.toString(value));
                }

                _properties.y = newValue;
            }
        });

        Object.defineProperty(self, "width", {
            enumerable: true,
            get() {
                return _properties.width;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!Number.isInteger(newValue) || newValue < 0) {
                    throw CYIUtilities.createError("Invalid rectangle width: " + CYIUtilities.toString(value));
                }

                _properties.width = newValue;
            }
        });

        Object.defineProperty(self, "height", {
            enumerable: true,
            get() {
                return _properties.height;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!Number.isInteger(newValue) || newValue < 0) {
                    throw CYIUtilities.createError("Invalid rectangle height: " + CYIUtilities.toString(value));
                }

                _properties.height = newValue;
            }
        });

        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
    }

    toArray() {
        const self = this;

        return [self.x, self.y, self.width, self.height];
    }

    equals(value) {
        const self = this;

        if(!CYIRectangle.isRectangle(value)) {
            return false;
        }

        return self.x === value.x &&
               self.y === value.y &&
               self.width === value.width &&
               self.height === value.height;
    }

    toString() {
        const self = this;

        return "X: " + self.x + " Y: " + self.y + " W: " + self.width + " H: " + self.height;
    }

    static isRectangle(value) {
        return value instanceof CYIRectangle;
    }
}

class CYIBitmovinVideoPlayerProperties {
    constructor() {
        const self = this;

        const _properties = {
            script: null,
            playerVersion: null,
            hidingUITimeoutMs: 250,
            stallThresholdSeconds: 1,
            stallSkipAheadTimeMs: 100,
            defaultStallDetectorIntervalMilliseconds: 250
        };

        Object.defineProperty(self, "script", {
            enumerable: true,
            get() {
                return _properties.script;
            },
            set(value) {
                if(!(value instanceof HTMLScriptElement)) {
                    throw CYIUtilities.createError("Invalid HTML script element!");
                }

                _properties.script = value;
            }
        });

        Object.defineProperty(self, "playerVersion", {
            enumerable: true,
            get() {
                return _properties.playerVersion;
            },
            set(value) {
                if(typeof value === "string") {
                    _properties.playerVersion = new CYIBitmovinVideoPlayerVersion(value);
                }
                else if(CYIBitmovinVideoPlayerVersion.isBitmovinVideoPlayerVersion(value)) {
                    _properties.playerVersion = value;
                }
                else {
                    throw CYIUtilities.createError("Invalid player version data!");
                }
            }
        });

        Object.defineProperty(self, "hidingUITimeoutMs", {
            enumerable: true,
            get() {
                return _properties.hidingUITimeoutMs;
            },
            set(value) {
                const formattedValue = CYIUtilities.parseInteger(value);

                if(isNaN(formattedValue) || formattedValue <= 0) {
                    return;
                }

                _properties.hidingUITimeoutMs = formattedValue;
            }
        });

        Object.defineProperty(self, "stallThresholdSeconds", {
            enumerable: true,
            get() {
                return _properties.stallThresholdSeconds;
            },
            set(value) {
                const formattedValue = CYIUtilities.parseFloatingPointNumber(value);

                if(isNaN(formattedValue) || formattedValue <= 0) {
                    return;
                }

                _properties.stallThresholdSeconds = formattedValue;
            }
        });

        Object.defineProperty(self, "stallSkipAheadTimeMs", {
            enumerable: true,
            get() {
                return _properties.stallSkipAheadTimeMs;
            },
            set(value) {
                const formattedValue = CYIUtilities.parseInteger(value);

                if(isNaN(formattedValue) || formattedValue <= 0) {
                    return;
                }

                _properties.stallSkipAheadTimeMs = formattedValue;
            }
        });

        Object.defineProperty(self, "defaultStallDetectorIntervalMilliseconds", {
            enumerable: true,
            get() {
                return _properties.defaultStallDetectorIntervalMilliseconds;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!isNaN(newValue) && newValue >= 1) {
                    _properties.defaultStallDetectorIntervalMilliseconds = newValue;
                }
            }
        });
    }
}

class CYIBitmovinVideoPlayer {
    constructor(configuration) {
        const self = this;

        if(!CYIUtilities.isObject(configuration)) {
            throw CYIUtilities.createError("Missing or invalid " + CYIBitmovinVideoPlayer.getType() + " player configuration!");
        }

        // store private player properties internally and only expose them through getters and setters
        const _properties = {
            streamFormats: [],
            externalTextTrackQueue: [],
            externalTextTrackIdCounter: 1
        };

        const bitmovinPlayerVersion = CYIBitmovinVideoPlayer.getVersionData();

        if(CYIUtilities.isInvalid(bitmovinPlayerVersion)) {
            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.getType() + " player failed to determine player version!");
        }

        _properties.legacyAPI = CYIUtilities.compareVersions(bitmovinPlayerVersion.version, "8.0.0") < 0;

        Object.defineProperty(self, "state", {
            enumerable: true,
            get() {
                return _properties.state;
            },
            set(value) {
                if(!CYIBitmovinVideoPlayerState.isValid(value)) {
                    throw CYIUtilities.createError("Invalid video player state!");
                }

                _properties.state = value;
            }
        });

        // create getters and setters for all player instance properties
        Object.defineProperty(self, "streamFormats", {
            enumerable: true,
            get() {
                return _properties.streamFormats;
            }
        });

        Object.defineProperty(self, "initialized", {
            enumerable: true,
            get() {
                return _properties.initialized;
            },
            set(value) {
                _properties.initialized = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "loaded", {
            enumerable: true,
            get() {
                return _properties.loaded;
            },
            set(value) {
                _properties.loaded = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "nickname", {
            enumerable: true,
            get() {
                return _properties.nickname;
            },
            set(value) {
                _properties.nickname = CYIUtilities.trimString(value);
            }
        });

        Object.defineProperty(self, "container", {
            enumerable: true,
            get() {
                return _properties.container;
            },
            set(value) {
                if(value instanceof HTMLElement) {
                    _properties.container = value;
                }
                else {
                    _properties.container = null;
                }
            }
        });

        Object.defineProperty(self, "video", {
            enumerable: true,
            get() {
                return _properties.video;
            },
            set(value) {
                if(value instanceof HTMLVideoElement) {
                    _properties.video = value;

                    if(CYIUtilities.isValid(_properties.requestedVideoRectangle)) {
                        self.setVideoRectangle(_properties.requestedVideoRectangle);
                    }
                }
                else {
                    _properties.video = null;
                }
            }
        });

        Object.defineProperty(self, "verbose", {
            enumerable: true,
            get() {
                return _properties.verbose;
            },
            set(value) {
                _properties.verbose = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "verboseStateChanges", {
            enumerable: true,
            get() {
                return _properties.verboseStateChanges;
            },
            set(value) {
                _properties.verboseStateChanges = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "streamFormat", {
            enumerable: true,
            get() {
                return _properties.streamFormat;
            },
            set(value) {
                if(CYIUtilities.isInvalid(value)) {
                    _properties.streamFormat = null;
                }
                else {
                    if(!CYIBitmovinVideoPlayerStreamFormat.isValid(value)) {
                        throw CYIUtilities.createError("Invalid stream format: " + JSON.stringify(value));
                    }

                    _properties.streamFormat = value;
                }
            }
        });

        Object.defineProperty(self, "currentDurationSeconds", {
            enumerable: true,
            get() {
                return _properties.currentDurationSeconds;
            },
            set(value) {
                _properties.currentDurationSeconds = CYIUtilities.parseFloatingPointNumber(value, null);
            }
        });

        Object.defineProperty(self, "initialAudioBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.initialAudioBitrateKbps;
            },
            set(value) {
                _properties.initialAudioBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "currentAudioBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.currentAudioBitrateKbps;
            },
            set(value) {
                _properties.currentAudioBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "initialVideoBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.initialVideoBitrateKbps;
            },
            set(value) {
                _properties.initialVideoBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "currentVideoBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.currentVideoBitrateKbps;
            },
            set(value) {
                _properties.currentVideoBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "initialTotalBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.initialTotalBitrateKbps;
            },
            set(value) {
                _properties.initialTotalBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "currentTotalBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.currentTotalBitrateKbps;
            },
            set(value) {
                _properties.currentTotalBitrateKbps = CYIUtilities.parseInteger(value, null);
            }
        });

        Object.defineProperty(self, "requestedVideoRectangle", {
            enumerable: true,
            get() {
                return _properties.requestedVideoRectangle;
            },
            set(value) {
                if(CYIUtilities.isInvalid(value)) {
                    _properties.requestedVideoRectangle = null;
                }
                else {
                    _properties.requestedVideoRectangle = new CYIRectangle(value);
                }
            }
        });

        Object.defineProperty(self, "shouldResumePlayback", {
            enumerable: true,
            get() {
                return _properties.shouldResumePlayback;
            },
            set(value) {
                _properties.shouldResumePlayback = CYIUtilities.parseBoolean(value, null);
            }
        });

        Object.defineProperty(self, "externalTextTrackQueue", {
            enumerable: true,
            get() {
                return _properties.externalTextTrackQueue;
            }
        });

        Object.defineProperty(self, "player", {
            enumerable: true,
            get() {
                return _properties.player;
            },
            set(value) {
                if(CYIUtilities.isObject(value)) {
                    _properties.player = value;
                }
                else {
                    _properties.player = null;
                }
            }
        });

        Object.defineProperty(self, "legacyAPI", {
            enumerable: true,
            get() {
                return _properties.legacyAPI;
            }
        });

        Object.defineProperty(self, "apiKey", {
            enumerable: true,
            get() {
                return _properties.apiKey;
            },
            set(value) {
                _properties.apiKey = CYIUtilities.trimString(value);
            }
        });

        Object.defineProperty(self, "appId", {
            enumerable: true,
            get() {
                return _properties.appId;
            },
            set(value) {
                _properties.appId = CYIUtilities.trimString(value);
            }
        });

        Object.defineProperty(self, "startTimeSeconds", {
            enumerable: true,
            get() {
                return _properties.startTimeSeconds;
            },
            set(value) {
                const newValue = CYIUtilities.parseFloatingPointNumber(value, null);

                if(!isNaN(newValue) && newValue >= 0) {
                    _properties.startTimeSeconds = newValue;
                }
            }
        });

        Object.defineProperty(self, "buffering", {
            enumerable: true,
            get() {
                return _properties.buffering;
            },
            set(value) {
                _properties.buffering = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "hidingUI", {
            enumerable: true,
            get() {
                return _properties.hidingUI;
            },
            set(value) {
                _properties.hidingUI = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "stallDetectorEnabled", {
            enumerable: true,
            get() {
                return _properties.stallDetectorEnabled;
            },
            set(value) {
                _properties.stallDetectorEnabled = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "previousPlaybackTimeSeconds", {
            enumerable: true,
            get() {
                return _properties.previousPlaybackTimeSeconds;
            },
            set(value) {
                const newValue = CYIUtilities.parseFloatingPointNumber(value, null);

                if(newValue === null || newValue >= 0) {
                    _properties.previousPlaybackTimeSeconds = newValue;
                }
            }
        });

        Object.defineProperty(self, "lastUpdateSeconds", {
            enumerable: true,
            get() {
                return _properties.lastUpdateSeconds;
            },
            set(value) {
                const newValue = CYIUtilities.parseFloatingPointNumber(value, null);

                if(newValue === null || newValue >= 0) {
                    _properties.lastUpdateSeconds = newValue;
                }
            }
        });

        Object.defineProperty(self, "wasMakingProgress", {
            enumerable: true,
            get() {
                return _properties.wasMakingProgress;
            },
            set(value) {
                _properties.wasMakingProgress = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "handlingStall", {
            enumerable: true,
            get() {
                return _properties.handlingStall;
            },
            set(value) {
                _properties.handlingStall = CYIUtilities.parseBoolean(value, false);
            }
        });

        Object.defineProperty(self, "stallDetectorId", {
            enumerable: true,
            get() {
                return _properties.stallDetectorId;
            },
            set(value) {
                let newValue = CYIUtilities.parseInteger(value, null);

                if(newValue !== null && newValue < 0) {
                    newValue = null;
                }

                _properties.stallDetectorId = newValue;
            }
        });

        Object.defineProperty(self, "maxBitrateKbps", {
            enumerable: true,
            get() {
                return _properties.maxBitrateKbps;
            },
            set(value) {
                if(value === Infinity) {
                    _properties.maxBitrateKbps = Infinity
                }
                else {
                    const newValue = CYIUtilities.parseInteger(value);

                    if(isNaN(newValue) || (newValue < -1 && newValue !== 0)) {
                        throw CYIUtilities.createError("Invalid maximum bitrate value.");
                    }

                    _properties.maxBitrateKbps = newValue === -1 || newValue === 0 ? Infinity : newValue;
                }
            }
        });

        Object.defineProperty(self, "drmConfiguration", {
            enumerable: true,
            get() {
                return _properties.drmConfiguration;
            },
            set(value) {
                if(CYIUtilities.isObject(value)) {
                    _properties.drmConfiguration = value;
                }
                else {
                    _properties.drmConfiguration = null;
                }
            }
        });

        Object.defineProperty(self, "requestedTextTrackId", {
            enumerable: true,
            get() {
                return _properties.requestedTextTrackId;
            },
            set(value) {
                let newValue = CYIUtilities.trimString(value);

                if(CYIUtilities.isEmptyString(newValue)) {
                    newValue = null;
                }

                _properties.requestedTextTrackId = newValue;
            }
        });

        Object.defineProperty(self, "externalTextTrackIdCounter", {
            enumerable: true,
            get() {
                return _properties.externalTextTrackIdCounter;
            },
            set(value) {
                const newValue = CYIUtilities.parseInteger(value);

                if(!isNaN(newValue) && newValue > _properties.externalTextTrackIdCounter) {
                    _properties.externalTextTrackIdCounter = newValue;
                }
            }
        });

        // assign default values for all player properties
        self.initialized = false;
        self.state = CYIBitmovinVideoPlayer.State.Uninitialized;
        self.loaded = false;
        self.nickname = null;
        self.container = null;
        self.video = null;
        self.verbose = CYIUtilities.isObjectStrict(configuration) ? CYIUtilities.parseBoolean(configuration.verbose, false) : false;
        self.verboseStateChanges = false;
        self.streamFormat = null;
        self.currentDurationSeconds = null;
        self.initialAudioBitrateKbps = null;
        self.currentAudioBitrateKbps = null;
        self.initialVideoBitrateKbps = null;
        self.currentVideoBitrateKbps = null;
        self.initialTotalBitrateKbps = null;
        self.currentTotalBitrateKbps = null;
        self.shouldResumePlayback = null;
        self.player = null;
        self.apiKey = configuration.apiKey;
        self.appId = configuration.appId;
        self.startTimeSeconds = 0;
        self.buffering = false;
        self.stallDetectorEnabled = false;
        self.previousPlaybackTimeSeconds = 0;
        self.lastUpdateSeconds = 0;
        self.wasMakingProgress = false;
        self.handlingStall = false;
        self.stallDetectorId = null;
        self.requestedTextTrackId = null;

        self.registerStreamFormat("DASH", ["PlayReady", "Widevine"]);
        self.registerStreamFormat("HLS", ["PlayReady", "Widevine"]);
        self.registerStreamFormat("MP4");

        self.resetExternalTextTrackIdCounter = function resetExternalTextTrackIdCounter() {
            _properties.externalTextTrackIdCounter = 1;
        };

        document.addEventListener("visibilitychange", function onVisibilityChangedEvent() {
            if(document.hidden) {
                self.suspend();
            }
            else {
                self.restore();
            }
        });

        window.addEventListener("tizennaclcrash", function(event) {
            self.destroy();
        });

        if(self.verbose) {
            console.log("Created new Bitmovin video player.");
        }
    }

    static createInstance(configuration) {
        if(CYIUtilities.isValid(CYIBitmovinVideoPlayer.instance)) {
            throw CYIUtilities.createError("Cannot create more than one " + CYIBitmovinVideoPlayer.getType() + " video player instance!");
        }

        CYIBitmovinVideoPlayer.instance = new CYIBitmovinVideoPlayer(configuration);
    };

    static getInstance() {
        return CYIBitmovinVideoPlayer.instance;
    }

    static generateAudioTrackTitle(audioTrack, addToTrack) {
        if(!CYIUtilities.isObjectStrict(audioTrack)) {
            return null;
        }

        addToTrack = CYIUtilities.parseBoolean(addToTrack, true);

        let audioTrackTitle = audioTrack.language;

        if(CYIUtilities.isNonEmptyArray(audioTrack.roles)) {
            audioTrackTitle += " " + audioTrack.roles.join(", ");
        }

        if(addToTrack) {
            audioTrack.title = audioTrackTitle;
        }

        return audioTrackTitle;
    }

    static generateTextTrackTitle(textTrack, addToTrack) {
        if(!CYIUtilities.isObjectStrict(textTrack)) {
            return null;
        }

        addToTrack = CYIUtilities.parseBoolean(addToTrack, true);

        let textTrackTitle = textTrack.label;

        if(CYIUtilities.isEmptyString(textTrackTitle)) {
            textTrackTitle = textTrack.language;

            if(addToTrack) {
                textTrack.title = textTrackTitle;
            }
        }

        return textTrackTitle;
    }

    static getType() {
        return "Bitmovin";
    }

    static getVersion() {
        if(typeof bitmovin === "undefined") {
            return "Unknown";
        }

        return CYIUtilities.isValid(bitmovin.player.version) ? bitmovin.player.version : bitmovin.player.Player.version;
    }

    static getVersionData() {
        if(typeof bitmovin === "undefined") {
            return "Unknown";
        }

        if(CYIUtilities.isInvalid(CYIBitmovinVideoPlayer.playerVersion)) {
            CYIBitmovinVideoPlayer.playerVersion = CYIBitmovinVideoPlayer.getVersion();
        }

        return CYIBitmovinVideoPlayer.playerVersion;
    }

    initialize(name) {
        const self = this;

        if(CYIPlatformUtilities.isUWP) {
            throw CYIUtilities.createError("Bitmovin is not currently supported on UWP.");
        }

        if(self.state !== CYIBitmovinVideoPlayer.State.Uninitialized) {
            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.getType() + " player is already initialized!");
        }

        if(CYIUtilities.isValid(name)) {
            self.setNickname(name);
        }

        // note: initialization is handled by prepare instead for Bitmovin 7
        if(self.legacyAPI) {
            throw CYIUtilities.createError("Legacy Bitmovin 7 player API is not supported, please update to Bitmovin 8.");
        }

        if(self.initialized) {
            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.getType() + " player is already initialized!");
        }

        if(typeof bitmovin === "undefined") {
            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.getType() + " player is not loaded yet!");
        }

        if(self.verbose) {
            console.log("Initializing " + CYIBitmovinVideoPlayer.getType() + " player...");
        }

        if(self.player) {
            if(self.verbose) {
                console.log(CYIBitmovinVideoPlayer.getType() + " player already initialized!");
            }

            return false;
        }

        const playerConfiguration = {
            key: self.apiKey,
            ui: CYIPlatformUtilities.isEmbedded ? false : undefined,
            logs: {
                bitmovin: false
            },
            playback: {
                autoplay: false,
                muted: false
            },
            tweaks: { }
        };

        if(self.verbose) {
            playerConfiguration.logs.level = bitmovin.player.LogLevel.DEBUG;
        }

        if(isFinite(self.maxBitrateKbps)) {
            playerConfiguration.adaptation = {
                exclude: true,
                bitrates: {
                    maxSelectableVideoBitrate: self.maxBitrateKbps * CYIBitmovinVideoPlayer.BitrateKbpsScale
                }
            };
        }

        if(CYIUtilities.isNonEmptyString(self.appId)) {
            playerConfiguration.tweaks.file_protocol = true;
            playerConfiguration.tweaks.app_id = self.appId;
        }

        self.container = document.createElement("div");

        if(!CYIPlatformUtilities.isEmbedded) {
            self.container.style.visibility = "hidden";
            self.container.style.zIndex = 50;
        }

        document.body.appendChild(self.container);
        self.video = document.createElement("video");

        try {
            self.player = new bitmovin.player.Player(self.container, playerConfiguration);

            self.hideUI();
        }
        catch(error) {
            self.stop();

            const newError = CYIBitmovinVideoPlayer.formatError(error);
            newError.originalMessage = newError.message;
            newError.message = self.getDisplayName() + " error: " + newError.message + " (" + newError.code + ")";
            throw newError;
        }

        // NOTE: we do not need to create the video element externally and set it as Bitmovin creates one internally,
        // however it does so asynchronously and we need access to it synchronously so by setting our own video element,
        // we are able to bypass this limitation
        self.player.setVideoElement(self.video);

        self.video.addEventListener("waiting", function() {
            if(!self.loaded || self.buffering) {
                return;
            }

            self.buffering = true;

            self.notifyBufferingStateChanged(true);
        });

        self.video.addEventListener("canplay", function() {
            if(!self.loaded || !self.buffering) {
                return;
            }

            self.buffering = false;

            self.notifyBufferingStateChanged(false);
        });

        self.player.on(bitmovin.player.PlayerEvent.Error, function onErrorEvent(event) {
            if(!CYIUtilities.isObject(event)) {
                return;
            }

            self.stop();

            const newError = CYIBitmovinVideoPlayer.formatError(event);
            newError.originalMessage = newError.message;
            newError.message = self.getDisplayName() + " error: " + newError.message + " (" + newError.code + ")";

            return self.sendErrorEvent("playerError", newError);
        });

        self.player.on(bitmovin.player.PlayerEvent.Warning, function onWarningEvent(event) {
            console.warn(self.getDisplayName() + (CYIUtilities.isValid(event.type) ? " " + event.type : "") + " warning: " + event.message + (CYIUtilities.isValid(event.code) ? " (" + event.code + ")" : ""));
        });

        self.player.on(bitmovin.player.PlayerEvent.Ready, function onPlayerReadyEvent(event) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " is ready.");
            }

            // note: duration changed event does not fire when duration is initially set
            self.notifyVideoDurationChanged();

            // note: vod assets emit a ready event once content is pre-buffered
            if(!self.isLive()) {
                self.onContentLoaded();
            }
        });

        self.player.on(bitmovin.player.PlayerEvent.SourceLoaded, function onVideoLoadedEvent(event) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " loaded asset.");
            }

            // note: live assets do not emit a ready event until after playback is started
            if(self.isLive()) {
                self.onContentLoaded();
            }

            if(self.startTimeSeconds > 0) {
                self.seek(self.startTimeSeconds);
            }
        });

        self.player.on(bitmovin.player.PlayerEvent.StallStarted, function onBufferingStartedEvent(event) {
            if(!self.loaded || self.buffering) {
                return;
            }

            self.buffering = true;

            self.notifyBufferingStateChanged(true);
        });

        self.player.on(bitmovin.player.PlayerEvent.StallEnded, function onBufferingEndedEvent(event) {
            if(!self.loaded || !self.buffering) {
                return;
            }

            self.buffering = false;

            self.notifyBufferingStateChanged(false);
        });

        self.player.on(bitmovin.player.PlayerEvent.SubtitleAdded, function onTextTrackAddedEvent(event) {
            self.notifyTextTracksChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.SubtitleRemoved, function onTextTrackRemovedEvent(event) {
            self.notifyTextTracksChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.SubtitleEnabled, function onTextTrackChangedEvent(event) {
            self.notifyTextTrackStatusChanged();
            self.notifyActiveTextTrackChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.SubtitleDisabled, function onTextTrackChangedEvent(event) {
            self.notifyTextTrackStatusChanged();
            self.notifyActiveTextTrackChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.AudioAdded, function onAudioTrackAddedEvent(event) {
            self.notifyAudioTracksChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.AudioRemoved, function onAudioTrackRemovedEvent(event) {
            self.notifyAudioTracksChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.AudioChanged, function onAudioTrackChangedEvent(event) {
            self.notifyActiveAudioTrackChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.Play, function onPlayEvent(event) {
            if(self.state === CYIBitmovinVideoPlayer.State.Playing) {
                return;
            }

            self.updateState(CYIBitmovinVideoPlayer.State.Playing);
        });

        self.player.on(bitmovin.player.PlayerEvent.Paused, function onPauseEvent(event) {
            if(self.state === CYIBitmovinVideoPlayer.State.Paused) {
                return;
            }

            self.updateState(CYIBitmovinVideoPlayer.State.Paused);
        });

        self.player.on(bitmovin.player.PlayerEvent.PlaybackFinished, function onVideoEndedEvent(event) {
            self.updateState(CYIBitmovinVideoPlayer.State.Complete);
        });

        self.player.on(bitmovin.player.PlayerEvent.TimeChanged, function onTimeUpdateEvent(event) {
            if(!self.player) {
                return;
            }

            self.notifyVideoTimeChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.DurationChanged, function onDurationChangedEvent(event) {
            self.notifyVideoDurationChanged();
        });

        self.player.on(bitmovin.player.PlayerEvent.AudioPlaybackQualityChanged, function onAudioPlaybackQualityChanged(event) {
            const audioBitrateKbps = event.targetQuality.bitrate / CYIBitmovinVideoPlayer.BitrateKbpsScale;

            if(!Number.isInteger(self.initialAudioBitrateKbps)) {
                self.initialAudioBitrateKbps = audioBitrateKbps;
            }

            if(CYIUtilities.isValidNumber(self.initialVideoBitrateKbps)) {
                self.initialTotalBitrateKbps = self.initialAudioBitrateKbps + self.initialVideoBitrateKbps;
            }

            if(CYIUtilities.isValidNumber(self.currentVideoBitrateKbps)) {
                self.currentTotalBitrateKbps = audioBitrateKbps + self.currentVideoBitrateKbps;
            }

            if(self.currentAudioBitrateKbps !== audioBitrateKbps) {
                self.currentAudioBitrateKbps = audioBitrateKbps;
                self.notifyBitrateChanged();
            }
        });

        self.player.on(bitmovin.player.PlayerEvent.VideoPlaybackQualityChanged, function onVideoPlaybackQualityChanged(event) {
            const videoBitrateKbps = event.targetQuality.bitrate / CYIBitmovinVideoPlayer.BitrateKbpsScale;

            if(!Number.isInteger(self.initialVideoBitrateKbps)) {
                self.initialVideoBitrateKbps = videoBitrateKbps;
            }

            if(CYIUtilities.isValidNumber(self.initialAudioBitrateKbps)) {
                self.initialTotalBitrateKbps = self.initialAudioBitrateKbps + self.initialVideoBitrateKbps;
            }

            if(CYIUtilities.isValidNumber(self.currentAudioBitrateKbps)) {
                self.currentTotalBitrateKbps = self.currentAudioBitrateKbps + videoBitrateKbps;
            }

            if(self.currentVideoBitrateKbps !== videoBitrateKbps) {
                self.currentVideoBitrateKbps = videoBitrateKbps;
                self.notifyBitrateChanged();
            }
        });

        self.player.on(bitmovin.player.PlayerEvent.Metadata, function onMetadataEvent(event) {
            if(!CYIUtilities.isObject(event.metadata)) {
                return;
            }

            const metadata = {
                timestamp: event.timestamp,
                type: event.metadataType
            };

            if(CYIUtilities.isNonEmptyArray(event.metadata.frames)) {
                metadata.identifier = event.metadata.frames[0].key;
                metadata.value = event.metadata.frames[0].data;
            }
            else if(CYIUtilities.isNonEmptyObject(event.metadata.properties)) {
                metadata.identifier = event.metadata.properties.id;
                metadata.value = event.metadata.properties.messageData;
            }
            else {
                if(self.verbose) {
                    let eventData = null;

                    try {
                        eventData = JSON.stringify(event);
                    }
                    catch(error) { }

                    console.warn(self.getDisplayName() + " encountered an unexpected metadata event format" + (CYIUtilities.isInvalid(eventData) ? "." : ": " + eventData));
                }

                return;
            }

            if(CYIUtilities.isValidNumber(event.start) && CYIUtilities.isValidNumber(event.end)) {
                metadata.durationMs = (event.end - event.start) * 1000;
            }
            else {
                metadata.durationMs = 0;
            }

            self.notifyMetadataAvailable(metadata);
        });

        self.initialized = true;
        self.updateState(CYIBitmovinVideoPlayer.State.Initialized);

        return true;
    }

    onContentLoaded() {
        const self = this;

        self.loaded = true;

        self.enableStallDetector();

        self.notifyLiveStatus();

        self.updateState(CYIBitmovinVideoPlayer.State.Loaded);

        self.processExternalTextTrackQueue();
    }

    hideUI() {
        const self = this;

        if(self.hidingUI || CYIPlatformUtilities.isEmbedded) {
            return;
        }

        self.hidingUI = true;

        const playerContainerObserver = new MutationObserver(function(mutationsList, observer) {
            let childModified = false;

            for(let mutation of mutationsList) {
                if(mutation.type === "childList") {
                    childModified = true;
                    break;
                }
            }

            if(!childModified) {
                return;
            }

            const uiContainerElement = self.container.getElementsByClassName(CYIBitmovinVideoPlayer.UIContainerClassName)[0];

            if(CYIUtilities.isValid(uiContainerElement)) {
                let uiPlayButtonElement = self.container.getElementsByClassName(CYIBitmovinVideoPlayer.UIPlayButtonClassName)[0];

                if(CYIUtilities.isValid(uiPlayButtonElement)) {
                    uiPlayButtonElement.style.display = "none";
                }

                if(CYIUtilities.isValid(uiContainerElement) && uiContainerElement.childNodes.length !== 0) {
                    const uiContainerElementHolder = uiContainerElement.childNodes[0];

                    for(let i = 0; i < uiContainerElementHolder.childNodes.length; i++) {
                        const uiElement = uiContainerElementHolder.childNodes[i];

                        if(!uiElement.classList.contains(CYIBitmovinVideoPlayer.UISubtitleOverlayClassName)) {
                            uiElement.style.display = "none";
                        }
                    }
                }

                playerContainerObserver.disconnect();

                clearTimeout(hideUITimeoutId);

                self.hidingUI = false;

                if(self.verbose) {
                    console.log(self.getDisplayName() + " UI hidden.");
                }
            }
        });

        playerContainerObserver.observe(self.container, {
            attributes: false,
            childList: true,
            subtree: true
        });

        const hideUITimeoutId = setTimeout(function() {
            playerContainerObserver.disconnect();

            self.hidingUI = false;

            console.warn(self.getDisplayName() + " failed to hide Bitmovin UI after " + CYIBitmovinVideoPlayer.hidingUITimeoutMs + "ms! Did you forget to load the UI script?");
        }, CYIBitmovinVideoPlayer.hidingUITimeoutMs);
    }

    checkInitialized() {
        const self = this;

        if(!self.initialized) {
            throw CYIUtilities.createError(self.getDisplayName() + " not initialized!");
        }
    }

    getDisplayName() {
        const self = this;

        return (self.nickname ? self.nickname + " " : "") + CYIBitmovinVideoPlayer.getType() + " player";
    }

    getNickname() {
        const self = this;

        return self.nickname;
    }

    setNickname(nickname) {
        const self = this;

        const formattedName = CYIUtilities.trimString(nickname);

        if(CYIUtilities.isEmptyString(nickname)) {
            self.nickname = null;

            if(self.verbose) {
                console.log("Removing nickname from " + self.getDisplayName() + ".");
            }
        }
        else {
            if(self.verbose) {
                console.log("Changing " + self.getDisplayName() + " nickname to " + formattedName + ".");
            }

            self.nickname = formattedName;
        }
    }

    getPosition() {
        const self = this;

        self.checkInitialized();

        // retrieve the player container / video element absolute position by converting the values from pixel strings to integers
        const position = {
            x: CYIUtilities.parseInteger(self.container.style.left.substring(0, self.container.style.left.length - 2)),
            y: CYIUtilities.parseInteger(self.container.style.top.substring(0, self.container.style.top.length - 2))
        };

        if(!Number.isInteger(position.x) || !Number.isInteger(position.y)) {
            return null;
        }

        return position;
    }

    getSize() {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isInvalid(self.container)) {
            throw CYIUtilities.createError(self.getDisplayName() + " video element is not initialized!");
        }

        // retrieve the player container / video element's width and height by converting the values from pixel strings to integers
        const size = {
            width: CYIUtilities.parseInteger(self.container.style.width.substring(0, self.container.style.width.length - 2)),
            height: CYIUtilities.parseInteger(self.container.style.height.substring(0, self.container.style.height.length - 2))
        };

        if(!Number.isInteger(size.width) || !Number.isInteger(size.height)) {
            return null;
        }

        return size;
    }

    isVerbose() {
        const self = this;

        return self.verbose;
    }

    setVerbose(verbose) {
        const self = this;

        self.verbose = verbose;
    }

    getState() {
        const self = this;

        return self.state;
    }

    updateState(state) {
        const self = this;

        const previousState = self.state;

        if(!CYIBitmovinVideoPlayerState.isValid(state)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to transition to invalid state!");
        }

        if(!self.state.canTransitionTo(state)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to incorrectly transition from " + previousState.displayName + " to " + state.displayName + ".");
        }

        self.state = state;

        self.sendEvent("stateChanged", self.state.id);

        if(self.verbose && self.verboseStateChanges) {
            console.log(self.getDisplayName() + " transitioned from " + previousState.displayName + " to " + state.displayName + ".");
        }
    }

    setVideoRectangle(x, y, width, height) {
        const self = this;

        if(CYIUtilities.isObject(x)) {
            const data = x;
            x = data.x;
            y = data.y;
            width = data.width;
            height = data.height;
        }

        if(CYIUtilities.isInvalid(self.container) || CYIUtilities.isInvalid(self.video)) {
            self.requestedVideoRectangle = new CYIRectangle(x, y, width, height);
            return;
        }

        const formattedXPosition = CYIUtilities.parseInteger(x);
        const formattedYPosition = CYIUtilities.parseInteger(y);
        const formattedWidth = CYIUtilities.parseInteger(width);
        const formattedHeight = CYIUtilities.parseInteger(height);

        if(!Number.isInteger(formattedXPosition)) {
            throw CYIUtilities.createError(self.getDisplayName() + " received an invalid x position for the video rectangle: " + x);
        }

        if(!Number.isInteger(formattedYPosition)) {
            throw CYIUtilities.createError(self.getDisplayName() + " received an invalid y position for the video rectangle: " + y);
        }

        if(!Number.isInteger(formattedWidth) || formattedWidth < 0) {
            throw CYIUtilities.createError(self.getDisplayName() + " received an invalid width for the video rectangle: " + width);
        }

        if(!Number.isInteger(formattedHeight) || formattedHeight < 0) {
            throw CYIUtilities.createError(self.getDisplayName() + " received an invalid height for the video rectangle: " + height);
        }

        self.container.style.position = "absolute";
        self.container.style.left = formattedXPosition + "px";
        self.container.style.top = formattedYPosition + "px";
        self.container.style.width = formattedWidth + "px";
        self.container.style.height = formattedHeight + "px";

        if(self.container !== self.video) {
            self.video.style.width = self.container.style.width;
            self.video.style.height = self.container.style.height;
        }

        self.requestedVideoRectangle = null;
    }

    shouldBeMakingProgress() {
        const self = this;

        // if the video is paused, avoid misidentification as a potential stall
        if(self.video.paused) {
            return false;
        }

        if(self.video.playbackRate === 0) {
            return false;
        }

        // if there is not enough content to play, then the video is buffering, not stalled
        if(self.video.buffered === null) {
            return false;
        }

        // verify that there is enough buffered content to play at the current time, ignoring the end of the buffered range since this is not relevant on all platforms
        for(let i = 0; i < self.video.buffered.length; i++) {
            const bufferedStart = self.video.buffered.start(i);
            const bufferedEnd = self.video.buffered.end(i);

            if (self.video.currentTime < bufferedStart) {
                continue;
            }

            if(self.video.currentTime > bufferedEnd - 0.5) {
                continue;
            }

            return true;
        }

        return false;
    }

    checkStall() {
        const self = this;

        const shouldBeMakingProgress = self.shouldBeMakingProgress();
        const currentPlaybackTimeSeconds = self.video.currentTime;
        const wallTimeSeconds = Date.now() / 1000;

        if(self.previousPlaybackTimeSeconds !== currentPlaybackTimeSeconds || self.wasMakingProgress !== shouldBeMakingProgress) {
            self.lastUpdateSeconds = wallTimeSeconds;
            self.previousPlaybackTimeSeconds = currentPlaybackTimeSeconds;
            self.wasMakingProgress = shouldBeMakingProgress;
        }

        const stallSeconds = wallTimeSeconds - self.lastUpdateSeconds;

        if(stallSeconds >= CYIBitmovinVideoPlayer.stallThresholdSeconds && shouldBeMakingProgress) {
            self.onStall(self.previousPlaybackTimeSeconds, stallSeconds);
        }
    }

    onStall(at, duration) {
        const self = this;

        if(self.handlingStall) {
            return;
        }

        console.warn(self.getDisplayName() + " video stall detected at " + at + " for " + duration + " seconds, attempting to resume playback.");

        self.handlingStall = true;

        self.video.currentTime += CYIBitmovinVideoPlayer.stallSkipAheadTimeMs / 1000;
    }

    enableStallDetector() {
        const self = this;

        if(CYIPlatformUtilities.isEmbedded) {
            return;
        }

        self.checkInitialized();

        if(self.stallDetectorEnabled) {
            return;
        }

        self.stallDetectorEnabled = true;
        self.previousPlaybackTimeSeconds = self.video.currentTime;
        self.lastUpdateSeconds = Date.now() / 1000;
        self.wasMakingProgress = self.shouldBeMakingProgress();
        self.handlingStall = false;

        self.stallDetectorId = setInterval(
            (function(self) {
                return function stallChecker() {
                    self.checkStall();
                };
            })(self),
            self.stallDetectorIntervalMilliseconds
        );
    }

    disableStallDetector() {
        const self = this;

        self.checkInitialized();

        if(!self.stallDetectorEnabled) {
            return;
        }

        self.stallDetectorEnabled = false;
        self.previousPlaybackTimeSeconds = null;
        self.lastUpdateSeconds = null;
        self.wasMakingProgress = null;
        self.handlingStall = false;

        if(CYIUtilities.isValid(self.stallDetectorId)) {
            clearInterval(self.stallDetectorId);
            self.stallDetectorId = null;
        }
    }

    configureDRM(drmConfiguration) {
        const self = this;

        if(self.state.id > CYIBitmovinVideoPlayer.State.Initialized.id) {
            throw CYIUtilities.createError(self.getDisplayName() + " cannot re-configure DRM after content has been loaded!");
        }

        self.drmConfiguration = drmConfiguration;
    }

    prepare(url, format, startTimeSeconds, maxBitrateKbps, drmConfiguration) {
        const self = this;

        if(CYIUtilities.isEmptyString(self.apiKey)) {
            throw CYIUtilities.createError(self.getDisplayName() + " API key is not set! Please add a value for \"apiKey\" in the player configuration parameter!");
        }

        if(CYIUtilities.isEmptyString(self.appId)) {
            const message = self.getDisplayName() + " " + CYIBitmovinVideoPlayer.getType() + " application ID is not set! This may cause playback to fail. Please add a value for \"appId\" in the player configuration parameter!";

            if(CYIPlatformUtilities.isTizen) {
                throw CYIUtilities.createError(message);
            }

            console.warn(message);
        }

        if(CYIUtilities.isObjectStrict(url)) {
            const data = url;
            url = data.url;
            format = data.format;
            startTimeSeconds = data.startTimeSeconds;
            maxBitrateKbps = data.maxBitrateKbps;
            drmConfiguration = data.drmConfiguration;
        }

        maxBitrateKbps = CYIUtilities.parseFloatingPointNumber(maxBitrateKbps);

        if(!isNaN(maxBitrateKbps) && maxBitrateKbps > 0) {
            self.setMaxBitrate(maxBitrateKbps);
        }

        if(!self.initialized) {
            self.initialize();
        }

        if(!self.isStreamFormatSupported(format, CYIUtilities.isObjectStrict(drmConfiguration) ? drmConfiguration.type : null)) {
            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.name + " does not support " + format + " stream formats" + (CYIUtilities.isObjectStrict(drmConfiguration) ? " with " + drmConfiguration.type + " DRM." : "."));
        }

        self.updateState(CYIBitmovinVideoPlayer.State.Loading);

        if(CYIUtilities.isValid(self.streamFormat)) {
            self.streamFormat.format = format;
        }
        else {
            self.streamFormat = new CYIBitmovinVideoPlayer.StreamFormat(format);
        }

        startTimeSeconds = CYIUtilities.parseInteger(startTimeSeconds, 0);

        if(startTimeSeconds < 0) {
            startTimeSeconds = 0;

            console.warn(self.getDisplayName() + " tried to prepare a video with a negative start time.");
        }

        self.startTimeSeconds = startTimeSeconds;

        if(CYIUtilities.isEmptyString(url)) {
            throw CYIUtilities.createError(self.getDisplayName() + " requires a non-empty url string to load when preparing.");
        }

        if(CYIUtilities.isNonEmptyObject(drmConfiguration)) {
            self.drmConfiguration = drmConfiguration;
        }

        if(!CYIPlatformUtilities.isEmbedded) {
            self.container.style.visibility = "visible";
        }

        // re-map the stream format to the corresponding attribute name used by the Bitmovin player configuration
        let streamSourceName = self.streamFormat.format.toLowerCase();

        if(streamSourceName === "mp4") {
            streamSourceName = "progressive";
        }

        const sourceConfiguration = { };

        sourceConfiguration[streamSourceName] = url;

        if(CYIUtilities.isValid(self.drmConfiguration)) {
            if(!CYIUtilities.isObjectStrict(self.drmConfiguration)) {
                throw CYIUtilities.createError(self.getDisplayName() + " requires a valid DRM configuration object.");
            }

            if(CYIUtilities.isNonEmptyObject(self.drmConfiguration)) {
                if(CYIUtilities.isValid(self.streamFormat)) {
                    self.streamFormat.drmTypes = [self.drmConfiguration.type];

                    if(CYIUtilities.isNonEmptyString(self.streamFormat.format)) {
                        if(!self.isStreamFormatSupported(self.streamFormat)) {
                            throw CYIUtilities.createError(CYIBitmovinVideoPlayer.name + " does not support " + self.streamFormat.format + " stream formats with " + self.drmConfiguration.type + " DRM.");
                        }
                    }
                }
                else {
                    self.streamFormat = new CYIBitmovinVideoPlayer.StreamFormat(null, [self.drmConfiguration.type]);
                }

                if(CYIUtilities.isNonEmptyString(self.drmConfiguration.type) && CYIUtilities.isNonEmptyString(self.drmConfiguration.url)) {
                    const formattedDRMType = self.drmConfiguration.type.trim().toLowerCase();

                    const drmInfo = {
                        LA_URL: self.drmConfiguration.url,
                        headers: []
                    };

                    if(!CYIUtilities.isObject(sourceConfiguration.drm)) {
                        sourceConfiguration.drm = { };
                    }

                    sourceConfiguration.drm[formattedDRMType] = drmInfo;

                    if(CYIUtilities.isNonEmptyObject(self.drmConfiguration.headers)) {
                        const headerNames = Object.keys(self.drmConfiguration.headers);

                        drmInfo.withCredentials = true;

                        for(let i = 0; i < headerNames.length; i++) {
                            drmInfo.headers.push({
                                name: headerNames[i],
                                value: self.drmConfiguration.headers[headerNames[i]]
                            });
                        }
                    }
                }
            }
        }

        self.drmConfiguration = null;

        self.player.load(
            sourceConfiguration
        ).then(function(player) {
            if(CYIUtilities.isInvalid(self.video)) {
                self.video = self.container.querySelector("video");
            }
        }).catch(function(error) {
            self.stop();

            const newError = CYIBitmovinVideoPlayer.formatError(error);
            newError.originalMessage = newError.message;
            newError.message = self.getDisplayName() + " load error: " + newError.message + " (" + newError.code + ")";

            self.sendErrorEvent("playerError", newError);
        });
    }

    isPlaying() {
        const self = this;

        self.checkInitialized();

        return self.player.isPlaying();
    }

    isPaused() {
        const self = this;

        self.checkInitialized();

        return self.player.isPaused();
    }

    play() {
        const self = this;

        self.checkInitialized();

        if(self.player.isPlaying()) {
            if(self.verbose) {
                console.warn(self.getDisplayName() + " tried to start playback, but video is already playing.");
            }

            return;
        }

        if(!self.loaded) {
            if(self.verbose) {
                console.warn(self.getDisplayName() + " tried to play while media is not loaded.");
            }

            return;
        }

        self.player.play();

        if(self.verbose) {
            console.log(self.getDisplayName() + " playing.");
        }
    }

    pause() {
        const self = this;

        self.checkInitialized();

        if(self.player.isPaused()) {
            if(self.verbose) {
                console.warn(self.getDisplayName() + " tried to pause playback, but video is already paused.");
            }

            return;
        }

        if(!self.loaded) {
            if(self.verbose) {
                console.warn(self.getDisplayName() + " tried to pause while media is not loaded.");
            }

            return;
        }

        self.player.pause();

        if(self.verbose) {
            console.log(self.getDisplayName() + " paused.");
        }
    }

    stop() {
        const self = this;

        if(!self.initialized) {
            return;
        }

        // store the last known player position and size so that it can be used if the player is re-initialized later
        const playerPosition = self.getPosition();
        const playerSize = self.getSize();

        if(CYIUtilities.isValid(playerPosition) && CYIUtilities.isValid(playerSize)) {
            self.requestedVideoRectangle = new CYIRectangle(playerPosition.x, playerPosition.y, playerSize.width, playerSize.height);
        }

        if(!CYIPlatformUtilities.isEmbedded) {
            self.container.style.visibility = "hidden";
        }

        self.disableStallDetector();

        // note: these functions can sometimes throw invalid exceptions which will disrupt the cleanup code flow, we should be able to safely ignore them
        try { self.player.unload(); } catch(error) { }
        try { self.player.destroy(); } catch(error) { }

        document.body.removeChild(self.container);
        self.player = null;
        self.container = null;
        self.video = null;
        self.initialized = false;
        self.loaded = false;
        self.buffering = false;
        self.startTimeSeconds = 0;
        self.maxBitrateKbps = Infinity;
        self.initialAudioBitrateKbps = null;
        self.currentAudioBitrateKbps = null;
        self.initialVideoBitrateKbps = null;
        self.currentVideoBitrateKbps = null;
        self.initialTotalBitrateKbps = null;
        self.currentTotalBitrateKbps = null;
        self.shouldResumePlayback = null;
        self.drmConfiguration = null;
        self.requestedTextTrackId = null;
        self.externalTextTrackQueue.length = 0;

        self.resetExternalTextTrackIdCounter();

        if(self.state !== CYIBitmovinVideoPlayer.State.Uninitialized) {
            self.updateState(CYIBitmovinVideoPlayer.State.Uninitialized);
        }

        if(self.verbose) {
            console.log(self.getDisplayName() + " stopped.");
        }
    }

    suspend() {
        const self = this;

        if(!self.initialized || !self.loaded) {
            return;
        }

        if(self.player.isPlaying()) {
            self.shouldResumePlayback = true;

            self.pause();
        }

        if(self.verbose) {
            console.log(self.getDisplayName() + " suspended" + (self.shouldResumePlayback ? ", will resume playback on restore" : "") + ".");
        }
    }

    restore() {
        const self = this;

        if(!self.initialized || !self.loaded) {
            return;
        }

        if(self.shouldResumePlayback) {
            if(self.player.isPaused()) {
                if(self.verbose) {
                    console.log(self.getDisplayName() + " resuming playback after restore.");
                }

                // delay video resuming to prevent pause event from interrupting playback
                setTimeout(function() {
                    self.play();
                });
            }

            self.shouldResumePlayback = false;
        }

        if(self.verbose) {
            console.log(self.getDisplayName() + " restored.");
        }
    }

    destroy() {
        const self = this;

        if(!self.player) {
            return;
        }

        self.stop();

        self.state = CYIBitmovinVideoPlayer.State.Uninitialized;
        self.apiKey = null;
        self.player = null;

        if(self.verbose) {
            console.log(self.getDisplayName() + " player removed.");
        }
    }

    getCurrentTime() {
        const self = this;

        self.checkInitialized();

        return self.player.getCurrentTime();
    }

    getDuration() {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isInvalidNumber(self.player.getDuration())) {
            return -1;
        }

        return self.player.getDuration();
    }

    seek(timeSeconds) {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isInvalidNumber(timeSeconds)) {
            return;
        }

        self.player.seek(CYIUtilities.clamp(timeSeconds, 0, self.player.getDuration()));

        if(self.verbose) {
            console.log(self.getDisplayName() + " seeked to " + timeSeconds + "s.");
        }

        self.notifyVideoTimeChanged();
    }

    isMuted() {
        const self = this;

        self.checkInitialized();

        return self.player.isMuted();
    }

    mute() {
        const self = this;

        self.checkInitialized();

        if(self.player.isMuted()) {
            return;
        }

        self.player.mute();

        if(self.verbose) {
            console.log(self.getDisplayName() + " muted.");
        }
    }

    unmute() {
        const self = this;

        self.checkInitialized();

        if(!self.player.isMuted()) {
            return;
        }

        self.player.unmute();

        if(self.verbose) {
            console.log(self.getDisplayName() + " unmuted.");
        }
    }

    setMaxBitrate(maxBitrateKbps) {
        const self = this;

        if(self.state !== CYIBitmovinVideoPlayer.State.Uninitialized &&
           self.state !== CYIBitmovinVideoPlayer.State.Initialized) {
            if(self.verbose) {
                console.warn(CYIBitmovinVideoPlayer.getType() + " cannot set maximum bitrate after content has been loaded.");
            }
        }
        else {
            if(self.verbose) {
                console.log(self.getDisplayName() + " setting maximum bitrate to " + maxBitrateKbps + " Kbps.");
            }

            if(self.state === CYIBitmovinVideoPlayer.State.Uninitialized) {
                self.maxBitrateKbps = maxBitrateKbps;
            }
            else {
                if(self.verbose) {
                    console.log(self.getDisplayName() + " re-initializing to change configured maximum bitrate.");
                }

                self.stop();

                self.maxBitrateKbps = maxBitrateKbps;

                self.initialize();
            }
        }
    }

    isLive() {
        const self = this;

        self.checkInitialized();

        return self.player.isLive();
    }

    getActiveAudioTrack() {
        const self = this;

        self.checkInitialized();

        let formattedActiveAudioTrack = null;
        const audioTracks = self.player.getAvailableAudio();
        const activeAudioTrack = self.player.getAudio();

        if(CYIUtilities.isInvalid(activeAudioTrack)) {
            return null;
        }

        for(let i = 0; i < audioTracks.length; i++) {
            if(!CYIUtilities.equalsIgnoreCase(audioTracks[i].id, activeAudioTrack.id)) {
                continue;
            }

            formattedActiveAudioTrack = {
                id: i,
                uniqueId: activeAudioTrack.id,
                label: activeAudioTrack.label,
                language: activeAudioTrack.lang,
                active: true,
                roles: []
            };

            break;
        }

        if(CYIUtilities.isInvalid(formattedActiveAudioTrack)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to retrieve the active audio track, but it did not exist in the list of available audio tracks.");
        }

        if(CYIUtilities.isNonEmptyArray(activeAudioTrack.role)) {
            for(let i = 0; i < activeAudioTrack.role.length; i++) {
                formattedActiveAudioTrack.roles.push(activeAudioTrack.role[i].value);
            }
        }

        CYIBitmovinVideoPlayer.generateAudioTrackTitle(formattedActiveAudioTrack);

        return formattedActiveAudioTrack;
    }

    getAvailableSubtitlesHelper() {
        const self = this;

        if(!self.initialized) {
            return [];
        }

        if(CYIUtilities.isInvalid(self.player.subtitles)) {
            return [];
        }

        return self.player.subtitles.list();
    }

    getAudioTracks() {
        const self = this;

        self.checkInitialized();

        let audioTrack = null;
        const audioTracks = self.player.getAvailableAudio();
        const activeAudioTrack = self.player.getAudio();
        let formattedAudioTrack = null;
        const formattedAudioTracks = [];

        for(let i = 0; i < audioTracks.length; i++) {
            audioTrack = audioTracks[i];

            formattedAudioTrack = {
                id: i,
                uniqueId: audioTrack.id,
                label: audioTrack.label,
                language: audioTrack.lang,
                active: audioTrack.id === activeAudioTrack.id,
                roles: []
            };

            if(CYIUtilities.isNonEmptyArray(audioTrack.role)) {
                for(let i = 0; i < audioTrack.role.length; i++) {
                    formattedAudioTrack.roles.push(audioTrack.role[i].value);
                }
            }

            CYIBitmovinVideoPlayer.generateAudioTrackTitle(formattedAudioTrack);

            formattedAudioTracks.push(formattedAudioTrack);
        }

        return formattedAudioTracks;
    }

    selectAudioTrack(id) {
        const self = this;

        self.checkInitialized();

        const audioTracks = self.player.getAvailableAudio();

        if(audioTracks.length === 0) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to select an audio track, but no audio tracks are available.");
        }

        let audioTrackIndex = CYIUtilities.parseInteger(id);

        if(isNaN(audioTrackIndex)) {
            const formattedAudioTrackId = CYIUtilities.trimString(id);

            if(CYIUtilities.isNonEmptyString(formattedAudioTrackId)) {
                for(let i = 0; i < audioTracks.length; i++) {
                    if(CYIUtilities.equalsIgnoreCase(audioTracks[i].id, formattedAudioTrackId)) {
                        audioTrackIndex = i;
                        break;
                    }
                }
            }
        }

        if(CYIUtilities.isInvalidNumber(audioTrackIndex)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to select an audio track using an invalid id: " + id);
        }

        if(audioTrackIndex < 0 || audioTrackIndex >= audioTracks.length) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to select an audio track using an index that is out of range: " + audioTrackIndex + ", expected a number between 0 and " + (audioTracks.length - 1) + ", inclusively.");
        }

        const selectedAudioTrack = audioTracks[audioTrackIndex];
        const activeAudioTrack = self.player.getAudio();

        if(CYIUtilities.isValid(activeAudioTrack) && CYIUtilities.equalsIgnoreCase(activeAudioTrack.id, selectedAudioTrack.id)) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " tried to select audio track with id: " + selectedAudioTrack.id + ", but it is already active.");
            }

            return true;
        }

        self.player.setAudio(selectedAudioTrack.id);

        if(self.verbose) {
            console.log(self.getDisplayName() + " selected audio track with id: " + selectedAudioTrack.id + (CYIUtilities.isNonEmptyString(selectedAudioTrack.lang) ? " (" + selectedAudioTrack.lang + ")" : "") + ".");
        }

        return true;
    }

    isTextTrackEnabled() {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isInvalid(self.player.subtitles)) {
            return false;
        }

        const textTracks = self.getAvailableSubtitlesHelper();

        for(let i = 0; i < textTracks.length; i++) {
            if(textTracks[i].enabled) {
                return true;
            }
        }

        return false;
    }

    setSubtitleHelper(textTrackId, exclusive) {
        const self = this;

        if(!self.initialized) {
            return;
        }

        if(CYIUtilities.isInvalid(self.player.subtitles)) {
            return;
        }

        exclusive = CYIUtilities.parseBoolean(exclusive, true);

        if(textTrackId === null) {
            return self.player.subtitles.disable(self.requestedTextTrackId);
        }

        return self.player.subtitles.enable(textTrackId);
    }

    enableTextTrack() {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isNonEmptyString(self.requestedTextTrackId)) {
            // if a text track was previously active, re-activate it
            self.setSubtitleHelper(self.requestedTextTrackId);

            if(self.verbose) {
                console.log(self.getDisplayName() + " enabled text track with id: " + self.requestedTextTrackId + ".");
            }
        }
        else {
            // otherwise, activate the first valid (non-"off") text track, if any exist
            const textTracks = self.getAvailableSubtitlesHelper();

            for(let i = 0; i < textTracks.length; i++) {
                const textTrack = textTracks[i];

                if(CYIUtilities.isInvalid(textTrack.id)) {
                    continue;
                }

                self.requestedTextTrackId = textTrack.id;

                self.setSubtitleHelper(textTrack.id);

                if(self.verbose) {
                    console.log(self.getDisplayName() + " enabled text track #" + i + " with id: " + textTrack.id + (CYIUtilities.isNonEmptyString(textTrack.lang) ? " (" + textTrack.lang + ")" : "") + ".");
                }

                break;
            }
        }
    }

    disableTextTrack() {
        const self = this;

        if(!self.initialized) {
            return;
        }

        self.setSubtitleHelper(null);

        if(self.verbose) {
            console.log(self.getDisplayName() + " text track disabled.");
        }
    }

    getSubtitleHelper() {
        const self = this;

        if(!self.initialized) {
            return null;
        }

        if(CYIUtilities.isInvalid(self.player.subtitles)) {
            return null;
        }

        const textTracks = self.getAvailableSubtitlesHelper();

        for(let i = 0; i < textTracks.length; i++) {
            if(textTracks[i].enabled) {
                return textTracks[i];
            }
        }

        return null;
    }

    getActiveTextTrack() {
        const self = this;

        self.checkInitialized();

        let formattedActiveTextTrack = null;
        const textTracks = self.getAvailableSubtitlesHelper();
        const activeTextTrack = self.getSubtitleHelper();

        // note: the "off" track has a special id of null
        if(CYIUtilities.isInvalid(activeTextTrack) || activeTextTrack.id === null) {
            return null;
        }

        for(let i = 0; i < textTracks.length; i++) {
            if(!CYIUtilities.equalsIgnoreCase(textTracks[i].id, activeTextTrack.id)) {
                continue;
            }

            formattedActiveTextTrack = {
                id: i,
                uniqueId: activeTextTrack.id,
                kind: activeTextTrack.kind,
                language: activeTextTrack.lang,
                label: activeTextTrack.label,
                url: activeTextTrack.url,
                isFragmented: activeTextTrack.isFragmented,
                active: true
            };

            break;
        }

        if(CYIUtilities.isInvalid(formattedActiveTextTrack)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to retrieve the active text track, but it did not exist in the list of available text tracks.");
        }

        CYIBitmovinVideoPlayer.generateTextTrackTitle(formattedActiveTextTrack);

        return formattedActiveTextTrack;
    }

    getTextTracks() {
        const self = this;

        self.checkInitialized();

        let textTrack = null;
        const textTracks = self.getAvailableSubtitlesHelper();
        const activeTextTrack = self.getSubtitleHelper();
        let formattedTextTrack = null;
        const formattedTextTracks = [];

        for(let i = 0; i < textTracks.length; i++) {
            textTrack = textTracks[i];

            // filter out the "off" track from the list
            if(CYIUtilities.isInvalid(textTrack.id)) {
                continue;
            }

            formattedTextTrack = {
                id: i,
                uniqueId: textTrack.id,
                kind: textTrack.kind,
                language: textTrack.lang,
                label: textTrack.label,
                url: textTrack.url,
                isFragmented: textTrack.isFragmented,
                active: CYIUtilities.isInvalid(activeTextTrack) ? false : textTrack.id === activeTextTrack.id
            };

            CYIBitmovinVideoPlayer.generateTextTrackTitle(formattedTextTrack);

            formattedTextTracks.push(formattedTextTrack);
        }

        return formattedTextTracks;
    }

    selectTextTrack(id, enableTextTrack) {
        const self = this;

        self.checkInitialized();

        // note: null is used to represent the off track
        if(id === null) {
            self.disableTextTrack();
            return true;
        }

        enableTextTrack = CYIUtilities.parseBoolean(enableTextTrack, true);

        const textTracks = self.getAvailableSubtitlesHelper();

        if(textTracks.length === 0) {
            if(self.verbose) {
                console.warn(self.getDisplayName() + " tried to select a text track, but no text tracks are available.");
            }

            return false;
        }

        let textTrackIndex = CYIUtilities.parseInteger(id);

        if(isNaN(textTrackIndex)) {
            const formattedTextTrackId = CYIUtilities.trimString(id);

            if(CYIUtilities.isNonEmptyString(formattedTextTrackId)) {
                for(let i = 0; i < textTracks.length; i++) {
                    if(CYIUtilities.equalsIgnoreCase(textTracks[i].id, formattedTextTrackId)) {
                        textTrackIndex = i;
                        break;
                    }
                }
            }
        }

        if(CYIUtilities.isInvalidNumber(textTrackIndex)) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to select a text track using an invalid id: " + id);
        }

        if(textTrackIndex < 0 || textTrackIndex >= textTracks.length) {
            throw CYIUtilities.createError(self.getDisplayName() + " tried to select a text track using an index that is out of range: " + textTrackIndex + ", expected a number between 0 and " + (textTracks.length - 1) + ", inclusively.");
        }

        const selectedTextTrack = textTracks[textTrackIndex];
        let activeTextTrack = self.getSubtitleHelper();

        if(CYIUtilities.isObject(activeTextTrack) && CYIUtilities.equalsIgnoreCase(activeTextTrack.id, selectedTextTrack.id)) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " tried to select text track with id: " + selectedTextTrack.id + ", but it is already active.");
            }

            return true;
        }

        self.requestedTextTrackId = selectedTextTrack.id;

        if(enableTextTrack) {
            self.setSubtitleHelper(selectedTextTrack.id);

            activeTextTrack = selectedTextTrack;

            if(self.verbose) {
                if(selectedTextTrack.id === null) {
                    console.log(self.getDisplayName() + " selected off text track.");
                }
                else {
                    console.log(self.getDisplayName() + " selected text track with id: " + selectedTextTrack.id + (CYIUtilities.isNonEmptyString(selectedTextTrack.language) ? " (" + selectedTextTrack.language + ")" : "") + ".");
                }
            }
        }

        return true;
    }

    addExternalTextTrack(url, language, label, type, format, enable) {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isObjectStrict(url)) {
            const data = url;
            url = data.url;
            language = data.language;
            label = data.label;
            type = data.type;
            format = data.format;
            enable = data.enable;
        }

        url = CYIUtilities.trimString(url);
        language = CYIUtilities.trimString(language);
        label = CYIUtilities.trimString(label, "");
        format = CYIUtilities.trimString(format);
        type = CYIUtilities.trimString(type);
        enable = CYIUtilities.parseBoolean(enable, false);

        if(CYIUtilities.isEmptyString(url)) {
            return console.error(self.getDisplayName() + " missing or invalid external text track url value.");
        }

        if(CYIUtilities.isEmptyString(language)) {
            return console.error(self.getDisplayName() + " missing or invalid external text track language value.");
        }

        if(CYIUtilities.isEmptyString(type)) {
            type = "caption";

            console.warn(self.getDisplayName() + " missing or invalid external text track type value, defaulting to caption.");
        }

        if(CYIUtilities.isEmptyString(label)) {
            console.warn(self.getDisplayName() + " missing or invalid external text track label value, defaulting to empty string.");
        }

        if(!self.loaded) {
            self.externalTextTrackQueue.push({
                url: url,
                language: language,
                label: label,
                type: type,
                format: format
            });

            return console.warn(self.getDisplayName() + " tried to add an external text track before video finished loading, storing in queue to add after the video has loaded.");
        }

        const generatedExternalTextTrackId = CYIBitmovinVideoPlayer.ExternalTrackPrefix + self.externalTextTrackIdCounter++;

        self.player.addSubtitle({
            id: generatedExternalTextTrackId,
            url: url,
            lang: language,
            kind: type,
            label: label
        });

        let newExternalTextTrackId = -1;
        let newExternalTextTrack = null;
        const textTracks = self.player.getAvailableCaption();

        for(let i = 0; i < textTracks.length; i++) {
            if(!CYIUtilities.equalsIgnoreCase(textTracks[i].id, generatedExternalTextTrackId)) {
                continue;
            }

            newExternalTextTrackId = i;
            newExternalTextTrack = textTracks[i];
            break;
        }

        const formattedNewExternalTextTrack = {
            id: newExternalTextTrackId,
            uniqueId: newExternalTextTrack.id,
            kind: newExternalTextTrack.kind,
            language: newExternalTextTrack.lang,
            label: newExternalTextTrack.label,
            url: newExternalTextTrack.url,
            isFragmented: newExternalTextTrack.isFragmented,
            active: false
        };

        CYIBitmovinVideoPlayer.generateTextTrackTitle(formattedNewExternalTextTrack);

        self.sendEvent("externalTextTrackAdded", formattedNewExternalTextTrack);

        self.notifyTextTracksChanged();

        if(enable) {
            self.selectTextTrack(newExternalTextTrackId, true);
        }
    }

    processExternalTextTrackQueue() {
        const self = this;

        self.checkInitialized();

        if(!self.loaded || self.externalTextTrackQueue.length === 0) {
            return;
        }

        if(self.verbose) {
            console.log(self.getDisplayName() + " processing external text track queue...");
        }

        for(let i = 0; i < self.externalTextTrackQueue.length; i++) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " adding external text track " + (i + 1) + " / " + self.externalTextTrackQueue.length + "...");
            }

            self.addExternalTextTrack(self.externalTextTrackQueue[i]);
        }

        self.externalTextTrackQueue.length = 0;
    }

    numberOfStreamFormats() {
        const self = this;

        return self.streamFormats.length;
    }

    hasStreamFormat(streamFormat) {
        const self = this;

        return self.indexOfStreamFormat() !== -1;
    }

    indexOfStreamFormat(streamFormat) {
        const self = this;

        let formattedStreamFormat = null;

        if(CYIBitmovinVideoPlayerStreamFormat.isStreamFormat(streamFormat) || CYIUtilities.isObjectStrict(streamFormat)) {
            formattedStreamFormat = CYIUtilities.trimString(streamFormat.format);
        }
        else if(CYIUtilities.isNonEmptyString(streamFormat)) {
            formattedStreamFormat = CYIUtilities.trimString(streamFormat);
        }

        if(CYIUtilities.isEmptyString(formattedStreamFormat)) {
            return -1;
        }

        for(let i = 0; i < self.streamFormats.length; i++) {
            if(CYIUtilities.equalsIgnoreCase(self.streamFormats[i].format, formattedStreamFormat)) {
                return i;
            }
        }

        return -1;
    }

    getStreamFormat(streamFormat) {
        const self = this;

        const streamFormatIndex = self.indexOfStreamFormat(streamFormat);

        if(streamFormatIndex === -1) {
            return null;
        }

        return self.streamFormats[streamFormatIndex];
    }

    registerStreamFormat(streamFormat, drmTypes) {
        const self = this;

        let streamFormatInfo = null;

        if(CYIBitmovinVideoPlayerStreamFormat.isStreamFormat(streamFormat)) {
            streamFormatInfo = streamFormat;
        }
        else {
            const formattedStreamFormat = CYIUtilities.trimString(streamFormat);

            if(CYIUtilities.isEmptyString(formattedStreamFormat)) {
                console.error(CYIBitmovinVideoPlayer.name + " cannot register stream format with empty or invalid format.");
                return null;
            }

            const formattedDRMTypes = [];

            if(CYIUtilities.isNonEmptyArray(drmTypes)) {
                for(let i = 0; i < drmTypes.length; i++) {
                    const formattedDRMType = CYIUtilities.trimString(drmTypes[i]);

                    if(CYIUtilities.isEmptyString(formattedDRMType)) {
                        console.error(CYIBitmovinVideoPlayer.name + " skipping registration of empty or invalid DRM type for " + formattedStreamFormat + " stream format.");
                        continue;
                    }

                    for(let j = 0; j < formattedDRMTypes.length; j++) {
                        if(CYIUtilities.equalsIgnoreCase(formattedDRMTypes[j], formattedDRMType)) {
                            console.warn(CYIBitmovinVideoPlayer.name + " already has " + formattedDRMType + " DRM type registered for " + formattedStreamFormat + " stream format.");
                            continue;
                        }
                    }

                    if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
                        continue;
                    }

                    formattedDRMTypes.push(formattedDRMType);
                }
            }

            streamFormatInfo = new CYIBitmovinVideoPlayerStreamFormat(formattedStreamFormat, formattedDRMTypes);
        }

        if(!streamFormatInfo.isValid()) {
            console.error(CYIBitmovinVideoPlayer.name + " tried to register an invalid stream format!");
            return null;
        }

        const registeredStreamFormat = self.getStreamFormat(streamFormatInfo);

        if(CYIUtilities.isValid(registeredStreamFormat)) {
            console.warn(CYIBitmovinVideoPlayer.name + " already has " + registeredStreamFormat.format + " stream format registered!");
            return null;
        }

        self.streamFormats.push(streamFormatInfo);

        return streamFormatInfo;
    }

    unregisterStreamFormat(streamFormat) {
        const self = this;

        const streamFormatIndex = self.indexOfStreamFormat(streamFormat);

        if(streamFormatIndex === -1) {
            return false;
        }

        return self.streamFormats.splice(streamFormatIndex, 1);
    }

    addDRMTypeToStreamFormat(streamFormat, drmType) {
        const self = this;

        const streamFormatInfo = self.getStreamFormat(streamFormat);

        if(!CYIBitmovinVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
            return false;
        }

        return streamFormatInfo.addDRMType(drmType);
    }

    removeDRMTypeFromStreamFormat(streamFormat, drmType) {
        const self = this;

        const streamFormatInfo = self.getStreamFormat(streamFormat);

        if(!CYIBitmovinVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
            return false;
        }

        return streamFormatInfo.removeDRMType(drmType);
    }

    removeAllDRMTypesFromStreamFormat(streamFormat) {
        const self = this;

        const streamFormatInfo = self.getStreamFormat(streamFormat);

        if(!CYIBitmovinVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
            return false;
        }

        streamFormatInfo.clearDRMTypes();

        return true;
    }

    isStreamFormatSupported(streamFormat, drmType) {
        const self = this;

        const streamFormatInfo = self.getStreamFormat(streamFormat);

        if(!CYIBitmovinVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
            return false;
        }

        if(CYIUtilities.isNonEmptyString(drmType)) {
            return streamFormatInfo.hasDRMType(drmType);
        }

        return true;
    }

    clearStreamFormats() {
        const self = this;

        self.streamFormats.length = 0;
    }

    notifyLiveStatus() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("liveStatus", self.isLive());
    }

    notifyBitrateChanged() {
        const self = this;

        self.checkInitialized();

        const bitrateData = { };

        if(CYIUtilities.isValidNumber(self.initialAudioBitrateKbps) || CYIUtilities.isValidNumber(self.currentAudioBitrateKbps)) {
            bitrateData.initialAudioBitrateKbps = Math.floor(self.initialAudioBitrateKbps);
            bitrateData.currentAudioBitrateKbps = Math.floor(self.currentAudioBitrateKbps);
        }

        if(CYIUtilities.isValidNumber(self.initialVideoBitrateKbps) || CYIUtilities.isValidNumber(self.currentVideoBitrateKbps)) {
            bitrateData.initialVideoBitrateKbps = Math.floor(self.initialVideoBitrateKbps);
            bitrateData.currentVideoBitrateKbps = Math.floor(self.currentVideoBitrateKbps);
        }

        if(CYIUtilities.isValidNumber(self.initialTotalBitrateKbps) || CYIUtilities.isValidNumber(self.currentTotalBitrateKbps)) {
            bitrateData.initialTotalBitrateKbps = Math.floor(self.initialTotalBitrateKbps);
            bitrateData.currentTotalBitrateKbps = Math.floor(self.currentTotalBitrateKbps);
        }

        self.sendEvent("bitrateChanged", bitrateData);
    }

    notifyBufferingStateChanged(buffering) {
        const self = this;

        self.checkInitialized();

        buffering = CYIUtilities.parseBoolean(buffering);

        if(CYIUtilities.isInvalid(buffering)) {
            return console.error(self.getDisplayName() + " tried to send an invalid buffering state value, expected a valid boolean value.");
        }

        self.sendEvent("bufferingStateChanged", buffering);
    }

    notifyVideoTimeChanged() {
        const self = this;

        self.checkInitialized();

        const bufferedTimeRanges = self.video.buffered;
        let bufferedTimeRange = null;

        for(let i = 0; i < bufferedTimeRanges.length; i++) {
            if(self.video.currentTime >= bufferedTimeRanges.start(i) && self.video.currentTime <= bufferedTimeRanges.end(i)) {
                bufferedTimeRange = {
                    start: bufferedTimeRanges.start(i),
                    end: bufferedTimeRanges.end(i)
                };

                break;
            }
        }

        const data = {
            currentTimeSeconds: self.getCurrentTime()
        };

        if(CYIUtilities.isValid(bufferedTimeRange)) {
            data.bufferStartMs = Math.floor(bufferedTimeRange.start * 1000);
            data.bufferEndMs = Math.floor(bufferedTimeRange.end * 1000);
            data.bufferLengthMs = Math.floor((bufferedTimeRange.end - self.video.currentTime) * 1000);
        }
        else {
            data.bufferStartMs = 0;
            data.bufferEndMs = 0;
            data.bufferLengthMs = 0;
        }

        self.sendEvent("videoTimeChanged", data);
    }

    notifyVideoDurationChanged() {
        const self = this;

        self.checkInitialized();

        if(CYIUtilities.isInvalidNumber(self.getDuration()) || self.getDuration() < 0) {
            return;
        }

        self.sendEvent("videoDurationChanged", self.getDuration());
    }

    notifyActiveAudioTrackChanged() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("activeAudioTrackChanged", self.getActiveAudioTrack());
    }

    notifyAudioTracksChanged() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("audioTracksChanged", self.getAudioTracks());
    }

    notifyActiveTextTrackChanged() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("activeTextTrackChanged", self.getActiveTextTrack());
    }

    notifyTextTracksChanged() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("textTracksChanged", self.getTextTracks());
    }

    notifyTextTrackStatusChanged() {
        const self = this;

        self.checkInitialized();

        self.sendEvent("textTrackStatusChanged", self.isTextTrackEnabled());
    }

    notifyMetadataAvailable(identifier, value, timestamp, durationMs) {
        const self = this;

        self.checkInitialized();

        const metadata = CYIUtilities.isObjectStrict(identifier) ? identifier : {
            identifier: identifier,
            value: value,
            timestamp: timestamp,
            durationMs: durationMs
        };

        metadata.identifier = CYIUtilities.trimString(metadata.identifier);
        metadata.value = CYIUtilities.toString(metadata.value);
        metadata.timestamp = CYIUtilities.parseDate(metadata.timestamp, new Date()).getTime();
        metadata.durationMs = CYIUtilities.parseInteger(metadata.durationMs, -1);

        if(CYIUtilities.isEmptyString(metadata.identifier)) {
            if(self.verbose) {
                console.warn("Failed to send metadata event with empty identifier.");
            }

            return false;
        }

        self.sendEvent("metadataAvailable", metadata);

        return true;
    }

    sendEvent(eventName, data) {
        return CYIMessaging.sendEvent({
            context: CYIBitmovinVideoPlayer.name,
            name: eventName,
            data: data
        });
    }

    sendErrorEvent(eventName, error) {
        return CYIMessaging.sendEvent({
            context: CYIBitmovinVideoPlayer.name,
            name: eventName,
            error: error
        });
    }

    static formatError(error) {
        if(!CYIUtilities.isObject(error)) {
            return CYIUtilities.createError("Unknown error.");
        }

        let errorMessage = error.message;

        if(CYIUtilities.isEmptyString(errorMessage)) {
            if(CYIUtilities.isNonEmptyString(error.name)) {
                errorMessage = error.name;
            }
            else {
                errorMessage = "Unknown error.";
            }
        }

        const newError = CYIUtilities.createError(errorMessage);

        if(CYIUtilities.isValid(error.stack)) {
            newError.stack = error.stack;
        }

        newError.timestamp = Number.isInteger(error.timestamp) ? error.timestamp : new Date().getTime();

        if(CYIUtilities.isValid(error.code)) {
            newError.code = error.code;
        }

        if(CYIUtilities.isValid(error.data)) {
            newError.data = error.data;
        }

        return newError;
    }
}

Object.defineProperty(CYIBitmovinVideoPlayerVersion, "PlayerVersionRegex", {
    value: /((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*))/,
    enumerable: false
});

Object.defineProperty(CYIBitmovinVideoPlayer, "StreamFormat", {
    value: CYIBitmovinVideoPlayerStreamFormat,
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "BitrateKbpsScale", {
    value: 1000,
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "UIContainerClassName", {
    value: "bmpui-ui-uicontainer",
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "UIPlayButtonClassName", {
    value: "ui-hugeplaybacktogglebutton",
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "UISubtitleOverlayClassName", {
    value: "bmpui-ui-subtitle-overlay",
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "ExternalTrackPrefix", {
    value: "external",
    enumerable: true
});

Object.defineProperty(CYIBitmovinVideoPlayer, "State", {
    enumerable: true,
    value: CYIBitmovinVideoPlayerState
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Invalid", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(-1, "Invalid")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Uninitialized", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(0, "Uninitialized")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Initialized", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(1, "Initialized")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Loading", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(2, "Loading")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Loaded", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(3, "Loaded")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Paused", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(4, "Paused")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Playing", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(5, "Playing")
});

Object.defineProperty(CYIBitmovinVideoPlayerState, "Complete", {
    enumerable: true,
    value: new CYIBitmovinVideoPlayerState(6, "Complete")
});

CYIBitmovinVideoPlayerState.Uninitialized.transitionStates = [
    CYIBitmovinVideoPlayerState.Initialized
];

CYIBitmovinVideoPlayerState.Initialized.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Loading
];

CYIBitmovinVideoPlayerState.Loading.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Loaded
];

CYIBitmovinVideoPlayerState.Loaded.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Paused,
    CYIBitmovinVideoPlayerState.Playing
];

CYIBitmovinVideoPlayerState.Paused.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Playing,
    CYIBitmovinVideoPlayerState.Complete
];

CYIBitmovinVideoPlayerState.Playing.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Paused,
    CYIBitmovinVideoPlayerState.Complete
];

CYIBitmovinVideoPlayerState.Complete.transitionStates = [
    CYIBitmovinVideoPlayerState.Uninitialized,
    CYIBitmovinVideoPlayerState.Playing
];

Object.defineProperty(CYIBitmovinVideoPlayer, "States", {
    enumerable: true,
    value: [
        CYIBitmovinVideoPlayerState.Uninitialized,
        CYIBitmovinVideoPlayerState.Initialized,
        CYIBitmovinVideoPlayerState.Loading,
        CYIBitmovinVideoPlayerState.Loaded,
        CYIBitmovinVideoPlayerState.Paused,
        CYIBitmovinVideoPlayerState.Playing,
        CYIBitmovinVideoPlayerState.Complete
    ]
});

Object.defineProperty(CYIBitmovinVideoPlayer, "properties", {
    value: new CYIBitmovinVideoPlayerProperties(),
    enumerable: false
});

Object.defineProperty(CYIBitmovinVideoPlayer, "script", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.script;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.script = value;
    }
});

Object.defineProperty(CYIBitmovinVideoPlayer, "playerVersion", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.playerVersion;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.playerVersion = value;
    }
});

Object.defineProperty(CYIBitmovinVideoPlayer, "hidingUITimeoutMs", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.hidingUITimeoutMs;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.hidingUITimeoutMs = value;
    }
});

Object.defineProperty(CYIBitmovinVideoPlayer, "stallThresholdSeconds", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.stallThresholdSeconds;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.stallThresholdSeconds = value;
    }
});

Object.defineProperty(CYIBitmovinVideoPlayer, "stallSkipAheadTimeMs", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.stallSkipAheadTimeMs;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.stallSkipAheadTimeMs = value;
    }
});

Object.defineProperty(CYIBitmovinVideoPlayer, "stallDetectorIntervalMilliseconds", {
    enumerable: true,
    get() {
        return CYIBitmovinVideoPlayer.properties.defaultStallDetectorIntervalMilliseconds;
    },
    set(value) {
        CYIBitmovinVideoPlayer.properties.defaultStallDetectorIntervalMilliseconds = value;
    }
});

CYIBitmovinVideoPlayer.script = document.currentScript;

window.CYIBitmovinVideoPlayer = CYIBitmovinVideoPlayer;

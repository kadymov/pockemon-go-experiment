var PocGo = (function (PocGo, undefined) {
    'use strict';

    var Camera = function (autoplay) {
        this._getUserMedia = this._initGetUserMedia();
        this._video = this._initVideoElement();
        this._sourceId = null;
        this._stream = null;
        
        if (autoplay) {
            this.getSources().then(function(sources) {
                if (!sources || !sources[0]) {
                    throw new Error('Sources of the video is not found'); // TODO
                    return;
                }
                
                this.setSource(sources[0]);
                
                this.start();
            }.bind(this));
        }
    };

    Camera.prototype = {
        getSources: function () {

            //mediaDevices.enumerateDevices
            if (false && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                return navigator.mediaDevices.enumerateDevices()
                    .then(function (devices) {
                        devices = devices.filter(function (dev) {
                            return dev.kind === 'videoinput';
                        });

                        return Promise.resolve(devices); // TODO
                    });
            }

            // MediaStreamTrack.getSources
            else if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                return new Promise(function (resolve) {
                    window.MediaStreamTrack.getSources(function (devices) {
                        devices = devices.filter(function (dev) {
                            return dev.kind === 'video';
                        });
                        resolve(devices);
                    });
                });
            } else {
                return Promise.reject(
                    new Error('"MediaStreamTrack" & "mediaDevices" not supported in this browser')
                );
            }
        },

        setSource: function (source) {
            this._sourceId = source.deviceId || source.id;
        },

        start: function () {
            var self = this;
            
            if (this._stream) {
                this._video.src = null;
                this._stream.stop();
            }
            
            if (!this._sourceId) {
                throw new Error('Not selected source'); // TODO
            }
            
            var constraints = {
                video: {
                    optional: [{sourceId: this._sourceId}]
                }
            };
            
            return new Promise(function(resolve, reject) {
                self._getUserMedia.call(navigator, constraints, function(stream) {
                    self._stream = stream;
                    self._video.src = window.URL.createObjectURL(stream);
                    self._video.play();
                    resolve(stream);
                }, reject);
            });
        },

        stop: function () {
            this._video.stop();
        },

        getVideo: function () {
            return this._video;
        },
        
        getStream: function () {
            return this._stream;
        },
        
        setFullScreenSize() {
            //TODO
        },

        _initGetUserMedia: function () {
            var getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;

            if (!getUserMedia) {
                throw new Error('GetUserMedia not supported in this browser');
            }

            return getUserMedia;
        },

        _initVideoElement: function () {
            var video = document.createElement('video');
            video.autoplay = 'autoplay';
            return video;
        }
    };

    // -----------------------
    PocGo.Camera = Camera;
    return PocGo;
})(PocGo || {});
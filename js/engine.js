var PocGo = (function (PocGo, THREE, undefined) {
    'use strict';
    
    var nopFn = function(){};
    
    var Engine = function(width, height, options) {
        
        // Params
        this._width = width || window.innerWidth;
        this._height = height || window.innerHeight;
        
        this._debugMode = !!options.debugMode;
        
        // Initialization //TODO
        this._scene = this._initScene();
        
        this._camera = this._initCamera(
            options.camX || 0, 
            options.camY || 0, 
            options.camZ || 0
        );
        
        this._controls = this._initControls(this._camera);
        
        this._renerer = this._initRenderer(
            this._width, 
            this._height, 
            options.clearColor
        );
        
        
        this._addLights();
        
        // if Debug Mode
        if (this._debugMode) {
            this._addAxis(
                options.axisX || 0, 
                options.axisY || 0, 
                options.axisZ || 0
            );
        }
        
        this._startRendering();
    };
    
    Engine.prototype = {
        getEl: function() {
            return this._renerer.domElement;
        },
        
        setSize: function(width, height) {
            // TODO
        },
        
        cameraPos: function(x, y, z) {
            if (!arguments.length) {
                return {
                    x: this._camera.position.x,
                    y: this._camera.position.y,
                    z: this._camera.position.z
                }
            }
            
            if (x !== null) {
                this._camera.position.x = x;
            }
            if (y !== null) {
                this._camera.position.x = y;
            }
            if (z !== null) {
                this._camera.position.z = z;
            }
        },
        
        loadModel: function(modelObjFile, textureFile) {
            return Promise.all([
                this._loadObj(modelObjFile),
                this._loadImage(textureFile)
            ]).then(function(res) {
                var object = res[0],
                    image = res[1],
                    texture;
                
                if (image) {
                    if (image instanceof THREE.Texture) {
                        texture = image;
                    } else {
                        texture = new THREE.Texture();
                        texture.image = image;
                        texture.needsUpdate = true;
                    }
                    
                    
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material.map = texture;
                        }
                    });
                }
                
                return Promise.resolve(object);
            });
        },
        
        addModel: function(model, x, y, z) {
            model.position.set(x || 0, y || 0, z || 0);
            this._scene.add(model);
        },
        
        removeModel: function(model) {
            this._scene.remove(model);
        },
        
        debugMode: function(isDebugEnable) {
            if (arguments.length) {
                this._debugMode = !!isDebugEnable;
            } else {
                return this._debugMode;
            }
        },
        
        _initScene: function() {
            return new THREE.Scene();
        },
        
        _initRenderer: function(width, height, clearColor) {
            var renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true // TODO
            });
            
            renderer.setClearColor(clearColor || 0x000000, 0); //TODO
            renderer.setSize(width, height);
            
            return renderer;
        },
        
        _initCamera: function(x, y, z) {
            var camera = new THREE.PerspectiveCamera(
                45, this._width / this._height, 0.1, 1000);
            
            camera.position.set(x || 0, y || 0, z || 0);
            
            return camera;
        },
        
        _initControls: function(camera) {
            return new THREE.DeviceOrientationControls(camera);
        },
        
        
        _addLights: function(scene) {
            var ambient = new THREE.AmbientLight( 0xffffff );
            this._scene.add(ambient);
        },
        
        _addAxis: function(x, y, z) {
            var axis = new THREE.AxisHelper(20);
            axis.position.set(x || 0, y || 0, z || 0);
            this._scene.add(axis);
            return axis;
        },
        
        _loadImage: function(path) {
            if (!path) {
                return Promise.resolve(null);
            }
            
            var loaderClass = path.split('.').pop() === 'tga' 
                    ? 'TGALoader' 
                    : 'ImageLoader',
                loader = new THREE[loaderClass]();
            
            return new Promise(function(resolve, reject) {
                loader.load(path, function(image) {
                    resolve(image);
                }, nopFn, reject);
            });
        },
        
        _loadObj: function(objFile) {
            var loader = new THREE.OBJLoader();
            
            return new Promise(function(resolve, reject) {
                loader.load(objFile, resolve, nopFn, reject);
            });
        },
        
        _startRendering: function() {
            var scene = this._scene,
                controls = this._controls,
                camera = this._camera,
                renderer = this._renerer;
            
            var animate = function () {
                window.requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        }
    };
    
    PocGo.Engine = Engine;
    return PocGo;
})(PocGo || {}, THREE);
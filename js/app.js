(function() {
    'use strict';
    
    var MODEL_PATH = './res/bulbasaur/bulbasaur.obj',
        TEXTURE_PATH = './res/bulbasaur/textures/bulbasaur.tga';
    
    var engine = new PocGo.Engine(
        window.innerWidth, 
        window.innerHeight, 
        {
            debugMode: true,
            
            camX: 0,
            camY: 1,
            camZ: 2
        }
    );
    
    var camera = new PocGo.Camera(),
        cameraVideo = camera.getVideo(),
        canvasElement = engine.getEl();
    
    cameraVideo.className = 'pocgo-bg-video';
    canvasElement.className = 'pocgo-engine';
    
    engine.loadModel(MODEL_PATH, TEXTURE_PATH)
        .then(function(model) {
            model.rotation.y = Math.PI;
            engine.addModel(model);
        });
    
    document.body.appendChild(cameraVideo);
    document.body.appendChild(canvasElement);
    
    camera.getSources().then(function(sources) {
        if (!sources || !sources[0]) {
            throw new Error('Sources of the video is not found'); // TODO
            return;
        }
        
        var options = sources.map(function(source) {
            return '<option value="' + 
                (source.id || source.deviceId) + '">' + source.label // TODO Label
                + '</option>';
        });
        
        var selectEl = document.querySelector('.sources-select');
        selectEl.innerHTML = options.join('');
        selectEl.addEventListener('change', function() {
            camera.setSource(selectEl.value);
        });
        
        camera.setSource(sources[0]);
        
        return camera.start();
    }).catch(function(error) {
        alert(error);
    });
    
    
    window.addEventListener('resize', function() {
        camera.setFullScreenSize();
    })
})();
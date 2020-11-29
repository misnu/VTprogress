// namespace our game

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();
var VT = {

    // set up some initial values
    WIDTH: 320, 
    HEIGHT:  480, 
    scale:  1,
        // the position of the canvas
        // in relation to the screen
        offset: {top: 0, left: 0},
        // store all bubble, touches, particles etc
        entities: [],
        // the amount of game ticks until
        // we spawn a bubble
        nextBubble: 100,
        // for tracking player's progress
        score: {
            taps: 0,
            hit: 0,
            escaped: 0,
            accuracy: 0
        },
    // we'll set the rest of these
    // in the init function
    RATIO:  null,
    currentWidth:  null,
    currentHeight:  null,
    canvas: null,
    ctx:  null,
    ua:  null,
    android: null,
    ios:  null,
    
    init: function() {
    
        // the proportion of width to height
        VT.RATIO = VT.WIDTH / VT.HEIGHT;
        // these will change when the screen is resized
        VT.currentWidth = VT.WIDTH;
        VT.currentHeight = VT.HEIGHT;
        // this is our canvas element
        VT.canvas = document.getElementsByTagName('canvas')[0];
        // setting this is important
        // otherwise the browser will
        // default to 320 x 200
        VT.canvas.width = VT.WIDTH;
        VT.canvas.height = VT.HEIGHT;
        // the canvas context enables us to 
        // interact with the canvas api
        VT.ctx = VT.canvas.getContext('2d');
    
        VT.ua = navigator.userAgent.toLowerCase();
        VT.android = VT.ua.indexOf('android') > -1 ? true : false;
        VT.ios = ( VT.ua.indexOf('iphone') > -1 || VT.ua.indexOf('ipad') > -1  ) ? 
        true : false;
        VT.wave = {
                x: -25, // x coord of first circle
                y: -40, // y coord of first circle
                r: 50, // circle radius
                time: 0, // we'll use this in calculating the sine wave
                offset: 0 // this will be the sine wave offset
            }; 
            // calculate how many circles we need to 
            // cover the screen width
            VT.wave.total = Math.ceil(VT.WIDTH / VT.wave.r) + 1;
       
        // init background 
        background = new Image();
        background.src = 'image/bg.png';

        wtrng = new Image();
        wtrng.src = 'image/wateringbg.png';

        wtr = new Image();
        wtr.src = 'image/watering.png';

        seedbg = new Image();
        seedbg.src = 'image/seedbg.png';

        seed = new Image();
        seed.src = 'image/seedbag.png';

        pot = new Image();
        pot.src = 'image/pot.png';

        // we're ready to resize
        
        VT.resize();
        VT.loop();
    },
    update: function() {
        // update wave offset
        // feel free to play with these values for
        // either slower or faster waves
        VT.wave.time = new Date().getTime() * 0.002;
        VT.wave.offset = Math.sin(VT.wave.time * 0.8) * 5;
    },
    
    resize: function() {
    
        VT.currentHeight = window.innerHeight;
            // resize the width in proportion
            // to the new height
            VT.currentWidth = VT.currentHeight * VT.RATIO;
    
            // this will create some extra space on the
            // page, allowing us to scroll pass
            // the address bar, and thus hide it.
            if (VT.android || VT.ios) {
                document.body.style.height = (window.innerHeight + 50) + 'px';
            }
    
            // set the new canvas style width & height
            // note: our canvas is still 320x480 but
            // we're essentially scaling it with CSS
            VT.canvas.style.width = VT.currentWidth + 'px';
            VT.canvas.style.height = VT.currentHeight + 'px';
    
            // the amount by which the css resized canvas
            // is different to the actual (480x320) size.
            VT.scale = VT.currentWidth / VT.WIDTH;
            // position of canvas in relation to
            // the screen
            VT.offset.top = VT.canvas.offsetTop;
            VT.offset.left = VT.canvas.offsetLeft;
    
            // we use a timeout here as some mobile
            // browsers won't scroll if there is not
            // a small delay
            window.setTimeout(function() {
                    window.scrollTo(0,1);
            }, 1);
            
    },
        // this is where we draw all the entities
        render: function() {
    
            var i;
            
            
            VT.Draw.rect(0, 1, VT.WIDTH, VT.HEIGHT, '#93d6ff');
            VT.Draw.image(background);
            VT.Draw.image1(wtrng, 200,400,70,70);
            VT.Draw.image1(wtr, 210,405,50,50);
            VT.Draw.image1(seedbg, 0,400,70,70);
            VT.Draw.image1(seed, 18,410,38,38);
            VT.Draw.image1(pot, 90,280,110,110);
            // display snazzy wave effect
            for (i = 0; i < VT.wave.total; i++) {
    
                VT.Draw.circle(
                    VT.wave.x + VT.wave.offset +  (i * VT.wave.r), 
                    VT.wave.y,
                    VT.wave.r, '#fff'); 
            }
    
                // cycle through all entities and render to canvas
                for (i = 0; i < VT.entities.length; i += 1) {
                    VT.entities[i].render();
            }
           
    
        },
    
    
        // the actual loop
        // requests animation frame
        // then proceeds to update
        // and render
        loop: function() {
            
            VT.render();
            VT.update();
            requestAnimFrame( VT.loop );
            
        }
    
    };
    VT.Draw = {
    
    clear: function() {
        VT.ctx.clearRect(0, 0, VT.WIDTH, VT.HEIGHT);
    },
    
    
    rect: function(x, y, w, h, col) {
        VT.ctx.fillStyle = col;
        VT.ctx.fillRect(x, y, w, h);
    },
    
    circle: function(x, y, r, col) {
        VT.ctx.fillStyle = col;
        VT.ctx.beginPath();
        VT.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
        VT.ctx.closePath();
        VT.ctx.fill();
    },
    
    
    text: function(string, x, y, size, col) {
        VT.ctx.font = 'bold '+size+'px Monospace';
        VT.ctx.fillStyle = col;
        VT.ctx.fillText(string, x, y);
    },
    
    image: function(source) {
            var x = VT.canvas.width;
            var y = VT.canvas.height;
            VT.ctx.drawImage(source,0,0, x, y);
    },

    image1: function(source,x,y,v,z){
        VT.ctx.drawImage(source, x, y,v,z);
    }

    
    };
    
    window.addEventListener('load', VT.init, false);
    window.addEventListener('resize', VT.resize, false);
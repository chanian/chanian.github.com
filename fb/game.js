$(function () {
    var name = document.location.search.split("=")[1] || "player" + (Math.floor(1000*random()));
    var GROUND = 200;
    var width = 500;
    var height = 300;
    function clear(ctx) {
        ctx.fillStyle = '#d0e7f9';
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.closePath();
        ctx.fill();
    };

    function handleKeys () {
        var i, k;
        var keys = KeyboardJS.activeKeys();
        for (i = 0; i < keys.length; i++) {
            k = keys[i];
            if (k === 'up') {
                if (p.isGrounded()) {
                    p.y -= 10;
                    p.ys = -20;
                }
            } else if (k === 'right') {
                if (!p.isShooting())
                    p.xs = 10;
            } else if (k === 'left') {
                if (!p.isShooting())
                    p.xs = -10;
            } else if (k === 'space') {
                if (p.isGrounded() && !p.isShooting()) {
                    p.xs -= 1;
                    p.sprite.setAnimation('shoot');
                }
            }
        }
    };
    var player = function (c) {
        var obj = {};
        obj.ctx = c;
        obj.x = 0;
        obj.y = 0;
        obj.xs = 0;
        obj.ys = 0;
        obj.sprite = new Sprite(c);
        obj.tick = function () {
            this.move();
            this.draw();
        };
        obj.isShooting = function () {
            return this.sprite.getAnimation() == 'shoot';
        };
        obj.isGrounded = function () {
            return this.y === GROUND;
        }
        obj.move = function () {
            // in motion
            if (Math.abs(this.xs) > 0.5) {
                this.xs /= 1.2;
                if (this.isGrounded() && !this.isShooting()) {
                    this.sprite.setAnimation('run');
                }
            // stationary
            } else {
                this.xs = 0;
                if (this.isGrounded()) {
                    if (!this.isShooting()) {
                        this.sprite.setAnimation('stand');
                    }
                }
            }

            if (!this.isGrounded()) {
                this.ys += 3;
                this.sprite.setAnimation('jump');
                if (this.y + this.ys >= GROUND) {
                    this.ys = 0;
                    this.xs /= 2;
                    this.y = GROUND;
                }
            }

            this.x = Math.floor(this.x + this.xs);
            this.y = Math.floor(this.y + this.ys);
            this.sprite.setPosition(this.x, this.y);
        };
        obj.getSnapshot = function () {
            return {
                x: this.x,
                y: this.y,
                animation: this.sprite.getAnimation()
            };
        }
        obj.draw = function () {
            this.sprite.draw();
        };
        return obj;
    }
    var players = {};
    var firebase = new Firebase('http://delta.firebase.com/chanian/game')
    var mynode = firebase.child(name);

    function createPlayer (node) {
        // this is me!
        if (node.name() === name) { return; }
        var p = new Sprite(c);
        val = node.val();
        // p.update(val);
        players[node.name()] = p;

        // watch for updates on this node
        firebase.child(node.name()).on("value", function (update) {
            players[update.name()].update(update.val());
        });
    }

    function initWorld () {
        // initialize all existing peeps
        firebase.once('value', function (d) {
            d.forEach(createPlayer);
        });
        // listen for new peeps
        firebase.on('child_added', createPlayer);
    }
    function drawWorld () {
        var key, player;
        for(var key in players) {
            player = players[key];
            player.draw();
        }
    }
    function sendData () {
        mynode.set(p.getSnapshot());
    }

    var canvas = document.createElement("canvas");
    $("body").append(canvas);
    canvas.height = height;
    canvas.width = width;
    var c = canvas.getContext('2d');
    var p = player(c);
    initWorld();

    function loop () {
        // local game stuff
        handleKeys();
        clear(c);
        p.tick();

        // remote game stuff
        drawWorld();
        sendData();        

        // and then we wait
        setTimeout(loop, 40);
    }
    loop();
});
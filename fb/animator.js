var animations = {
    run: {
        name: 'run',
        xOffset: 104,
        yOffset: 0,
        x: [0, 33, 63, 96, 129, 160, 191, 226],
        w: [35,30, 34, 34,  32,  32,  35,  36],
        h: 43
    },
    stand: {
        name: 'stand',
        xOffset: 4,
        yOffset: 0,
        x: [0, 0, 31, 31, 60, 60, 31, 31],
        w: 29,
        h: 40
    },
    crouch: {
        name: 'crouch',
        xOffset: 265,
        yOffset: 496,
        x: [0,  32, 65, 98],
        w: [32, 32, 33, 33],
        h: 45,
        next: 'freeze'
    },
    jump: {
        name: 'jump',
        xOffset: 2,
        yOffset: 189,
        x: [0,  30, 60, 92, 122, 154, 185, 216, 248],
        w: [30, 30, 32, 30,  32,  30,  30,  30,  30],
        h: 48
    },
    shoot: {
        name: 'shoot',
        xOffset: 3,
        yOffset: 56,
        x: [0,  52, 108, 150],
        w: [52, 51,  41,  39],
        h: 40
    }
}
animations.shoot.next = animations.stand;
function Sprite (context, mag) {
    this.mag = mag || 1;
    this.tick = 0;
    this.frame = 0;
    this._x = 0;
    this._y = 0;
    this.animation = animations.jump;
    this.context = context;
    this.image = new Image();
    this.image.height = 30;
    this.image.width = 30;
    this.image.src = "./metalslug.png";
}
Sprite.prototype.update = function (snapshot) {
    this.setAnimation(snapshot.animation);
    this.setPosition(snapshot.x, snapshot.y);
}
Sprite.prototype.getAnimation = function () {
    return this.animation.name;
}
Sprite.prototype.setAnimation = function (a) {
    var animation = animations[a];
    if (animation && this.animation != animation) {
        this.animation = animation;
    }
};
Sprite.prototype.setPosition = function (x, y) {
    this._x = x;
    this._y = y;
};
Sprite.prototype.doTick = function () {
    this.tick++;
    this.frame = Math.floor(this.tick / 2);
    if (this.frame >= this.animation.x.length) {
        if (this.animation.next === 'freeze') {
            this.frame = this.animation.x.length - 1;
            return;
        } else if (this.animation.next) {
            this.animation = this.animation.next;
        }
        this.tick = 0;
        this.frame = 0;
    }
};
Sprite.prototype.getAnimationFrame = function () {
    var a = this.animation;
    return {
        x: this._x,
        y: this._y,
        xOffset: a.xOffset + a.x[this.frame],
        yOffset: a.yOffset + (a.y && a.y[this.frame] || 0),
        w: a.w[0] ? a.w[this.frame] : a.w,
        h: a.h
    };
};
Sprite.prototype.draw = function () {
    var f = this.getAnimationFrame();
    this.context.drawImage(this.image, f.xOffset, f.yOffset, f.w, f.h, this._x, this._y, f.w * this.mag, f.h * this.mag);
    this.doTick();
};


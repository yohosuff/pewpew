//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?

function update(progress) {
    if (input.up) {
        player.acceleration.y = -player.speed;
    } else if (input.down) {
        player.acceleration.y = player.speed;
    } else {
        player.acceleration.y = 0;
    }

    if (input.left) {
        player.acceleration.x = -player.speed;
    } else if (input.right) {
        player.acceleration.x = player.speed;
    } else {
        player.acceleration.x = 0;
    }

    const delta = progress / 1000;
    player.velocity.x += player.acceleration.x * delta;
    player.velocity.y += player.acceleration.y * delta;
    player.position.x += player.velocity.x * delta;
    player.position.y += player.velocity.y * delta;

    camera.follow(player);
    detectCollisions();
}

function detectCollisions() {
    const collidables = [player, wall];

    for(let i = 0; i < collidables.length - 1; ++i) {
        for(let j = i + 1; j < collidables.length; ++j) {
            const a = collidables[i];
            const b = collidables[j];

            if(
                a.position.x > b.position.x + b.width ||
                b.position.x > a.position.x + a.width ||
                a.position.y > b.position.y + b.height ||
                b.position.y > a.position.y + a.height
            ) {
                a.collision = b.collision = false;
                continue;
            }
            
            a.collision = b.collision = true;
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const drawables = [player, wall];

    drawables.forEach(drawable => {
        context.fillStyle = drawable.collision ? 'green' : drawable.color;
        context.fillRect(
            drawable.position.x - (camera.position.x - window.innerWidth / 2),
            drawable.position.y - (camera.position.y - window.innerHeight / 2),
            drawable.width,
            drawable.height
        );
    });
}

function loop(timestamp) {
    const progress = timestamp - lastRender;
    update(progress);
    draw();
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}

function keydown(event) {
    const direction = keyMap[event.code];
    input[direction] = true;
}

function keyup(event) {
    const direction = keyMap[event.code];
    input[direction] = false;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

////////////////////////////////////////////////////

const camera = {
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    follow: function(followee) {
        this.position.x = followee.position.x;
        this.position.y = followee.position.y;
    },
};

const player = {
    width: 50,
    height: 50,
    speed: 400,
    color: 'red',
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    acceleration: {
        x: 0,
        y: 0,
    },
};

const wall = {
    width: 100,
    height: 100,
    color: 'white',
    position: {
        x: 0,
        y: 0,
    }
};

player.position.x = window.innerWidth / 2 - player.width / 2;
player.position.y = window.innerHeight / 2 - player.height / 2;

camera.follow(player);

const input = {
    up: false,
    down: false,
    left: false,
    right: false,
};

const canvas = document.getElementsByTagName('canvas')[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

let lastRender = 0;
window.requestAnimationFrame(loop);

const keyMap = {
    'KeyW': 'up',
    'KeyS': 'down',
    'KeyA': 'left',
    'KeyD': 'right',
};

window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
window.addEventListener('resize', resize);
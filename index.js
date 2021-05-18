const player = {
    width: 50,
    height: 50,
    speed: 100,
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    }
};

const input = {
    up: false,
    down: false,
    left: false,
    right: false,
};

function update(progress) {
    if (input.up) {
        player.velocity.y = -player.speed;
    } else if (input.down) {
        player.velocity.y = player.speed;
    } else {
        player.velocity.y = 0;
    }

    if (input.left) {
        player.velocity.x = -player.speed;
    } else if (input.right) {
        player.velocity.x = player.speed;
    } else {
        player.velocity.x = 0;
    }

    const delta = progress / 1000;
    player.position.x += player.velocity.x * delta;
    player.position.y += player.velocity.y * delta;
}

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');
context.fillStyle = 'red';

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(player.position.x, player.position.y, player.width, player.height);
}

function loop(timestamp) {
    const progress = timestamp - lastRender;
    update(progress);
    draw();
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}

let lastRender = 0;
window.requestAnimationFrame(loop);

const keyMap = {
    'KeyW': 'up',
    'KeyS': 'down',
    'KeyA': 'left',
    'KeyD': 'right',
};

function keydown(event) {
    const direction = keyMap[event.code];
    input[direction] = true;
}

function keyup(event) {
    const direction = keyMap[event.code];
    input[direction] = false;
}

window.addEventListener("keydown", keydown)
window.addEventListener("keyup", keyup)
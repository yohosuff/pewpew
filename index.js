//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?

function update(progress) {
    handleInput();
    updatePositions(progress);
    detectCollisions();
}

function updatePositions(progress) {
    const delta = progress / 1000;

    const moveables = [
        player1,
        player2,
    ];

    moveables.forEach(moveable => {
        moveable.velocity.x += moveable.acceleration.x * delta;
        moveable.velocity.y += moveable.acceleration.y * delta;
        moveable.position.x += moveable.velocity.x * delta;
        moveable.position.y += moveable.velocity.y * delta;    
    });

    camera.follow(player1);
}

function handleInput() {
    if (input.up) {
        player1.acceleration.y = -player1.speed;
    } else if (input.down) {
        player1.acceleration.y = player1.speed;
    } else {
        player1.acceleration.y = 0;
    }

    if (input.left) {
        player1.acceleration.x = -player1.speed;
    } else if (input.right) {
        player1.acceleration.x = player1.speed;
    } else {
        player1.acceleration.x = 0;
    }
}

function getDistanceBetweenPoints(a, b) {
    const distanceX = a.x - b.x;
    const distanceY = a.y - b.y;
    const distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
    return distance;
}

function getMagnitudeOfVector(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function detectCollisions() {
    const collidables = [
        player1,
        player2
    ];

    for(let i = 0; i < collidables.length - 1; ++i) {
        for(let j = i + 1; j < collidables.length; ++j) {
            const a = collidables[i];
            const b = collidables[j];

            const distance = getDistanceBetweenPoints(a.position, b.position);

            if(distance > a.radius + b.radius) {
                continue;
            }

            const normal = {
                x: b.position.x - a.position.x,
                y: b.position.y - a.position.y,
            }
            const magnitudeNormal = getMagnitudeOfVector(normal);
            normal.x /= magnitudeNormal;
            normal.y /= magnitudeNormal;
                        
            const magnitudeA = getMagnitudeOfVector(a.velocity);
            const magnitudeB = getMagnitudeOfVector(b.velocity);

            const relativeVelocity = {
                x: b.velocity.x - a.velocity.x,
                y: b.velocity.y - a.velocity.y,
            };
            const magnitudeRelativeVelocity = getMagnitudeOfVector(relativeVelocity);

            a.velocity.x = -normal.x * (magnitudeA - magnitudeRelativeVelocity);
            a.velocity.y = -normal.y * (magnitudeA - magnitudeRelativeVelocity);
            
            b.velocity.x = normal.x * (magnitudeB + magnitudeRelativeVelocity);
            b.velocity.y = normal.y * (magnitudeB + magnitudeRelativeVelocity);
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const drawables = [
        boundary,
        player1, 
        player2, 
    ];

    drawables.forEach(drawable => {
        //each drawable should draw itself... pass the context to drawable.draw()?
        context.fillStyle = drawable.color;
        context.beginPath();
        context.arc(
            drawable.position.x - (camera.position.x - window.innerWidth / 2), 
            drawable.position.y - (camera.position.y - window.innerHeight / 2),
            drawable.radius,
            0,
            2 * Math.PI
        );
        context.fill();
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

const player1 = {
    radius: 50,
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

const player2 = {
    radius: 50,
    color: 'white',
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

const boundary = {
    radius: 500,
    color: 'blue',
    position: {
        x: 0,
        y: 0,
    }
};

player2.position.y = player1.position.y; // - player1.radius;
player2.position.x = player1.position.x + player1.radius * 4;

camera.follow(player1);

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
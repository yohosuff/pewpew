//fun idea: fly around and shoot missiles at each other
//turret auto targets, can cycle targets, missiles track target, firing has cooldown?

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    toUnitVector() {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
    }

    dotProduct(v) {
        return this.x * v.x + this.y * v.y;
    }

    subtract(b) {
        const a = new Vector(this.x, this.y);
        a.x -= b.x;
        a.y -= b.y;
        return a;
    }

    multiplyByScalar(scalar) {
        const a = new Vector(this.x, this.y);
        a.x *= scalar;
        a.y *= scalar;
        return a;
    }
}

function update(progress) {
    handleInput();
    updatePositions(progress);
    handleCollisions();
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

function getDistanceBetweenPoints(a, b) {
    const distanceX = a.x - b.x;
    const distanceY = a.y - b.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return distance;
}

function handleCollisions() {
    const collidables = [
        player1,
        player2
    ];

    for(let i = 0; i < collidables.length - 1; ++i) {
        for(let j = i + 1; j < collidables.length; ++j) {
            const a = collidables[i];
            const b = collidables[j];
            
            if (!areColliding(a, b)) {
                continue;
            }

            collideElastically(a, b);
        }
    }
}

function areColliding(a, b) {
    const distance = getDistanceBetweenPoints(a.position, b.position);
    return distance <= a.radius + b.radius;
}

function collideElastically(a, b) {
    separateCollidees(a, b);
    const aVelocity = getNewVelocity(a, b);
    const bVelocity = getNewVelocity(b, a);
    a.velocity = aVelocity;
    b.velocity = bVelocity;
}

//https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_Balls1.cpp
function separateCollidees(a, b) {
    const distance = getDistanceBetweenPoints(a.position, b.position);
    const overlap = 0.5 * (distance - a.radius - b.radius);
    a.position.x -= overlap * (a.position.x - b.position.x) / distance;
    a.position.y -= overlap * (a.position.y - b.position.y) / distance;
    b.position.x += overlap * (a.position.x - b.position.x) / distance;
    b.position.y += overlap * (a.position.y - b.position.y) / distance;
}

//https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
function getNewVelocity(a, b) {
    const mass = 2 * b.mass / (a.mass + b.mass);
    const velocityDiff = a.velocity.subtract(b.velocity);
    const positionDiff = a.position.subtract(b.position);
    const dotProduct = velocityDiff.dotProduct(positionDiff);
    const magnitude = Math.pow(positionDiff.magnitude, 2);
    const rightSide = positionDiff.multiplyByScalar(mass * dotProduct / magnitude)
    return a.velocity.subtract(rightSide);
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

        if(drawable.velocity) {
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(
                `velocity.x: ${drawable.velocity.x.toFixed(1)}, velocity.y:  ${drawable.velocity.y.toFixed(1)}`,
                drawable.position.x - (camera.position.x - window.innerWidth / 2),
                drawable.position.y - (camera.position.y - window.innerHeight / 2)
            );
        }
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
    position: new Vector(0,0),
    velocity: new Vector(0,0),
    follow: function(followee) {
        this.position.x = followee.position.x;
        this.position.y = followee.position.y;
    },
};

const player1 = {
    radius: 50,
    mass: 1,
    speed: 400,
    color: 'red',
    position: new Vector(0,0),
    velocity: new Vector(0,0),
    acceleration: new Vector(0,0),
};

const player2 = {
    radius: 50,
    mass: 1,
    color: 'green',
    position: new Vector(0,0),
    velocity: new Vector(0,0),
    acceleration: new Vector(0,0),
};

const boundary = {
    radius: 500,
    color: 'blue',
    position: new Vector(0,0),
};

player2.position.y = player1.position.y;
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
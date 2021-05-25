import { Socket } from "socket.io-client";
import { EventName } from "../../server/src/event-name";

export class Input {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    socket: Socket;

    constructor(socket: Socket) {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.socket = socket;
    }

    keydown = (event: KeyboardEvent) => {
    
        let emit = false;
    
        switch (event.code) {
            case 'KeyW': emit = !this.up; this.up = true; break;
            case 'KeyS': emit = !this.down; this.down = true; break;
            case 'KeyA': emit = !this.left; this.left = true; break;
            case 'KeyD': emit = !this.right; this.right = true; break;
        }
    
        if (emit) {
            this.socket.emit(EventName.INPUT, {
                up: this.up,
                down: this.down,
                left: this.left,
                right: this.right,
            });
        }
    }
    
    keyup = (event: KeyboardEvent) => {
    
        let emit = false;
    
        switch (event.code) {
            case 'KeyW': emit = !!this.up; this.up = false; break;
            case 'KeyS': emit = !!this.down; this.down = false; break;
            case 'KeyA': emit = !!this.left; this.left = false; break;
            case 'KeyD': emit = !!this.right; this.right = false; break;
        }
    
        if (emit) {
            this.socket.emit(EventName.INPUT, {
                up: this.up,
                down: this.down,
                left: this.left,
                right: this.right,
            });
        }
    }
}

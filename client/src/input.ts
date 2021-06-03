import { Subject } from "rxjs";

export class Input {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;

    public inputChange: Subject<any>;

    constructor() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.inputChange = new Subject<any>();
    }

    listenForKeyboardEvents() {
        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));
    }

    keydown(event: KeyboardEvent) {
    
        let changed = false;
    
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                changed = !this.up; this.up = true; break;
            case 'ArrowDown':
            case 'KeyS':
                changed = !this.down; this.down = true; break;
            case 'ArrowLeft':
            case 'KeyA':
                changed = !this.left; this.left = true; break;
            case 'ArrowRight':
            case 'KeyD':
                changed = !this.right; this.right = true; break;
        }
    
        if (changed) {
            const inputDto = this.getInputDto();
            this.inputChange.next(inputDto);
        }
    };
    
    keyup(event: KeyboardEvent) {
    
        let changed = false;
    
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': 
                changed = !!this.up; this.up = false; break;
            case 'ArrowDown':
            case 'KeyS': 
                changed = !!this.down; this.down = false; break;
            case 'ArrowLeft':
            case 'KeyA': 
                changed = !!this.left; this.left = false; break;
            case 'ArrowRight':
            case 'KeyD': 
                changed = !!this.right; this.right = false; break;
        }
    
        if (changed) {
            const inputDto = this.getInputDto();
            this.inputChange.next(inputDto);
        }
    };

    getInputDto() {
        return {
            up: this.up,
            down: this.down,
            left: this.left,
            right: this.right,
        };
    };
}

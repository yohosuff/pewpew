import { Subject } from "rxjs";
import { IMenuState } from "./menu-state-interface";
import { IndividualInput } from "./individual-input";

export class Input {
    public movementChange: Subject<any>;
    movementMappings: Map<string, IndividualInput>;
    moveUp: IndividualInput;
    moveDown: IndividualInput;
    moveLeft: IndividualInput;
    moveRight: IndividualInput;
    
    public menuChange: Subject<any>;
    menuMappings: Map<string, IndividualInput>;
    setName: IndividualInput;

    constructor() {
        this.movementChange = new Subject<any>();
        this.movementMappings = new Map<string, IndividualInput>();
        this.moveUp = new IndividualInput();
        this.moveDown = new IndividualInput();
        this.moveLeft = new IndividualInput();
        this.moveRight = new IndividualInput();
        this.mapInput(this.movementMappings, ['ArrowUp', 'KeyW'], this.moveUp);
        this.mapInput(this.movementMappings, ['ArrowDown', 'KeyS'], this.moveDown);
        this.mapInput(this.movementMappings, ['ArrowLeft', 'KeyA'], this.moveLeft);
        this.mapInput(this.movementMappings, ['ArrowRight', 'KeyD'], this.moveRight);
        
        this.menuChange = new Subject<any>();
        this.menuMappings = new Map<string, IndividualInput>();
        this.setName = new IndividualInput();
        this.mapInput(this.menuMappings, ['Escape'], this.setName);
    }

    mapInput(mappings: Map<string, IndividualInput>, codes: string[], input: IndividualInput) {
        codes.forEach(code => {
            mappings.set(code, input);
        });
    }

    listenForKeyboardEvents() {
        window.addEventListener('keydown', event => this.handleKeyboardEvent(event, 'down'));
        window.addEventListener('keyup', event => this.handleKeyboardEvent(event, 'up'));
    }

    handleKeyboardEvent(event: KeyboardEvent, direction: string) {
        this.handleMovement(event, direction);
        this.handleMenu(event, direction);
    };

    updateInput(mappings: Map<string, IndividualInput>, event: KeyboardEvent, direction: string): boolean {
        const input = mappings.get(event.code);
        if(!input) { return false; }
        const changed = direction === 'down' ? !input.pressed : input.pressed;
        input.pressed = direction === 'down';
        return changed;
    }
    
    handleMovement(event: KeyboardEvent, direction: string) {
        const changed = this.updateInput(this.movementMappings, event, direction);

        if (changed) {
            const state = this.getMovementState();
            this.movementChange.next(state);
        }
    }

    handleMenu(event: KeyboardEvent, direction: string) {
        const changed = this.updateInput(this.menuMappings, event, direction);

        if (changed) {
            const state = this.getMenuState();
            this.menuChange.next(state);
        }
    }

    getMovementState() {
        return {
            up: this.moveUp.pressed,
            down: this.moveDown.pressed,
            left: this.moveLeft.pressed,
            right: this.moveRight.pressed,
        };
    };

    getMenuState(): IMenuState {
        return {
            setName: this.setName.pressed,
        }
    }
}



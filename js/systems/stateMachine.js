export class StateMachine {
    constructor(owner) {
        this.owner = owner;
        this.states = {};
        this.currentState = null;
        this.currentStateName = '';
        this.previousStateName = '';
    }

    addState(name, state) {
        this.states[name] = state;
        state.machine = this;
        state.owner = this.owner;
    }

    setState(name, ...args) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        this.previousStateName = this.currentStateName;
        this.currentStateName = name;
        this.currentState = this.states[name];
        if (this.currentState && this.currentState.enter) {
            this.currentState.enter(...args);
        }
    }

    update(dt) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(dt);
        }
    }

    isState(name) {
        return this.currentStateName === name;
    }
}

export class State {
    constructor() {
        this.machine = null;
        this.owner = null;
        this.timer = 0;
    }

    enter() { this.timer = 0; }
    update(dt) { this.timer += dt; }
    exit() {}
}

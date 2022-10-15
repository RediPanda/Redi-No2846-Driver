const { Screen } = require("../../lib/hook_screen");

class TestBScreen extends Screen {
    constructor() {
        super("testbscreen", 550);
    }

    render() {
        return [
            "First row!",
            "Second row!"
        ]
    }

    tick(stack) {
        if ((this.m_tick % 10) === 0) stack.freeze("bottom");

        if ((this.m_tick % 20) === 0) stack.unfreeze("bottom");

        return [
            `BTick: ${this.m_tick}`,
            `BTick: (F) ${this.m_tick}`
        ]
    }

    onClockwise(intake) {
        console.log(`Speed C: ${intake}`);
    }

    onAnticlockwise(intake) {
        console.log(`Speed AC: ${intake}`);
    }
}

module.exports = TestBScreen;
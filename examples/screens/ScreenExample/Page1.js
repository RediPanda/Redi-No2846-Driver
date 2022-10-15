const { Screen } = require("../../../lib/hook_screen");

class PageAScreen extends Screen {
    m_display = 5;

    constructor() {
        super("testbscreen", 500);
    }

    prepare() {
        let id = setInterval(() => {
            this.m_display -= 1;
        }, 1000);
        return id;
    }

    render() {
        return [
            "This is page 1!",
            "Switching in 5s"
        ]
    }

    tick(stack) {
        return [
            "This is page 1!",
            `Switching in ${this.m_display}s`
        ]
    }

    onClockwise(stack, intake) {
        console.log(`Speed C: ${intake}`);
    }

    onAnticlockwise(stack, intake) {
        console.log(`Speed AC: ${intake}`);
    }
}

module.exports = PageAScreen;
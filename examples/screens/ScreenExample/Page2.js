const { Screen } = require("../../../lib/hook_screen");

class PageBScreen extends Screen {
    m_display = 0;

    constructor() {
        super("testbscreen", 500);
    }

    prepare() {
        let id = setInterval(() => {
            this.m_display += 1;
        }, 1000);
        return id;
    }

    render() {
        return [
            "This is page 2!",
            "Page on for 0s"
        ]
    }

    tick(stack) {
        return [
            "This is page 2!",
            `Page on for ${this.m_display}s`
        ]
    }

    onClockwise(stack, intake) {
        console.log(`Speed C: ${intake}`);
    }

    onAnticlockwise(stack, intake) {
        console.log(`Speed AC: ${intake}`);
    }
}

module.exports = PageBScreen;
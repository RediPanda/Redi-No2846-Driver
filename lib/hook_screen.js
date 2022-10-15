// (This is an extension of the kit. This file is not necessary for the barebone kit!)
/**
 * This file contains the templating contents of a "screen" for a "screenstack".
 */
const { readFileSync, readdirSync } = require("fs")
const { performance } = require("perf_hooks")

class Screen {
    m_id;
    m_tick = 0;
    m_tickspeed; /* In milliseconds */

    constructor(id, tickspeed = 1000) {
        this.m_id = id;
        this.m_tick = 0;
        this.m_tickspeed = tickspeed;
    }

    /**
     * The prepare method is here to allow the screen to setup the necessary time-consuming tasks.
     * Screens are not designed for block-waiting async results. It's designed to receive an instantaneous structure of the screen.
     * It is standard for the screen renderer (tick()) to read the data off from the "screen memory" rather than managing it either per-tick or first-paint;
     * rather any tasks that require "live data", manipulation of data, must be done here.
     */
    async prepare(stacker) {
        return; // Prepare *NEEDS* to return the interval ID if there is any here.
    }

    /**
     * Return the contents of the screen on first-paint.
     */
    render(stacker) {
        return [
            "Hey there chief!",
            "I am a unicorn"
        ]
    }

    /**
     * Run any dynamic/changing contents of the screen.
     * This method runs (0.25s (lower-bound) -> inf) per cycle.
     */
    tick(stacker) {
        return [
            "No tick.", 
            "No tick."
        ]
    }

    /**
     * Polled from Kit -> ScreenManager -> Screen (this!)
     */
    onClockwise(stack, acc) {
        return;
    }

    onAnticlockwise(stack, acc) {
        return;
    }

}

/**
 * This class is responsible for handling the stack operations and App implementation.
 */
class ScreenManager {
    m_App;
    m_ScreensDir;

    /* Stack */
    m_stack = [];
    m_reader = 0;

    /* Row Data */
    m_freeze = {
        top: false,
        bottom: false
    }

    m_text = {
        top: "no data",
        bottom: "no data"
    }

    /* Tick */
    m_intervalid;
    m_internal_clock_id; /* Clock id from the prepare method. */

    constructor(App, dir) {
        this.m_App = App;
        this.m_ScreensDir = dir;

        // Load all the screens into stack memory.
        let screens = readdirSync(dir);
        
        // Read per file, and mount into stack.
        for (const file of screens) {
            try {
                this.add(file);
            } catch(err) {
                console.log("[Screen Manager]: There was an issue adding to the stack!");
                console.log(err);
            }
        }
    }

    /* Add a screen to the stack */
    add(filename) {
        let module = require(`../${this.m_ScreensDir}/${filename}`);
        let screen = new module();

        this.m_stack.push({instance: screen});
    }

    /* Start the Screen Stack Display. */
    start() {
        // We offset the reader so we can push right into the beginning screen.
        this.m_reader = -1;
        this.push();

        // We actually attach the events listeners here, since this boots off once and dynamically triggers on the active screen only.
        let speedStat = {
            lastC: performance.now() - 10000,
            lastAC: performance.now() - 10000,
        }

        this.m_App.on("onClockwise", () => {
            this.m_stack[this.m_reader].instance?.onClockwise(this, speed(performance.now() - speedStat.lastC));
            speedStat.lastC = performance.now();
        });

        this.m_App.on("onAnticlockwise", () => {
            this.m_stack[this.m_reader].instance?.onAnticlockwise(this, speed(performance.now() - speedStat.lastAC));
            speedStat.lastAC = performance.now();
        });
    }

    /* We go forward into the stack. */
    push() {
        this.m_reader++;
        // Handle wraparound. (top to bottom)
        if (this.m_reader > this.m_stack.length) this.m_reader = 0;

        // Clean out the old screen ticker.
        const clocks = [this.m_intervalid, this.m_internal_clock_id];
        for (const id of clocks) {
            clearInterval(id);
        }

        // Run the common method.
        this.print();
    }

    /* We go backward into the stack. */
    pop() {
        this.m_reader--;
        // Handle wraparound (bottom to top).
        if (this.m_reader < 0) this.m_reader = (this.m_stack.length - 1);

        // Clean out the old screen ticker.
        const clocks = [this.m_intervalid, this.m_internal_clock_id];
        for (const id of clocks) {
            clearInterval(id);
        }

        // Run the common method.
        this.print();
    }

    async print() {
        // Run prepare statement before first-paint.
        let internal_clock = await this.m_stack[this.m_reader].instance.prepare(this);
        if (internal_clock) {
            this.m_internal_clock_id = internal_clock;
        }

        // Paint the screen first.
        this.m_stack[this.m_reader].instance.render(this);

        let id = setInterval(() => {
            // console.log(this.m_stack[this.m_reader].instance)

            // Run the tick process.
            this.m_stack[this.m_reader].instance.m_tick += 1; // Increment the internal screen tick. (max. 100)
            if (this.m_stack[this.m_reader].instance.m_tick > 100) this.m_stack[this.m_reader].instance.m_tick = 1;

            const side = [{id: "top", index: 0}, {id: "bottom", index: 1}]

            // Run the tick operation.
            let text = this.m_stack[this.m_reader].instance.tick(this);

            // Run the update-per-row.
            for (const row of side) {
                if (!this.m_freeze[row.id]) {
                    // Save the row inside the stack memory.
                    this.m_text[row.id] = text[row.index];

                    // Push text into kit.
                    this.m_App.setText(row.id, text[row.index]);
                };
            }
        }, (this.m_stack[this.m_reader]?.instance.m_tickspeed >= 250 ? this.m_stack[this.m_reader].instance.m_tickspeed : 250));

        this.m_intervalid = id;
    }

    /* Useful for saving text for later on with (restoreRow()). */
    // (deprecated until needed.)
    saveRow() {

    }

    /* Useful for restoring the row's last saved content. */
    // (deprecated until needed.)
    restoreRow() {

    }

    /* Freeze the row from tick rendering. */
    freeze(row) {
        if (!["top", "bottom"].includes(row.toLowerCase())) {
            throw new Error("[freeze()]: (row) parameter can only be (top/bottom).")
        }

        this.m_freeze[row.toLowerCase()] = true;
    }

    /* Unfreeze the row for tick rendering. */
    unfreeze(row) {
        if (!["top", "bottom"].includes(row.toLowerCase())) {
            throw new Error("[unfreeze()]: (row) parameter can only be (top/bottom).")
        }

        this.m_freeze[row.toLowerCase()] = false;
    }
}

function speed(difference) {
    let speed = 0;

    // Some cool math that does.. fake-velocity.
    speed = (1/(difference)) * 100;

    if (speed >= 100) speed = 100;
    return speed;
}

module.exports = {
    Screen,
    ScreenManager
}
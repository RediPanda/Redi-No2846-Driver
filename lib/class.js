const HID = require('node-hid');
const { EventEmitter } = require('stream');

/**
 * This is the Kit class. It is responsible for handling the low-level interactions to the kit in an easy manner.
 */
class Kit extends EventEmitter {
    /**
     * This constructor takes the 2 unique Ids that corresponds to the Kit.
     * @param {string} prefix Class prefix for logging-related operations.
     * @param {*} usagePage 
     * @param {*} usage 
     */
    m_init = false;
    m_prefix = "Kit";
    m_usagePage;
    m_usage;

    /* Variables that stores the HID-Device */
    m_device; // Device interface.
    m_inf; // Device info.

    /* Variables that may serve useful later. */
    // Only use this in a read-only state.
    m_cache_top;
    m_cache_bottom;
    
    constructor(prefix, usagePage, usage) {
        super();
        this.m_prefix = prefix;
        this.m_usagePage = usagePage;
        this.m_usage = usage;

        this.reconnect(usagePage, usage);

        // The class should be ready now.
        this.m_cache_top = "e_init";
        this.m_cache_bottom = "e_init";

        // Register the listeners from the HID -> Kit class.
        // (Event) Data. (Also includes scroll-wheel.)
        this.m_device.on("data", (data) => {
            const view = new DataView(data.buffer);

            // Filter only the knob events.(The first byte buffer can be picked up from key-changes.)
            if (view.getInt8(0) !== -3) return;

            (view.getInt8(2) === 2 ? this.emit("onClockwise", {}) : this.emit("onAnticlockwise", {})) // Handle the rotary unit events.

            // We also past this event down to our "data" event for any other use-case.
            this.emit("onData", data);
        })

        // (Event) Error.
        this.m_device.on("error", (err) => {
            console.log(`[${this.m_prefix}]: Error has been emitted by the HID. (Device disconnected?)`);
            this.m_device.close(); // Close the device from other procedural calls.
            this.m_init = false; // Block kit access until device is available.

            // We also past this event down to our "error" event for higher-level handling..
            this.emit("onError", err);
        })
    }

    /**
     * If the higher-level app handles the error thrown, they can retry the device reconnection on their own.
     */
    reconnect(usagePage, usage) {
        // Register the device.
        let devices = HID.devices();

        this.m_inf = devices.find((d) => {
        	let isFranky = d.vendorId === 65277 && d.productId === 3;
        	return isFranky && d.usagePage === usagePage && d.usage === usage;
        });

        if (!this.m_inf) {
            // Handle the missing device from here.
            throw new Error(`Couldn't find the device with the identifiers: (UsagePage: ${usagePage} | Usage: ${usage})`);
        }

        this.m_device = new HID.HID(this.m_inf.path);
        if (!this.m_device) {
            // Handle any issues with the HID registration.
            throw new Error(`Couldn't register the device with the HID lib.`);
        }

        console.log(`[${this.m_prefix}]: Device loaded!`)
        this.m_init = true;
    }

    /**
     * This function is responsible for text interaction.
     * @param {string} pos // "top" || "bottom"
     * @param {string} text // 16 char limit.
     */
    setText(pos, text) {
        if (!this.m_init) throw new Error("Cannot access the Kit if it's not available!");
        // if (pos === "top") console.log(`API (${pos})    - [${text}]`);
        // else console.log(`API (${pos}) - [${text}]`);

        // Positional condition check.
        if (!["top", "bottom"].includes(pos.toLowerCase())) {
            throw new Error("[setRow()]: (Position) parameter can only be (top/bottom).")
        }

        // Text-size check (maximum).
        if (text.length > 16) {
            throw new Error(`[setRow()]: (Text) parameter has exceeded the maximum character limit! (expecting: 16, got: ${text.length})`)
        }

        /* [...] = ReporterId, ??, ??, 0x00 = top, 0x01 = bot, rest is textual data. */
        this[`m_cache_${pos.toLowerCase()}`] = text;
        this.m_device.write([0x00, 0xfd, 0x01, (pos.toLowerCase() === "top" ? 0x00 : 0x01), ...this.prepareText(text)]);
    }

    /**
     * Internal-use only. Used to convey string to Array<hex>.
     * @param {string} string The content to format from text -> hex.
     */
    prepareText(string) {
        if (!this.m_init) throw new Error("Cannot access the Kit if it's not available!");

        let arr = [];
        let max = 0;

	    for (let i = 0; i < string.length; i++) {
	    	arr.push(parseInt(`0x${Buffer.from(string[i], 'utf8').toString('hex')}`)); // I'm sure we can do a better job here LMAO.
            max = i;
	    }

        // Fill the left-over with space. (Fixes weird formatting symbol.)
        while (max < 16) {
            arr.push(0x20); // 0x20 = Space.
            max++;
        }

	    return arr;
    }

    /**
     * Clears the screen.
     */
    clear() {
        if (!this.m_init) throw new Error("Cannot access the Kit if it's not available!");

        const row = ["top", "bottom"];
        for (const pos of row) {
            this.setText(pos, " ");
        }
    }
}

module.exports = Kit;
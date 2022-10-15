const { Screen } = require("../../../lib/hook_screen");
const { AudioManager, DeviceManager} = require("../../../lib/hook_audio");
const { AuthProvider, generateRandomString } = require("../../../lib/hook_auth");
const { ScrollText } = require("../../components/scrolltext");
const { loadbar } = require("../../components/loadbar");

// Please modify this config line to your needs!
const config = {
    client_id: "CHANGE ME!",
    client_secret: "CHANGE ME!",
    auth_port: 4000,
    CSRF: generateRandomString(64),
    device_id: "CHANGE ME!"
};

class CurrentTrack extends Screen {
    
    m_top_var = "EDIT ROW";
    m_bot_var = "EDIT ROW";

    m_AudioMGR;

    last_vol = {
        up: performance.now(),
        down: performance.now(),
        lock: new Date().getTime(),
        //unit: 50
        unit: 50
    }

    constructor() {
        super("spotify_CurrentTrack", 450); // Changing this second parameter will change the speed of the text!
    }

    async prepare(stack) {
        const Auth = new AuthProvider(config.client_id, config.client_secret);
        await Auth.start(config); // Blocking call.

        // Prepare the Device Manager.
        const DeviceMGR = new DeviceManager(Auth);
        const mypc = await DeviceMGR.findById(config.device_id)

        // Prepare the AudioManager.
        this.m_AudioMGR = new AudioManager(Auth, mypc.id);

        // Run the AudioManager loop variables.
        // We'll pull song data every 1 second.

        this.m_top_var = new ScrollText("Waiting for Spotify response.");
        this.m_bot_var = new ScrollText(".  .  .  .  .  .  .  .  .  .");

        let id = setInterval(async () => {
            // Refresh content.
            let res = await this.m_AudioMGR.getCurrentlyPlaying();

            let trackname, artists = "", l_artists;
            trackname = res?.item?.name || "No track playing";
            l_artists = res?.item?.artists || [];

            for (const person of l_artists) {
                artists += `${person.name}, `
            }

            // Update volume changes if volume control was inactive.
            if ((performance.now() - this.last_vol.up) > 1500 && (performance.now() - this.last_vol.down) > 1500) {
                this.last_vol.unit = (await DeviceMGR.findById(config.device_id))?.volume_percent;

                // We can unfreeze the bottom row.
                stack.unfreeze("bottom");
            }

            // Edit if the track doesn't match the existing scroller text.
            if (this.m_top_var.get() !== trackname) this.m_top_var.edit(trackname);
            if (this.m_bot_var.get() !== artists) {
                // console.log(this.m_bot_var.get())
                // console.log(artists)
                this.m_bot_var.edit(artists);
            }
        }, 1000)

        return id;
    }

    render() { // Default render.
        return [
            "No track!",
            "No artist!"
        ]
    }

    tick(stack) { // Load the latest 
        // console.log(stack);
        // console.log(`tick: ${this.m_tick}`)

        return [
            `${this.m_top_var.pan()}`,
            `${this.m_bot_var.pan()}`
        ]
    }

    onClockwise(stack, intake) {
        // Ensure the row is frozen.
        stack.freeze("bottom")
        
        this.last_vol.unit += 1 * intake;
        if (this.last_vol.unit > 100) this.last_vol.unit = 100;
        this.last_vol["up"] = performance.now();

        stack.m_App.setText("bottom", "Vol |" + loadbar(this.last_vol.unit) + "|")

        setTimeout(() => {
            // 1100 - 1100 - 1000
            if ((performance.now() - this.last_vol.up) > 1100 && (performance.now() - this.last_vol.down) > 1100 && (new Date().getTime() - this.last_vol.lock) > 1000 ) {
                this.last_vol.lock = new Date().getTime();

                // console.log("Commit change; up (" + this.last_vol.unit + ")")
                this.m_AudioMGR.changeVolume(Math.round(this.last_vol.unit))
            }
        }, 1200)
    }

    onAnticlockwise(stack, intake) {
        // Ensure the row is frozen.
        stack.freeze("bottom")
        
        this.last_vol.unit -= 1 * intake;
        if (this.last_vol.unit < 0) this.last_vol.unit = 0;
        this.last_vol["down"] = performance.now();

        stack.m_App.setText("bottom", "Vol |" + loadbar(this.last_vol.unit) + "|")

        setTimeout(() => {
            // 1100 - 1100 - 1000
            if ((performance.now() - this.last_vol.up) > 1100 && (performance.now() - this.last_vol.down) > 1100 && (new Date().getTime() - this.last_vol.lock) > 1000 ) {
                this.last_vol.lock = new Date().getTime();

                // console.log("Commit change; down (" + this.last_vol.unit + ")")
                this.m_AudioMGR.changeVolume(Math.round(this.last_vol.unit))
            }
        }, 1200)
    }
}

module.exports = CurrentTrack;
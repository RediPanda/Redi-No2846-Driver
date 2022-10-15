// (This is an extension of an example. This file is not necessary for the barebone kit!)
const { default: axios } = require("axios");

/**
 * @file hook_audio.js
 * @author "Redi Panda_#0247"
 * @description Responsible for handling Kit <-> Spotify communications!
 */

/**
 * @class AudioManager
 * @description Responsible for the Web-API interactions.
 */
class AudioManager {
    m_init = false;

    // From the (DeviceManager).prepare()
    m_deviceid;
    m_auth;

    constructor(authprovider, deviceid) {
        if (!deviceid) throw new Error("AudioManager requires a device ID!")

        // Save to memory.
        this.m_deviceid = deviceid;
        this.m_auth = authprovider;
    }

    /* Returns whole REST object. */
    async getCurrentlyPlaying() {
        const res = await axios({
            method: "get",
            url: "https://api.spotify.com/v1/me/player/currently-playing",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Audio Manager]: Track lookup failed.")
            return;
        }

        return res?.data;
    }

    /* Changes the active player's volume (0-100) */
    async changeVolume(volumeRange) {
        const res = await axios({
            method: "PUT",
            url: "https://api.spotify.com/v1/me/player/volume",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            },
            params: {
                volume_percent: volumeRange,
                device_id: this.m_deviceid
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Audio Manager]: Volume change failed.")
            return;
        }

        return res;
    }

    /* Skip to the next queue's track */
    async skipNext() {
        const res = await axios({
            method: "post",
            url: "https://api.spotify.com/v1/me/player/next",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Audio Manager]: Track skip (next) failed.")
            return;
        }

        return res.data;
    }

    /* Skip to the previous queue's track (back-tracking) */
    async skipPrevious() {
        const res = await axios({
            method: "post",
            url: "https://api.spotify.com/v1/me/player/previous",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Audio Manager]: Track skip (previous) failed.")
            return;
        }

        return res.data;
    }

    /* Seek to a specific position. (millisecond) */
    async seekPosition(position) {
        const res = await axios({
            method: "put",
            url: "https://api.spotify.com/v1/me/player/seek",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            },
            params: {
                position_ms: position,
                device_id: this.m_deviceid
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Audio Manager]: Track skip (previous) failed.")
            return;
        }

        return res.data;
    }
}

/**
 * @class DeviceManager
 * @description Polls data from the Web-API specific to (Devices Available) to feed into the Audio Manager.
 */
class DeviceManager {
    m_auth;

    constructor(authprovider) {
        // Save to memory.
        this.m_auth = authprovider;
    }

    async getDevices() {
        if (!this.m_auth) throw new Error("Device Manager needs a token!");
        
        const res = await axios({
            method: "get",
            url: "https://api.spotify.com/v1/me/player/devices",
            headers: {
                'Authorization': `Bearer ${this.m_auth.getAccess()}`,
                'Content-Type': "application/json"
            }
        }).catch(err => {
            console.log(err?.response);
        })

        if (res?.data?.error) {
            console.log("[Device Manager]: Device lookup failed.")
            return [];
        }

        return res?.data?.devices || [];
    }

    /* Find the devices by ID. */
    async findById(id) {
        let devices = await this.getDevices(); // Fetch the latest devices available.
        return devices.find(dev => dev.id === id);
    }

    /* Find the devices by Name. (First-queue priority) */
    async findByName(name) {
        let devices = await this.getDevices(); // Fetch the latest devices available.
        return devices.find(dev => dev.name === name);
    }
}

module.exports = {
    AudioManager,
    DeviceManager
}
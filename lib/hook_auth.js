// (This is an extension of an example. This file is not necessary for the barebone kit!)
/**
 * This file is responsible to host a small HTTP server. It is only necessary for applications that require an "Authorization Code Flow" to receive
 * an access token and manages new token exchanges.
 */

const express = require("express");
const bodyParser = require('body-parser');
const open = require("open");
const { default: axios } = require("axios");
const crypto = require("crypto");

/**
 * @class AuthProvider
 * @description In charge of handling and validating tokens.
 */
class AuthProvider {

    /* Token-related vars. */
    m_token; // Always-active token.
    m_ref_token; // Refresh token.
    m_duetime; // Internal time checker. (Unix timestamp)

    /* EXT: PCKE */
    m_pcke;
    m_code_verifier;

    /* Provider variables */
    m_server;
    m_ready;

    /* Config variables */
    m_clientid;
    m_clientsecret;

    constructor(client_id, client_secret) {
        this.m_clientid = client_id;
        this.m_clientsecret = client_secret;
        this.m_code_verifier = generateRandomString(64);

        this.m_ready = false;
    }

    /* Starts the whole authentication flow and process. */
    async start(cnf) {
        // Generate PCKE.
        this.m_pcke = await sha256(this.m_code_verifier);
        
        let server = this.m_server;
        // Create server.
        server = new AuthServer(cnf?.auth_port || 4000);

        // Start and open server.
        server.start().open(cnf?.CSRF);

        // Prepare and check token.
        this.prompt(cnf?.auth_port, cnf?.CSRF);

        // Wait for the auth code to be ready.
        console.log("[Auth Provider]: Waiting for code...")
        await new Promise((resolve) => {
            function runner() {
                if (!server.m_code) {
                    // Still missing code. We'll try again in 100ms.
                    setTimeout(runner, 100);
                    return;
                }
                resolve();
            }
            runner();
        })

        console.log("[Auth Provider]: Code received! Generating access token and starting provider processes.")

        // Generate Access Token.
        await this.requestAccessToken(cnf?.auth_port, server.m_code);

        // Await until this token is prepared in memory.
        let client = this;
        await new Promise((resolve) => {
            function runner() {
                if (!client.m_token) {
                    // Still missing token. We'll try again in 100ms.
                    setTimeout(runner, 100);
                    return;
                }
                resolve();
            }
            runner();
        })

        // Everything is ready! Now run a function that loops over time that checks and regenerates the token!
        this.m_ready = true;
        this.runRefresh();
    }

    /* Prompt the user for Auth Code Flow */
    prompt(port, csrf) {
        const url = `https://accounts.spotify.com/authorize?response_type=code`
            + `&client_id=${encodeURIComponent(this.m_clientid)}`
            + `&scope=${encodeURIComponent("user-read-playback-state user-modify-playback-state user-library-read")}`
            + `&redirect_uri=${encodeURIComponent(`http://127.0.0.1:${port}/callback`)}`
            + `&state=${encodeURIComponent(csrf)}`
            + `&show_dialog=false` // This shows the Spotify screen on true.
            + `&code_challenge_method=S256`
            + `&code_challenge=${base64urlencode(this.m_pcke)}`

        console.log("-o----- ATTENTION! -----o-")
        console.log("In order for this applet to properly run it's operations, please provide consent to Spotify.\n");
        console.log("This app should've opened the link in a new browser window. If not, please copy and paste the link below!\n")
        console.log(url + "\n");
        console.log("-o--- -------------- ---o-")

        // Attempt to open via browser.
        open(url)
    }

    async requestAccessToken(port, i_code) {
        const res = await axios({
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            headers: {
                // 'Authorization': `Basic ${Buffer.from(`${this.m_clientid}:${this.m_clientsecret}`.toString('base64'))}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: "authorization_code",
                code: i_code,
                redirect_uri: `http://127.0.0.1:${port}/callback`,
                client_id: this.m_clientid,
                client_secret: this.m_clientsecret,
                code_verifier: this.m_code_verifier
            }
        }).catch(err => {
            console.log(err.response.data);
        })

        if (res?.data?.error) {
            console.log("[Auth Provider]: Authorisation failed.")
            return;
        }

        // Edit the new variables.
        // console.log(res.data);
        this.m_token = res.data.access_token;
        this.m_ref_token = res.data.refresh_token;
        this.m_duetime = new Date().getTime() + (1000 * 60 * 60); // Add an hour from now.
        return;
    }

    /* Runs every minute, check if we're in the 5 min expiry range. */
    async runRefresh() {
        console.log("[Auth Provider]: Token expiration module running...");
        setInterval(async () => {
            if ((this.m_duetime - new Date().getTime()) < (1000 * 60 * 5)) {
                console.log("[Auth Provider]: Token near expiry. Refreshing...");
                // Run the refresh token script.
                const res = await axios({
                    method: "POST",
                    url: "https://accounts.spotify.com/api/token",
                    headers: {
                        // 'Authorization': `Basic ${Buffer.from(`${this.m_clientid}:${this.m_clientsecret}`.toString('base64'))}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    params: {
                        grant_type: "refresh_token",
                        client_id: this.m_clientid,
                        refresh_token: this.m_ref_token
                    }
                }).catch(err => {
                    console.log("[Auth Provider]: (Axios) Refresh failed.")
                    console.log(err.response.data);
                })
        
                if (res?.data?.error) {
                    console.log("[Auth Provider]: Refresh failed.")
                    return;
                }

                // console.log(res?.data)

                // console.log("---- Post Debug Info");
                // console.log(`O_Token: ${this.m_token.substring(0, 6)} // N_Token: ${res.data.access_token.substring(0, 6)}`)
                // console.log(`O_Ref: ${this.m_ref_token.substring(0, 6)} // N_Ref: ${res.data.refresh_token.substring(0, 6)}`)

                this.m_token = res.data.access_token;
                this.m_ref_token = res.data.refresh_token;
                this.m_duetime = new Date().getTime() + (1000 * 60 * 60); // Add an hour from now.
            }
        }, 1000 * 60 * 1); 
    }

    /* MUST ALWAYS RETURN A VALID TOKEN. */
    getAccess() {
        return (this.m_ready) ? this.m_token : "not-ready";
    }
}

/**
 * @class AuthServer
 * @descrption In charge of exposing the applet for authenticating and receiving data from Spotify.
 */
class AuthServer {

    /* Server variables. */
    m_server;
    m_port;
    m_status = false;
    m_csrf;

    /* Important-session variables. */
    m_code; // Important for Refresh Tokens.

    constructor(port) {
        if (!port) throw new Error("Missing port argument in constructor!");

        // Setup light-weight express server.
        this.m_server = express();
        this.m_server.use(bodyParser.urlencoded({ extended: false }));

        // Register routes.
        this.m_server.get("/callback", (req, res) => {
            // Status check.
            if (!this.m_status) {
                return res.status(404).json({message: "Server not available."})
            }

            // CSRF check.
            if (req.query.state !== this.m_csrf) {
                console.log("[Auth Server]: CSRF check failed!")
                return res.status(404).json({message: "Server not available."})
            }

            // Error check.
            if (req.query?.error) {
                console.log("[Auth Server]: User failed to accept app consent form!")
                return res.status(500).json({message: "Unable to continue authentication flow. You must accept the app form in order for the applet to run correctly! Please re-run the node process to regenerate a new codeflow."})
            }

            // Save query variables.
            this.m_code = req.query.code;

            // Respond, save the variables.
            console.log("[Auth Server]: Consent received and authorisation confirmed.")
            res.status(200).json({message: "Thanks! You can now close this page :)"})

            // Close the server once the token is received.
            this.close();
        })

        this.m_port = port;
    }

    /* Bind service to the network interface. */
    start() {
        this.m_server.listen(this.m_port, () => {
            console.log(`[Auth Server]: Service running on http://127.0.0.1:${this.m_port}. Ready for authorisation requests!`)
        });

        return this;
    }

    /* Opens the Auth Server for requests. */
    open(csrf) {
        console.log("[Auth Server]: Service is open for authentication requests!");
        this.m_status = true;
        this.m_csrf = csrf;
    }

    /* Closes the Auth Server from receiving any requests. */
    close() {
        console.log("[Auth Server]: Service is closed from authentication requests!");
        this.m_status = false;
    }
}

const generateRandomString = (length) => {
    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
      { length: length },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomString = randomArray.join("");
    return randomString;
};

function base64urlencode(a) {
    // Convert the ArrayBuffer to string using Uint8 array.
    // btoa takes chars from 0-255 and base64 encodes.
    // Then convert the base64 encoded to base64url encoded.
    // (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain) { 
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await crypto.webcrypto.subtle.digest("SHA-256", data);
}

module.exports = {
    AuthProvider,
    generateRandomString
};
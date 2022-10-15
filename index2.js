const { ScreenManager } = require("./lib/hook_screen");
const Kit = require("./lib/class")

// Instantiate the app driver.
const App = new Kit("Kit", 65376, 97);

// Log when this (kit-error) event occurs.
App.on("onError", (err) => {
    console.log("Device disconnected(?) or another source of error.");
    console.log(err);
})

// Clear screen.
App.clear();

// Absorb the app into the Stack Manager.
const SM = new ScreenManager(App, "./examples/screens/Spotify");

SM.start();
// Done! The Screen Manager will handle the scroll events and the dynamic-changing screens.
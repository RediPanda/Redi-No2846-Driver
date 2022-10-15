const Kit = require("./lib/class")

// Instantiate the app driver.
const App = new Kit("Kit", 65376, 97);

// Log when this (knob-clockwise) event occurs.
App.on("onClockwise", () => {
    console.log("Clockwise!");
})

// Log when this (knob-anticlockwise) event occurs.
App.on("onAnticlockwise", () => {
    console.log("Anti Clockwise!");
})

// Log when this (kit-error) event occurs.
App.on("onError", (err) => {
    console.log("Device disconnected(?) or another source of error.");
    console.log(err);
})

// You can clear the screen via this function.
App.clear();

App.setText("top", "Welcome to kit!");

App.setText("bottom", "Turn the knob!");
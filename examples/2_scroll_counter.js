const Kit = require("./lib/class");

// Instantiate the app driver.
const App = new Kit("Kit", 65376, 97);

// Keep the high-level variable stored in the global scope.
let i = 0;

// Handle volume up with knob.
App.on("onClockwise", () => {
    i++;
})

// Handle volume down with knob.
App.on("onAnticlockwise", () => {
    i--;
})

// Init test
App.clear();
App.setText("bottom", `A simple test`)

setInterval(() => {
    App.setText("top", `Counter: ${i}`)
}, 50)
<h1 align="center">Welcome to Redi-No2846-Driver 👋</h1>
<p>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> A simple NodeJS library that can modify the No.2846 kit as a standalone, with some nifty additions!

## ✨ Insight
I've received the [Frankenstein No.2846](https://ezykeys.com/products/frankenstein-series-no-2846) as a present from my friends. Although the intention of the product was to bring out creativity and getting your hands dirty with it; the creators didn't publish any useful documentations nor provided any necessary SDK/tools.

I've wanted more out of the screen rather than displaying static text or polled stats from my PC. I wanted information from the web, I wanted the text to do things, seem more animated, fit more text than the 16 character limit of the LCD.

I have gone ahead and did some light reverse-engineering on the product to see how I could interact with the screen (which for me was the main selling point) and utilise the knob even better. After breaking the product down to it's raw components, analysing the patterns and connections I present you: The `Redi-No2846-Driver` library.

This small (`./lib/class.js`) file is the only file you'll need if you wish to interact with the product. The rest of the files are extensions off the class itself.

In the core, it serves it's only purpose. To change text, clear text, and respond to device events. (Knob up/down; Errors (disconnected)).

## 🔧 Install

Download the contents of this kit via clicking on the bright green buttom top right of the page and selecting the `Download ZIP` option.
Extract the contents in a folder on your Desktop or wherever you need it.

Please ensure that the following dependencies are met!
 - [NodeJS LTS](https://nodejs.org).

Once NodeJS has been installed on your computer, you can run the executable files (.bat/.sh) depending on what platform you're running.
This script/shell will automatically check-install the dependencies and run the target file (index.js).

```sh
[Windows]
"Double click on the (executable.bat) file."

[Linux/MacOS]
bash executable.sh
```

## Usage

By default, the `index.js` script has a working (simple) demo of how you can interact with the `Kit` and what methods are available to you.
If you want to use other features that also come pre-packed with the repository, please take a look at the `Examples` section of this document and see what is available for you to use which showcase a few great ideas on how to display more information out of your No. 2846 kit.

**It is expected for the end-user to have working-knowledge with the NodeJS ecosystem and Javascript. I cannot provide you any form of support or assistance with that; however I may be willing to lend a hand if you have experienced any issues getting the sample file to run, or have any questions with the hook providers (audio/auth/screen).**

## Examples
|Example | Documentation | Description |
|--|--|--|
|Default |[Docs](https://github.com/RediPanda/Redi-No2846-Driver/documentation/default.md) | Want the skeleton of the kit? See what function triggers and what you can do? This example is perfect and minimal for you!|
|Spotify |[Docs](https://github.com/RediPanda/Redi-No2846-Driver/documentation/spotify.md) | Want to see what song and artist is playing? This is the example you'd want to copy! Control the volume directly via the knob! |
|Scroll Counter|[Docs](https://github.com/RediPanda/Redi-No2846-Driver/documentation/scroller.md) | A simple counter app with the knob! |
|Weather|[Docs](https://github.com/RediPanda/Redi-No2846-Driver/documentation/weather.md) | Start your day off by checking the weather and temperature! |
|Screens|[Docs](https://github.com/RediPanda/Redi-No2846-Driver/documentation/screens.md) | Feeling advanced? Want to make something yourself? Utilise our screen hook! |

## Author

👤 **RediPanda**

* Github: [@RediPanda](https://github.com/RediPanda)
* Discord: **Redi Panda_#0247**

## 🤝 Contributing
Any new samples you want to contribute? Cool features or any bug fixes? 
Feel free to pop by and open a Pull Request!

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_

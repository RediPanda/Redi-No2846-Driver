@ECHO OFF
REM Suppress the command line to make it look cleaner.

REM A simple bat folder to run the node app without opening CMD. (WINDOWS ONLY.)
REM usage: Double-click this file.

REM Install all the pre-requisites first before running.
call npm install

REM Now we run this command.
node index.js

REM In case an issue occurs, we pause here.
PAUSE
/* Returns a loadbar (10 internal chars.) */
function loadbar(range) {
    let string = "          " // Empty buffer.

    // Write "=" for every whole 10ths.
    let max = -1;
    for (let i = 0; i < Math.floor(range / 10); i++) {
        string = setCharAt(string, i, "=");
        max = i;
    }

    if ((range % 10) > 4) {
        string = setCharAt(string, max + 1, "-");
    }

    return string;
}

module.exports = {
    loadbar
}

// Third-party functions.
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

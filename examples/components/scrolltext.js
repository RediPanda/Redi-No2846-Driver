/* A char buffer that can accept all lengths, and pan across the sequence over time. */
class ScrollText {
    
    m_buffer; /* Working buffer. */
    m_string; /* String original */
    constructor(istring) {
        this.m_buffer = [];
        this.m_string = istring;

        // Feed string into buffer.
        // console.log(istring);
        // console.log(typeof istring)
        this.m_buffer = istring.split("");

        // Add extra spacing till it hits the 16 char limit.
        for (let i = this.m_buffer.length; i < 16; i++) {
            this.m_buffer.push(" ");
        }

        // Extra spacing for clean scroll.
        for (let i = 0; i < 5; i++) {
            this.m_buffer.push(" ");
        }
    }

    /* Edit the scroller. */
    edit(istring) {
        /* Replica of the constructor */
        this.m_buffer = [];
        this.m_string = istring;

        // Feed string into buffer.
        this.m_buffer = istring.split("");

        // Add extra spacing till it hits the 16 char limit.
        for (let i = this.m_buffer.length; i < 16; i++) {
            this.m_buffer.push(" ");
        }

        // Extra spacing for clean scroll.
        for (let i = 0; i < 5; i++) {
            this.m_buffer.push(" ");
        }
    }

    get() {
        return this.m_string;
    }

    /* Pan the text to the right. Return new content. */
    pan() {
        let newchar = this.m_buffer.shift();
        
        let compile = [];
        for (let i = 0; i < 16; i++) {
            compile.push(this.m_buffer[i]);
        }

        // return new-char into the buffer.
        this.m_buffer.push(newchar);

        return compile.join('');
    }


}

module.exports = { 
    ScrollText
};
const themeToggle = document.getElementById("themeToggle");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
let typingBubble = null;

let recognition;
let isListening = false;
let isVoiceChat = false;

window.speechSynthesis.onvoiceschanged = () => {
    console.log(window.speechSynthesis.getVoices());
};

const connectd = async () => { 

    document.getElementById("connected").textContent = "🟡 Connecting...";
    try {
        const response = await fetch("http://127.0.0.1:5000");
        if (!response.ok) {
            throw new Error("Server Error");
        }
        document.getElementById("connected").textContent = "🟢 Connected"; 

    } catch (error) {
        document.getElementById("connected").textContent = "🔴 Not Connected";
        console.error(error)
    }
   
}


//   Load saved theme 
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "🔆";
}

// Toggle Theme
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "🔆";
    }
    else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
    }
})
connectd()

//  STT or TTS functions:-

// Function to start speech recognition
function startRecognition() {
    //  Create a new speech recognition object 
    recognition = new webkitSpeechRecognition();

    //Set Language
    recognition.lang = 'hi-IN';

    // Stop automatically after one sentence
    recognition.continuous = false;
    recognition.interimResults = true;

    // Event triggered when recognition starts
    recognition.onstart = () => {
        isListening = true; // Flag to indicate mic is active
        document.getElementById("micButton").style.backgroundColor = "red";
        console.log("Listening...");
    };



    // Event triggered when speech results are received
    recognition.onresult = (event) => {
        let transcript = '';

        // Loop through results and collect spoken text
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }

        // Put recognized speech into input box
        document.getElementById("messageInput").value = transcript;
    };


    // Handle errors during speech recognition
    recognition.onerror = (event) => {
        console.error("Speech error:", event.error);

        // If no speech detected and voice chat is active, restart listening
        if (event.error === 'no-speech' && isVoiceChat) {
            startRecognition();
        } else {
            // Stop listening and reset states
            isListening = false;
            isVoiceChat = false;
            document.getElementById("micButton").style.backgroundColor = "#1f2a48";
        };
    };


    // Event triggered when recognition ends
    recognition.onend = () => {
        const inputValue = document.getElementById("messageInput").value.trim();

        // If some text was captured, send the message
        if (inputValue !== '') {
            sendMessage();
        }

        // Otherwise stop and reset mic button
        isListening = false;
        document.getElementById("micButton").style.backgroundColor = "#1f2a48";
        console.log("Stopped Listening.");

    };

    // Start the speech recognition
    recognition.start();


};



// Function to toggle voice chat ON/OFF when mic button is clicked
function toggleVoice() {
    // Stop any currently speaking text-to-speech audio
    window.speechSynthesis.cancel();

    //  Check browser support or not Speech Recognition 
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    };

    //    If already listening, stop voice chat
    if (isListening) {
        isVoiceChat = false; // Turn off voice chat mode

        if (recognition) {
            recognition.stop(); // Stop recognition
        };

        // onend event will handle remaining cleanup
        console.log("Mic stopped by user");
    } else {
        // If not listening, start voice chat
        isVoiceChat = true;
        document.getElementById("messageInput").value = "";
        startRecognition(); // Begin listening 
    };

};

function speakText(text) {
    // Check if TTS is supported
    if (!window.speechSynthesis) {
        console.log("TTS not supported");
        return;
    }

    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
    }

    // Create speech utterance with given text
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice properties
    utterance.lang = 'hi-IN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
        if (isVoiceChat) {
            startRecognition();  // 🎤 Restart mic AFTER bot finishes speaking
        }
    };

    // Stop any previous speech before starting new one
    window.speechSynthesis.cancel();

    // Speak the text
    window.speechSynthesis.speak(utterance);
}


// Manage Overlay 
const overlay = document.getElementById("overlay");
menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
});


document.querySelectorAll(".chat_item").forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
        };
    });
});


// Keyboard keys (Enter) support button 
document.getElementById("messageInput").addEventListener("keydown", function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    };
});

// Input field height manage
const inputBox = document.getElementById("messageInput");

inputBox.addEventListener("input", () => {
    inputBox.style.height = "auto"
    inputBox.style.height = Math.min(inputBox.scrollHeight, 120) + "px";
});

//  Bubble creation 
function createTypingBubble() {
    const wrap = document.createElement("div");
    wrap.className = "chat-wrap";
    wrap.style.display = "flex";

    wrap.innerHTML = `
                        <div class="typing-bubble">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        </div>
`
    return wrap;
};


// Bot reply div function
function createBotDiv() {
    const div = document.createElement("div");
    div.style.alignSelf = "flex-start";
    div.style.backgroundColor = "var(--bot-msg)";
    div.style.color = "var(--text-main)";
    div.style.border = "1px solid var(--border-soft)";

    div.style.padding = "10px 14px";
    div.style.borderRadius = "12px 12px 12px 0";
    div.style.maxWidth = "70%";
    div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    div.style.fontSize = "1.1rem"
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.overflowWrap = "break-word";
    div.style.wordBreak = "break-word";
    div.style.height = "auto";

    return div;
};

// API Function 
const postData = async (url, data) => {
    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            throw new Error("Server Error");
        };

        //  Read the text from the response and create textdecoder object
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Create bot reply div
        const botDiv = createBotDiv();

        // Hide typing bubble from the chat section 
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        };

        // Append bot div in the chat section 
        chatBox.appendChild(botDiv);

        let fullReply = "";
        // Print bot reply 
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullReply += chunk;
            botDiv.textContent += chunk;

            chatBox.scrollTop = chatBox.scrollHeight;
        }

        if (isVoiceChat) {
            speakText(fullReply);
            // Do not reset isVoiceChat here to keep mode active
        }
    } catch (error) {
        const errorDiv = createBotDiv();
        errorDiv.textContent = "⚠️ Server is not responding. Please try again later.";

        chatBox.appendChild(errorDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        console.error(error);
        if (isVoiceChat) {
            speakText(fullReply);
            // Do not reset isVoiceChat here to keep mode active
        }
    } finally {
        // Hide typing bubble from the chat section 
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        };
    };
};

// Send Message Function
function sendMessage() {
    // Extract input, chatBox from html using id's
    input = document.getElementById("messageInput");
    chatBox = document.getElementById("chatBox");

    // Extract welcome_msg from html using id
    text_msg = document.getElementById("welcome_msg");
    text_msg.style.display = "none";

    // Create object user input value
    data = {
        message: input.value
    }

    // Check user input is null or not
    if (input.value.trim() === "") return;

    // Create a new element 'div' for user message 
    const msg = document.createElement("div");

    // Add CSS to the div 
    msg.textContent = input.value;
    msg.style.height = "auto";
    msg.style.alignSelf = 'flex-end';
    msg.style.backgroundColor = "var(--user-msg)";
    msg.style.color = "white";
    msg.style.padding = "10px 14px";
    msg.style.borderRadius = "12px 12px 0px 12px";
    msg.style.maxWidth = "70%";
    msg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15";
    msg.style.whiteSpace = "pre-wrap";
    msg.style.wordWrap = "break-word";
    msg.style.overflowWrap = "break-word";
    msg.style.wordBreak = "break-word";
    msg.style.maxWidth = "70%";

    //  Append div to the parent(chatBox)
    chatBox.appendChild(msg);

    // Control Typing Indicator
    if (typingBubble) {
        typingBubble.remove();
        typingBubble = null;
    }

    // Create Typing Bubble and append it into chatBox 
    typingBubble = createTypingBubble();
    chatBox.appendChild(typingBubble);

    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = "";

    // POST API 
    postData("http://127.0.0.1:5000/chat", data);

};


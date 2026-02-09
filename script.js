const themeToggle = document.getElementById("themeToggle");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const parent_chat = document.getElementById("recent_chat_parent")
const newChats = document.getElementById("new_chat");
const chats = JSON.parse(localStorage.getItem("chats")) || [];
let typingBubble = null;
const chatBox = document.getElementById("chatBox");
const language = 'hi-IN'

let recognition;
let isListening = false;
let isVoiceChat = false;

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

const connectd = async () => {

    document.getElementById("connected").textContent = "🟡 Connecting...";
    try {
        const response = await fetch("http://127.0.0.1:5000");
        if (!response.ok) { throw new Error("Server Error"); }

        document.getElementById("connected").textContent = "🟢 Connected";
    }
    catch (error) {
        document.getElementById("connected").textContent = "🔴 Not Connected, Please reload the page"; console.error(error)
    }
}

setTimeout(() => {
    document.getElementById("connected").textContent = "🔴 Not Connected, Please reload the page";
    connectd();
}, 4000);

async function toHinglish(text) {
    try {
        const url = "https://inputtools.google.com/request?itc=hi-t-i0-und&num=1";

        const res = await fetch(url, {
            method: "POST",
            body: text
        });

        const data = await res.json();

        if (data[0] === "SUCCESS") {
            return data[1][0][1][0]; // Best transliteration
        }

        return text;
    } catch (e) {
        console.error("Transliteration failed:", e);
        return text;
    }
}

function cleanForSpeech(text) {
    return text
        // Emojis remove
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
        // Markdown symbols remove (*, _, #, `)
        .replace(/[*_#`~]/g, '')
        // Url
        .replace(/https?:\/\/\S+/g, '')
        // Extra spaces fix
        .replace(/\s+/g, ' ')
        .trim();

}


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



//  STT or TTS functions:-

// Function to start speech recognition
async function startRecognition() {
    //  Create a new speech recognition object 
    recognition = new webkitSpeechRecognition();

    //Set Language
    recognition.lang = language;

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
    utterance.lang = language;
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
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "text/plain"
                },
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
            fullReply += chunk
            if (isVoiceChat) {
                const speakable = cleanForSpeech(fullReply);
                speakText(speakable);
                // Do not reset isVoiceChat here to keep mode active
            }
            botDiv.innerHTML =  marked.parse(fullReply);

            chatBox.scrollTop = chatBox.scrollHeight;
        }

    } catch (error) {
        const errorDiv = createBotDiv();
        errorDiv.textContent = "⚠️ Server is not responding. Please try again later.";

        chatBox.appendChild(errorDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        console.error(error);
        // if (isVoiceChat) {
        //     speakText(fullReply);
        //     // Do not reset isVoiceChat here to keep mode active
        // }
    } finally {
        // Hide typing bubble from the chat section 
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        };
    };
};

// Send Message Function
async function sendMessage() {
    const input = document.getElementById("messageInput");
    const chatBox = document.getElementById("chatBox");
    const text_msg = document.getElementById("welcome_msg");

    if (input.value.trim() === "") return;

    text_msg.style.display = "none";
    document.getElementById("connected").style.display = "none";

    chatBox.style.justifyContent = "flex-start";
    chatBox.style.alignItems = "stretch";


    const cleanText = await toHinglish(input.value);

    const data = {
        message: cleanText
    };


    const msg = document.createElement("div");
    // msg.textContent = input.value;
    msg.textContent = cleanText;
    msg.style.alignSelf = 'flex-end';
    msg.style.backgroundColor = "var(--user-msg)";
    msg.style.color = "white";
    msg.style.padding = "10px 14px";
    msg.style.borderRadius = "12px 12px 0px 12px";
    msg.style.maxWidth = "70%";
    msg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    msg.style.whiteSpace = "pre-wrap";

    chatBox.appendChild(msg);

    if (typingBubble) typingBubble.remove();
    typingBubble = createTypingBubble();
    chatBox.appendChild(typingBubble);

    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = "";

    postData("http://127.0.0.1:5000/chat", data);
}


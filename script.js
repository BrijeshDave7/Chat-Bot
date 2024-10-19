// Import the natural library (if using Node.js)
// const natural = require('natural'); // Uncomment this line for Node.js environment

// Load responses from JSON file (Make sure to fetch the responses.json file)
let responses = {};

fetch('responses.json')
  .then(response => response.json())
  .then(data => {
    responses = data.responses;
  })
  .catch(error => console.error('Error loading JSON:', error));

// Function to calculate similarity
function stringSimilarity(str1, str2) {
    const tokenizer = new natural.WordTokenizer();
    const words1 = tokenizer.tokenize(str1.toLowerCase());
    const words2 = tokenizer.tokenize(str2.toLowerCase());
    
    const allWords = new Set([...words1, ...words2]);
    const totalWords = allWords.size;

    let matches = 0;

    allWords.forEach(word => {
        if (words1.includes(word) && words2.includes(word)) {
            matches++;
        }
    });

    return (matches / totalWords) * 100; // returns similarity percentage
}

// Function to check if input is a math expression
function isMathExpression(input) {
    // Regex to detect basic math expressions (add, subtract, multiply, divide, exponent)
    return /^[\d\s+\-*/().^]+$/.test(input);
}

// Safe math evaluation function
function evaluateMathExpression(input) {
    try {
        // Use 'eval' carefully, only for basic math
        return eval(input.replace("^", "**")); // Replace '^' with '**' for exponentiation
    } catch (error) {
        return "Sorry, I couldn't evaluate the math expression.";
    }
}

// Chatbot function
function chatbot(input) {
    input = input.toLowerCase(); // Normalize the input to lower case

    // Check if the input is a math expression
    if (isMathExpression(input)) {
        return `The answer is: ${evaluateMathExpression(input)}`;
    }

    // Check for exact match first
    for (let category in responses) {
        for (let question in responses[category]) {
            if (input.includes(question)) {
                return responses[category][question];
            }
        }
    }

    // If no exact match, check for similar questions
    let closestMatch = '';
    let highestSimilarity = 0;

    for (let category in responses) {
        for (let question in responses[category]) {
            let similarity = stringSimilarity(input, question);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                closestMatch = responses[category][question];
            }
        }
    }

    // Check if the highest similarity is above 80%
    if (highestSimilarity >= 80) {
        return closestMatch;
    }

    // Default response if no match is found
    return "Sorry, I don't understand that. Please try something else.";
}

// Display user message
function displayUserMessage(message) {
    let chat = document.getElementById("chat");
    let userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    let userAvatar = document.createElement("div");
    userAvatar.classList.add("avatar");
    let userText = document.createElement("div");
    userText.classList.add("text");
    userText.innerHTML = message;
    userMessage.appendChild(userAvatar);
    userMessage.appendChild(userText);
    chat.appendChild(userMessage);
    chat.scrollTop = chat.scrollHeight;
}

// Display bot message
function displayBotMessage(message) {
    let chat = document.getElementById("chat");
    let botMessage = document.createElement("div");
    botMessage.classList.add("message", "bot");
    let botAvatar = document.createElement("div");
    botAvatar.classList.add("avatar");
    let botText = document.createElement("div");
    botText.classList.add("text");
    botText.innerHTML = message;
    botMessage.appendChild(botAvatar);
    botMessage.appendChild(botText);
    chat.appendChild(botMessage);
    chat.scrollTop = chat.scrollHeight;
}

// Send message function
function sendMessage() {
    let input = document.getElementById("input").value;
    if (input) {
        displayUserMessage(input);
        let output = chatbot(input);
        setTimeout(function() {
            displayBotMessage(output);
        }, 1000);
        document.getElementById("input").value = "";
    }
}

// Event listeners
document.getElementById("button").addEventListener("click", sendMessage);
document.getElementById("input").addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
});

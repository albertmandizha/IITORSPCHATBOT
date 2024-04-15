// Array of random thoughts with authors
const randomThoughts = [
    {
        thought: "Life is not about finding yourself. Life is about creating yourself.",
        author: "George Bernard Shaw"
    },
    {
        thought: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        thought: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein"
    },
    {
        thought: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        thought: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        thought: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt"
    },
    {
        thought: "Happiness is not something readymade. It comes from your own actions.",
        author: "Dalai Lama"
    },
    {
        thought: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    },
    {
        thought: "You miss 100% of the shots you don't take.",
        author: "Wayne Gretzky"
    },
    {
        thought: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson"
    },
    {
        thought: "Don't count the days, make the days count.",
        author: "Muhammad Ali"
    }
];


// Function to generate and display a random thought
function displayRandomThought() {
    const randomIndex = Math.floor(Math.random() * randomThoughts.length);
    const thoughtElement = document.getElementById('random-thought');
    const thought = randomThoughts[randomIndex];
    thoughtElement.innerHTML = `<em>"${thought.thought}"</em><br>- ${thought.author}`;
}

displayRandomThought();

// Function to trigger manager login
function triggerLogin() {
    document.getElementById("googleLoginBtn").click();
}
document.getElementById("LoginBtn").addEventListener("click", triggerLogin);



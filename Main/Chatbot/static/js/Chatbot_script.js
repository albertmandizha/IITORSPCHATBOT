const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store message by user
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // Return chat <li> element
};

const generateResponse = (chatElement, userInput, isQuestion) => {
  const API_URL = "/sendMessage";
  const messageElement = chatElement.querySelector("p");

  // Clear any previous content in the message element
  messageElement.textContent = "";
  const optionsContainer = chatElement.querySelector(".options-container");
  if (optionsContainer) {
    optionsContainer.remove();
  }

  // Define the data to be sent in the AJAX request
  const requestData = {
    input: userInput,
  };

  // Define the AJAX request options
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  // Send AJAX request to Flask backend
  fetch(API_URL, requestOptions)
  .then((response) => response.json())
  .then((data) => {
    messageElement.innerHTML = `<p>${data.answer}</p>`;

    if (data.options && data.options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("options-container");
      data.options.forEach((option) => {
        const optionButton = document.createElement("button");
        optionButton.textContent = option;
        optionButton.classList.add("option-button");
        optionButton.dataset.answerId = data.answer_id; // Store the answer_id
        optionButton.addEventListener("click", () => handleOptionClick(option, data.answer_id));
        optionsContainer.appendChild(optionButton);
      });
      messageElement.appendChild(optionsContainer);
    }
  })
    .catch((error) => {
      console.error("Error:", error);
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => (chatbox.scrollTo(0, chatbox.scrollHeight)));
};


const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  handleUserMessage();
};

const handleUserMessage = () => {
  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateClientTopThree(incomingChatLi, userMessage);
  }, 600);
};

const generateClientTopThree = (chatElement, userMessage) => {
  const API_URL = "/clientTopThree";
  const messageElement = chatElement.querySelector("p");

  // Clear any previous content in the message element
  messageElement.textContent = "";
  const optionsContainer = chatElement.querySelector(".options-container");
  if (optionsContainer) {
    optionsContainer.remove();
  }

  // Define the data to be sent in the AJAX request
  const requestData = {
    message: userMessage,
  };

  // Define the AJAX request options
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  // Send AJAX request to Flask backend
  fetch(API_URL, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.questions) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");
        data.questions.forEach((question) => {
          const optionButton = document.createElement("button");
          optionButton.textContent = question;
          optionButton.classList.add("option-button");
          if (question === "None of the Above") {
            optionButton.addEventListener("click", () => handleNoneOfTheAboveClick());
          } else {
            optionButton.addEventListener("click", () => handleQuestionClick(question));
          }
          optionsContainer.appendChild(optionButton);
        });
        messageElement.appendChild(optionsContainer);
      } else {
        // If no matching questions found, display the default message
        messageElement.textContent = data.answer;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => (chatbox.scrollTo(0, chatbox.scrollHeight)));
};

const handleQuestionClick = (question) => {
  const outgoingChatLi = createChatLi(question, "outgoing");
  chatbox.appendChild(outgoingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi, question, true);
  }, 600);
};


const handleOptionClick = (option, answerId) => {
  const outgoingChatLi = createChatLi(option, "outgoing");
  chatbox.appendChild(outgoingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  const API_URL = "/getOptionAnswer";
  const requestData = {
    answer_id: answerId,
    option_text: option,
  };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  fetch(API_URL, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.option_answer) {
        const incomingChatLi = createChatLi(`${data.option_answer}`, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
      } else {
        const incomingChatLi = createChatLi(data.answer, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const incomingChatLi = createChatLi("Oops! Something went wrong. Please try again.", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
    });
};



const handleNoneOfTheAboveClick = () => {
  const outgoingChatLi = createChatLi("None of the Above", "outgoing");
  chatbox.appendChild(outgoingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateClientAns(incomingChatLi, userMessage);
  }, 600);
};

const generateClientAns = (chatElement, userMessage) => {
  const API_URL = "/clientAns";
  const messageElement = chatElement.querySelector("p");

  // Clear any previous content in the message element
  messageElement.textContent = "";
  const optionsContainer = chatElement.querySelector(".options-container");
  if (optionsContainer) {
    optionsContainer.remove();
  }

  // Define the data to be sent in the AJAX request
  const requestData = {
    question: userMessage,
  };

  // Define the AJAX request options
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  // Send AJAX request to Flask backend
  fetch(API_URL, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      messageElement.innerHTML = `<p>${data.answer}</p>`;

      if (data.options && data.options.length > 0) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");
        data.options.forEach((option) => {
          const optionButton = document.createElement("button");
          optionButton.textContent = option;
          optionButton.classList.add("option-button");
          optionButton.dataset.answerId = data.answer_id; // Store the answer_id
          optionButton.addEventListener("click", () => handleOptionClick(option, data.answer_id));
          optionsContainer.appendChild(optionButton);
        });
        messageElement.appendChild(optionsContainer);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => (chatbox.scrollTo(0, chatbox.scrollHeight)));
};

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});
sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);

const fetchTopTags = () => {
  const API_URL = "/getToptags";
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      const tagButtonsContainer = document.getElementById("tagButtons");
      tagButtonsContainer.innerHTML = ""; // Clear previous buttons

      // Extract the top 5 tags from the response
      const topTags = data.tags.slice(0, 5);

      topTags.forEach((tag) => {
        const button = document.createElement("button");
        button.textContent = tag.tag;
        button.classList.add("action-button");
        button.addEventListener("click", () => handleTagClick(tag.tag));
        tagButtonsContainer.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const handleTagClick = (tag) => {
  const outgoingChatLi = createChatLi(tag, "outgoing");
  chatbox.appendChild(outgoingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateTagQuestions(incomingChatLi, tag);
  }, 600);
};

const generateTagQuestions = (chatElement, tag) => {
  const API_URL = "/tagQuestions";
  const messageElement = chatElement.querySelector("p");

  // Clear any previous content in the message element
  messageElement.textContent = "";
  const optionsContainer = chatElement.querySelector(".options-container");
  if (optionsContainer) {
    optionsContainer.remove();
  }

  // Define the data to be sent in the AJAX request
  const requestData = {
    tag: tag,
  };

  // Define the AJAX request options
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  // Send AJAX request to Flask backend
  fetch(API_URL, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.questions) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");
        data.questions.forEach((question) => {
          const optionButton = document.createElement("button");
          optionButton.textContent = question;
          optionButton.classList.add("option-button");
          optionButton.addEventListener("click", () => handleQuestionClick(question));
          optionsContainer.appendChild(optionButton);
        });
        messageElement.appendChild(optionsContainer);
      } else {
        // If no questions found for the tag, display a default message
        messageElement.textContent = "No questions found for this tag.";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => (chatbox.scrollTo(0, chatbox.scrollHeight)));
};



// Call the fetchTopTags function when the page loads
window.addEventListener("load", fetchTopTags);
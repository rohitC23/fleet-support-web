document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-div");
  const chatPopup = document.getElementById('chatPopup');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon'); 
  const loginContainer = document.getElementById("login-container");
  const floatingIcon = document.getElementById("float-icon");
  const userContainer = document.getElementById("user-container");
  const chatContainer = document.getElementById("chat-container");
  const loginBtn = document.getElementById("login-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");
  const logoutBtn = document.getElementById("logout-btn");
  const userInputContainer = document.getElementById('user-input-container');

  // Check if user is already logged in
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    loginContainer.style.display = "none";
    floatingIcon.style.display = "flex";
    headerContainer.style.display = "flex";
  }else{
    loginContainer.style.display = "flex";
    usernameInput.value = "";
    passwordInput.value = "";
  }

  loginBtn.addEventListener("click", () => {
    const enteredUsername = usernameInput.value;
    const enteredPassword = passwordInput.value;

    // Show the spinner and hide the button text
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;
    errorMessage.textContent = "";

    fetch("http://127.0.0.1:8000/validate_credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: enteredUsername, password: enteredPassword })
    })
    .then(response => response.json())
    .then(data => {
      // Hide the spinner and show the button text
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;

      if (data.success) {
        localStorage.setItem("loggedInUser", enteredUsername);
        localStorage.setItem("userPassword", enteredPassword);
        loginContainer.style.display = "none";
        floatingIcon.style.display = "flex";
        headerContainer.style.display = "flex";
        chatIcon.style.display = "block"; // Ensure chatIcon is displayed initially after login
        closeIcon.style.display = "none";
      } else {
        errorMessage.textContent = "Invalid username or password.";
      }
    })
    .catch(error => {
      console.error("Error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";

      // Hide the spinner and show the button text
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
    });
  });


    let chatInitialized = false; // Flag to check if the chat has been initialized
  
    function initializeChat() {
      displayInputMessage("Hi, I'm Fleet Enable's Support AI. Ask me anything for example:", "bot");
      displaySuggestions();
  
      document.getElementById("send-btn").addEventListener("click", () => {
        sendMessage();
        hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks send
      });
  
      document.getElementById("user-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user presses Enter
        }
      });
    }
  
    function displayInputMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
      messageElem.innerHTML = data;
      chatbox.appendChild(messageElem);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function displaySuggestions() {
      const chatbox = document.getElementById("chatbox");
      const suggestions = [
        "How to start billing for an order manually?",
        "How to search for zero billing data?",
        "How to configure LOS?",
        "How to get the billing information for an order?"
      ];
  
      const suggestionContainer = document.createElement("div");
      suggestionContainer.classList.add("suggestions");
  
      suggestions.forEach(suggestion => {
        const suggestionElem = document.createElement("button");
        suggestionElem.classList.add("suggestion");
        suggestionElem.textContent = suggestion;
        suggestionElem.addEventListener("click", () => {
          document.getElementById("user-input").value = suggestion;
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks on a suggestion
        });
        suggestionContainer.appendChild(suggestionElem);
      });
  
      chatbox.appendChild(suggestionContainer);
      chatbox.scrollTop = chatbox.scrollHeight;
    }

    let lastUserInput = "";
  
    function sendMessage() {
      const userInput = document.getElementById("user-input").value;
      if (userInput.trim() === "") return;

      lastUserInput = userInput;
    
      displayInputMessage(userInput, "user");
      document.getElementById("user-input").value = "";
    
      // Show the bot typing indicator
      addBotTypingIndicator();
    
      // Remove the suggestion container if it exists
      const suggestionContainer = document.querySelector(".suggestions");
      if (suggestionContainer) {
        suggestionContainer.remove();
      }
    
      fetch("http://127.0.0.1:8000/get_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userInput,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          removeTypingIndicator(); // Remove the typing indicator
          displayMessage(data, "bot");
          //console.log(data);
        })
        .catch((error) => {
          removeTypingIndicator(); // Remove the typing indicator in case of an error
          console.error("Error:", error);
        });
    }
    
    function addBotTypingIndicator() {
      const chatbox = document.getElementById("chatbox");
    
      // Create a container for the bot's typing indicator
      const botContainer = document.createElement("div");
      botContainer.classList.add("bot-container");
      botContainer.id = "bot-typing-indicator"; // ID to reference it later
    
      // Create the bot icon element
      const botIcon = document.createElement("div");
      botIcon.classList.add("bot-icon");
    
      // Create the message container to hold the typing dots
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", "bot");
    
      // Create the typing dots
      const dotsContainer = document.createElement("div");
      dotsContainer.classList.add("typing-dots");
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dotsContainer.appendChild(dot);
      }
    
      // Append typing dots to the message container
      messageElem.appendChild(dotsContainer);
    
      // Append the bot icon and message container to the botContainer
      botContainer.appendChild(botIcon);
      botContainer.appendChild(messageElem);
    
      // Append the botContainer to the chatbox
      chatbox.appendChild(botContainer);
    
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    function removeTypingIndicator() {
      // Find and remove the typing indicator container
      const typingIndicator = document.getElementById("bot-typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    function displayMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
  
      // Create a container for the bot's message and icon
      const botContainer = document.createElement("div");
      botContainer.classList.add("bot-container");
  
      // Create the bot icon element for bot messages
      if (sender === "bot") {
          const botIcon = document.createElement("div");
          botIcon.classList.add("bot-icon");
          botContainer.appendChild(botIcon);
      }
  
      // Create a wrapper div to contain both message and emoji-reaction-bar
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add("message-wrapper");
  
      // Create a message container element
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
  
      // Create a span element for displaying the message text
      const messageSpan = document.createElement("span");

      // Helper function to format the message with bold and links
      const formatMessage = (messageText) => {
        // Format bold text
        let formattedText = messageText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        
        // Format markdown links [text](url)
        formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Format URLs starting with https
        formattedText = formattedText.replace(/(https:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
        // Replace newlines with <br> tags
        return formattedText.replace(/\n/g, "<br>");
    };
  
      // Format the message
      let formattedMessage = formatMessage(data.message);
  
      // Set the inner HTML of the span element with the formatted message
      messageSpan.innerHTML = formattedMessage;
  
      // Append the span element to the message container
      messageElem.appendChild(messageSpan);
  
      // Append the message container to the messageWrapper
      messageWrapper.appendChild(messageElem);
  
      // Create the emoji reaction bar
      const emojiReactionBar = document.createElement("div");
      emojiReactionBar.classList.add("emoji-reaction-bar");
      
      // Check if images exist and create image elements for each
      if (Array.isArray(data.images)) {
        data.images.forEach((imageBase64) => {
            const imageElem = document.createElement("img");
            imageElem.src = `data:image/jpeg;base64,${imageBase64}`;
            imageElem.alt = "Image";
            imageElem.style.maxWidth = "100%"; // Set a maximum width to ensure it fits within the chatbox
            imageElem.style.marginTop = "10px"; // Add some spacing between the text and image

            // Add click event to maximize the image
            imageElem.addEventListener('click', () => {
                showImageModal(imageElem.src);
            });

            // Append the image element to the message container
            messageElem.appendChild(imageElem);
        });
      }
      
      // If the message matches the specific message, add two buttons
      if (data.message === "Similar questions detected. Do you want to contact the agent about your inconvenience.") {
        emojiReactionBar.style.display = "none";

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const yesButton = document.createElement("button");
        yesButton.textContent = "Yes";
        yesButton.classList.add("response-button");
        yesButton.addEventListener("click", () => {
            // Handle the 'Yes' button click
            displayBotMessageWithForm();
            buttonContainer.style.display = "none";
            userInputContainer.style.display = "none";
        });

        const noButton = document.createElement("button");
        noButton.textContent = "No";
        noButton.classList.add("response-button");
        noButton.addEventListener("click", () => {
            displayBotMessage();
            buttonContainer.style.display = "none";
        });

        buttonContainer.appendChild(yesButton);
        buttonContainer.appendChild(noButton);

        // Append the button container to the messageWrapper
        messageWrapper.appendChild(buttonContainer);
      }

      if (data.message === "Please submit the below feedback form and our customer executive will reach you") {
        emojiReactionBar.style.display = "none";
        userInputContainer.style.display = "none";
        const feedbackForm = showFeedbackForm(); // Call the form display function
        messageWrapper.appendChild(feedbackForm);

      }

      // Define emojis without initial counts
      const emojis = [
          { emoji: "👍", feedback: "Positive", count: 0 },
          { emoji: "👎", feedback: "Negative", count: 0 }
      ];
  
      let hasSelectedEmoji = false; // Flag to track if an emoji has been selected
      let selectedFeedback = null; // To store the selected feedback
  
      // Create an emoji button for each emoji
      emojis.forEach((emojiObj) => {
          const emojiButton = document.createElement("button");
          emojiButton.classList.add("emoji-button");
          emojiButton.innerHTML = `${emojiObj.emoji} <span class="emoji-count">${emojiObj.count}</span>`;
  
          // Event listener to allow only one emoji selection
          emojiButton.addEventListener("click", function () {
              if (!hasSelectedEmoji) {
                  const countSpan = this.querySelector(".emoji-count");
                  countSpan.textContent = 1; // Set the selected emoji count to 1
                  hasSelectedEmoji = true; // Mark as selected
                  selectedFeedback = emojiObj.feedback; // Store the selected feedback
  
                  // If thumbs down is clicked, show feedback form inside a bot message
                  if (emojiObj.emoji === "👎") {
                      userInputContainer.style.display = "none";
                      displayBotMessageWithForm(); // Show bot message with feedback form
                  }
  
                  // Send data to the API after the feedback is clicked
                  sendFeedback(lastUserInput, data.message, selectedFeedback);
              }
          });
  
          // Append each emoji button to the emoji reaction bar
          emojiReactionBar.appendChild(emojiButton);
      });
  
      // Append the emoji reaction bar to the messageWrapper
      messageWrapper.appendChild(emojiReactionBar);
  
      // Append the messageWrapper (with message and emoji reaction bar) to the botContainer
      botContainer.appendChild(messageWrapper);
  
      // Append the botContainer to the chatbox
      chatbox.appendChild(botContainer);
  
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
  }
  
  window.toggleChatBot = function () {
  
    if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
        chatPopup.style.display = 'flex';
        chatIcon.style.display = 'none';
        closeIcon.style.display = 'block';

        if (!chatInitialized) {
            initializeChat(); // Initialize the chat only if it hasn't been initialized
            chatInitialized = true; // Set the flag to true after initialization
        }
    } else {
        chatPopup.style.display = 'none';
        chatIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
  };
  
  // Function to send feedback to the API
  function sendFeedback(userInput, message, feedback) {
      
      // Create the body for the POST request
      const requestBody = {
          user_question: userInput,
          ai_response: message,
          feedback: feedback
      };
  
      // Send the POST request using Fetch API
      fetch("http://127.0.0.1:8000/dbupdate", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
      })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              throw new Error('Error sending feedback.');
          }
      })
      .then(data => {
          //console.log("Feedback successfully sent:", data);
      })
      .catch(error => {
          console.error("Error:", error);
      });
  }
  
  
  // Function to display a bot message with the feedback form
  function displayBotMessageWithForm() {
    const chatbox = document.getElementById("chatbox");

    // Create a container for the bot message
    const botContainer = document.createElement("div");
    botContainer.classList.add("bot-container");

    // Create bot icon
    const botIcon = document.createElement("div");
    botIcon.classList.add("bot-icon");
    botContainer.appendChild(botIcon);

    // Create a message wrapper for the bot's feedback message
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    // Create the message element
    const messageElem = document.createElement("div");
    messageElem.classList.add("message", "bot");

    // Create the message text
    const messageSpan = document.createElement("span");
    messageSpan.innerHTML = "Please fill the below feedback form";

    // Append the message to the message container
    messageElem.appendChild(messageSpan);
    messageWrapper.appendChild(messageElem);

    // Append the feedback form
    const feedbackForm = showFeedbackForm(); // Call the form display function
    messageWrapper.appendChild(feedbackForm);

    // Append the message wrapper to the bot container
    botContainer.appendChild(messageWrapper);

    // Append the bot container to the chatbox
    chatbox.appendChild(botContainer);

    // Scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  //Function to display thank you message
  function displayFeedbackMessage() {
    const chatbox = document.getElementById("chatbox");

    // Create a container for the bot message
    const botContainer = document.createElement("div");
    botContainer.classList.add("bot-container");

    // Create bot icon
    const botIcon = document.createElement("div");
    botIcon.classList.add("bot-icon");
    botContainer.appendChild(botIcon);

    // Create a message wrapper for the bot's feedback message
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    // Create the message element
    const messageElem = document.createElement("div");
    messageElem.classList.add("message", "bot");

    // Create the message text
    const messageSpan = document.createElement("span");
    messageSpan.innerHTML = "Thank you for submitting your feedback, please let me know how can I help you further?";

    // Append the message to the message container
    messageElem.appendChild(messageSpan);
    messageWrapper.appendChild(messageElem);

    // Append the message wrapper to the bot container
    botContainer.appendChild(messageWrapper);

    // Append the bot container to the chatbox
    chatbox.appendChild(botContainer);

    // Scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
}

   //Function to display thank you message
  function displayBotMessage() {
    const chatbox = document.getElementById("chatbox");

    // Create a container for the bot message
    const botContainer = document.createElement("div");
    botContainer.classList.add("bot-container");

    // Create bot icon
    const botIcon = document.createElement("div");
    botIcon.classList.add("bot-icon");
    botContainer.appendChild(botIcon);

    // Create a message wrapper for the bot's feedback message
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    // Create the message element
    const messageElem = document.createElement("div");
    messageElem.classList.add("message", "bot");

    // Create the message text
    const messageSpan = document.createElement("span");
    messageSpan.innerHTML = "Okay, please let me know how can I help you further?";

    // Append the message to the message container
    messageElem.appendChild(messageSpan);
    messageWrapper.appendChild(messageElem);

    // Append the message wrapper to the bot container
    botContainer.appendChild(messageWrapper);

    // Append the bot container to the chatbox
    chatbox.appendChild(botContainer);

    // Scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
  } 

    // Modify showFeedbackForm to return the form instead of appending it directly to chatbox
    function showFeedbackForm() {
      // Create a form element
      const feedbackForm = document.createElement("form");
      feedbackForm.classList.add("feedback-form");

      // Define form fields
      const fields = [
          { label: "Name", type: "text", id: "userName", required: true },
          { label: "Email", type: "email", id: "userEmail", required: true },
          { label: "Phone Number", type: "tel", id: "userPhone", required: true },
          { label: "Issue", type: "textarea", id: "userIssue", required: true }
      ];

      // Loop through fields and create input elements
      fields.forEach(field => {
          const fieldLabel = document.createElement("label");
          fieldLabel.textContent = field.label;

          const fieldInput = field.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
          fieldInput.type = field.type;
          fieldInput.id = field.id;
          fieldInput.name = field.id;
          fieldInput.required = field.required;  // Set the field as required

          // Append label and input to the form
          feedbackForm.appendChild(fieldLabel);
          feedbackForm.appendChild(fieldInput);
      });

      // Add submit button to form
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit Feedback";

      // Event listener for form submission
      feedbackForm.addEventListener("submit", async function (event) {
          event.preventDefault();

          // Gather form data
          const formData = {
              user_name: document.getElementById("userName").value,
              user_mail: document.getElementById("userEmail").value,
              user_number: document.getElementById("userPhone").value,
              user_feedback: document.getElementById("userIssue").value
          };

          // Validate all fields are filled in
          if (!formData.user_name || !formData.user_mail || !formData.user_number || !formData.user_feedback) {
              alert("Please fill in all required fields.");
              return;
          }

          try {
              // Send the form data to the API via POST request
              const response = await fetch("http://127.0.0.1:8000/feedback", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify(formData)
              });

              if (response.ok) {
                  displayFeedbackMessage();
                  // Hide the feedback form
                  // Disable all input fields after successful submission
                  const formElements = feedbackForm.elements;
                  for (let i = 0; i < formElements.length; i++) {
                      formElements[i].disabled = true;
                  }
                  userInputContainer.style.display = "flex";
              } else {
                  alert("There was an error submitting your feedback. Please try again.");
              }
          } catch (error) {
              console.error("Error submitting feedback:", error);
              alert("There was an issue connecting to the server.");
          }
      });

      feedbackForm.appendChild(submitButton);

      // Return the form to be appended elsewhere
      return feedbackForm;
    }    
      
    // Function to create and display the image modal
    function showImageModal(imageSrc) {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('image-modal');
    
        // Create the image element for the modal
        const modalImage = document.createElement('img');
        modalImage.src = imageSrc;
        modalImage.classList.add('modal-image');
    
        // Append the image to the modal container
        modalContainer.appendChild(modalImage);
    
        // Add click event to close the modal
        modalContainer.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
    
        // Append the modal container to the body
        document.body.appendChild(modalContainer);
    }
  
    // Add styles for the image modal (using JavaScript)
    const style = document.createElement('style');
    style.innerHTML = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
    
        .modal-image {
            max-width: 90%;
            max-height: 90%;
            border-radius: 5px;
        }
    `;
    document.head.appendChild(style); 
  
    function hideGreetingAndSuggestions() {
      const suggestionsContainer = document.querySelector('.suggestions');
      if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none'; // Hide the suggestions container
      }
  
      const greetingMessage = document.querySelector('.message.bot');
      if (greetingMessage) {
        greetingMessage.style.display = 'none'; // Hide the greeting message
      }
    }
  
    

  document.getElementById('web-scrape').addEventListener('click', function() {
    // Hide chat header, chatbox, and user input container
    document.querySelector('.chat-header').style.display = 'none';
    document.getElementById('chatbox').style.display = 'none';
    document.getElementById('user-input-container').style.display = 'none';

    // Show the add user section
    document.getElementById('web-scrape-section').style.display = 'block';
  });

  

document.getElementById('search-btn').addEventListener('click', function() {
  // Get the values from the input fields
  const ordernumber = document.getElementById('order-number').value.trim();

  // Check if the order number field is filled
  if (!ordernumber) {
      alert('Please fill the order number field');
      return; // Stop the function if the field is empty
  }  

  // Create and show the loading effect
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading';
  loadingDiv.innerHTML = `
    <p style="font-size: 18px; font-weight: bold; color: #007BFF; text-align: center; animation: blink 1.5s linear infinite;">
      Loading, please wait...
    </p>
  `;

  // Append the loading element to the web-scrape-section
  document.getElementById('web-scrape-section').appendChild(loadingDiv);

  // Prepare the API body
  const requestBody = {
      "order_number": ordernumber
  };

  // Call the API to get the order status
  fetch('http://127.0.0.1:8000/order_status', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to fetch order status');
      }
      return response.json();
  })
  .then(data => {
      //console.log('Fetched Data successfully:', data);
      // Hide input and buttons
      document.getElementById('order-number').style.display = 'none';
      document.getElementById('search-btn').style.display = 'none';
      document.getElementById('exit-scrape').style.display = 'none';

      // Remove the loading effect
      document.getElementById('loading').remove();
      
      // Create a new div with the fetched data
      const dataDiv = document.createElement('div');
      dataDiv.id = 'web-data';
      dataDiv.innerHTML = `
        <p><strong>Flow Name:</strong> ${data.flow_name}</p>
        <p><strong>Tracking Info:</strong> ${data.tracking_info}</p>
      `;
      
      // Append the new div to the web-scrape-section
      document.getElementById('web-scrape-section').appendChild(dataDiv);

      // Create a new button
      const newButton = document.createElement('button');
      newButton.textContent = 'Back'; // Modify text as needed
      newButton.id = 'back-btn';
      
      // Append the button below the div
      document.getElementById('web-scrape-section').appendChild(newButton);

      newButton.addEventListener('click', function() {
        document.getElementById('web-data').style.display = 'none';
        document.getElementById('back-btn').style.display = 'none';
        document.getElementById('order-number').style.display = 'flex';
        document.getElementById('search-btn').style.display = 'flex';
        document.getElementById('exit-scrape').style.display = 'flex';
        document.getElementById('order-number').value = '';
      });
  })
  .catch(error => {
      console.error('Error:', error);
      
      // Remove the loading effect if error occurs
      document.getElementById('loading').remove();
      
      // Display an error message to the user
      alert('Error fetching data. Please try again later.');
  });
});


document.getElementById('exit-scrape').addEventListener('click', function() {
  // Hide the add user section
  document.getElementById('web-scrape-section').style.display = 'none';

  // Show chat header, chatbox, and user input container
  document.querySelector('.chat-header').style.display = 'flex';
  document.getElementById('chatbox').style.display = 'block';
  document.getElementById('user-input-container').style.display = 'flex';
  document.getElementById('order-number').value = '';
});

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userPassword");
    floatingIcon.style.display = "none";
    loginContainer.style.display = "flex";
    headerContainer.style.display = "none";
    chatPopup.style.display= "none";
    usernameInput.value = "";
    passwordInput.value = "";
    chatbox.innerHTML = ''; // Clear chat history
    chatInitialized = false; // Reset chat initialization flag
  });
  
  
  });  
  
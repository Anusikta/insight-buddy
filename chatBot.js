// chatbot.js

function addRedDotToButton(buttonOrSelector) {
  const button =
  typeof buttonOrSelector === 'string'
    ? document.querySelector(buttonOrSelector)
    : buttonOrSelector;

if (!button) {
  console.error('Invalid button or selector:', buttonOrSelector);
  return;
}

const redDot = document.createElement('div');
redDot.className = 'red-dot';
button.appendChild(redDot);
  }
  
  function removeRedDotFromButton(button) {
    const redDot = button.querySelector('.red-dot');
    if (redDot) {
        redDot.remove();
    }
  }
  
  function updatePopupIcon() {
    const popupIcon = document.querySelector('.open-button');
    popupIcon.textContent = '🤖';
  }
  
  function updateCloseButtonIcon() {
    const closeButton = document.querySelector('.close-button');
    closeButton.textContent = '❌';
  }
  
  function handleBeep(message, btnClose, audioElement) {
    if (message.sender === 'bot' && message.text !== 'typing...' && btnClose === 1) {
        audioElement.play();
        addRedDotToButton('.open-button');
        addRedDotToButton('.close-button');
      }
    }
  
  function fetchProducts(apiEndpoint) {
    // Mocked data for testing
    return Promise.resolve([
      { id: 1, title: 'Product1', price: 10 },
      { id: 2, title: 'Product2', price: 20 },
    ]);
  }
  
  function handleSendMessage(state, avt, userMessage, btnClose, audioElement, inputFieldFun, render) {
    const fetchProducts = async () => {
        try {
          const response = await fetch(apiEndpoint);
          const data = await response.json();
          state.products = data;
          render();
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
      fetchProducts();
 
      const userM = state.userMessage;
      state.userMessage = '';
 
      if (!userM.trim()) return;
      const selectedAvatar = avt;
      const newUserMessageWithAvatar = {
        text: userM,
        sender: 'user',
        avatar: selectedAvatar,
      };
 
      state.chatHistory = [...state.chatHistory, newUserMessageWithAvatar];
      const botTyping = { text: 'typing...', sender: 'bot' };
      state.chatHistory = [...state.chatHistory, botTyping];
      const sanitizedUserMessage = userM.toLowerCase().replace(/\s/g, '');
      
      setTimeout(() => {
        if (sanitizedUserMessage === 'hi' || sanitizedUserMessage === 'hello') {
          const botResponse = { text: 'Hello! How can I assist you today?', sender: 'bot' };
          state.chatHistory = [...state.chatHistory, botResponse];
          handleBeep(botResponse);
          requestAnimationFrame(() => {
           inputFieldFun();
         });
        } else if (sanitizedUserMessage === 'whoareyou') {
          const botResponse = { text: "I'm a friendly chatbot here to help!", sender: 'bot' };
          state.chatHistory = [...state.chatHistory, botResponse];
          handleBeep(botResponse);
          requestAnimationFrame(() => {
           inputFieldFun();
         });
        } else {
          let foundProduct = null;
          for (let i = 0; i < state.products.length; i++) {
            const sanitizedTitle = state.products[i].title.toLowerCase().replace(/\s/g, '');
            if (sanitizedTitle.includes(sanitizedUserMessage)) {
              foundProduct = state.products[i];
              break;
            }
          }
          if (foundProduct) {
            const { id, title, price } = foundProduct;
            const botResponse = { text: `Price for ${title}: $${price}`, sender: 'bot' };
            state.chatHistory = [...state.chatHistory, botResponse];
            handleBeep(botResponse);
            requestAnimationFrame(() => {
             inputFieldFun();
           });
          } else {
            const botResponse = { text: `Product "${userM}" not found.`, sender: 'bot' };
            state.chatHistory = [...state.chatHistory, botResponse];
            handleBeep(botResponse);
            requestAnimationFrame(() => {
             inputFieldFun();
           });
          }
        }
       
        state.chatHistory = state.chatHistory.filter((message) => message.sender !== 'bot' || message.text !== 'typing...');
       
        render();
     
       }, 5000); 
     }
  
  function addWelcomeMessage(state, render) {
    const welcomeMessage = { text: 'Welcome! How can I assist you today?', sender: 'bot' };
    state.chatHistory = [welcomeMessage];
    console.log('called this');
    render();
  }
  
  function createChatbox(btncr) {
    const chatboxContent = `
    <div class="chat-popup" id="myForm">
    <div class="form-container" id="chatbot-container" ></div>
    <button type="button" class="close-button" onclick="closeForm()" style="background-color: ${btncr};">❌<span class="notification-symbol-close"></span></button>
    </div>
    <button class="open-button" onclick="openForm()" style="background-color: ${btncr};">🤖<span class="notification-symbol"></span></button>
    `;
    document.body.innerHTML += chatboxContent;  }
  
  function render(state, btncr, title) {
    document.body.onload = function () { createChatbox(btncr); };
    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.innerHTML = '';
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    const card = document.createElement('div');
    card.className = 'card';
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.style.backgroundColor = btncr;
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = '🤖';
    const h4 = document.createElement('h4');
    h4.style.color = 'white';
    h4.textContent = title;
    titleBar.appendChild(icon);
    titleBar.appendChild(h4);
    card.appendChild(titleBar);
    const chatHistoryContainer = document.createElement('div');
    chatHistoryContainer.className = 'chat-history-container';
    
    state.chatHistory.forEach((message, index) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`;
      messageDiv.textContent = message.text;
      if (message.sender === 'user') {
        const avatarSpan = document.createElement('span');
        avatarSpan.className = 'avatar';
        avatarSpan.textContent = message.avatar;
        chatHistoryContainer.appendChild(avatarSpan);
      }
      chatHistoryContainer.appendChild(messageDiv);
    });
   
    card.appendChild(chatHistoryContainer);
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    
    const input = document.createElement('input');
    input.className = 'user-input';
    input.type = 'text';
    input.value = state.userMessage;
    input.placeholder = 'Enter Request...';
    input.addEventListener('input', handleUserMessageChange);
    input.addEventListener("keyup", handleKeyPress);
   
    const button = document.createElement('button');
    button.className = 'send-btn';
    button.textContent = 'Send';
    button.style.backgroundColor = btncr;
    button.addEventListener('click', handleSendMessage);
    
    inputContainer.appendChild(input);
    inputContainer.appendChild(button);
   
    card.appendChild(inputContainer);
    cardContainer.appendChild(card);
    chatbotContainer.appendChild(cardContainer);
   
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
   }
  
  const initialState = {
    userMessage: '',
    chatHistory: [],
    products: [],
  };
  
  export {
    addRedDotToButton,
    removeRedDotFromButton,
    updatePopupIcon,
    updateCloseButtonIcon,
    handleBeep,
    fetchProducts,
    handleSendMessage,
    addWelcomeMessage,
    createChatbox,
    render,
    initialState,
  };
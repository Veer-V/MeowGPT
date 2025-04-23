import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaTrashAlt } from 'react-icons/fa';
import './App.css';

function getRandomMeowSentence() {
  const meowCount = Math.floor(Math.random() * 5) + 3;
  return 'meow '.repeat(meowCount).trim();
}

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('catgpt_messages');
    return saved ? JSON.parse(saved) : [{ id: 0, sender: 'bot', text: getRandomMeowSentence() }];
  });
  const [input, setInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('catgpt_profile_photo') || null);
  const [userName, setUserName] = useState(() => localStorage.getItem('catgpt_user_name') || 'User');
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('catgpt_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (profilePhoto) localStorage.setItem('catgpt_profile_photo', profilePhoto);
    else localStorage.removeItem('catgpt_profile_photo');
  }, [profilePhoto]);

  useEffect(() => {
    localStorage.setItem('catgpt_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('remove profile photo') || transcript.includes('delete profile photo')) {
        setProfilePhoto(null);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { id: messages.length, sender: 'user', text: input.trim() };
    const botMessage = { id: messages.length + 1, sender: 'bot', text: getRandomMeowSentence() };
    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUserNameChange = (e) => setUserName(e.target.value);

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('catgpt_messages');
  };

  const handleDeleteProfilePhoto = (e) => {
    e.stopPropagation();
    setProfilePhoto(null);
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="profile-section" onClick={handleProfilePhotoClick} title="Click to change profile photo">
          {profilePhoto ? (
            <>
              <img src={profilePhoto} alt="Profile" className="profile-photo" />
              <button className="delete-profile-button" onClick={handleDeleteProfilePhoto} title="Delete profile photo">
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <FaUserCircle className="profile-icon" />
          )}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfilePhotoChange} style={{ display: 'none' }} />
        </div>
        <input
          className="user-name-input"
          type="text"
          value={userName}
          onChange={handleUserNameChange}
          maxLength={20}
          placeholder="Enter your name"
          title="Enter your name"
        />
      
        <div className="sidebar-header">
          <h2>CatGPT</h2>
          <button className="clear-history-button" onClick={handleClearHistory} title="Clear chat history">
            <FaTrashAlt />
          </button>
        </div>
        <div className="chat-history">
          <h3>Chat History</h3>
          <ul>
            {messages.map(msg => (
              <li key={msg.id} className={`history-item ${msg.sender}`}>
                {msg.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="chat-container">
        <div className="chat-header">
          <h1>CatGPT</h1>
          <div className="meow-indicator">meow meow</div>
        </div>
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="What can I help with?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send-button" onClick={handleSend}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;

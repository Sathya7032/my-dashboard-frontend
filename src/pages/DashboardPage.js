import React, { useState, useEffect } from 'react';
import { Base } from '../components/Base';
import { Player } from '@lottiefiles/react-lottie-player'; 
import './DashboardPage.css';
import dashboardAnimation from '../assets/anime/dashboard.json';

const DashboardPage = () => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const quotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It's not whether you get knocked down, it's whether you get up.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "The way to get started is to quit talking and begin doing.",
    "Don't watch the clock; do what it does. Keep going.",
    "Innovation distinguishes between a leader and a follower."
  ];

  useEffect(() => {
    updateTime();
    setRandomQuote();

    const timeInterval = setInterval(updateTime, 60000);
    const quoteInterval = setInterval(setRandomQuote, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const updateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    setCurrentTime(now.toLocaleDateString('en-US', options));
  };

  const setRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };





  return (
    <Base>
      <div className="dashboard-container">
        {/* Welcome Row */}
        <div className="dashboard-welcome-row">
          <div className="welcome-message">
            <h1>Welcome Sathya</h1>
            <p className="current-time">{currentTime}</p>
            <div className="quote-container">
              <p className="motivational-quote">"{currentQuote}"</p>
            </div>
            <button 
              className="new-quote-btn"
              onClick={setRandomQuote}
            >
              <span className="btn-icon">↻</span> New Quote
            </button>
          </div>
          
          <div className="lottie-animation">
            <Player
              autoplay
              loop
              src={dashboardAnimation}
              style={{ height: '280px', width: '280px' }}
            />
          </div>
        </div>

        
      </div>
    </Base>
  );
};

export default DashboardPage;
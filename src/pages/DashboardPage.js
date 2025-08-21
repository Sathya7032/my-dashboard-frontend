import React, { useState, useEffect } from 'react';
import { Base } from '../components/Base';
import { Player } from '@lottiefiles/react-lottie-player'; 
import './DashboardPage.css';
import dashboardAnimation from '../assets/anime/dashboard.json';

const DashboardPage = () => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [techNews, setTechNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

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
    fetchTechNews();

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

  const fetchTechNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=technology&language=en&sortBy=publishedAt&apiKey=8071780762ac4a7fad1112b297d8832e`
      );
      const data = await response.json();
      console.log(data)
      setTechNews(data.articles || []);
    } catch (err) {
      console.error("Error fetching tech news:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextNews = () => {
    setCurrentNewsIndex(prevIndex => 
      prevIndex < techNews.length - 1 ? prevIndex + 1 : 0
    );
  };

  const prevNews = () => {
    setCurrentNewsIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : techNews.length - 1
    );
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

        {/* Tech News Section */}
        <div className="tech-news-section">
          <h2>Latest Tech News</h2>
          {loading ? (
            <div className="news-loader">
              <p>Loading news...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : techNews.length > 0 ? (
            <div className="news-carousel">
              <div className="news-card">
                {/* Thumbnail */}
                {techNews[currentNewsIndex].urlToImage && (
                  <div className="news-image-container">
                    <img 
                      src={techNews[currentNewsIndex].urlToImage} 
                      alt={techNews[currentNewsIndex].title} 
                      className="news-image"
                    />
                  </div>
                )}

                {/* News Content */}
                <div className="news-details">
                  <a 
                    href={techNews[currentNewsIndex].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-title"
                  >
                    {techNews[currentNewsIndex].title}
                  </a>
                  <p className="news-description">{techNews[currentNewsIndex].description}</p>
                  <div className="news-meta">
                    <span className="news-source">📰 {techNews[currentNewsIndex].source?.name}</span>
                    <span className="news-author">✍️ {techNews[currentNewsIndex].author || "Unknown"}</span>
                    <span className="news-date">📅 {new Date(techNews[currentNewsIndex].publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="news-navigation">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevNews}
                    aria-label="Previous news"
                  >
                    &lt;
                  </button>
                  <div className="news-counter">
                    {currentNewsIndex + 1} / {techNews.length}
                  </div>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextNews}
                    aria-label="Next news"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="no-news-message">No tech news available right now.</p>
          )}
        </div>
      </div>
    </Base>
  );
};

export default DashboardPage;
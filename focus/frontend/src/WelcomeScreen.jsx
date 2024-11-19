import React, { useState, useEffect } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ setStep, name, setName, period, setPeriod }) => {
    const [showSlogan, setShowSlogan] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowSlogan(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="welcome-screen">
            <h1>Welcome to <span className="highlight">Focus Mode</span></h1>
            <div className={`slogan-container ${showSlogan ? 'visible' : ''}`}>
                <p className="slogan">"Focus is the new superpower."</p>
            </div>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="number"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                placeholder="Focus duration (seconds)"
            />
            <button
                onClick={() => name && period > 0 && setStep(2)}
                className="start-btn"
            >
                Start Focus Mode
            </button>
        </div>
    );
};

export default WelcomeScreen;
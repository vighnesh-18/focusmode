import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import WebCam from './WebCam';
import './App.css';

const App = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [period, setPeriod] = useState(60);

    return (
        <div className="app">
            {step === 1 ? (
                <WelcomeScreen
                    setStep={setStep}
                    name={name}
                    setName={setName}
                    period={period}
                    setPeriod={setPeriod}
                />
            ) : (
                <WebCam name={name} period={period} />
            )}
        </div>
    );
};

export default App;
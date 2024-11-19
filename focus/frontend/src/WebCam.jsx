import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import './WebCam.css';

const WebCam = ({ name, period }) => {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('');
    const [engagedCount, setEngagedCount] = useState(0);
    const [notEngagedCount, setNotEngagedCount] = useState(0);
    const [tracking, setTracking] = useState(false);
    const [isFocusModeComplete, setIsFocusModeComplete] = useState(false); // Track completion of focus mode
    const [trackingMessage, setTrackingMessage] = useState('');


    useEffect(() => {
        let interval;
        if (tracking) {
            interval = setInterval(() => {
                capture();
            }, 10000); // Capture every 10 seconds

            setTimeout(() => {
                clearInterval(interval);
                setTracking(false);
                calculateEngagement();
                setIsFocusModeComplete(true); // Mark focus mode as complete
            }, period * 1000); // Stop tracking after the specified period
        }
        return () => clearInterval(interval);
    }, [tracking, period]);

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            const blob = await fetch(imageSrc).then(res => res.blob());
            const formData = new FormData();
            formData.append('image', blob, 'webcam.jpg'); // 'image' should match your server-side key
    
            const response = await fetch('http://localhost:3000/save-image', {
                method: 'POST',
                body: formData,
            });
    
            const result = await response.json();
            if (result.success) {
                console.log('Image saved successfully');
            } else {
                console.error('Error saving image');
            }
        }
    };

    const calculateEngagement = async () => {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const result = await response.json();
        if (result.engagement_percentage !== undefined) {
            setStatus(`Engagement: ${result.engagement_percentage.toFixed(2)}%`);
            setEngagedCount(result.engaged_count);
            setNotEngagedCount(result.not_engaged_count);
        } else {
            console.error('Error calculating engagement');
        }
    };

    const startTracking = () => {
        setTrackingMessage('Tracking started!');
        setEngagedCount(0);
        setNotEngagedCount(0);
        setTracking(true);
        setIsFocusModeComplete(false); // Reset focus mode completion status
        
        setTimeout(() => setTrackingMessage(''), 3000); // Clear the message after 3 seconds
    };
    

    const stopWebcam = () => {
        if (webcamRef.current) {
            webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop()); // Stop the webcam stream
        }
    };

    useEffect(() => {
        if (isFocusModeComplete) {
            stopWebcam(); // Stop webcam when focus mode is complete
        }
    }, [isFocusModeComplete]);

    return (
        <div className="webcam-container">
            <h2>{name}, you're in Focus Mode for {period} seconds!</h2>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"  // Optional: Adjust as needed
                videoConstraints={{ facingMode: 'user' }} // Optional: Use user-facing camera
            />
            <div>
                <input
                    type="number"
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    placeholder="Tracking period (seconds)"
                />
                <div>
                    {trackingMessage && <p className="tracking-message">{trackingMessage}</p>}
                    <button onClick={startTracking} disabled={tracking || isFocusModeComplete}>
                        Start Tracking
                    </button>
                </div>

            </div>
            <p>{status}</p>
            {/* Show message when focus mode is complete */}
            {isFocusModeComplete && <h3>Focus Mode Complete! Your results are on the way...</h3>}
        </div>
    );
};

export default WebCam;

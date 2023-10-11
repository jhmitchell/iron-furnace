import React from "react";
import "./VideoSection.css";

const VideoSection = () => {
    // List of Video IDs - will pull from backend
    const videoIds = ["8IJu6yMUQF4", "lmb7jrxW2oY"];

    return (
        <section className="video-section">
            <div className="video-title-container">
                <h2 className="video-title">Featured Videos</h2>
            </div>
            <div className="video-container">
                {videoIds.map((videoId, index) => (
                    <div className="video-wrapper" key={index}>
                        <iframe
                            title={`Video ${index + 1}`}
                            src={`https://www.youtube.com/embed/${videoId}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                            loading="lazy"
                        ></iframe>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default VideoSection;

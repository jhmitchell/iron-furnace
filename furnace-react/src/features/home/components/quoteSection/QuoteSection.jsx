import React from "react";
import "./QuoteSection.css";

const QuoteSection = () => {
    return (
        <section className="quote-section">
            <div className="quote-container">
                <div className="quote">
                    <p className="quote-text">A Site of Transcendent Significance.</p>
                    <p className="quote-continuation">With the exception of a mere handful of similar preservations in Sweden and Germany - and possibly a few in eastern Europe - I doubt that elsewhere in the world is there a 19th-century iron furnace complex with the degree of historical integrity to be found at Cornwall…</p>
                    <p className="quote-author">- Robert Vogel, Smithsonian Institution</p>
                </div>
            </div>
        </section>
    );
}

export default QuoteSection;

import React, { useState, useCallback } from "react";
import "../../../components/ui/button/Button.css";
import styles from "./SubscriptionBar.module.css";

const MAILCHIMP_URL =
  "https://cornwallironfurnace.us17.list-manage.com/subscribe/post-json?u=d7cf0609b1e05da9297b10ba5&id=ebbdb19eab&f_id=00e2fde2f0";
const HONEYPOT_NAME = "b_d7cf0609b1e05da9297b10ba5_ebbdb19eab";

const SubscriptionBar = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Check honeypot
      const honeypot = e.target.elements[HONEYPOT_NAME]?.value;
      if (honeypot) return;

      setStatus("loading");
      setMessage("");

      // JSONP callback
      const callbackName = `mc_cb_${Date.now()}`;
      const script = document.createElement("script");

      window[callbackName] = (data) => {
        if (data.result === "success") {
          setStatus("success");
          setMessage(data.msg || "You're subscribed!");
          setEmail("");
        } else {
          setStatus("error");
          // Strip HTML and error codes (e.g. "0 - ") from Mailchimp messages
          const clean = data.msg
            ? data.msg.replace(/<[^>]*>/g, "").replace(/^\d+\s*-\s*/, "")
            : "Something went wrong. Please try again.";
          setMessage(clean);
        }

        // Cleanup
        delete window[callbackName];
        script.remove();
      };

      script.src = `${MAILCHIMP_URL}&EMAIL=${encodeURIComponent(email)}&c=${callbackName}`;

      script.onerror = () => {
        setStatus("error");
        setMessage("Network error. Please try again.");
        delete window[callbackName];
        script.remove();
      };

      document.body.appendChild(script);
    },
    [email]
  );

  return (
    <div className={styles.bar}>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              type="email"
              name="EMAIL"
              required
              placeholder="Enter email to stay informed"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status) {
                  setStatus(null);
                  setMessage("");
                }
              }}
              className={styles.input}
              aria-label="Email address"
            />
            {/* Honeypot field — hidden from humans */}
            <input
              type="text"
              name={HONEYPOT_NAME}
              tabIndex="-1"
              autoComplete="off"
              className={styles.honeypot}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`button orange medium ${styles.submitButton}`}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          {message && (
            <p
              className={`${styles.message} ${
                status === "success" ? styles.success : styles.error
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubscriptionBar;

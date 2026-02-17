import React, { useEffect, useState } from "react";

// This component assumes Google reCAPTCHA v3 is loaded globally.
// In index.html, you would include:
// <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const RecaptchaWrapper = ({ action, onToken }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) return;

    const interval = setInterval(() => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setReady(true));
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ready || !SITE_KEY) return;
    window.grecaptcha
      .execute(SITE_KEY, { action })
      .then((token) => onToken(token))
      .catch(() => onToken(null));
  }, [ready, action, onToken]);

  return null;
};

export default RecaptchaWrapper;



/* ==========================================================================
   Calculatrice Landing Page - Interactive Logic
   ========================================================================== */

// --- TELEGRAM BOT CONFIGURATION ---
// To collect reviews in your Telegram Bot, fill in your Bot Token and Chat ID below:
const TELEGRAM_BOT_TOKEN = "8309493401:AAFO1eUcsQkDXHkJ6yGEszXYoQpnmEDahyM"; // e.g., "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
const TELEGRAM_CHAT_ID = "6990478240";   // e.g., "987654321" or "@your_channel_name"

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://rurvyqrctfoouonkikbo.supabase.co";
const SUPABASE_KEY = "sb_publishable_3tdWAFJMEfhqZo9UddYvAg_Q0V4InQk";

document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  initScrollReveal();
  initReviewsForm();
  initDownloadTracking();
});

/* ==========================================================================
   2. FAQ Accordion Handler
   ========================================================================== */
function initFaqAccordion() {
  document.querySelectorAll(".faq-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const isActive = item.classList.contains("active");
      
      // Collapse open entries (ensuring single expansion focus)
      document.querySelectorAll(".faq-item").forEach(otherItem => {
        otherItem.classList.remove("active");
      });
      
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

/* ==========================================================================
   3. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  // If the user prefers reduced motion, disable animations instantly
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(el => {
      el.classList.add("revealed");
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   4. User Reviews & Telegram Form Handler
   ========================================================================== */
function initReviewsForm() {
  const form = document.getElementById("review-form");
  const starBtns = document.querySelectorAll("#form-stars .star-btn");
  const ratingInput = document.getElementById("review-rating");
  const successMsg = document.getElementById("form-success-msg");
  const errorMsg = document.getElementById("form-error-msg");
  const submitBtn = document.getElementById("submit-review-btn");
  const btnLoader = document.getElementById("submit-review-loader");
  const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;

  if (!form || !starBtns) return;

  // Star rating hover and click handlers
  starBtns.forEach(btn => {
    // Hover entry
    btn.addEventListener("mouseenter", () => {
      const val = parseInt(btn.getAttribute("data-value"));
      starBtns.forEach(s => {
        const sVal = parseInt(s.getAttribute("data-value"));
        if (sVal <= val) {
          s.classList.add("hover");
        } else {
          s.classList.remove("hover");
        }
      });
    });

    // Click selection
    btn.addEventListener("click", () => {
      const val = parseInt(btn.getAttribute("data-value"));
      ratingInput.value = val;
      starBtns.forEach(s => {
        const sVal = parseInt(s.getAttribute("data-value"));
        if (sVal <= val) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });

  // Clear hover on container leave
  const starsContainer = document.getElementById("form-stars");
  if (starsContainer) {
    starsContainer.addEventListener("mouseleave", () => {
      starBtns.forEach(s => s.classList.remove("hover"));
    });
  }

  // Submit form handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const rating = ratingInput.value;
    const message = document.getElementById("review-message").value.trim();

    // Toggle loading visual state
    if (btnLoader && btnText) {
      btnLoader.style.display = "block";
      btnText.style.opacity = "0";
      submitBtn.disabled = true;
    }
    successMsg.style.display = "none";
    errorMsg.style.display = "none";

    const telegramMessage = `🌟 *New Review Received!*\n\n👤 *Name:* ${name}\n⭐ *Rating:* ${rating}/5 Stars\n💬 *Message:* ${message}`;

    // If no credentials configured, show simulation alert
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      setTimeout(() => {
        // Stop loader
        if (btnLoader && btnText) {
          btnLoader.style.display = "none";
          btnText.style.opacity = "1";
          submitBtn.disabled = false;
        }
        successMsg.innerHTML = `✓ Simulating submit! Configure <code>TELEGRAM_BOT_TOKEN</code> at the top of <code>app.js</code> to link your live bot.`;
        successMsg.style.display = "block";
        form.reset();
        // Reset stars
        ratingInput.value = 5;
        starBtns.forEach(s => s.classList.add("active"));
      }, 1000);
      return;
    }

    // Live Telegram API call
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "Markdown"
        })
      });

      const data = await response.json();

      if (data.ok) {
        successMsg.innerHTML = "✓ Review submitted successfully to Telegram Bot!";
        successMsg.style.display = "block";
        form.reset();
        ratingInput.value = 5;
        starBtns.forEach(s => s.classList.add("active"));
      } else {
        throw new Error(data.description || "Telegram API error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      errorMsg.innerHTML = `✗ Submission failed: ${err.message}`;
      errorMsg.style.display = "block";
    } finally {
      if (btnLoader && btnText) {
        btnLoader.style.display = "none";
        btnText.style.opacity = "1";
        submitBtn.disabled = false;
      }
    }
  });
}

/* ==========================================================================
   5. Download Tracking Handler
   ========================================================================== */
function initDownloadTracking() {
  const downloadBtn = document.getElementById("dl-android");
  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", async () => {
    const downloadData = {
      clicked_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || "direct",
      platform: "android",
      screen_resolution: `${window.screen.width}x${window.screen.height}`
    };

    console.log("Tracking download:", downloadData);

    try {
      const { createClient } = window.supabase;
      if (!createClient) {
        console.error("Supabase client not loaded.");
        return;
      }
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      
      // Attempt to insert record into the 'apk_downloads' table
      const { error } = await supabase
        .from("apk_downloads")
        .insert([downloadData]);

      if (error) {
        console.error("Error inserting download stats:", error);
      } else {
        console.log("Successfully tracked download in Supabase.");
      }
    } catch (err) {
      console.error("Failed to track download:", err);
    }
  });
}



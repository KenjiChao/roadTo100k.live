// Configuration - Replace these with your actual values
// Read runtime env from a local, gitignored env.js if present
const RUNTIME_ENV =
  typeof window !== "undefined" && window.ENV ? window.ENV : {};
const CONFIG = {
  YOUTUBE_API_KEY: RUNTIME_ENV.YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY", // Set via env.js
  CHANNEL_ID: "UCJIPFjZSCWR15_jxBaK2fQQ", // Your YouTube Channel ID
  FEATURED_VIDEO_ID: "jT7XPKHXTwE", // Video to feature on the page
  CHANNEL_NAME: "矽谷輕鬆談", // Will be updated from API
  TARGET_SUBSCRIBERS: 100000,
};

// State management
let currentSubscribers = 0;

// DOM elements
const elements = {
  currentSubs: document.getElementById("current-subs"),
  percentage: document.getElementById("percentage"),
  remainingSubs: document.getElementById("remaining-subs"),
  progressFill: document.getElementById("progress-fill"),
  subscribeBtn: document.getElementById("subscribe-btn"),
  storySubscribeBtn: document.getElementById("story-subscribe-btn"),
  videoThumbnail: document.getElementById("video-thumbnail"),
  playButton: document.getElementById("play-button"),
  channelLogo: document.querySelector(".logo-circle"),
  // Video overlays (Medium-like layout, stacked over thumbnail)
  overlayAvatar: document.querySelector(".yt-topbar .yt-avatar"),
  overlayTitle: document.querySelector(".yt-topbar .yt-title"),
};

// Utility functions
const formatNumber = (num) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + "億";
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + "萬";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "千";
  }
  return num.toLocaleString();
};

const animateNumber = (element, start, end, duration = 1500) => {
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Enhanced easing function for smoother animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOutCubic);

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const updateProgressBar = (subscribers) => {
  const percentage = Math.min(
    (subscribers / CONFIG.TARGET_SUBSCRIBERS) * 100,
    100
  );
  const roundedPercentage = Math.round(percentage * 10) / 10;

  // Update progress bar width with enhanced animation
  setTimeout(() => {
    elements.progressFill.style.width = `${percentage}%`;
  }, 200);

  // Update percentage text with animation (now shows actual achievement percentage)
  const startPercentage = parseFloat(elements.percentage.textContent) || 0;
  animatePercentage(startPercentage, roundedPercentage);

  // Update remaining subscribers
  const remaining = Math.max(CONFIG.TARGET_SUBSCRIBERS - subscribers, 0);
  setTimeout(() => {
    animateNumber(
      elements.remainingSubs,
      CONFIG.TARGET_SUBSCRIBERS -
        (parseFloat(elements.currentSubs.textContent.replace(/[^\d]/g, "")) ||
          0),
      remaining,
      1200
    );
  }, 300);
};

const animatePercentage = (start, end) => {
  const duration = 1000;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeOutCubic;

    elements.percentage.textContent = `${current.toFixed(1)}%`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// YouTube API functions
const fetchSubscriberCount = async () => {
  if (
    CONFIG.YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY" ||
    CONFIG.CHANNEL_ID === "YOUR_CHANNEL_ID"
  ) {
    // Demo mode with simulated data
    simulateSubscriberCount();
    return;
  }

  try {
    const [channelRes, videoRes] = await Promise.all([
      fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.YOUTUBE_API_KEY}`
      ),
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${CONFIG.FEATURED_VIDEO_ID}&key=${CONFIG.YOUTUBE_API_KEY}`
      ),
    ]);

    if (!channelRes.ok || !videoRes.ok) {
      throw new Error(
        `HTTP error! channel:${channelRes.status} video:${videoRes.status}`
      );
    }

    const channelData = await channelRes.json();
    const videoData = await videoRes.json();

    if (channelData.items && channelData.items.length > 0) {
      const channel = channelData.items[0];
      const subscribers = parseInt(channel.statistics.subscriberCount);
      const channelName = channel.snippet.title;
      const channelAvatar =
        channel.snippet.thumbnails?.high?.url ||
        channel.snippet.thumbnails?.default?.url;

      // Update channel name
      CONFIG.CHANNEL_NAME = channelName;

      // Update overlays (avatar + title)
      if (elements.overlayAvatar && channelAvatar) {
        elements.overlayAvatar.src = channelAvatar;
        elements.overlayAvatar.alt = channelName;
      }
      if (
        elements.overlayTitle &&
        videoData.items &&
        videoData.items.length > 0
      ) {
        elements.overlayTitle.textContent =
          videoData.items[0].snippet.title || "";
      }

      // Update subscriber count
      updateSubscriberData(subscribers);
    } else {
      throw new Error("Channel not found");
    }
  } catch (error) {
    console.error("獲取訂閱數時發生錯誤:", error);
    showError("無法獲取訂閱數，使用示範數據。");
    simulateSubscriberCount();
  }
};

const simulateSubscriberCount = () => {
  // Simulate subscriber count between 15K and 85K for demo
  const minSubs = 15000;
  const maxSubs = 85000;
  const simulatedCount =
    Math.floor(Math.random() * (maxSubs - minSubs + 1)) + minSubs;

  console.log("示範模式：使用模擬訂閱數據");
  updateSubscriberData(simulatedCount);
};

const updateSubscriberData = (subscribers) => {
  const oldCount = currentSubscribers;
  currentSubscribers = subscribers;

  // Animate subscriber count with enhanced timing
  animateNumber(elements.currentSubs, oldCount, currentSubscribers, 1800);

  // Update progress bar
  updateProgressBar(currentSubscribers);

  // Update links
  updateChannelLinks();

  // Check milestones
  checkMilestones(currentSubscribers);
};

const updateChannelLinks = () => {
  const channelUrl = `https://youtube.com/channel/${CONFIG.CHANNEL_ID}`;
  elements.subscribeBtn.onclick = () =>
    window.open(`${channelUrl}?sub_confirmation=1`, "_blank");
};

// Try to get featured video title via oEmbed (no API quota)
const getFeaturedVideoTitle = () => {
  // If we already set a custom title in HTML, keep it as fallback
  let fallbackTitle = elements.videoHeaderTitle?.textContent?.trim() || "";
  try {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${CONFIG.FEATURED_VIDEO_ID}&format=json`,
      false
    );
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      return data.title || fallbackTitle;
    }
  } catch (e) {
    // ignore and return fallback
  }
  return fallbackTitle || "影片預覽";
};

// Video functions
const loadVideoThumbnail = () => {
  const thumbnailUrl = `https://img.youtube.com/vi/${CONFIG.FEATURED_VIDEO_ID}/maxresdefault.jpg`;
  elements.videoThumbnail.style.backgroundImage = `url(${thumbnailUrl})`;
};

const loadFeaturedVideo = () => {
  if (CONFIG.FEATURED_VIDEO_ID === "YOUR_VIDEO_ID") {
    console.log("示範模式：影片ID尚未設定");
    return;
  }

  const iframe = document.createElement("iframe");
  // enable JS API so user can pause via player UI reliably
  iframe.src = `https://www.youtube.com/embed/${CONFIG.FEATURED_VIDEO_ID}?autoplay=1&rel=0&enablejsapi=1`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.borderRadius = "20px";

  elements.videoThumbnail.innerHTML = "";
  elements.videoThumbnail.classList.add("playing");
  elements.videoThumbnail.appendChild(iframe);
};

const showError = (message) => {
  console.error(message);
  // Could add a toast notification here
};

// Event listeners
const initEventListeners = () => {
  // Video thumbnail click
  elements.videoThumbnail.addEventListener("click", () => {
    loadFeaturedVideo();
  });

  // Channel logo click (CSS version)
  if (elements.channelLogo) {
    elements.channelLogo.addEventListener("click", () => {
      if (CONFIG.CHANNEL_ID !== "YOUR_CHANNEL_ID") {
        window.open(
          `https://youtube.com/channel/${CONFIG.CHANNEL_ID}`,
          "_blank"
        );
      } else {
        alert("請先在程式中設定你的YouTube頻道ID！");
      }
    });
  }

  // Channel logo click (image version)
  const logoImage = document.querySelector(".logo-image");
  if (logoImage) {
    logoImage.addEventListener("click", () => {
      if (CONFIG.CHANNEL_ID !== "YOUR_CHANNEL_ID") {
        window.open(
          `https://youtube.com/channel/${CONFIG.CHANNEL_ID}`,
          "_blank"
        );
      } else {
        alert("請先在程式中設定你的YouTube頻道ID！");
      }
    });
  }

  // Subscribe button
  elements.subscribeBtn.addEventListener("click", () => {
    if (CONFIG.CHANNEL_ID !== "YOUR_CHANNEL_ID") {
      window.open(
        `https://youtube.com/channel/${CONFIG.CHANNEL_ID}?sub_confirmation=1`,
        "_blank"
      );
    } else {
      alert("請先在程式中設定你的YouTube頻道ID！");
    }
  });

  // Story subscribe button
  if (elements.storySubscribeBtn) {
    elements.storySubscribeBtn.addEventListener("click", () => {
      if (CONFIG.CHANNEL_ID !== "YOUR_CHANNEL_ID") {
        window.open(
          `https://youtube.com/channel/${CONFIG.CHANNEL_ID}?sub_confirmation=1`,
          "_blank"
        );
      } else {
        alert("請先在程式中設定你的YouTube頻道ID！");
      }
    });
  }

  // Add smooth scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe elements for scroll animations
  document
    .querySelectorAll(".progress-section, .story-content, .video-section")
    .forEach((el) => {
      observer.observe(el);
    });
};

// Milestone celebrations
const checkMilestones = (subscribers) => {
  const milestones = [1000, 5000, 10000, 25000, 50000, 75000, 90000, 100000];
  const currentMilestone = milestones.find(
    (m) => subscribers >= m && !localStorage.getItem(`milestone_${m}`)
  );

  if (currentMilestone) {
    celebrateMilestone(currentMilestone);
    localStorage.setItem(`milestone_${currentMilestone}`, "true");
  }
};

const celebrateMilestone = (milestone) => {
  console.log(`🎉 里程碑達成：${formatNumber(milestone)} 訂閱者！`);

  // Enhanced celebration animation
  document.body.style.animation = "celebration 2s ease-in-out";

  // Create celebratory particles
  createCelebrationParticles();

  setTimeout(() => {
    document.body.style.animation = "";
  }, 2000);
};

const createCelebrationParticles = () => {
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: var(--neon-green);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${Math.random() * 100}vw;
      top: ${Math.random() * 100}vh;
      animation: celebrateParticle 3s ease-out forwards;
      box-shadow: var(--glow-neon);
    `;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 3000);
  }
};

// Add celebration particle animation to CSS dynamically
const style = document.createElement("style");
style.textContent = `
  @keyframes celebrateParticle {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes celebration {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
`;
document.head.appendChild(style);

// Initialization
const init = async () => {
  console.log("🚀 十萬訂閱就裸辭 - 初始化中...");

  // Initialize event listeners
  initEventListeners();

  // Load video thumbnail
  loadVideoThumbnail();

  // Set initial values
  elements.currentSubs.textContent = "0";
  elements.percentage.textContent = "0.0%";
  elements.remainingSubs.textContent =
    CONFIG.TARGET_SUBSCRIBERS.toLocaleString();

  // Fetch initial data
  await fetchSubscriberCount();

  console.log("✅ 初始化完成！");
};

// Auto-refresh functionality
const startAutoRefresh = () => {
  // Refresh every 5 minutes
  setInterval(() => {
    fetchSubscriberCount();
  }, 5 * 60 * 1000);
};

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await init();

  // Start auto-refresh after initial load
  setTimeout(startAutoRefresh, 15000); // Start after 15 seconds
});

// Handle visibility change to refresh when user returns
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Refresh when user returns to tab
    setTimeout(fetchSubscriberCount, 1000);
  }
});

// Add scroll effects for better UX
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallax = scrolled * 0.5;

  const cyberGrid = document.querySelector(".cyber-grid");
  if (cyberGrid) {
    cyberGrid.style.transform = `translateY(${parallax}px)`;
  }
});

// Export functions for debugging (remove in production)
window.roadTo100k = {
  fetchSubscriberCount,
  updateSubscriberData,
  loadFeaturedVideo,
  CONFIG,
};

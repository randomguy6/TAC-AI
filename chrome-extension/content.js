(function() {
  const urlPatterns = [
    /terms-and-conditions/i,
    /terms_of_service/i,
    /privacy-policy/i,
    /legal-notice/i,
    /user-agreement/i,
    /eula/i,
    /disclaimer/i,
    /terms/i,
    /privacy/i
  ];

  const keywords = [
    "terms and conditions",
    "terms of service",
    "privacy policy",
    "legal notice",
    "user agreement",
    "end-user license agreement",
    "disclaimer",
    "effective date",
    "last updated",
    "governing law",
    "dispute resolution",
    "limitation of liability",
    "indemnification",
    "intellectual property",
    "data collection",
    "data usage",
    "cookies",
    "third-party services",
    "termination",
    "amendments",
    "contact us"
  ];

  function isTermsAndConditionsPage() {
    const url = window.location.href;
    const pageText = document.body ? document.body.innerText.toLowerCase() : '';

    // Check URL patterns
    for (const pattern of urlPatterns) {
      if (pattern.test(url)) {
        console.log(`T&C detected by URL pattern: ${pattern}`);
        return true;
      }
    }

    // Check keywords in page content
    let keywordCount = 0;
    for (const keyword of keywords) {
      if (pageText.includes(keyword)) {
        keywordCount++;
      }
    }

    // A heuristic: if at least 3 keywords are found, consider it a T&C page
    if (keywordCount >= 3) {
      console.log(`T&C detected by keyword count: ${keywordCount}`);
      return true;
    }

    console.log("Not detected as a T&C page.");
    return false;
  }

  if (isTermsAndConditionsPage()) {
    const pageContent = document.body ? document.body.innerText : '';
    if (pageContent.length > 0) {
      console.log("Sending page content to background script for summarization.");
      chrome.runtime.sendMessage({ action: "summarizeContent", content: pageContent })
        .then(response => {
          if (response && response.status === "success") {
            console.log("Summary received successfully from background.");
          } else if (response && response.status === "error") {
            console.error("Error from background script:", response.message);
          }
        })
        .catch(error => {
          console.error("Error sending message to background script:", error);
        });
    } else {
      console.warn("Page content is empty, not sending for summarization.");
    }
  }
})();
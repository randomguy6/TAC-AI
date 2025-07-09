import { GEMINI_API_KEY } from './config.js';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      console.log("content.js injected");
    }).catch(err => console.error("Failed to inject content.js:", err));
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeContent" && request.content) {
    console.log("Received content from content.js, sending to Gemini...");
    summarizeWithGemini(request.content)
      .then(summary => {
        chrome.storage.local.set({ 'tcSummary': summary }, () => {
          console.log("Summary saved to local storage.");
          sendResponse({ status: "success", summary: summary });
        });
      })
      .catch(error => {
        console.error("Error summarizing with Gemini:", error);
        chrome.storage.local.set({ 'tcSummary': `Error: ${error.message}` }, () => {
          sendResponse({ status: "error", message: error.message });
        });
      });
    return true; // Indicates an asynchronous response
  }
});

async function summarizeWithGemini(text) {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const prompt = `Summarize the following terms and conditions in plain language, highlighting key clauses and potential implications for the user. Keep the summary concise and easy to understand:\n\n${text}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No summary found in Gemini response.");
    }
  } catch (error) {
    console.error("Failed to call Gemini API:", error);
    throw error;
  }
}
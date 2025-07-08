document.addEventListener('DOMContentLoaded', () => {
  const summaryContentDiv = document.getElementById('summaryContent');

  chrome.storage.local.get(['tcSummary'], (result) => {
    if (result.tcSummary) {
      summaryContentDiv.textContent = result.tcSummary;
      summaryContentDiv.classList.remove('loading-message');
      if (result.tcSummary.startsWith('Error:')) {
        summaryContentDiv.classList.add('error-message');
      }
    } else {
      summaryContentDiv.textContent = "No summary available. Navigate to a Terms & Conditions page.";
      summaryContentDiv.classList.remove('loading-message');
    }
  });
});
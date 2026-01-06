let lockedTabId = null;
let lockEndTime = null;
let lockTimer = null;

// SINGLE message listener (IMPORTANT)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received:", message);

  if (message.action === "START_LOCK") {
    startLock(message.duration);
  }

  if (message.action === "GET_STATUS") {
    sendResponse({
      lockedTabId,
      lockEndTime
    });
  }

  // Required for async sendResponse in MV3
  return true;
});

function startLock(minutes) {
  console.log("Starting lock for", minutes, "minutes");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    lockedTabId = tabs[0].id;
    lockEndTime = Date.now() + minutes * 60 * 1000;

    console.log("Locked tab:", lockedTabId);
    console.log("Ends at:", new Date(lockEndTime));

    chrome.storage.local.set({ lockedTabId, lockEndTime });

    if (lockTimer) clearInterval(lockTimer);
    lockTimer = setInterval(checkTimer, 1000);
  });
}

function checkTimer() {
  if (!lockEndTime) return;

  if (Date.now() >= lockEndTime) {
    console.log("Timer finished");
    unlock();
  }
}

function unlock() {
  console.log("Unlocking");

  lockedTabId = null;
  lockEndTime = null;

  chrome.storage.local.clear();
  clearInterval(lockTimer);
}

// Tab switch blocking

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!lockedTabId || activeInfo.tabId === lockedTabId) return;

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.startsWith("chrome://")) return;

    chrome.tabs.update(lockedTabId, { active: true })
      .catch(() => {});
  });
});



function isChromeInternalTab(tabId) {
  return chrome.tabs.get(tabId)
    .then(tab => tab.url.startsWith("chrome://"));
}

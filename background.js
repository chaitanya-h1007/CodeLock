let lockedTabId = null;
let lockEndTime = null;
let lockTimer = null;

chrome.runtime.onMessage.addListener((message) => {
  console.log("Message received:", message);

  if (message.action === "START_LOCK") {
    startLock(message.duration);
  }
});

function startLock(minutes) {
  console.log("Starting lock for", minutes, "minutes");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    lockedTabId = tabs[0].id;
    lockEndTime = Date.now() + minutes * 60 * 1000;

    console.log("Locked Tab ID:", lockedTabId);
    console.log("Lock ends at:", new Date(lockEndTime));

    if (lockTimer) clearInterval(lockTimer);
    lockTimer = setInterval(checkTimer, 1000);
  });
}

function checkTimer() {
  if (Date.now() >= lockEndTime) {
    console.log("Timer ended. Unlocking...");
    unlock();
  }
}

function unlock() {
  console.log("Unlocked");
  lockedTabId = null;
  lockEndTime = null;
  clearInterval(lockTimer);
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (lockedTabId && activeInfo.tabId !== lockedTabId) {
    console.log("Blocked tab switch. Returning to locked tab.");
    chrome.tabs.update(lockedTabId, { active: true });
  }
});

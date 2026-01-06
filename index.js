console.log("Popup JS loaded");

document.getElementById("lock15").addEventListener("click", () => {
  sendStart(15);
});

document.getElementById("lock20").addEventListener("click", () => {
  sendStart(20);
});

function sendStart(minutes) {
  console.log("Popup clicked:", minutes);

  chrome.runtime.sendMessage({
    action: "START_LOCK",
    duration: minutes
  });
}

// Poll background every second
setInterval(() => {
  chrome.runtime.sendMessage(
    { action: "GET_STATUS" },
    (response) => {
      if (!response || !response.lockEndTime) {
        document.getElementById("timer").innerText =
          "No active lock";
        return;
      }

      const remaining = Math.max(
        0,
        response.lockEndTime - Date.now()
      );

      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);

      document.getElementById("timer").innerText =
        `Time left: ${m}:${s.toString().padStart(2, "0")}`;
    }
  );
}, 1500);

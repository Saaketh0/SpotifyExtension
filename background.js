let popupWindowId = null;

chrome.runtime.onInstalled.addListener(() => {
  createPopup();
});

chrome.action.onClicked.addListener(() => {
  createPopup();
});

function createPopup() {
  if (popupWindowId === null) {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL("index.html"),
        type: "popup",
        width: 350,
        height: 200,
      },
      (window) => {
        popupWindowId = window.id;
      }
    );
  } else {
    chrome.windows.update(popupWindowId, { focused: true });
  }
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

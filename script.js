let currentTrackName = "";

document.getElementById("login-button").addEventListener("click", () => {
  window.location.href = "/login";
});

async function fetchCurrentTrack() {
  try {
    const response = await fetch("http://localhost:8000/current-track");

    if (response.status === 204) {
      console.warn("No content available");
      document.getElementById("track-info").textContent =
        "No content available";
      return;
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch current track: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (data && data.item && data.item.name) {
      currentTrackName = data.item.name;
    } else {
      currentTrackName = "No track currently playing";
    }
    console.log(currentTrackName); ////////////////////////
    displayTrackInfo(data);
  } catch (error) {
    console.error("Error fetching current track:", error);
    document.getElementById("track-info").textContent =
      "Failed to fetch current track";
  }
}

async function addbox(TrackName) {
  // Creating and styling the box. It is on the top left of the screen and should show the current song playing
  const helloBox = document.createElement("div");
  helloBox.id = "hello-box";
  helloBox.style.position = "fixed";
  helloBox.style.top = "0px";
  helloBox.style.left = "0px";
  helloBox.style.padding = "5px 10px 5px 10px";
  helloBox.style.backgroundColor = "black";
  helloBox.style.color = "green"; // Font color of the text
  helloBox.style.zIndex = "2**30";
  helloBox.style.fontFamily = "'Nunito', sans-serif";
  helloBox.style.borderRadius = "0 0 10px 0"; // Rounded bottom-right corner
  helloBox.style.fontSize = "16px";
  helloBox.style.textAlign = "center";
  helloBox.style.whiteSpace = "nowrap";
  helloBox.style.display = "inline-block"; // Size the box based on content width

  //console.log(typeof TrackName);
  //console.log(TrackName);
  helloBox.innerText = "Song: " + TrackName;
  document.body.appendChild(helloBox);
}
function removebox() {
  // Function name pretty self-explanatory
  const helloBox = document.getElementById("hello-box");
  if (helloBox) {
    helloBox.remove();
  }
}
// When the button in index.html is clicked this is triggered causing the events inside to happen
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("showHello").addEventListener("click", async () => {
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        // Loops through every tab that is open
        console.log("Testing track name: " + currentTrackName); // Logging in console current song playing
        chrome.scripting.executeScript(
          // Adds the box to the tab
          {
            target: { tabId: tab.id },
            func: addbox,
            args: [currentTrackName],
          },
          (results) => {
            // Returns console log on if box is added to tab or not
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              console.log("Script executed on tab ID:", tab.id);
            }
          }
        );
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // This checks if Remove box button is clicked in index.html
  document.getElementById("removeHello").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      /*
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (tabs.length === 0) {
        console.error("No active tabs found.");
        return;
      }
        */

      console.log("Patty");
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removebox,
        //files: ["content.js"],
      });
    });
  });
});

function displayTrackInfo(data) {
  // Displaying on the webpage the song, artist, and cover
  const trackInfo = document.getElementById("track-info"); // GEtting data from the function at the top of this file
  if (data && data.item) {
    const trackName = data.item.name;
    const albumName = data.item.album.name;
    const artistName = data.item.artists
      .map((artist) => artist.name)
      .join(", ");
    const albumImageUrl = data.item.album.images[0].url;
    // Displaying all the stuff on the page below
    trackInfo.innerHTML = ` 
          <img src="${albumImageUrl}" alt="${albumName}" width="200">
          <p><strong>Track:</strong> ${trackName}</p>
          <p><strong>Album:</strong> ${albumName}</p>
          <p><strong>Artist:</strong> ${artistName}</p>
      `;
  } else {
    trackInfo.textContent = "No track currently playing"; // If nothing is playing displays this
  }
}

// Poll for the current track every 10 seconds
setInterval(fetchCurrentTrack, 10000);

// Fetch the current track when the page loads
fetchCurrentTrack();
/*
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["script.js"]
    }
  ]
    */

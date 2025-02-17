document.getElementById("login-button").addEventListener("click", () => {
  window.location.href = "/login";
});

// filepath: /c:/Users/saake/SpotifyExtension/script.js
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("showHello").addEventListener("click", async () => {
    fetchCurrentTrack(); // Fetch the current track immediately
    setInterval(fetchCurrentTrack, 2000); // Poll for the current track every 10 seconds
  });
});

let currentTrackName = "No track currently playing";

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
    let newTrackName;
    if (data && data.item && data.item.name) {
      newTrackName = data.item.name;
    } else {
      newTrackName = "No track currently playing";
    }
    if (newTrackName != currentTrackName) {
      currentTrackName = newTrackName;
      updateBoxInAllTabs(currentTrackName);
    }
    //console.log(currentTrackName); ////////////////////////
    displayTrackInfo(data);
  } catch (error) {
    console.error("Error fetching current track:", error);
    document.getElementById("track-info").textContent =
      "Failed to fetch current track";
  }
}

function updateBoxInAllTabs(trackName) {
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      //console.log("Updating track name: " + trackName);
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: addbox,
          args: [trackName],
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log("Script executed on tab ID:", tab.id);
          }
        }
      );
    }
  });
}

async function addbox(trackName) {
  let helloBox = document.getElementById("hello-box");
  if (!helloBox) {
    // Creating and styling the box if it doesn't exist
    helloBox = document.createElement("div");
    helloBox.id = "hello-box";
    helloBox.style.position = "fixed";
    helloBox.style.top = "0px";
    helloBox.style.left = "0px";
    helloBox.style.padding = "5px 10px 5px 10px";
    helloBox.style.backgroundColor = "#191414";
    helloBox.style.color = "#1DB954"; // Font color of the text
    helloBox.style.zIndex = "2**30";
    helloBox.style.fontFamily = "'Circular', sans-serif";
    helloBox.style.borderRadius = "0 0 10px 0"; // Rounded bottom-right corner
    helloBox.style.fontSize = "16px";
    helloBox.style.textAlign = "center";
    helloBox.style.whiteSpace = "nowrap";
    helloBox.style.display = "inline-block"; // Size the box based on content width
    helloBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)"; // Adjusted box shadow
    document.body.appendChild(helloBox);
  }
  // Update the content of the box
  helloBox.innerText = "Song: " + trackName;
}

document.addEventListener("DOMContentLoaded", () => {
  // This checks if Remove box button is clicked in index.html
  document.getElementById("removeHello").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removebox,
      });
    });
  });
});

function removebox() {
  // Function name pretty self-explanatory
  const helloBox = document.getElementById("hello-box");
  if (helloBox) {
    helloBox.remove();
  }
}

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
setInterval(fetchCurrentTrack, 2000);

// Fetch the current track when the page loads
fetchCurrentTrack();

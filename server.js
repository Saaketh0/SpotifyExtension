const express = require("express");
const fetch = require("node-fetch");
const querystring = require("querystring");
const path = require("path");
const { Buffer } = require("buffer");
const cors = require("cors");

const app = express();
const port = 8000;

const client_id = "6bfd432b28de4771844f6480e8bd5a98";
const client_secret = "d61dcc38a1e74ed5a728603bce3fe236";
const redirect_uri = "http://localhost:8000/callback";

app.use(cors());
let access_token = "";

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  const scopes = "user-read-currently-playing";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scopes,
        redirect_uri: redirect_uri,
      })
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      body: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
    });
    const data = await response.json();
    access_token = data.access_token;
    res.redirect("/");
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Error during token exchange");
  }
});

app.get("/current-track", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 204) {
      // No Content
      res.status(204).json({ message: "No content" });
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch current track: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching current track:", error);
    res.status(500).json({ error: "Failed to fetch current track" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const express = require("express"); // Express web server framework
const ax = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

// production stuff
var _port = 8888;
var _redirect_uri = "http://localhost:" + _port + "/callback/";
if (process.env.NODE_ENV == "production") {
  _port = process.env.PORT;
  _redirect_uri = process.env.SPOTIFY_CALL_BACK_URI;
}

const _client_id = process.env.NODE_SPOTIFY_CLIENT_ID || null;
const _client_secret = process.env.NODE_SPOTIFY_CLIENT_SECRET || null;
const track_search_limit = 5;
const directoryPath = __dirname + "/../";

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

const app = express();

app
  .use(express.static(directoryPath))
  .use(helmet())
  .use(compression())
  .use(cors())
  .use(cookieParser());

app.get("/login", function (req, res) {
  let state = generateRandomString(16);
  res.clearCookie(stateKey);
  res.cookie(stateKey, state);

  let scope = "playlist-modify-public playlist-modify-private";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: _client_id,
        scope: scope,
        redirect_uri: _redirect_uri,
        state: state,
        show_dialog: true, // show dialog to allow users to log out
      })
  );
});

app.get("/callback", function (req, res) {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "State mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    // request auth
    const params = {
      client_id: _client_id,
      client_secret: _client_secret,
      redirect_uri: _redirect_uri,
      code,
      grant_type: "authorization_code",
    };

    ax({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        let token = response.data.access_token;
        res.redirect(
          "/#" +
            querystring.stringify({
              authorized: "access_granted",
              token: token,
            })
        );
      })
      .catch((error) => {
        console.log("Failed to login: " + error);
        res.redirect(
          "/#" + querystring.stringify({ authorized: "access_denied" })
        );
      });
  }
});

// Return the string used as a Bearer token
function getBearerAuthHeader(token) {
  if (!token) {
    return "";
  }
  return "Bearer " + token;
}

// Search for a list of tracks given a search query
app.get("/trackSearch", function (req, res) {
  let url =
    "https://api.spotify.com/v1/search?" +
    querystring.stringify({
      limit: track_search_limit,
      q: req.query.track_value,
      offset: req.query.searchOffset,
      type: "track",
    });

  ax({
    method: "get",
    url: url,
    headers: {
      Authorization: getBearerAuthHeader(req.query.token),
    },
  })
    .then((response) => {
      if (response.data.tracks.total > 0) {
        res.json({
          status: response.status,
          message: "success",
          trackResult: response.data,
        });
      } else {
        res.json({
          status: "404",
          message: "Track not found",
        });
      }
    })
    .catch((error) => {
      res.send(handleError(error));
    });
});

// Generate up to 50 recommended songs given params
app.get("/recommendations", function (req, res) {
  let requestData = {
    limit: req.query.limit,
    seed_artists: req.query.seed_artists,
    seed_tracks: req.query.seed_tracks,
    target_energy: req.query.energy,
    target_danceability: req.query.danceability,
    min_popularity: req.query.popular,
  };
  if (req.query.acousticness) {
    requestData["target_acousticness"] = req.query.acousticness;
  }
  if (req.query.speechiness) {
    requestData["target_speechiness"] = req.query.speechiness;
  }
  if (req.query.instrumentalness) {
    requestData["target_instrumentalness"] = req.query.instrumentalness;
  }
  if (req.query.tempo) {
    requestData["target_tempo"] = req.query.tempo;
  }
  if (req.query.valence) {
    requestData["target_valence"] = req.query.valence;
  }

  let url =
    "https://api.spotify.com/v1/recommendations?" +
    querystring.stringify(requestData);

  ax({
    method: "get",
    url: url,
    headers: {
      Authorization: getBearerAuthHeader(req.query.token),
    },
  })
    .then((response) => {
      res.json({
        status: response.status,
        message: "success",
        trackResult: response.data,
      });
    })
    .catch((error) => {
      console.log("Recommendations Failed: " + error);
      res.send(handleError(error));
    });
});

// Creates a playlist, then calls function to add songs to playlist
app.get("/createPlaylist", function (req, res) {
  let seed_song = req.query.seed_song;

  let date = new Date();
  let dateStr =
    +date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

  let name = seed_song + " : Personally DJ'd For You!";
  let desc =
    "Go to https://personal-dj-app.herokuapp.com to make a free Personally DJ'd Playlist now!";

  if (!seed_song) {
    name = "Personal DJ Playlist!";
  }

  // get user profile information
  ax({
    method: "get",
    url: "https://api.spotify.com/v1/me",
    headers: { Authorization: getBearerAuthHeader(req.query.token) },
  })
    .then((response) => {
      // on success get id and create playlist
      let id = response.data.id;

      let url = "https://api.spotify.com/v1/users/" + id + "/playlists";

      const body = {
        name: name,
        description: desc,
      };

      ax({
        method: "post",
        url: url,
        data: body,
        headers: {
          Authorization: getBearerAuthHeader(req.query.token),
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          res.json({
            status: 201,
            message: "Successfully created new playlist",
            data: response.data.id,
          });
        })
        .catch((error) => {
          res.send(handleError(error));
        });
    })
    .catch((error) => {
      console.log("Failed to load user account: " + error);
      res.redirect(
        "/#" +
          querystring.stringify({ authorized: "account_failure", error: error })
      );
    });
});

// Add a list of tracks by id to a playlist by id
app.get("/addTracks", function (req, res) {
  let track_list = req.query.track_list;
  let playlistId = req.query.playlist_id;

  if (!playlistId || !track_list || track_list.length < 1) {
    return;
  }

  let url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";

  const body = {
    uris: track_list,
  };

  ax({
    method: "post",
    url: url,
    data: body,
    headers: {
      "Content-Type": "application/json",
      Authorization: getBearerAuthHeader(req.query.token),
    },
  })
    .then((response) => {
      res.json({
        status: response.status,
        message: "success",
      });
    })
    .catch((error) => {
      res.send(handleError(error));
    });
});

// Handles the error object and returns a JSON message
function handleError(error) {
  // console.log(error);
  if (error.response.status === 401) {
    return {
      status: error.response.status,
      message: "Token time out please log in again",
      trackResult: null,
    };
  } else if (error.response.status === 429) {
    return {
      status: error.response.status,
      message: "Too many requests. Please try again in a few minutes.",
      trackResult: null,
    };
  } else {
    return {
      status: error.response.status,
      message:
        "Something went wrong, no idea what happened. You're on your own!",
      trackResult: null,
    };
  }
}

app.listen(_port);

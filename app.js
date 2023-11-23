require('dotenv').config();
const express = require("express"); // Express web server framework
const ax = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const path = require('path');

const _port = process.env.PORT || 8888;
const _redirect_uri = process.env.SPOTIFY_CALL_BACK_URI;

const _client_id = process.env.NODE_SPOTIFY_CLIENT_ID;
const _client_secret = process.env.NODE_SPOTIFY_CLIENT_SECRET;
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

// Below lines are used in prod to deploy.
// https://www.freecodecamp.org/news/deploy-a-react-node-app-to/
app.use(express.static(path.join(__dirname, 'ui/build')));
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui/build', 'index.html'));
})

app
    .use(express.static(directoryPath))
    .use(helmet())
    .use(compression())
    .use(cors())
    .use(cookieParser());

// Preflight
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8888");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.get("/api/login", function (req, res) {
    let state = generateRandomString(16);
    res.clearCookie(stateKey);
    res.cookie(stateKey, state);

    let scope = "playlist-modify-public playlist-modify-private";
    res.send(
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: _client_id,
            scope: scope,
            redirect_uri: _redirect_uri,
            show_dialog: true, // show dialog to allow users to log out
        })
    );
});

app.get("/callback", function (req, res) {
    let code = req.query.code || null;
    // request auth
    const params = {
        client_id: _client_id,
        client_secret: _client_secret,
        redirect_uri: _redirect_uri,
        code: code,
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
            res.redirect("/dashboard?token=" + token);
        })
        .catch((error) => {
            console.error("Failed to login: \n" + error);
            res.redirect(
                "/#" + querystring.stringify({ authorized: "access_denied" })
            );
        });
    //   }
});

// Return the string used as a Bearer token
function getBearerAuthHeader(token) {
    if (!token) {
        return "";
    }
    return "Bearer " + token;
}

// Search for a list of tracks given a search query
app.get("/api/trackSearch", function (req, res) {

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
            res.send({
                trackResult: response.data,
            });
        })
        .catch((error) => {
            res.status(400);
            if (error.message === "Request failed with status code 401") {
                res.status(401);
            }
            console.error("Track Search Error: \n" + error);
            res.send(error);
        });
});

// Generate up to 50 recommended songs given params
app.get("/api/recommendations", function (req, res) {
    // Required data
    let requestData = {
        seed_tracks: req.query.seed_tracks,
        limit: req.query.limit
    };
    // Optional data
    if (req.query.danceability !== "") {
        requestData["target_danceability"] = req.query.danceability;
    }
    if (req.query.energy !== "") {
        requestData["target_energy"] = req.query.energy;
    }
    if (req.query.popular !== "") {
        requestData[" target_popularity"] = req.query.popular;
    }
    if (req.query.acousticness !== "") {
        requestData["target_acousticness"] = req.query.acousticness;
    }
    if (req.query.speechiness !== "") {
        requestData["target_speechiness"] = req.query.speechiness;
    }
    if (req.query.instrumentalness !== "") {
        requestData["target_instrumentalness"] = req.query.instrumentalness;
    }
    if (req.query.tempo !== "") {
        requestData["target_tempo"] = req.query.tempo;
    }
    if (req.query.valence !== "") {
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
            console.error("Recommendations Failed: " + error);
            res.send(handleError(error));
        });
});

function getReadablePlaylistParameters(data) {
    let dataAsJSON = JSON.parse(data);
    let result = ``;
    for (let key in dataAsJSON) {
        if (dataAsJSON[key] && dataAsJSON[key] !== "")
            result += key + ": " + dataAsJSON[key] + ", ";
    }
    return result;
}

// Creates a playlist, then calls function to add songs to playlist
app.get("/api/createPlaylist", function (req, res) {

    let date = new Date();
    let dateStr =
        +date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

    let track = JSON.parse(req.query.seed_track);
    let playlist_params = req.query.playlist_params;

    let name = "Playlist made by PersonalDJ";
    let desc = "Go to personaldj.net to make a free Personally DJ'd Playlist now! ~~~ Created on ";

    // NOTE: Spotify does not support line breaks or tabs in the description
    if (track && playlist_params) {
        name = track.title + " : PersonalDJ'd for you!"
        desc += dateStr + " ~~~ " +
            "Fine-tuned with:  " +
            getReadablePlaylistParameters(playlist_params);
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
            console.error("Failed to load user account: " + error);
            res.redirect(
                "/#" +
                querystring.stringify({
                    authorized: "account_failure",
                    error: error,
                })
            );
        });
});

// Add a list of tracks by id to a playlist by id
app.get("/api/addTracks", function (req, res) {
    let track_list = req.query.track_list;
    let playlistId = req.query.playlist_id;

    if (!playlistId || !track_list || track_list.length < 1) {
        return;
    }

    let url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";

    for (let i = 0; i < track_list.length; i++) {
        track_list[i] = "spotify:track:" + track_list[i];
    }

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
            error,
        };
    }
}

app.listen(_port, () => {
    console.log(`Server listening on the port::${_port}`);
});

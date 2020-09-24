const express = require('express'); // Express web server framework
const ax = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

// production stuff
const _port = process.env.PORT || 8888;
var _redirect_uri = 'http://localhost:8888/callback/'
if (process.env.NODE_ENV == 'production') {
    _redirect_uri = process.env.SPOTIFY_CALL_BACK_URI;
}

var _client_id = process.env.NODE_SPOTIFY_CLIENT_ID || null;
var _client_secret = process.env.NODE_SPOTIFY_CLIENT_SECRET || null;

var _access_token;
var _refresh_token;
var _token_timeout;

var _user_id = "";
const track_search_limit = 5;

// Constants
const MSG_ACCESS_DENIED = "Access was denied. Please try logging in again.";
const MSG_TOKEN_TIMEOUT = "For security reasons your session expires after a period of inactivity. Please log in again. Thank you!";

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname))
    .use(cors())
    .use(cookieParser());

app.get('/login', function (req, res) {
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    let scope = 'playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: _client_id,
            scope: scope,
            redirect_uri: _redirect_uri,
            state: state,
            show_dialog: true // show dialog to allow users to log out
        }));
});

app.get('/callback', function (req, res) {

    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'State mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        // request auth
        const params = {
            client_id: _client_id,
            client_secret: _client_secret,
            redirect_uri: _redirect_uri,
            code,
            grant_type: "authorization_code"
        };

        ax({
            method: "post",
            url: "https://accounts.spotify.com/api/token",
            params,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded" //WARNING: This may cause errors
            }
        })
            .then(response => {
                _access_token = response.data.access_token;
                _refresh_token = response.data.refresh_token;
                let date = new Date();
                date.setHours(date.getHours() + ((response.data.expires_in || 0) / 3600));
                _token_timeout = date.toISOString();
                ax({
                    method: "get",
                    url: "https://api.spotify.com/v1/me",
                    headers: { Authorization: "Bearer " + _access_token }
                })
                    .then(response => {
                        _user_id = response.data.id;
                        res.redirect("/#" + querystring.stringify({ authorized: true })); // Do not pass access token or refresh token in header
                    })
                    .catch(error => {
                        console.log("Failed to load user account: " + error);
                        res.redirect("/#" + querystring.stringify({ authorized: false }));
                        // res.send({
                        //     statusCode: "400",
                        //     message: "Failed to load user information. Please try again.",
                        //     error: error.response.data
                        // })
                    });
            })
            .catch(error => {
                console.log("Failed to login: " + error);
                res.redirect("/#" + querystring.stringify({ authorized: false }));
                // res.send({
                //     'status': '401',
                //     'message': MSG_ACCESS_DENIED,
                //     'trackResult': null
                // });
            });
    }
});

// Return the string used as a Bearer token
function getBearerAuthHeader() {
    if (!_access_token) {
        return '';
    }
    return 'Bearer ' + _access_token;
}

// Return true if the token has timed out or token is null
function isTokenTimedOutOrInvalid() {
    if (!_token_timeout) {
        return true;
    }
    return !new Date().toISOString >= _token_timeout;
}

// Refreshes the access token.
// Return true if success, false otherwise
function refreshToken() {

    // If token is still valid, return true
    if (!isTokenTimedOutOrInvalid()) {
        // console.log("REFRESH REROUTE");
        return true;
    }

    // missing refresh token, need to log in again
    if (!_refresh_token || _refresh_token == '') {
        // console.log("REFRESH FAILED");
        return false;
    }

    const params = {
        client_id: _client_id,
        client_secret: _client_secret,
        grant_type: "refresh_token",
        refresh_token: _refresh_token
    };

    ax({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        params,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" // WARNING: This may cause errors
        }
    })
        .then(response => {
            _access_token = response.data.access_token;
            return true;
        })
        .catch(error => {
            console.log("REFRESH FAILED! " + error);
            return false;
        });
}

// Search for a list of tracks given a search query
app.get('/trackSearch', function (req, res) {

    // If refresh fails, redirect to login
    if (!refreshToken()) {
        res.send({
            'status': '401',
            'message': MSG_TOKEN_TIMEOUT,
            'trackResult': null
        });
        return;
    }

    let url = 'https://api.spotify.com/v1/search?' +
        querystring.stringify({
            limit: track_search_limit,
            q: req.query.track_value,
            offset: req.query.searchOffset,
            type: 'track'
        });

    ax({
        method: "get",
        url: url,
        headers: {
            Authorization: getBearerAuthHeader()
        }
    })
        .then(response => {
            if (response.data.tracks.total > 0) {
                res.json({
                    'status': response.status,
                    'message': 'success',
                    'trackResult': response.data
                });
            } else {
                res.json({
                    'status': '404',
                    'message': 'Track not found',
                });
            }
        })
        .catch(error => {
            console.log("Track Search Failed: " + error);
            if (error.response.status === 401) {
                res.json({
                    'status': error.response.data,
                    'message': 'Token time out please log in again',
                    'trackResult': null
                });
            } else if (error.response.status === 429) {
                res.json({
                    'status': error.response.data,
                    'message': 'Too many requests. Please try again in a few minutes.',
                    'trackResult': null
                });
            } else {
                res.json({
                    'status': error.response.data,
                    'message': 'Something went wrong and it was definitely your fault because this site is flawless. You could try refreshing the site but this error usually signals something much deeper.',
                    'trackResult': null
                })
            }
        });
});

// Generate up to 50 recommended songs given params 
app.get('/recommendations', function (req, res) {

    // If refresh fails, redirect to login
    if (!refreshToken()) {
        console.log("Trying to reroute to login");
        res.send({
            'status': '401',
            'message': MSG_TOKEN_TIMEOUT,
            'trackResult': null
        });
        return;
    }

    let url = 'https://api.spotify.com/v1/recommendations?' +
        querystring.stringify({
            limit: req.query.limit,
            seed_artists: req.query.seed_artists,
            seed_tracks: req.query.seed_tracks,
            target_energy: req.query.energy,
            target_danceability: req.query.danceability,
            min_popularity: req.query.popular
        });

    ax({
        method: "get",
        url: url,
        headers: {
            Authorization: getBearerAuthHeader()
        }
    })
        .then(response => {
            res.json({
                'status': response.status,
                'message': 'success',
                'trackResult': response.data
            });
        })
        .catch(error => {
            console.log("Recommendations Failed: " + error);
            if (error.response.status === 401) {
                res.json({
                    'status': error.response.data,
                    'message': 'Token time out please log in again',
                    'trackResult': null
                });
            } else if (error.response.status === 429) {
                res.json({
                    'status': error.response.data,
                    'message': 'Too many requests. Please try again in a few minutes.',
                    'trackResult': null
                });
            } else {
                res.json({
                    'status': error.response.data,
                    'message': 'Something went wrong, no idea what happened. You\'re on your own!',
                    'trackResult': null
                });
            }
        });
});

// Creates a playlist, then calls function to add songs to playlist
app.get('/createPlaylist', function (req, res) {

    // If refresh fails, redirect to login
    if (!refreshToken()) {
        console.log("Trying to reroute to login");
        res.send({
            'status': '401',
            'message': MSG_TOKEN_TIMEOUT,
            'trackResult': null
        });
        return;
    }

    let track_list = req.query.track_list;

    let seed_song = req.query.seed_song;
    let dance = req.query.dance;
    let energy = req.query.energy;


    if (!_user_id || _user_id.length < 1 || !track_list || track_list.length < 1) {
        return;
    }

    let url = 'https://api.spotify.com/v1/users/' + _user_id + '/playlists';

    let date = new Date();
    let dateStr = +date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

    let name = seed_song + " : Personally Tailored For You!";
    let desc = "Custom playlist made with " + dance + " danceability, " +
        energy + " energy, and seeded from: " + seed_song + ". Go to https://personal-dj-app.herokuapp.com/ to make your Personal DJ now!";

    if (!seed_song) {
        name = "Personal DJ Playlist " + dateStr;
    }
    if (!dance || !energy) {
        desc = "Custom playlist created by your Personal DJ! Go to https://personal-dj-app.herokuapp.com/ to make your Personal DJ now!";
    }

    const body = {
        "name": name,
        "description": desc
    };

    ax({
        method: "post",
        url: url,
        data: body,
        headers: {
            "Authorization": getBearerAuthHeader(),
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            addTracksToPlaylist(response.data.id, track_list);
        })
        .catch(error => {
            console.log("Playlist could not be created: " + error);
            if (error.response.status === 401) {
                res.json({
                    'status': error.response.data,
                    'message': 'Token time out please log in again'
                });
            } else if (error.response.status === 429) {
                res.json({
                    'status': error.response.data,
                    'message': 'Too many requests. Please try again in a few minutes.'
                });
            } else {
                res.json({
                    'status': error.response.data,
                    'message': 'Something went wrong, no idea what happened. You\'re on your own!',
                })
            }
        });
});

// Add a list of tracks by id to a playlist by id
async function addTracksToPlaylist(playlistId, track_list) {

    if (isTokenTimedOutOrInvalid()) {
        refreshToken();
    }

    if (!playlistId || !track_list || track_list.length < 1) {
        return;
    }

    let url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';

    const body = {
        "uris": track_list
    };

    ax({
        method: "post",
        url: url,
        data: body,
        headers: {
            "Content-Type": "application/json",
            Authorization: getBearerAuthHeader()
        }
    })
        .then(response => {
            return {
                'status': response.status,
                'message': 'success'
            };
        })
        .catch(error => {
            console.log("Failed to add songs to playlist: " + error);
            if (error.response.status === 401) {
                return {
                    'status': error.response.data,
                    'message': 'Token time out please log in again',
                    'trackResult': null
                };
            } else if (error.response.status === 429) {
                return {
                    'status': error.response.data,
                    'message': 'Too many requests. Please try again in a few minutes.',
                    'trackResult': null
                };
            } else {
                return {
                    'status': error.response.data,
                    'message': 'Something went wrong, no idea what happened. You\'re on your own!',
                    'trackResult': null
                };
            }
        });
}

app.listen(_port);
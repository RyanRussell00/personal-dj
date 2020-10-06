//Constants
const token_id = "personal-dj-token";

(function () {
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var params = getHashParams();

  var error = params.error || null;
  authorized = params.authorized || false;
  token = params.token || sessionStorage.getItem(token_id) || null;
  trackResult = [];
  user_id = "";
  searchOffset = 0;
  selectedTrackId = "";
  selectedTrackName = "";

  recList_id = [];

  if (error) {
    msg = error;
    if (error.status === 429) {
      msg += params.Retry - After;
    }
    alert(msg);
    isValidLogin(false);
    window.history.replaceState({}, document.title, "/"); // remove from header to help reduce accidental shares of token
  } else {
    if (authorized == null || token == null) {
      isValidLogin(false);
    } else {
      if (authorized == "access_granted" || token != null) {
        isValidLogin(true);
        sessionStorage.setItem(token_id, token);
      } else {
        isValidLogin(false);
      }
    }
    window.history.replaceState({}, document.title, "/"); // remove from header to help reduce accidental shares of token

    // listener for track search button
    document.getElementById("search-track").addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        validateForm("track-id");
        let track_id_element = document.getElementById("track-id");
        if (!track_id_element.value || track_id_element.value.length < 1) {
          return;
        }
        const { originalText: origText, onRemoveSpinner } = loading(
          "search-track",
          true
        );
        searchTrackByName(track_id_element.value, undefined, function () {
          loading("search-track", false, origText);
          onRemoveSpinner();
        });
      },
      false
    );

    // listener for search results backwards pagination
    document.getElementById("search-last").addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        validateForm("track-id");
        let track_id_element = document.getElementById("track-id");
        if (!track_id_element.value || track_id_element.value.length < 1) {
          return;
        }
        // if already at first page
        if (searchOffset <= 0) {
          return;
        }
        searchOffset -= trackResult.length;
        const { originalText: origText, onRemoveSpinner } = loading(
          "search-last",
          true
        );
        searchTrackByName(track_id_element.value, searchOffset, function () {
          loading("search-last", false, origText);
          onRemoveSpinner();
        });
      },
      false
    );

    // listener for search results forwards pagination
    document.getElementById("search-next").addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        validateForm("track-id");
        let track_id_element = document.getElementById("track-id");
        if (!track_id_element.value || track_id_element.value.length < 1) {
          return;
        }
        // if beyond max limit (2000)
        if (searchOffset > 2000) {
          return;
        }
        searchOffset += trackResult.length;
        const { originalText: origText, onRemoveSpinner } = loading(
          "search-next",
          true
        );
        searchTrackByName(track_id_element.value, searchOffset, function () {
          loading("search-next", false, origText);
          onRemoveSpinner();
        });
      },
      false
    );

    // search for a track by name
    function searchTrackByName(track_name, offset = 0, onDone) {
      $.ajax({
        url: "/trackSearch",
        data: {
          track_value: track_name,
          searchOffset: offset,
          token: sessionStorage.getItem(token_id),
        },
      }).done(function (data) {
        if (responseIsSuccess(data)) {
          trackResult = data.trackResult.tracks.items;
          displaySearchResults(trackResult);
        }
        if (onDone && typeof onDone === "function") {
          onDone(data);
        }
      });
    }

    // listener for recommendations button
    document.getElementById("rec-button").addEventListener(
      "click",
      function (e) {
        e.preventDefault();

        let seed_artists = trackResult[0].artists[0].id;
        let seed_tracks = selectedTrackId;

        // Check selected track and artist exists
        if (
          !seed_tracks ||
          seed_tracks == "" ||
          !seed_artists ||
          seed_artists == ""
        ) {
          alert("Please select a track first.");
        }

        let dance = "danceability";
        let energy = "energy";
        let popular = "popular";
        let limit = "limit";
        let acoustic = 'acousticness';
        let speech = 'speechiness';
        let instrumental = 'instrumentalness';
        let tempo = 'tempo';
        let valence = 'valence';

        // Validate the dance, energy, popular, and limit
        // Using booleans like this because we can validate multiple inputs at a time instead of 1 input at a time
        danceValid = validateForm(dance);
        energyValid = validateForm(energy);
        popularValid = validateForm(popular);
        limitValid = validateForm(limit);
        acousticValid = validateForm(acoustic);
        speechValid = validateForm(speech);
        instrumentalValid = validateForm(instrumental);
        tempoValid = validateForm(tempo);
        valenceValid = validateForm(valence);

        if (!danceValid || !energyValid || !popularValid || !limitValid || !acousticValid || !speechValid || !instrumentalValid || !tempoValid || !valenceValid) {
          return;
        }

        dance = document.getElementById(dance).value;
        energy = document.getElementById(energy).value;
        popular = parseInt(document.getElementById(popular).value);
        limit = parseInt(document.getElementById(limit).value);
        acoustic = parseInt(document.getElementById(acoustic).value);
        speech = parseInt(document.getElementById(speech).value);
        instrumental = parseInt(document.getElementById(instrumental).value);
        tempo = parseInt(document.getElementById(tempo).value);
        valence = parseInt(document.getElementById(valence).value);

        // Check for invalid inputs
        if (!limit || !Number.isInteger(limit) || limit < 1 || limit > 50 ||
          !seed_artists || seed_artists.length < 1 ||
          !seed_tracks || seed_tracks.length < 1 ||
          !dance || dance < 0 || dance > 10 ||
          !energy || energy < 0 || energy > 10 ||
          !popular || !Number.isInteger(popular) || popular < 1 || popular > 100 ||
          acoustic && (acoustic < 0 || acoustic > 10) ||
          speech && (speech < 0 || speech > 10) ||
          instrumental && (instrumental < 0 && instrumental > 10) ||
          tempo && (tempo < 0 || tempo > 10) ||
          valence && (valence < 0 || valence > 10)
        ) {
          return;
        }

        // change energy and hype to decimal values
        dance = parseFloat(dance / 10);
        energy = parseFloat(energy / 10);

        const { originalText: origText, onRemoveSpinner } = loading(
          "rec-button",
          true
        );

        let requestData = {
          'limit': limit,
          'seed_artists': seed_artists,
          'seed_tracks': seed_tracks,
          'danceability': dance,
          'energy': energy,
          'popular': popular,
          'token': sessionStorage.getItem(token_id)
        };
        if(acoustic) {
          acoustic = parseFloat(acoustic / 10);
          requestData['acousticness'] = acoustic;
        }
        if(speech) {
          speech = parseFloat(speech / 10);
          requestData['speechiness'] = speech;
        }
        if(instrumental) {
          instrumental = parseFloat(instrumental / 10);
          requestData['instrumentalness'] = instrumental;
        }
        if(tempo) {
          tempo = parseFloat(tempo / 10);
          requestData['tempo'] = tempo;
        }
        if(valence) {
          valence = parseFloat(valence / 10);
          requestData['valence'] = valence;
        }

        $.ajax({
          url: "/recommendations",
          data: requestData,
        }).done(function (data) {
          if (responseIsSuccess(data)) {
            recList_id = displayRecommendations(data.trackResult);
          }
          loading("rec-button", false, origText);
          onRemoveSpinner();
        });
      },
      false
    );

    // listener for create playlist button
    document.getElementById("playlist-button").addEventListener(
      "click",
      function (e) {
        e.preventDefault();

        let dance = document.getElementById("danceability").value;
        let energy = document.getElementById("energy").value;

        if (
          !recList_id ||
          recList_id.length < 1 ||
          !dance ||
          dance < 0 ||
          dance > 10 ||
          !energy ||
          energy < 0 ||
          energy > 10
        ) {
          return;
        }

        const { originalText: origText, onRemoveSpinner } = loading(
          "playlist-button",
          true
        );

        $.ajax({
          url: "/createPlaylist",
          data: {
            track_list: recList_id,
            seed_song: selectedTrackName,
            energy: energy,
            dance: dance,
            token: sessionStorage.getItem(token_id),
          },
        }).done(function (data) {
          // If successfuly created playlist, add tracks
          if (responseIsSuccess(data) && data && data.data != null) {
            $.ajax({
              url: "/addTracks",
              data: {
                track_list: recList_id,
                playlist_id: data.data,
                token: sessionStorage.getItem(token_id),
              },
            }).done(function (data) {
              responseIsSuccess(data);
              loading("playlist-button", false, origText);
              onRemoveSpinner();
            });
          }
        });
      },
      false
    );
  }
})();

function addSpinner(el) {
  const cls = el.getAttribute("class") || "";
  el.setAttribute("class", cls + " loader-container");
  return function () {
    el.setAttribute("class", cls);
  };
}

// Change text content of id to "loading" or back to original text
function loading(id, status, origText = "I am button hear me roar") {
  var x = document.getElementById(id);

  // Start loading
  if (status == true) {
    const orig = x.textContent;
    x.textContent = "Loading...";
    const removeSpinner = addSpinner(x);
    x.disabled = true;
    return { originalText: orig, onRemoveSpinner: removeSpinner };
  } else {
    x.textContent = origText;
    x.disabled = false;
  }
}

// Selects a track for seeding
function selectTrack(track_id) {
  if (!track_id || track_id.length < 1) {
    return false;
  }
  selectedTrackId = track_id;

  let allTracks = document.getElementsByClassName("track");
  for (let i = 0; i < allTracks.length; i++) {
    let x = allTracks[i];
    // Remove selected class from all elements
    if (x.classList.contains("selected-track")) {
      x.classList.remove("selected-track");
    }
    if (x.id == selectedTrackId) {
      x.classList.add("selected-track");
      selectedTrackName = x.getAttribute("name");
    }
  }
  return true;
}

// Validates that a form is not empty and adds necessary valid/invalid classes
function validateForm(in_form_id) {
  var x = document.getElementById(in_form_id);
  let checkValidity = x.required;
  if(checkValidity) {
    x.classList.remove('is-invalid');
    if (!x.value || x.value.length < 1) {
      x.classList.remove('is-valid');
      x.classList.add('is-invalid');
      return false;
    }
  }
  return true;
}

// Checks if error exists and shows error message. True = NO error, False = Error
function responseIsSuccess(data) {
  var error;
  if (data && data.status.error == null) {
    error = data.status;
  } else {
    error = data.status.error.status || "401";
  }
  var msg = data.message;
  // if unauthorized we need to prompt log in
  if (error && parseInt(error) == 401) {
    alert(msg);
    isValidLogin(false);
    return false;
  }
  if (error && error >= 400) {
    alert(msg || "Error: Please try logging in and out again.");
    return false;
  }
  return true;
}

function isValidLogin(valid) {
  valid = Boolean(valid);
  if (valid == true) {
    $("#login").hide();
    $("#loggedin").show();
  } else {
    sessionStorage.removeItem(token_id);
    $("#login").show();
    $("#loggedin").hide();
  }
}

// generates search results
/*
<div class="col" id="A">
    <div class="card shadow">
        <img class="card-img-top" src="Album Art">
        <p class="card-title py-2">Song Title <br> <i>by Artist</i></p>
    </div>
</div>
*/
function displaySearchResults(in_val) {
  let container = document.getElementById("track-search-results");

  container.innerHTML = "";

  if (!in_val || in_val.length < 1) {
    container.innerHTML = "";
    container.innerHTML = `
        <div class="col">
            <h5 class="text-danger">No Search Results Found</h5>
        </div>`;
    return false;
  }

  document.getElementById("search-pagination").style.display = "block";
  document.getElementById("step-2").style.display = "block";

  for (let i = 0; i < in_val.length; i++) {
    let imgUrl =
      in_val[i].album.images[0].url ||
      "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
    let trackName = in_val[i].name || "Title Not Found";
    let artistName = in_val[i].artists[0].name || "Artist Not Found";
    let trackId = in_val[i].id || null;
    container.innerHTML += `
        <div class="col-lg col-sm-6">
            <div class="card shadow track my-2" name="${fixTrackName(
              trackName
            )} "id="${trackId}" onclick="selectTrack('${trackId}')">
                <img class="card-img-top" src="${imgUrl}">
                <p class="card-title py-2">${trackName} <br> <i>by ${artistName}</i></p>
            </div>
        </div>
        `;
  }
}

// function that fixes a track name that has quotes
function fixTrackName(inTrackName) {
  let regmatch = /\\([\s\S])|(")/g;

  if (inTrackName != "Title Not Found" && inTrackName.match(regmatch)) {
    return inTrackName.replace(regmatch, "&quot;");
  }
  return inTrackName;
}

// generates HTML like such
/*
<div id="rec-results">
    <div>
        <h4>Track Name</h4>
        <h5>Artist</h5>
        <a href="">Click to listen</a>
    </div>
    </div>
*/
function displayRecommendations(in_rec_list) {
  clearResults();
  // error where data is null
  if (!in_rec_list) {
    alert("Recommendations are null. Try again.");
    return false;
  }
  if (in_rec_list.length < 1) {
    alert("No recommendations found.");
    return false;
  }
  // data is good

  var recList = [];

  // parent div that holds list
  var results = document.getElementById("rec-results");
  for (i = 0; i < in_rec_list.tracks.length; i++) {
    // update list of ids of tracks to later add to playlist
    recList.push(in_rec_list.tracks[i].uri);
    var curr = in_rec_list["tracks"][i];
    results.innerHTML += `
        <div class="col-sm-3">
            <a href="${curr.external_urls.spotify}" target="_blank" style="text-decoration: none;">
                <div class="card my-1 text-center">
                    <img class="card-img-top" src="${curr.album.images[0].url}">
                    <p class="card-title py-2">${curr.name} <br> <i>by ${curr.artists[0].name}</i></p>
                </div>
            </a>
        </div>
        `;
  }
  document.getElementById("playlist-button").style.display = "block";
  return recList;
}

function clearResults() {
  document.getElementById("rec-results").innerHTML = "";
  document.getElementById("playlist-button").style.display = "none";
  recList_id = [];
}

function showOptionalInputs(element) {
  if(element.id === "show-optional-inputs") {
    if(element.checked) {
        document.getElementById("additional-options").style.display = "block";
    } else {
        document.getElementById("additional-options").style.display = "none";
    }
  }
}

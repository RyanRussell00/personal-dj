import {AxiosResponse} from "axios";
import {SearchResultModel} from "../models/SearchResultModel";
import {fixTrackName} from "./DisplayUtilities";
import {image404_url} from "./constants";
import {PlaylistTrackModel} from "../models/PlaylistTrackModel";

export const mapJSONTrackSearchToModel = (data: AxiosResponse) => {
    let results: SearchResultModel[] = [];
    // This fat try catch makes me feel sick
    try {
        let searchResultsAsJSON = data.data.trackResult.tracks.items;
        // Parse JSON and create them into components
        for (let i = 0; i < searchResultsAsJSON.length; i++) {
            let tempImgUrl = searchResultsAsJSON[i].album.images[0].url || image404_url;
            let tempTitle = fixTrackName(
                searchResultsAsJSON[i].name || "Title Not Found"
            );
            let tempArtistName =
                searchResultsAsJSON[i].artists[0].name || "Artist Not Found";
            let tempTrackId = searchResultsAsJSON[i].id;
            // Add all results to explicit list (both explicit and non explicit)
            results.push({
                trackId: tempTrackId,
                title: tempTitle,
                imgUrl: tempImgUrl,
                artistName: tempArtistName,
            });
        }
        return results;
    } catch (e) {
        console.error("Failed to convert track result response to model");
        return [];
    }
}

export const mapJSONRecommendedTracksToModel = (data: AxiosResponse) => {
    let explicit: PlaylistTrackModel[] = [];
    let nonExplicit: PlaylistTrackModel[] = [];
    console.log(data);
    try {
        if (!data) {
            return [[], []];
        }
        let dataAsJSON = data.data.trackResult;
        console.log(dataAsJSON);
        for (let i = 0; i < dataAsJSON.tracks.length; i++) {
            let curr = dataAsJSON.tracks[i];
            let track: PlaylistTrackModel = {
                trackId: curr.id,
                title: curr.name,
                imgUrl: curr.album.images[0].url,
                artistName: curr.artists[0].name,
                explicit: curr.explicit
            };
            // Always add to explicit
            explicit.push(track);
            // Only add non explicit to nonExplicit one
            if (!track.explicit) {
                nonExplicit.push(track);
            }
        }
        return [explicit, nonExplicit];
    } catch (e) {
        console.error("Failed to convert recommendations to model");
        return [[], []];
    }
}
export const idsFromTracks = (tracks: PlaylistTrackModel[]) => {
    let ids: string[] = [];
    tracks.forEach((t) => {
        ids.push(t.trackId);
    })
    return ids;
}
import {AxiosResponse} from "axios";
import {SearchResultModel} from "../models/SearchResultModel";
import {fixTrackName} from "./DisplayUtilities";
import {image404_url} from "./constants";

export const mapJSONTrackSearchToModel = (data: AxiosResponse) => {
    let results: SearchResultModel[] = [];
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

export const searchResultModelMapper = (data: any) => {

}
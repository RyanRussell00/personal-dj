// import React, {useState} from "react";
// import axios from "axios";
// import {SearchResultList} from "./SearchResultList";
// import {handleError} from '../../utilities/apiErrorHandler'
// import {PATHS} from "../../utilities/constants";
// import {LoadingAnimation} from "../../utilities/LoadingAnimation";
// import {SearchResultModel} from "../../SearchResultModel";
//
// type MediaSearchProps = {
//     token: () => string,
//     setSelected: () => void
// }
//
export const MediaSearch = () => {}
//         const [searchText, setSearchText] = useState("");
//         const [offset, setOffset] = useState(5);
//         const [results, showResults] = useState(false);
//         const [resultsList, setResultsList] = useState([]);
//         const [isLoading, setIsLoading] = useState(false);
//
//         function searchForMedia(event) {
//             if (event) event.preventDefault();
//             setIsLoading(true);
//             setResultsList([]);
//             setSelected(null);
//
//             axios
//                 .get(PATHS.api + "/trackSearch", {
//                     params: {
//                         track_value: searchText,
//                         searchOffset: offset,
//                         token: token,
//                     },
//                 })
//                 .then((response) => {
//                     loadSearchResults(response.data.trackResult.tracks.items);
//                 }).catch((err) => {
//                 handleError(err);
//             }).finally(() => setIsLoading(false));
//         }
//
//         function loadSearchResults(searchResultsAsJSON: JSON) {
//             let tempResultsList: SearchResultModel[] = [];
//             // Parse JSON and create them into components
//             for (let i = 0; i < searchResultsAsJSON.length; i++) {
//                 let tempImgUrl = searchResultsAsJSON[i].album.images[0].url ||
//                     "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
//                 let tempTitle = fixTrackName(
//                     searchResultsAsJSON[i].name || "Title Not Found"
//                 );
//                 let tempArtistName =
//                     searchResultsAsJSON[i].artists[0].name || "Artist Not Found";
//                 let tempTrackId = searchResultsAsJSON[i].id || null;
//                 tempResultsList.push({
//                     title: tempTitle,
//                     id: tempTrackId,
//                     artist: tempArtistName,
//                     imgUrl: tempImgUrl,
//                 });
//             }
//             setResultsList(tempResultsList);
//             showResults(true);
//         }
//
//         // function that fixes a track name that has quotes
//         function fixTrackName(inTrackName) {
//             let regmatch = /\\([\s\S])|(")/g;
//
//             if (inTrackName != "Title Not Found" && inTrackName.match(regmatch)) {
//                 return inTrackName.replace(regmatch, "&quot;");
//             }
//             return inTrackName;
//         }
//
//         const loadLessResults = (event) => {
//             setOffset(Math.max(0, offset - 5));
//             searchForMedia(event);
//         };
//
//         const loadMoreResults = (event) => {
//             setOffset(Math.max(0, offset + 5));
//             searchForMedia(event);
//         };
//
//         return (
//             <>
//                 <form className="container" onSubmit={searchForMedia}>
//                     <label>Search for a track:</label>
//                     <br/>
//                     <input
//                         className="w-75"
//                         type="text"
//                         placeholder="Track name..."
//                         onChange={(e) => setSearchText(e.target.value)}
//                         required
//                     />
//                     <br/>
//                     <button className="my-3 px-5 btn btn-success" type="submit">
//                         Search
//                     </button>
//                 </form>
//                 <LoadingAnimation show={isLoading}/>
//                 {resultsList.length > 0 ? (
//                     <div className="search-results p-4">
//                         <div className="">
//                             <SearchResultList
//                                 searchResults={resultsList}
//                                 setCurrentSelected={setSelected}
//                             />
//                         </div>
//                         <div className="my-4">
//                             <ul className="row pagination justify-content-center">
//                                 <li className="page-item" onClick={loadLessResults}>
//                                     <a className="btn btn-success text-white"> Show Last 5 </a>
//                                 </li>
//                                 <li className="px-2">Don't See Your Track?</li>
//                                 <li className="page-item" onClick={loadMoreResults}>
//                                     <a className="btn btn-success text-white">Show Next 5</a>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 ) : ((results && !isLoading) ?
//                     <h3 className="my-3 text-white">No tracks found</h3> : <></>)}
//             </>
//         );
//     }
// ;
// export default MediaSearch;

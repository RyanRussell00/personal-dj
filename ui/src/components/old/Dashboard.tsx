// import {useHistory, useLocation} from "react-router-dom";
// import {useEffect, useState} from "react";
// import NewPlaylistForm from "./NewPlaylistForm";
// import MediaSearch from "./MediaSearch";
// import {saveToken, getTokenFromCookies, tokenError} from '../../utilities/cookieHandler'
//
export const Dashboard = () => {}
//     const [selected, setSelected] = useState(null);
//     const query = new URLSearchParams(useLocation().search);
//     const history = useHistory();
//     const newToken = query.get("token");
//     useEffect(() => {
//         if (newToken) {
//             saveToken(newToken);
//             // Hide user token so they don't accidentally copy paste it out
//             history.replace({search: ""});
//         } else if (!getTokenFromCookies()) {
//             tokenError();
//             history.replace("/");
//         }
//     }, []);
//
//     // Need to implement child callbacks: https://linguinecode.com/post/get-child-component-state-from-parent-component
//     return (
//         <div className="container-lg py-1 text-center">
//             <h1>Create a new Playlist!</h1>
//             <MediaSearch
//                 token={getTokenFromCookies()}
//                 setSelected={setSelected}
//             />
//             {(selected &&
//                 <NewPlaylistForm seedIds={selected} token={getTokenFromCookies()}/>)}
//         </div>
//     );
// };
//
// export default Dashboard;

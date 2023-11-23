import { useEffect } from "react";
import { PATHS } from "../utilities/constants";
import axios from "axios";
import { useHistory } from "react-router";

export const HandleAuth = () => {

    const history = useHistory();
    const query = new URLSearchParams(window.location.search);
    const authCode = query.get("code");

    useEffect(() => {
        if (authCode) {
            axios.get(PATHS.api + "/callback/", {
                params: {
                    code: authCode
                }
            }).then((response) => {
                console.log("Received callback response: ", response);
                window.location.href = PATHS.dashboard + "?token=" + response.data.body;
            }).catch((error) => {
                console.error(error);
                history.push(PATHS.home);
            });
        } else {
            console.error("Auth code invalid!")
            history.push(PATHS.home);
        }
    });

    return (
        <h1> Loading...</h1 >
    )
}
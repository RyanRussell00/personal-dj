import Cookies from "js-cookie";
const TOKEN_COOKIE = "personal_dj_token";

export const saveToken = (newToken) => {
    removeCookie();
    // Set the cookie to expire in 1 hour (Spotify expiry time)
    // The "expires" value has to be in days, so 1/24 is 1 hour
    // let inOneHour = 1 / 24;
    Cookies.set(TOKEN_COOKIE, newToken);
}

export const getTokenFromCookies = () => {
    return Cookies.get(TOKEN_COOKIE);
}

export const removeCookie = () => {
    Cookies.remove(TOKEN_COOKIE);
}

export const tokenError = () => {
    removeCookie();
}
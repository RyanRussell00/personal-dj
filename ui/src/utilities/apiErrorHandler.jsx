import {removeCookie} from './cookieHandler'

export const handleError = (error) => {
    console.error(error)
    if (!error || !error.message) {
        alert("Unknown error. Please try refreshing your browser.");
        return;
    }
    if (error.message.includes("401")) {
        alert("Session expired. Please refresh your browser.");
        removeCookie();

    } else {
        alert("Unkown error. Please try again. If issue continues, refresh your browser.")

    }
}

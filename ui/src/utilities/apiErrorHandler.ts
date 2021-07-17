import {removeCookie} from './cookieHandler'

// TODO: Do some more extensive error handling w/ better messages
export const handleError = (error: any) => {
    console.error(error)
    if (!error || !error.message) {
        alert("Unknown error. Please try refreshing your browser.");
        return;
    }
    if (error.message.includes("401")) {
        alert("Session expired. Please login again.");
        removeCookie();
        window.location.href = '/';

    } else {
        alert("Unknown error. Please try again. If issue continues, refresh your browser.")
    }
}

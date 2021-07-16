//         // function that fixes a track name that has quotes
export function fixTrackName(inTrackName: string) {
    let regmatch = /\\([\s\S])|(")/g;

    if (inTrackName != "Title Not Found" && inTrackName.match(regmatch)) {
        return inTrackName.replace(regmatch, "&quot;");
    }
    return inTrackName;
}
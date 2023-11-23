export const API_ROOT_PATH = process.env.NODE_ENV === "production" ? "https://personaldj.net" : "http://localhost:8888";

export const PATHS = {
    api: API_ROOT_PATH + "/api",
    dashboard: "/dashboard",
    home: "/",
    callback: "/callback",
};

export const image404_url = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Home from "./components/Home";
import reportWebVitals from "./reportWebVitals";
import Footer from "./components/Footer";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {MediaSearchForm} from "./components/MediaSearchForm";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route path="/" exact>
                    <Home/>
                </Route>
                <Route path="/dashboard" exact>
                    <MediaSearchForm/>
                </Route>
            </Switch>
            <Footer/>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

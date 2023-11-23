import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Home from "./components/Home";
import reportWebVitals from "./reportWebVitals";
import Footer from "./components/Footer";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { HandleAuth } from "./components/HandleAuth";
import { PATHS } from "./utilities/constants";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route path={PATHS.home} exact>
                    <Home />
                </Route>
                <Route path={PATHS.callback} exact>
                    <HandleAuth />
                </Route>
                <Route path={PATHS.dashboard} exact>
                    <Dashboard />
                </Route>
            </Switch>
            <Footer />
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

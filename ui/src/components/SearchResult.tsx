import React from "react";
import {SearchResultModel} from "../models/SearchResultModel";

type SearchResultProps = {
    searchResult: SearchResultModel
}

export const SearchResult: React.FC<SearchResultProps> = ({searchResult}) => {
    return (
        <div className="col-lg col-sm-3 m-1">
            <div
                className={
                    "card shadow track my-2 d-block " +
                    (searchResult.isSelected && searchResult.showSelected ? "selected-track" : "")
                }
                id={searchResult.trackId}
                onClick={() => searchResult.onClick(searchResult.trackId)}
            >
                <img className="card-img-top" src={searchResult.imgUrl}/>
                <p className="card-title py-2">
                    {searchResult.title}
                    <br/>
                    <i>by {searchResult.artistName}</i>
                </p>
            </div>
        </div>
    );
};

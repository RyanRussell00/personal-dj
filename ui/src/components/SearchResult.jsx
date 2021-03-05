import { useEffect, useState } from "react";
export const SearchResult = ({
  trackId,
  title,
  imgUrl,
  artistName,
  isSelected,
  onClick,
  showSelected,
}) => {
  return (
    <div className="col-lg col-sm-3 m-1">
      <div
        className={
          "card shadow track my-2 d-block " +
          (isSelected && showSelected ? "selected-track" : "")
        }
        name={title}
        id={trackId}
        onClick={() => onClick(trackId)}
      >
        <img className="card-img-top" src={imgUrl} />
        <p className="card-title py-2">
          {title}
          <br />
          <i>by {artistName}</i>
        </p>
      </div>
    </div>
  );
};

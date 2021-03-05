import { useEffect, useState } from "react";
import { SearchResult } from "./SearchResult";
export const SearchResultList = ({ searchResults, setCurrentSelected }) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (id) => {
    setSelected(id); // Set the selected to show which one is highlighted
    if (setCurrentSelected != null) setCurrentSelected(id); // Callback function so the parent can have access to the selected id
  };

  return (
    <>
      {searchResults.map((result) => {
        return (
          <SearchResult
            key={result.id}
            trackId={result.id}
            title={result.title}
            imgUrl={result.imgUrl}
            artistName={result.artist}
            isSelected={selected === result.id}
            onClick={handleClick}
            showSelected={setCurrentSelected != null}
          />
        );
      })}
    </>
  );
};

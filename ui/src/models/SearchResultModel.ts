export interface SearchResultModel {
    trackId: string,
    title: string,
    imgUrl: string,
    artistName: string,
    isSelected: boolean,
    onClick: (id: string) => void,
    showSelected: boolean,
}
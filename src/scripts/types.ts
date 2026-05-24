export interface Playlist {
  id: string;
  name: string;
  external_urls: { spotify: string };
  images: { url: string }[];
  owner: {
    display_name: string | null,
  }
}

export type PlaylistSelectionType = "source" | "target";
export type Photo = {
  id: string;
  src: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  tags: string[];
  dataAiHint?: string;
};

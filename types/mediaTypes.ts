export interface MediaStats {
  localPhotos: number;
  localVideos: number;
  networkPhotos: number;
  networkVideos: number;
  orientations: { [key: string]: number };
  aspectRatios: { [key: string]: number };
  fileTypes: { [key: string]: number };
  creationYears: { [key: string]: number };
  timeOfDay: { [key: string]: number };
  cameraModels: { [key: string]: number };
  lensModels: { [key: string]: number };
  highest: number;
  lowest: number;
  fastest: number;
  totalVideoDuration: number;
  longestVideo: number;
}

export interface PhotoLocation {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  error?: string;
}

export type ExifInfo = {
  [key: string]: any;
};

export const STORAGE_KEYS = {
  mediaStats: "mediaStats",
  photoLocations: "photoLocations",
};

export const BATCH_SIZE = 50;
export const MAX_MEDIA = 1000;

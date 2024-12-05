import * as MediaLibrary from "expo-media-library";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MediaStats,
  getInitialMediaStats,
  PhotoLocation,
  ExifInfo,
  ProcessingStatus,
  STORAGE_KEYS,
  BATCH_SIZE,
  MAX_MEDIA,
} from "../types/mediaTypes";
import {
  getFileType,
  getOrientation,
  getAspectRatio,
  getTimeOfDay,
} from "../utils/mediaUtils";
import { Alert } from "react-native";

const processAsset = async (
  asset: MediaLibrary.Asset,
  mediaStats: MediaStats,
): Promise<PhotoLocation | undefined> => {
  try {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset, {
      shouldDownloadFromNetwork: false,
    });

    if (assetInfo.isNetworkAsset) {
      asset.mediaType === MediaLibrary.MediaType.photo
        ? mediaStats.networkPhotos++
        : mediaStats.networkVideos++;
      return;
    }

    // media type
    if (asset.mediaType === MediaLibrary.MediaType.photo) {
      mediaStats.localPhotos++;
    } else {
      mediaStats.localVideos++;
      mediaStats.totalVideoDuration += asset.duration || 0;
      mediaStats.longestVideo = Math.max(
        mediaStats.longestVideo,
        asset.duration || 0,
      );
    }

    // file type
    const fileType = getFileType(asset.filename);
    mediaStats.fileTypes[fileType] = (mediaStats.fileTypes[fileType] || 0) + 1;

    // Creation year
    const year = new Date(asset.creationTime).getFullYear().toString();
    mediaStats.creationYears[year] = (mediaStats.creationYears[year] || 0) + 1;

    // Time of day
    const hour = new Date(asset.creationTime).getHours();
    const timeOfDay = getTimeOfDay(hour);
    mediaStats.timeOfDay[timeOfDay] =
      (mediaStats.timeOfDay[timeOfDay] || 0) + 1;

    // Orientation
    const orientation = getOrientation(asset.width, asset.height);
    mediaStats.orientations[orientation] =
      (mediaStats.orientations[orientation] || 0) + 1;

    // Aspect ratio
    const aspectRatio = getAspectRatio(asset.width, asset.height);
    mediaStats.aspectRatios[aspectRatio] =
      (mediaStats.aspectRatios[aspectRatio] || 0) + 1;

    // EXIF data
    if (assetInfo.exif) {
      const exif = assetInfo.exif as ExifInfo;

      // Camera Model
      const cameraModel = exif["{TIFF}"]?.Model;
      if (typeof cameraModel === "string") {
        mediaStats.cameraModels[cameraModel] =
          (mediaStats.cameraModels[cameraModel] || 0) + 1;
      }

      // Lens Model
      const lensModel = exif["{Exif}"]?.LensModel;
      if (typeof lensModel === "string") {
        mediaStats.lensModels[lensModel] =
          (mediaStats.lensModels[lensModel] || 0) + 1;
      }

      // GPS
      const altitude = Number(exif["{GPS}"]?.Altitude);
      if (!isNaN(altitude)) {
        mediaStats.highest = Math.max(mediaStats.highest, altitude);
        mediaStats.lowest = Math.min(mediaStats.lowest, altitude);
      }

      const speed = Number(exif["{GPS}"]?.Speed);
      if (!isNaN(speed)) {
        mediaStats.fastest = Math.max(mediaStats.fastest, speed);
      }
    }

    // location
    if (assetInfo.location) {
      return {
        id: asset.id,
        latitude: Number(assetInfo.location.latitude),
        longitude: Number(assetInfo.location.longitude),
        timestamp: asset.creationTime,
      } as PhotoLocation;
    }
  } catch (error) {
    console.error("Error processing asset:", error);
  }
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const convertToWLPoints = (locations: PhotoLocation[]): PhotoLocation[] => {
  if (locations.length <= 1) return locations;

  const result: PhotoLocation[] = [locations[0]]; // Always keep first point
  const DISTANCE_THRESHOLD = 20; // 20 meters

  for (let i = 1; i < locations.length; i++) {
    const current = locations[i];
    const prev = result[result.length - 1];

    const distance = calculateDistance(
      prev.latitude,
      prev.longitude,
      current.latitude,
      current.longitude,
    );

    if (distance >= DISTANCE_THRESHOLD) {
      result.push(current);
    }
  }

  return result;
};

export const useMediaProcessing = () => {
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
  });

  const startProcessing = useCallback(async () => {
    // permissions
    const { status: permissionStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (permissionStatus !== "granted") {
      setStatus((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Permission denied",
      }));
      return false;
    }

    analyzeMediaLibrary();
    return true;
  }, []);

  const analyzeMediaLibrary = useCallback(async () => {
    setStatus({ isProcessing: true, progress: 0 });

    try {
      let mediaStats = getInitialMediaStats();
      let locationData: PhotoLocation[] = [];
      let hasNextPage = true;
      let endCursor: string | undefined;
      let totalProcessed = 0;

      while (hasNextPage && totalProcessed < MAX_MEDIA) {
        const {
          assets,
          endCursor: newEndCursor,
          hasNextPage: newHasNextPage,
        } = await MediaLibrary.getAssetsAsync({
          first: BATCH_SIZE,
          after: endCursor,
          mediaType: [
            MediaLibrary.MediaType.photo,
            MediaLibrary.MediaType.video,
          ],
          sortBy: [MediaLibrary.SortBy.creationTime],
        });

        await Promise.all(
          assets.map(async (asset) => {
            const result = await processAsset(asset, mediaStats);
            if (result) locationData.push(result);
          }),
        );

        totalProcessed += assets.length;
        setStatus((prev) => ({
          ...prev,
          progress: totalProcessed,
        }));

        // sort by timestamp
        locationData.sort((a, b) => a.timestamp - b.timestamp);

        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.mediaStats,
            JSON.stringify(mediaStats),
          );
          await AsyncStorage.setItem(
            STORAGE_KEYS.photoLocations,
            JSON.stringify(locationData),
          );
          console.log(`Saved ${locationData.length} photo locations`);
        } catch (storageError) {
          console.error("Error saving to storage:", storageError);
        }

        hasNextPage = newHasNextPage;
        endCursor = newEndCursor;
      }

      let worldLineLocations = convertToWLPoints(locationData);

      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.worldLineLocations,
          JSON.stringify(worldLineLocations),
        );
        console.log(`Saved ${worldLineLocations.length} WL locations`);
      } catch (storageError) {
        console.error("Error saving to storage:", storageError);
      }

      if (totalProcessed >= MAX_MEDIA) {
        Alert.alert(
          "Analysis Limit Reached",
          `Analyzed ${totalProcessed} media items. Some items may not be included in the stats.`,
        );
      }
      setStatus({ isProcessing: false, progress: totalProcessed });
    } catch (error) {
      console.error("Error processing media library:", error);
      setStatus((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Failed to process media library",
      }));
    }
  }, []);

  return {
    status,
    startProcessing,
  };
};

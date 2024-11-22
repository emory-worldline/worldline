import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TextProps, Button, ScrollView, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  mediaStats: "mediaStats",
  photoLocations: "photoLocations",
} as const;

const BATCH_SIZE = 10;
const MAX_MEDIA = 1000;

interface MediaStats {
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

const initialMediaStats: MediaStats = {
  localPhotos: 0,
  localVideos: 0,
  networkPhotos: 0,
  networkVideos: 0,
  orientations: {},
  aspectRatios: {},
  fileTypes: {},
  creationYears: {},
  timeOfDay: {},
  cameraModels: {},
  lensModels: {},
  highest: 0,
  lowest: Infinity,
  fastest: 0,
  totalVideoDuration: 0,
  longestVideo: 0,
};

interface PhotoLocation {
  id: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: number;
}

type ExifInfo = {
  [key: string]: any;
};

function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const typeMap: { [key: string]: string } = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    dng: "RAW",
    heic: "HEIC",
    gif: "GIF",
    tiff: "TIFF",
    bmp: "BMP",
    mp4: "MP4",
    mov: "MOV",
    avi: "AVI",
    mkv: "MKV",
  };
  return typeMap[extension] || "Unknown";
}

function getOrientation(width: number, height: number): string {
  if (width > height) return "Landscape";
  if (height > width) return "Portrait";
  return "Square";
}

function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const LibraryAnalyzer: React.FC = () => {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadStoredStats = async () => {
      try {
        const storedStats = await AsyncStorage.getItem(STORAGE_KEYS.mediaStats);
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.error("Error loading stored stats:", error);
      }
    };

    loadStoredStats();
  }, []);

  const processAsset = async (
    asset: MediaLibrary.Asset,
    mediaStats: MediaStats,
  ) => {
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

      if (asset.mediaType === MediaLibrary.MediaType.photo) {
        mediaStats.localPhotos++;
      } else {
        mediaStats.localVideos++;
        mediaStats.totalVideoDuration += asset.duration;
        mediaStats.longestVideo = Math.max(
          mediaStats.longestVideo,
          asset.duration,
        );
      }

      // File type
      const fileType = getFileType(asset.filename);
      mediaStats.fileTypes[fileType] =
        (mediaStats.fileTypes[fileType] || 0) + 1;

      // Creation year
      const year = new Date(asset.creationTime).getFullYear().toString();
      mediaStats.creationYears[year] =
        (mediaStats.creationYears[year] || 0) + 1;

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
    } catch (assetError) {
      console.error("Error processing asset:", assetError);
    }
  };

  const analyzeMediaLibrary = useCallback(async () => {
    setProcessing(true);
    setProgress(0);
    setStats(null);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access media library was denied");
      }

      let mediaStats: MediaStats = { ...initialMediaStats };
      let locationData: PhotoLocation[] = [];
      let hasNextPage = true;
      let endCursor: string | undefined;

      while (
        hasNextPage &&
        mediaStats.localPhotos +
          mediaStats.localVideos +
          mediaStats.networkPhotos +
          mediaStats.networkVideos <
          MAX_MEDIA
      ) {
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

        setStats({ ...mediaStats });
        setProgress(
          mediaStats.localPhotos +
            mediaStats.localVideos +
            mediaStats.networkPhotos +
            mediaStats.networkVideos,
        );

        hasNextPage = newHasNextPage;
        endCursor = newEndCursor;
      }

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

      if (
        mediaStats.localPhotos +
          mediaStats.localVideos +
          mediaStats.networkPhotos +
          mediaStats.networkVideos >=
        MAX_MEDIA
      ) {
        Alert.alert(
          "Analysis Limit Reached",
          `Analyzed ${MAX_MEDIA} media items. Some items may not be included in the stats.`,
        );
      }
    } catch (error) {
      console.error("Error analyzing media library:", error);
      Alert.alert(
        "Error",
        "An error occurred while analyzing the media library. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  }, []);

  const StyledText: React.FC<TextProps> = ({ style, ...props }) => (
    <Text style={[{ color: "#FFFFFF" }, style]} {...props} />
  );

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {!processing && !stats && (
        <Button title="Analyze Media Library" onPress={analyzeMediaLibrary} />
      )}
      {!processing && stats && (
        <Button title="Reprocess Media Library" onPress={analyzeMediaLibrary} />
      )}
      {processing && (
        <StyledText>Processing... {progress} items analyzed</StyledText>
      )}
      {stats && (
        <View>
          <StyledText
            style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
          >
            Media Library Stats
          </StyledText>
          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            Total Media:{" "}
            {stats.localPhotos +
              stats.localVideos +
              stats.networkPhotos +
              stats.networkVideos}
          </StyledText>
          <StyledText>Local Photos: {stats.localPhotos}</StyledText>
          <StyledText>Network Photos: {stats.networkPhotos}</StyledText>
          <StyledText>Local Videos: {stats.localVideos}</StyledText>
          <StyledText>Network Videos: {stats.networkVideos}</StyledText>
          <StyledText>
            Total Video Duration: {(stats.totalVideoDuration / 60).toFixed(2)}{" "}
            minutes
          </StyledText>
          <StyledText>
            Longest Video Duration: {(stats.longestVideo / 60).toFixed(2)}{" "}
            minutes
          </StyledText>
          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            Extremes:
          </StyledText>
          <StyledText>Highest: {stats.highest.toFixed(2)} meters</StyledText>
          <StyledText>
            Lowest:{" "}
            {stats.lowest === Infinity
              ? "N/A"
              : stats.lowest.toFixed(2) + " meters"}
          </StyledText>
          <StyledText>Fastest: {stats.fastest.toFixed(2)} km/h</StyledText>

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            File Types:
          </StyledText>
          {Object.entries(stats.fileTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([ratio, count]) => (
              <StyledText key={ratio}>
                {ratio}: {count}
              </StyledText>
            ))}

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            Orientations:
          </StyledText>
          {Object.entries(stats.orientations)
            .sort((a, b) => b[1] - a[1])
            .map(([orientation, count]) => (
              <StyledText key={orientation}>
                {orientation}: {count}
              </StyledText>
            ))}

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            Top 5 Aspect Ratios:
          </StyledText>
          {Object.entries(stats.aspectRatios)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ratio, count]) => (
              <StyledText key={ratio}>
                {ratio}: {count}
              </StyledText>
            ))}

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            Top 5 Camera Models:
          </StyledText>
          {Object.entries(stats.cameraModels)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([model, count]) => (
              <StyledText key={model}>
                {model}: {count}
              </StyledText>
            ))}

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            By Year:
          </StyledText>
          {Object.entries(stats.creationYears)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, count]) => (
              <StyledText key={year}>
                {year}: {count}
              </StyledText>
            ))}

          <StyledText style={{ fontWeight: "bold", marginTop: 10 }}>
            By Time of Day:
          </StyledText>
          {Object.entries(stats.timeOfDay).map(([time, count]) => (
            <StyledText key={time}>
              {time}: {count}
            </StyledText>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default LibraryAnalyzer;

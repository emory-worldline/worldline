import React, { useState, useCallback } from "react";
import { View, Text, Button, ScrollView, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";

const BATCH_SIZE = 10;
const MAX_MEDIA = 300;

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
          assets.map((asset) => processAsset(asset, mediaStats)),
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

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {!processing && !stats && (
        <Button title="Analyze Media Library" onPress={analyzeMediaLibrary} />
      )}
      {processing && <Text>Processing... {progress} items analyzed</Text>}
      {stats && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Media Library Stats
          </Text>
          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Total Media:{" "}
            {stats.localPhotos +
              stats.localVideos +
              stats.networkPhotos +
              stats.networkVideos}
          </Text>
          <Text>Local Photos: {stats.localPhotos}</Text>
          <Text>Network Photos: {stats.networkPhotos}</Text>
          <Text>Local Videos: {stats.localVideos}</Text>
          <Text>Network Videos: {stats.networkVideos}</Text>
          <Text>
            Total Video Duration: {(stats.totalVideoDuration / 60).toFixed(2)}{" "}
            minutes
          </Text>
          <Text>
            Longest Video Duration: {(stats.longestVideo / 60).toFixed(2)}{" "}
            minutes
          </Text>
          <Text style={{ fontWeight: "bold", marginTop: 10 }}>Extremes:</Text>
          <Text>Highest: {stats.highest.toFixed(2)} meters</Text>
          <Text>
            Lowest:{" "}
            {stats.lowest === Infinity
              ? "N/A"
              : stats.lowest.toFixed(2) + " meters"}
          </Text>
          <Text>Fastest: {stats.fastest.toFixed(2)} km/h</Text>

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>File Types:</Text>
          {Object.entries(stats.fileTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([ratio, count]) => (
              <Text key={ratio}>
                {ratio}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Orientations:
          </Text>
          {Object.entries(stats.orientations)
            .sort((a, b) => b[1] - a[1])
            .map(([orientation, count]) => (
              <Text key={orientation}>
                {orientation}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Top 5 Aspect Ratios:
          </Text>
          {Object.entries(stats.aspectRatios)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ratio, count]) => (
              <Text key={ratio}>
                {ratio}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Top 5 Camera Models:
          </Text>
          {Object.entries(stats.cameraModels)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([model, count]) => (
              <Text key={model}>
                {model}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Top 5 Lens Models:
          </Text>
          {Object.entries(stats.lensModels)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([model, count]) => (
              <Text key={model}>
                {model}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>By Year:</Text>
          {Object.entries(stats.creationYears)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, count]) => (
              <Text key={year}>
                {year}: {count}
              </Text>
            ))}

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            By Time of Day:
          </Text>
          {Object.entries(stats.timeOfDay).map(([time, count]) => (
            <Text key={time}>
              {time}: {count}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default LibraryAnalyzer;

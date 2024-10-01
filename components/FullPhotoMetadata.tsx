import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ListRenderItem } from "react-native";
import * as MediaLibrary from "expo-media-library";

interface FullPhotoMetadata {
  id: string;
  filename: string;
  uri: string;
  mediaType: string;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration: number;
  albumId: string | undefined;
  exif?: {
    [key: string]: any;
  };
  location?: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    speed: number;
  };
}

// not meant to be used just to see all metadata possible
export default function ComprehensivePhotoMetadata() {
  const [photos, setPhotos] = useState<FullPhotoMetadata[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library was denied");
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 5,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const photosWithMetadata = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return assetInfo as FullPhotoMetadata;
        })
      );

      setPhotos(photosWithMetadata);
    })();
  }, []);

  const renderPhotoItem: ListRenderItem<FullPhotoMetadata> = ({ item }) => (
    <View style={styles.photoContainer}>
      <Text style={styles.header}>Photo: {item.filename}</Text>
      <Text>ID: {item.id}</Text>
      <Text>URI: {item.uri}</Text>
      <Text>Media Type: {item.mediaType}</Text>
      <Text>
        Width: {item.width}, Height: {item.height}
      </Text>
      <Text>Creation Time: {new Date(item.creationTime).toLocaleString()}</Text>
      <Text>
        Modification Time: {new Date(item.modificationTime).toLocaleString()}
      </Text>
      <Text>Duration: {item.duration} (typically 0 for photos)</Text>
      <Text>Album ID: {item.albumId || "N/A"}</Text>

      {item.location && (
        <View>
          <Text style={styles.subheader}>Location:</Text>
          <Text>Latitude: {item.location.latitude}</Text>
          <Text>Longitude: {item.location.longitude}</Text>
          <Text>Altitude: {item.location.altitude}</Text>
          <Text>Heading: {item.location.heading}</Text>
          <Text>Speed: {item.location.speed}</Text>
        </View>
      )}

      {item.exif && (
        <View>
          <Text style={styles.subheader}>EXIF Data:</Text>
          {Object.entries(item.exif).map(([key, value]) => (
            <Text key={key} style={styles.exifItem}>
              {key}: {typeof value === "object" ? JSON.stringify(value) : value}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderPhotoItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  photoContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  exifItem: {
    fontSize: 12,
    marginBottom: 2,
  },
});

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ListRenderItem } from "react-native";
import * as MediaLibrary from "expo-media-library";

// Structure of each photo's metadata
interface PhotoMetadata {
  id: string;
  creationTime: number | null;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export default function PhotoMetadata() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);

  useEffect(() => {
    (async () => {
      // Try to get permissions from user
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library was denied");
        return;
      }

      // get the photos from newest to oldest
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 20,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      // process the photos mapping each to the interface
      const photosWithMetadata: PhotoMetadata[] = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return {
            id: asset.id,
            creationTime: assetInfo.creationTime || null,
            location: assetInfo.location,
          };
        }),
      );

      // set state
      setPhotos(photosWithMetadata);
    })();
  }, []);

  // how to render each photo item
  const renderPhotoItem: ListRenderItem<PhotoMetadata> = ({ item }) => (
    <View style={styles.photoItem}>
      <Text style={styles.photoId}>Photo ID: {item.id}</Text>
      {item.creationTime ? (
        <Text style={styles.photoInfo}>
          Taken on: {new Date(item.creationTime).toLocaleString()}
        </Text>
      ) : (
        <Text style={styles.photoInfo}>Creation time unknown</Text>
      )}
      {item.location ? (
        <Text style={styles.photoInfo}>
          Location: (Latitude: {item.location.latitude}, Longitude:{" "}
          {item.location.longitude})
        </Text>
      ) : (
        <Text style={styles.photoInfo}>Location info unknown</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhotoItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  photoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  photoId: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  photoInfo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
});

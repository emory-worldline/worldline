import { PhotoLocation } from "./mediaTypes";

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
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
}

export class LocationCluster {
  private points: PhotoLocation[] = [];
  minLat = Infinity;
  maxLat = -Infinity;
  minLong = Infinity;
  maxLong = -Infinity;

  addPoint(point: PhotoLocation) {
    this.points.push(point);
    this.minLat = Math.min(this.minLat, point.latitude);
    this.maxLat = Math.max(this.maxLat, point.latitude);
    this.minLong = Math.min(this.minLong, point.longitude);
    this.maxLong = Math.max(this.maxLong, point.longitude);
  }

  get density(): number {
    const width = calculateDistance(
      this.minLat,
      this.minLong,
      this.minLat,
      this.maxLong,
    );
    const height = calculateDistance(
      this.minLat,
      this.minLong,
      this.maxLat,
      this.minLong,
    );
    const areaKm2 = (width * height) / 1000000; // Convert to km²
    return this.points.length / Math.max(areaKm2, 0.000001); // photos per km²
  }

  get size(): number {
    return this.points.length;
  }

  get locations(): PhotoLocation[] {
    return this.points;
  }

  get boundingBox() {
    return {
      minLat: this.minLat,
      maxLat: this.maxLat,
      minLong: this.minLong,
      maxLong: this.maxLong,
    };
  }
}

function getNeighbors(
  point: PhotoLocation,
  locations: PhotoLocation[],
  radiusMeters: number,
): PhotoLocation[] {
  return locations.filter(
    (p) =>
      p.id !== point.id &&
      calculateDistance(
        point.latitude,
        point.longitude,
        p.latitude,
        p.longitude,
      ) <= radiusMeters,
  );
}

export function findDenseClusters(
  locations: PhotoLocation[],
  radiusMeters: number = 200,
  minPoints: number = 5,
  maxClusters: number = 5,
): LocationCluster[] {
  const visited = new Set<string>();
  const clusters: LocationCluster[] = [];

  for (const point of locations) {
    if (visited.has(point.id)) continue;

    const cluster = new LocationCluster();
    const queue: PhotoLocation[] = [point];
    visited.add(point.id);
    cluster.addPoint(point);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = locations.filter(
        (p) =>
          !visited.has(p.id) &&
          calculateDistance(
            current.latitude,
            current.longitude,
            p.latitude,
            p.longitude,
          ) <= radiusMeters,
      );

      for (const neighbor of neighbors) {
        visited.add(neighbor.id);
        cluster.addPoint(neighbor);
        queue.push(neighbor);
      }
    }

    if (cluster.size >= minPoints) {
      clusters.push(cluster);
    }
  }

  // Sort by size first, then density as a tiebreaker
  return clusters
    .sort((a, b) => b.size - a.size || b.density - a.density)
    .slice(0, maxClusters);
}

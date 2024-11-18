export function getFileType(filename: string): string {
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

export function getOrientation(width: number, height: number): string {
  if (width > height) return "Landscape";
  if (height > width) return "Portrait";
  return "Square";
}

export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

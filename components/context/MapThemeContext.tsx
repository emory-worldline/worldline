import React, { createContext, useState, ReactNode } from "react";

type MapTheme = "standard" | "dark" | "satellite";

interface MapThemeContextType {
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
}

export const MapThemeContext = createContext<MapThemeContextType>({
  mapTheme: "standard",
  setMapTheme: () => console.log("context not provided"),
});

interface MapThemeProviderProps {
  children: ReactNode;
}

export function MapThemeProvider({ children }: MapThemeProviderProps) {
  const [mapTheme, setMapThemeState] = useState<MapTheme>("standard");

  const setMapTheme = (theme: MapTheme) => {
    setMapThemeState(theme);
  };

  return (
    <MapThemeContext.Provider value={{ mapTheme, setMapTheme }}>
      {children}
    </MapThemeContext.Provider>
  );
}

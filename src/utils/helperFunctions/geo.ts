import axios from "axios";
import { appConfig } from "config/app.config";

/**
 * Geo Code Lookup using mapbox api
 * @param {string} address full address: address city state zip
 * @returns {Promise<number[]>}
 */
export const geoCodeFromAddress = async (address = ""): Promise<number[]> => {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${appConfig.mapBoxToken}`;
    const response = await axios.get(url);
    const coordinates = response.data.features[0]?.geometry.coordinates;
    return coordinates || [];
  } catch {
    return [];
  }
};
/**
 * Get a url to display a mapbox image of a location by lat/lng
 * @param {number} lat required lat param latitude
 * @param {number} lng required lng param longitude
 * @param {number} width optional width param default 600
 * @param {number} height optional heigth param default 300
 * @param {number} zoom ptional heigth param default 15
 * @returns string
 */
export const getMapImageUri = (
  lat: number,
  lng: number,
  width = 600,
  height = 300,
  zoom = 15
) => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+285A98(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}?access_token=${appConfig.mapBoxToken}`;
};

import config from "config/config";
import { DistanceMatrixAPI } from "providers/googleMaps.provider";

describe("DistanceMatrixAPI Integration Test", () => {
  let distanceMatrixAPI: DistanceMatrixAPI;
  const apiKey = config.GOOGLE_MAPS_API_KEY;

  beforeAll(() => {
    distanceMatrixAPI = new DistanceMatrixAPI({ apiKey, maxDestinationsPerBatch: 2 });
  });

  it("should correctly retrieve driving distances from the API", async () => {
    const origins = ["Copenhagen, Denmark"];
    const destinations = ["Berlin, Germany", "Paris, France"];

    const distances = await distanceMatrixAPI.getDrivingDistance({ origins, destinations });


    expect(Array.isArray(distances)).toBe(true);
    expect(distances.length).toBe(destinations.length);
    distances.forEach(distance => {
      expect(typeof distance).toBe("number");
      expect(distance).toBeGreaterThan(0);
    });
  });
});

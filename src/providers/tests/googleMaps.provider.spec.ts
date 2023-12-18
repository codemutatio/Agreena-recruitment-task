import config from "config/config";
import { ProviderIntegrationError } from "errors/errors";
import { GoogleMapAPI } from "providers/googleMaps.provider";

describe("GoogleMapAPI Integration Test", () => {
  let googleMapAPI: GoogleMapAPI;
  const apiKey = config.GOOGLE_MAPS_API_KEY;

  beforeEach(() => {
    googleMapAPI = new GoogleMapAPI({ apiKey, maxDestinationsPerBatch: 2 });
  });

  describe(".getDrivingDistance", () => {
    const origins = ["Copenhagen, Denmark"];
    const destinations = ["Berlin, Germany", "Paris, France"];

    it("should correctly retrieve driving distances from the API", async () => {
      const distances = await googleMapAPI.getDrivingDistance({ origins, destinations });

      expect(Array.isArray(distances)).toBe(true);
      expect(distances.length).toBe(destinations.length);
      distances.forEach(distance => {
        expect(typeof distance).toBe("number");
        expect(distance).toBeGreaterThan(0);
      });
    });

    it("should throw ProviderIntegrationError if the API key is invalid", async () => {
      googleMapAPI = new GoogleMapAPI({ apiKey: "invalid", maxDestinationsPerBatch: 2 });

      await googleMapAPI.getDrivingDistance({ origins, destinations }).catch((error: ProviderIntegrationError) => {
        expect(error.name).toBe("IntegrationError");
        expect(error.message).toBe("Google Maps Integration Error");
      });
    });
  });

  describe(".getCoordinatesFromAddressString", () => {
    const addressInput = "Nørrebro, Copenhagen, Denmark";

    it("should correctly get coordinate from address Input", async () => {
      const coordinate = await googleMapAPI.getCoordinateFromAddressString({ addressInput });

      expect(typeof coordinate).toBe("string");
      expect(coordinate.split(",").length).toBe(2);
    });

    it("should return empty string if the address is invalid", async () => {
      const coordinate = await googleMapAPI.getCoordinateFromAddressString({ addressInput: "invalid address" });

      expect(coordinate).toBe("");
    });

    it("should throw ProviderIntegrationError if the API key is invalid", async () => {
      googleMapAPI = new GoogleMapAPI({ apiKey: "invalid", maxDestinationsPerBatch: 2 });

      await googleMapAPI.getCoordinateFromAddressString({ addressInput }).catch((error: ProviderIntegrationError) => {
        expect(error.name).toBe("IntegrationError");
        expect(error.message).toBe("Google Maps Integration Error");
      });
    });
  });
});

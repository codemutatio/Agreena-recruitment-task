import { Client, DistanceMatrixResponse, TravelMode } from "@googlemaps/google-maps-services-js";
import axios, { AxiosInstance } from "axios";
import { ProviderIntegrationError } from "errors/errors";

export class GoogleMapAPI {
  private axiosInstance: AxiosInstance;
  private readonly maxDestinationsPerBatch;
  private readonly mapClient: Client;
  private readonly apiKey: string;

  constructor({ apiKey, maxDestinationsPerBatch = 25 }: { apiKey: string; maxDestinationsPerBatch?: number }) {
    this.maxDestinationsPerBatch = maxDestinationsPerBatch;
    this.axiosInstance = axios.create({
      baseURL: "https://maps.googleapis.com/maps/api",
      params: {
        key: apiKey,
      },
    });
    this.mapClient = new Client({});
    this.apiKey = apiKey;
  }

  public async getDrivingDistance({ origins, destinations }: { origins: string[]; destinations: string[] }) {
    try {
      const batches = this.createBatches(destinations);
      let allDistances: number[] = [];

      for (const batch of batches) {
        const distanceResponse: DistanceMatrixResponse = await this.axiosInstance.get("/distancematrix/json", {
          params: {
            origins: origins.join("|"),
            destinations: batch.join("|"),
            mode: TravelMode.driving,
          },
        });

        // Note: The function presently takes into account a single origin as that is the use case for this project
        // This returns the distance in meters, so we divide by 1000 to get the distance in kilometers
        const batchDistances = distanceResponse.data.rows[0].elements.map(element => (element?.distance?.value || 0) / 1000);
        allDistances = allDistances.concat(batchDistances);
      }

      // Note: The order of the distances in the response is the same as the order of the destinations in the request
      return allDistances;
    } catch (error) {
      throw new ProviderIntegrationError("Google Maps");
    }
  }

  public async getCoordinateFromAddressString({ addressInput }: { addressInput: string }) {
    try {
      const address = await this.mapClient.geocode({
        params: {
          address: addressInput,
          key: this.apiKey,
        },
      });

      if (!address.data.results.length) {
        return "";
      }

      // Note: The function presently takes into account that the first result is the most relevant
      // This might not be the case as an autocomplete search and places detail api would have been more Ideal
      // but for the sake of this project, this is fine
      const { lat, lng } = address.data.results[0].geometry.location;

      return `${lat},${lng}`;
    } catch (error) {
      throw new ProviderIntegrationError("Google Maps");
    }
  }

  private createBatches(destinations: string[]) {
    const batches: string[][] = [];

    for (let i = 0; i < destinations.length; i += this.maxDestinationsPerBatch) {
      batches.push(destinations.slice(i, i + this.maxDestinationsPerBatch));
    }

    return batches;
  }
}

import { DistanceMatrixResponse, TravelMode } from "@googlemaps/google-maps-services-js";
import axios, { AxiosInstance } from "axios";

export class DistanceMatrixAPI {
  private axiosInstance: AxiosInstance;
  private readonly maxDestinationsPerBatch;

  constructor({ apiKey, maxDestinationsPerBatch }: { apiKey: string; maxDestinationsPerBatch: number }) {
    this.maxDestinationsPerBatch = maxDestinationsPerBatch;
    this.axiosInstance = axios.create({
      baseURL: "https://maps.googleapis.com/maps/api/distancematrix/json",
      params: {
        key: apiKey,
      },
    });
  }
  public async getDrivingDistance({ origins, destinations }: { origins: string[]; destinations: string[] }): Promise<number[]> {
    const batches = this.createBatches(destinations);
    let allDistances: number[] = [];

    for (const batch of batches) {
      const distanceResponse: DistanceMatrixResponse = await this.axiosInstance.get("", {
        params: {
          origins: origins.join("|"),
          destinations: batch.join("|"),
          mode: TravelMode.driving,
        },
      });

      // This returns the distance in meters, so we divide by 1000 to get the distance in kilometers
      const batchDistances = distanceResponse.data.rows[0].elements.map(element => element.distance.value / 1000);
      allDistances = allDistances.concat(batchDistances);
    }

    return allDistances;
  }

  private createBatches(destinations: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < destinations.length; i += this.maxDestinationsPerBatch) {
      batches.push(destinations.slice(i, i + this.maxDestinationsPerBatch));
    }
    return batches;
  }
}

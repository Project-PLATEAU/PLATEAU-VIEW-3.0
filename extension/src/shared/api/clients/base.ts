import { fetchWithDelete, fetchWithGet, fetchWithPatch, fetchWithPost } from "../fetch";

export type PlateauAPIType = "data" | "templates";

export class PlateauAPIClient<V> {
  projectId: string;
  url: string;
  token: string;
  type: PlateauAPIType;

  constructor(projectId: string, url: string, token: string, type: PlateauAPIType) {
    this.projectId = projectId;
    this.url = url;
    this.token = token;
    this.type = type;
  }

  baseUrl() {
    return `${this.url}/${this.projectId}/${this.type}`;
  }

  urlWithId(id: string) {
    return `${this.baseUrl()}/${id}`;
  }

  handleError(obj: any) {
    if (!obj) return [];
    if (typeof obj === "object" && "error" in obj) return [];
    return obj;
  }

  async findAll(): Promise<V[]> {
    return this.handleError(await fetchWithGet(this.baseUrl()));
  }

  async findById(id: string): Promise<V> {
    return this.handleError(await fetchWithGet(this.urlWithId(id)));
  }

  async save(data: V) {
    return await fetchWithPost(this.baseUrl(), data, this.token);
  }

  async update(id: string, data: V) {
    return await fetchWithPatch(this.urlWithId(id), data, this.token);
  }

  async delete(id: string) {
    return await fetchWithDelete(this.urlWithId(id), this.token);
  }
}

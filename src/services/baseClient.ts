import { APIRequestContext, APIResponse } from "@playwright/test";

export class BaseClient {
  protected request: APIRequestContext;
  protected basePath: string;

  constructor(request: APIRequestContext, basePath = "") {
    this.request = request;
    this.basePath = basePath;
  }

  protected async get(path: string, options = {}) {
    console.log(`GET Request URL: ${this.basePath}${path}`);
    return this.request.get(`${this.basePath}${path}`, options);
  }

  protected async post(path: string, data: any, options = {}) {
    console.log(`POST Request URL: ${this.basePath}${path}`);
    return this.request.post(`${this.basePath}${path}`, { data, ...options });
  }

  protected async put(path: string, data: any, options = {}) {
    console.log(`PUT Request URL: ${this.basePath}${path}`);
    return this.request.put(`${this.basePath}${path}`, { data, ...options });
  }

  protected async delete(path: string, options = {}) {
    console.log(`DELETE Request URL: ${this.basePath}${path}`);
    return this.request.delete(`${this.basePath}${path}`, options);
  }

  protected async patch(path: string, data: any, options = {}) {
    console.log(`PATCH Request URL: ${this.basePath}${path}`);
    return this.request.patch(`${this.basePath}${path}`, { data, ...options });
  }
}

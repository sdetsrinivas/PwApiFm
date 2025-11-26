import { BaseClient } from "./baseClient";

export class UsersService extends BaseClient {
  async createUser(payload: any) {
    return this.post("/Users", payload);
  }
  async getUser(id: string) {
    return this.get(`/Users/${id}`);
  }
  async getAllUser() {
    return this.get(`/Users`);
  }
  async updateUser(id: string, payload: any) {
    return this.put(`/Users/${id}`, payload);
  }
  async deleteUser(id: string) {
    return this.delete(`/Users/${id}`);
  }
}

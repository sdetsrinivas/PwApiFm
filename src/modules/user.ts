import { faker } from "@faker-js/faker";

export class User {
  constructor() {
    this.id = faker.number.int({ min: 20, max: 40 });
    this.userName = faker.person.firstName();
    this.password = faker.internet.password();
  }
  id: number;
  userName: string;
  password: string;
}

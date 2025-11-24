import { faker } from "@faker-js/faker";

export interface IUser {
  id: number;
  userName: string;
  password: string;
}

/**
 * Factory class for creating test user data
 */
export class UserFactory {
  /**
   * Create a user with random data
   */
  static createRandomUser(): IUser {
    return {
      id: faker.number.int({ min: 20, max: 40 }),
      userName: faker.person.firstName(),
      password: faker.internet.password(),
    };
  }

  /**
   * Create a user with specific data (override defaults)
   */
  static createUser(overrides?: Partial<IUser>): IUser {
    const defaultUser = this.createRandomUser();
    return { ...defaultUser, ...overrides };
  }

  /**
   * Create multiple random users
   */
  static createRandomUsers(count: number): IUser[] {
    return Array.from({ length: count }, () => this.createRandomUser());
  }
}

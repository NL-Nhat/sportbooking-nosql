import { mockStorage } from './storage/mockStorage.js';

export function runSeed() {
  console.log("Seeding SportBooking mock data...");
  return mockStorage.reset();
}


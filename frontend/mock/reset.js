import { mockStorage } from './storage/mockStorage.js';

export function resetMockDatabase() {
  console.log("Resetting SportBooking mock database to initial state...");
  return mockStorage.reset();
}


import { initialUsers } from '../data/users.js';
import { initialAuthSessions } from '../data/authSessions.js';
import { initialOwnerApplications } from '../data/ownerApplications.js';
import { initialSportsCategories } from '../data/sportsCategories.js';
import { initialFacilities } from '../data/facilities.js';
import { initialCourts } from '../data/courts.js';
import { initialOperatingHours } from '../data/operatingHours.js';
import { initialPriceRules } from '../data/priceRules.js';
import { initialBlockedSlots } from '../data/blockedSlots.js';
import { initialBookings } from '../data/bookings.js';
import { initialBookingSlots } from '../data/bookingSlots.js';
import { initialPayments } from '../data/payments.js';
import { initialReviews } from '../data/reviews.js';
import { initialFavorites } from '../data/favorites.js';
import { initialNotifications } from '../data/notifications.js';
import { initialComplaints } from '../data/complaints.js';

// 16 collections chuẩn theo Database_Design.md v2.0
export const SEED_DATA = {
  users: initialUsers,
  auth_sessions: initialAuthSessions,
  owner_applications: initialOwnerApplications,
  sports_categories: initialSportsCategories,
  facilities: initialFacilities,
  courts: initialCourts,
  operating_hours: initialOperatingHours,
  price_rules: initialPriceRules,
  blocked_slots: initialBlockedSlots,
  bookings: initialBookings,
  booking_slots: initialBookingSlots,
  payments: initialPayments,
  reviews: initialReviews,
  favorites: initialFavorites,
  notifications: initialNotifications,
  complaints: initialComplaints
};

const STORAGE_PREFIX = 'sportbooking_mock_v2_2_';

// Fallback in-memory cache nếu trình duyệt chặn localStorage
const memoryStorage = {};

export const mockStorage = {
  getCollection: (name) => {
    try {
      const key = `${STORAGE_PREFIX}${name}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      if (memoryStorage[name]) return memoryStorage[name];
    }

    // Nếu chưa có, nạp seed mặc định
    const defaultData = SEED_DATA[name] ? JSON.parse(JSON.stringify(SEED_DATA[name])) : [];
    mockStorage.setCollection(name, defaultData);
    return defaultData;
  },

  setCollection: (name, items) => {
    try {
      const key = `${STORAGE_PREFIX}${name}`;
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // In-memory fallback
      memoryStorage[name] = items;
    }
  },

  reset: () => {
    try {
      Object.keys(SEED_DATA).forEach((name) => {
        const key = `${STORAGE_PREFIX}${name}`;
        localStorage.removeItem(key);
      });
      // Xóa cả key cũ nếu có
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sportbooking_mock_')) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.warn('Cannot clear localStorage:', e);
    }
    // Nạp lại dữ liệu gốc
    Object.keys(SEED_DATA).forEach((name) => {
      mockStorage.setCollection(name, JSON.parse(JSON.stringify(SEED_DATA[name])));
    });
    return true;
  }
};

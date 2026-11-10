import { mockStorage } from './mockStorage.js';

export class MockRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getAll() {
    return mockStorage.getCollection(this.collectionName);
  }

  saveAll(items) {
    mockStorage.setCollection(this.collectionName, items);
  }

  findById(id) {
    const items = this.getAll();
    return items.find((item) => item._id === id) || null;
  }

  find(filterFn) {
    const items = this.getAll();
    return filterFn ? items.filter(filterFn) : items;
  }

  findOne(filterFn) {
    const items = this.getAll();
    return items.find(filterFn) || null;
  }

  create(doc) {
    const items = this.getAll();
    const newDoc = {
      _id: doc._id || `69${Date.now().toString(16).padStart(22, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.unshift(newDoc);
    this.saveAll(items);
    return newDoc;
  }

  update(id, partial) {
    const items = this.getAll();
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...partial,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(items);
    return items[index];
  }

  delete(id) {
    const items = this.getAll();
    const filtered = items.filter((item) => item._id !== id);
    if (filtered.length !== items.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }
}

export const mockRepository = {
  getAll: (collectionName) => mockStorage.getCollection(collectionName),
  findById: (collectionName, id) => new MockRepository(collectionName).findById(id),
  create: (collectionName, doc) => new MockRepository(collectionName).create(doc),
  update: (collectionName, id, partial) => new MockRepository(collectionName).update(id, partial),
  delete: (collectionName, id) => new MockRepository(collectionName).delete(id)
};


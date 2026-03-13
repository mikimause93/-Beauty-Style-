/**
 * In-memory data store for development and testing.
 * Replace with Prisma client calls when the shared database is available.
 */
const { v4: uuidv4 } = require('uuid');

const looks = new Map();
const bookings = new Map();

function createLook(data) {
  const id = uuidv4();
  const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
  looks.set(id, record);
  return record;
}

function getLook(id) {
  return looks.get(id) || null;
}

function updateLook(id, updates) {
  const existing = looks.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  looks.set(id, updated);
  return updated;
}

function createBooking(data) {
  const id = uuidv4();
  const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
  bookings.set(id, record);
  return record;
}

function getBooking(id) {
  return bookings.get(id) || null;
}

function clear() {
  looks.clear();
  bookings.clear();
}

module.exports = { createLook, getLook, updateLook, createBooking, getBooking, clear };

// Simple test to verify demo data initialization
console.log('Testing demo data initialization...');

// Mock localStorage
global.localStorage = {
  getItem: function(key) {
    return this[key] || null;
  },
  setItem: function(key, value) {
    this[key] = value;
  },
  removeItem: function(key) {
    delete this[key];
  }
};

// Mock window object
global.window = {
  undefined: undefined
};

// Import and initialize demo data
const storageModule = require('./.next/server/chunks/ssr/src_935aa490._.js');
const storage = storageModule.storage;

// Initialize demo data
storage.initializeDemoData();

// Check if users were created
const users = storage.getUsers();
console.log('Users created:', users.length);
users.forEach(user => {
  console.log(`- ${user.name} (${user.role})`);
});

// Check if courses were created
const courses = storage.getCourses();
console.log('Courses created:', courses.length);
courses.forEach(course => {
  console.log(`- ${course.title} (Instructor: ${course.instructorName})`);
});

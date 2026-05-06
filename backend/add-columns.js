const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run("ALTER TABLE users ADD COLUMN reset_password_token varchar(255)", (err) => {
    if (err) {
      console.error('Error adding token column (might already exist):', err.message);
    } else {
      console.log('Added reset_password_token column');
    }
  });

  db.run("ALTER TABLE users ADD COLUMN reset_password_expires datetime", (err) => {
    if (err) {
      console.error('Error adding expires column (might already exist):', err.message);
    } else {
      console.log('Added reset_password_expires column');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database', err.message);
  } else {
    console.log('Database modification finished.');
  }
});

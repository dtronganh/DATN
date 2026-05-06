const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbGitPath = path.join(__dirname, 'db_git.sqlite');
const dbCurrentPath = path.join(__dirname, 'db.sqlite');

const dbGit = new sqlite3.Database(dbGitPath);
const dbCurrent = new sqlite3.Database(dbCurrentPath);

dbGit.serialize(() => {
  dbGit.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error("Error reading from db_git:", err);
      return;
    }

    if (!rows || rows.length === 0) {
      console.log("No products found in git backup.");
      return;
    }

    dbCurrent.serialize(() => {
      // First, let's clear the existing products table just in case it has corrupted data
      dbCurrent.run("DELETE FROM products", (err) => {
        if (err) {
          console.error("Error clearing products:", err);
          return;
        }

        let insertedCount = 0;
        const stmt = dbCurrent.prepare(`
          INSERT INTO products (
            id, created_at, updated_at, deleted_at,
            name, slug, price, description, stock,
            thumbnail, images, attributes, category_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        rows.forEach(row => {
          let parsedImages = null;
          if (row.images) {
            const parts = row.images.split(',');
            const imagesArray = [];
            for (let i = 0; i < parts.length; i += 2) {
              if (parts[i] && parts[i+1]) {
                imagesArray.push(parts[i] + ',' + parts[i+1]);
              } else {
                // If it's not base64 and just a normal URL without comma
                imagesArray.push(parts[i]);
              }
            }
            parsedImages = JSON.stringify(imagesArray);
          }

          stmt.run(
            row.id, row.created_at, row.updated_at, row.deleted_at,
            row.name, row.slug, row.price, row.description, row.stock,
            row.thumbnail, parsedImages, row.attributes, row.category_id,
            (err) => {
              if (err) {
                console.error("Error inserting row id " + row.id + ":", err);
              } else {
                insertedCount++;
              }
            }
          );
        });

        stmt.finalize(() => {
          console.log(`Successfully restored ${insertedCount} products!`);
          dbGit.close();
          dbCurrent.close();
        });
      });
    });
  });
});

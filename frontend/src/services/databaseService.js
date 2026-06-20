import * as SQLite from 'expo-sqlite';

// ============================================
// PERSISTENCIA LOCAL ESTRUCTURADA - SQLite
// Base de datos relacional embebida
// Para carrito, favoritos, operaciones CRUD
// ============================================

let db = null;

function isClassicSQLiteDatabase(database) {
  return database && typeof database.transaction === 'function';
}

async function executeSqlAsync(sql, params = []) {
  if (!db) {
    throw new Error('Database no inicializada');
  }

  if (isClassicSQLiteDatabase(db)) {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        error => reject(error)
      );
    });
  }

  if (typeof db.prepareAsync === 'function') {
    const statement = await db.prepareAsync(sql);
    try {
      const result = await statement.executeAsync(...params);
      const rows = await result.getAllAsync();
      return {
        rows: {
          _array: Array.isArray(rows) ? rows : [],
        },
        insertId: result.lastInsertRowId,
        rowsAffected: result.changes,
      };
    } finally {
      await statement.finalizeAsync();
    }
  }

  if (typeof db.execAsync === 'function') {
    return await db.execAsync(sql);
  }

  throw new Error('Unsupported SQLite database instance');
}

const DatabaseService = {
  // --- INICIALIZAR base de datos ---
  async init() {
    if (db) return;
    if (typeof SQLite.openDatabaseAsync === 'function') {
      db = await SQLite.openDatabaseAsync('naturapp.db');
    } else if (typeof SQLite.openDatabase === 'function') {
      db = SQLite.openDatabase('naturapp.db');
    } else if (typeof SQLite.openDatabaseSync === 'function') {
      db = SQLite.openDatabaseSync('naturapp.db');
    } else {
      throw new Error('No se puede inicializar la base de datos SQLite');
    }

    await executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        quantity INTEGER DEFAULT 1
      );
    `);

    await executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        added_date TEXT DEFAULT (datetime('now'))
      );
    `);
  },

  // === OPERACIONES CRUD DEL CARRITO ===

  async addToCart(product) {
    const result = await executeSqlAsync(
      `INSERT OR REPLACE INTO cart
       (product_id, name, price, image, quantity)
       VALUES (?, ?, ?, ?,
         COALESCE(
           (SELECT quantity + 1 FROM cart WHERE product_id = ?), 1))`,
      [product.id, product.name, product.price, product.image, product.id]
    );
    return result.insertId;
  },

  async getCartItems() {
    const result = await executeSqlAsync(
      'SELECT * FROM cart ORDER BY id DESC'
    );
    return result.rows ? result.rows._array : [];
  },

  async updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    await executeSqlAsync(
      'UPDATE cart SET quantity = ? WHERE product_id = ?',
      [quantity, productId]
    );
  },

  async removeFromCart(productId) {
    await executeSqlAsync(
      'DELETE FROM cart WHERE product_id = ?',
      [productId]
    );
  },

  async getCartTotal() {
    const result = await executeSqlAsync(
      'SELECT SUM(price * quantity) as total FROM cart'
    );
    const row = result.rows ? result.rows._array[0] : null;
    return row?.total || 0;
  },

  async clearCart() {
    await executeSqlAsync('DELETE FROM cart');
  },

  async getCartCount() {
    const result = await executeSqlAsync(
      'SELECT SUM(quantity) as count FROM cart'
    );
    const row = result.rows ? result.rows._array[0] : null;
    return row?.count || 0;
  },

  // === OPERACIONES CRUD DE FAVORITOS ===

  async addFavorite(product) {
    await executeSqlAsync(
      `INSERT OR IGNORE INTO favorites
       (product_id, name, price, image)
       VALUES (?, ?, ?, ?)`,
      [product.id, product.name, product.price, product.image]
    );
  },

  async removeFavorite(productId) {
    await executeSqlAsync(
      'DELETE FROM favorites WHERE product_id = ?',
      [productId]
    );
  },

  async isFavorite(productId) {
    const result = await executeSqlAsync(
      'SELECT id FROM favorites WHERE product_id = ?',
      [productId]
    );
    const row = result.rows ? result.rows._array[0] : null;
    return !!row;
  },

  async getFavorites() {
    const result = await executeSqlAsync(
      'SELECT * FROM favorites ORDER BY added_date DESC'
    );
    return result.rows ? result.rows._array : [];
  },
};

export default DatabaseService;

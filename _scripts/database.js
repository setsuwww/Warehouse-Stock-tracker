
import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "warehouse_db",
    waitForConnections: true,
    connectionLimit: 5,
});

// ==========================================
// TABLE SETUP
// ==========================================

async function createTables() {
    console.log("\nCreating database tables...\n");

    const tables = [

        // USERS
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'staff', 'manager')
                NOT NULL DEFAULT 'staff',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB`,

        // CATEGORIES
        `CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB`,

        // SUPPLIERS
        `CREATE TABLE IF NOT EXISTS suppliers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(30),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB`,

        // PRODUCTS
        `CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sku VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(150) NOT NULL,
            category_id INT,
            supplier_id INT,
            stock INT NOT NULL DEFAULT 0,
            minimum_stock INT NOT NULL DEFAULT 5,
            unit VARCHAR(30) DEFAULT 'pcs',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            FOREIGN KEY (category_id)
                REFERENCES categories(id)
                ON DELETE SET NULL,

            FOREIGN KEY (supplier_id)
                REFERENCES suppliers(id)
                ON DELETE SET NULL
        ) ENGINE=InnoDB`,

        // STOCK MOVEMENTS
        `CREATE TABLE IF NOT EXISTS stock_movements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference_code VARCHAR(50) UNIQUE NOT NULL,
            product_id INT NOT NULL,
            user_id INT NOT NULL,
            type ENUM('IN', 'OUT') NOT NULL,
            quantity INT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (product_id)
                REFERENCES products(id),

            FOREIGN KEY (user_id)
                REFERENCES users(id)
        ) ENGINE=InnoDB`

    ];

    for (const sql of tables) {
        await db.execute(sql);
    }

    console.log("✓ Users table created");
    console.log("✓ Categories table created");
    console.log("✓ Suppliers table created");
    console.log("✓ Products table created");
    console.log("✓ Stock movements table created");

    console.log("\nAll tables are ready!\n");
}

// ==========================================
// DUMMY DATA SEEDER
// ==========================================

async function seedData() {
    console.log("\nInserting dummy data...\n");

    // DEFAULT PASSWORD
    const passwordHash = await bcrypt.hash("Password123!", 12);

    // USERS
    await db.execute(
        `INSERT IGNORE INTO users
        (email, password_hash, role)
        VALUES
        (?, ?, 'admin'),
        (?, ?, 'staff'),
        (?, ?, 'manager')`,
        [
            "admin@warehouse.com", passwordHash,
            "staff@warehouse.com", passwordHash,
            "manager@warehouse.com", passwordHash
        ]
    );

    console.log("✓ Users inserted");

    // CATEGORIES
    await db.execute(
        `INSERT IGNORE INTO categories (name, description)
        VALUES
        ('Electronics', 'Electronic equipment and devices'),
        ('Office Supplies', 'Office stationery and equipment'),
        ('Accessories', 'Computer and device accessories')`
    );

    console.log("✓ Categories inserted");

    // SUPPLIERS
    await db.execute(
        `INSERT IGNORE INTO suppliers
        (name, email, phone, address)
        VALUES
        ('Tech Supplier', 'tech@supplier.com', '081234567801', 'Jakarta'),
        ('Office Partner', 'office@supplier.com', '081234567802', 'Bandung'),
        ('Global Accessories', 'global@supplier.com', '081234567803', 'Surabaya')`
    );

    console.log("✓ Suppliers inserted");

    // PRODUCTS
    await db.execute(
        `INSERT IGNORE INTO products
        (sku, name, category_id, supplier_id, stock, minimum_stock, unit)
        VALUES
        (
            'PRD-001',
            'Wireless Mouse',
            (SELECT id FROM categories WHERE name = 'Electronics'),
            (SELECT id FROM suppliers WHERE name = 'Tech Supplier'),
            120, 10, 'pcs'
        ),
        (
            'PRD-002',
            'Mechanical Keyboard',
            (SELECT id FROM categories WHERE name = 'Electronics'),
            (SELECT id FROM suppliers WHERE name = 'Tech Supplier'),
            45, 10, 'pcs'
        ),
        (
            'PRD-003',
            'A4 Paper',
            (SELECT id FROM categories WHERE name = 'Office Supplies'),
            (SELECT id FROM suppliers WHERE name = 'Office Partner'),
            200, 20, 'ream'
        ),
        (
            'PRD-004',
            'USB Hub',
            (SELECT id FROM categories WHERE name = 'Accessories'),
            (SELECT id FROM suppliers WHERE name = 'Global Accessories'),
            8, 15, 'pcs'
        )`
    );

    console.log("✓ Products inserted");

    console.log("\nDummy data successfully inserted!\n");
}

// ==========================================
// COMMAND HANDLER
// ==========================================

async function main() {
    const command = process.argv[2];

    try {
        if (command === "tables") {
            await createTables();
        } else if (command === "seed") {
            await seedData();
        } else {
            console.log(`
Warehouse Database Manager

Available commands:

npm run insert:table-data
    Create all database tables.

npm run insert:data
    Insert dummy data.
            `);
        }
    } catch (error) {
        console.error("\nDatabase operation failed:");
        console.error(error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("SQL:", error.sql);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

main();

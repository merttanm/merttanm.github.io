// app.js veya global.js gibi bir dosya

let db;

function openDatabase() {
    if (db) {
        return Promise.resolve(db);  // Eğer bağlantı zaten açılmışsa, hemen geri döndür
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open("CarInventoryDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("cars")) {
                const carsStore = db.createObjectStore("cars", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("reservations")) {
                const reservationsStore = db.createObjectStore("reservations", { keyPath: "id", autoIncrement: true });
                reservationsStore.createIndex("carId", "carId", { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

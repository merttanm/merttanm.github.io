const addCarForm = document.getElementById('addCarForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
let db;

// IndexedDB'yi başlatma
const request = indexedDB.open("CarInventoryDB", 5);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    console.log("Veritabanı oluşturuluyor veya güncelleniyor...");

    // Veritabanı sürümüne göre object store oluşturma
    if (!db.objectStoreNames.contains("cars")) {
        db.createObjectStore("cars", { keyPath: "id", autoIncrement: true });
        console.log("Yeni 'cars' object store oluşturuldu.");
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("IndexedDB başarıyla başlatıldı.");
    console.log("Mevcut object store'lar:", db.objectStoreNames);
};

request.onerror = (event) => {
    console.error("IndexedDB başlatılırken bir hata oluştu:", event.target.error);
};

// Araç Ekleme İşlemi
addCarForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!db) {
        alert("Veritabanı bağlantısı yok! Lütfen tekrar deneyin.");
        return;
    }

    const formData = new FormData(addCarForm); // Formdaki tüm alanları alır.
    console.log("Veritabanı bağlantısı mevcut.");

    // Fotoğrafları al
    const carImages = document.getElementById('carImage').files;

    if (carImages.length === 0) {
        alert('Lütfen en az bir araç fotoğrafı yükleyin');
        return;
    }

    // Her fotoğrafı tek tek işleme
    const base64Images = [];
    const promises = [];

    Array.from(carImages).forEach(file => {
        const reader = new FileReader();
        const promise = new Promise((resolve, reject) => {
            reader.onloadend = function () {
                base64Images.push(reader.result);
                resolve();
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
        promises.push(promise);
    });
    

    // Fotoğraflar okunduktan sonra işlemi tamamla
    Promise.all(promises).then(() => {
        const newCar = {
            model: document.getElementById('model').value.trim(),
            year: parseInt(document.getElementById('year').value),
            km: parseInt(document.getElementById('km').value),
            color: document.getElementById('color').value.trim(),
            fuel: document.getElementById('fuel').value,
            transmission: document.getElementById('transmission').value,
            vehicleType: document.getElementById('vehicleType').value,
            category: document.getElementById('category').value, // Yeni alan
            plate: document.getElementById('plate').value.trim(),
            images: base64Images
        };

        // Veritabanına yeni araç ekle
        const transaction = db.transaction(["cars"], "readwrite");
        const store = transaction.objectStore("cars");
        const request = store.add(newCar);

        request.onsuccess = () => {
            console.log("Yeni araç başarıyla eklendi:", newCar);
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            addCarForm.reset();
            setTimeout(() => successMessage.style.display = 'none', 3000);

            // TXT dosyasını oluştur ve indir
            const carContent = JSON.stringify(newCar, null, 2);
            
            createAndDownloadTxtFile(`${newCar.plate || 'arac'}.txt`, carContent);
            console.log("newCar.plate:", newCar.plate);
            // Fotoğrafları base64 formatında indir
            newCar.images.forEach((base64Image, index) => {
                const imageFileName = `${newCar.plate || 'arac'}_photo${index + 1}.jpg`;
                createAndDownloadImage(imageFileName, base64Image); // Fotoğrafı base64 olarak indir
            });
        };

        request.onerror = (event) => {
            console.error("Araç eklenirken bir hata oluştu:", event.target.error);
            successMessage.style.display = 'none';
            errorMessage.style.display = 'block';
            setTimeout(() => errorMessage.style.display = 'none', 3000);
        };
    }).catch(error => {
        console.error("Fotoğraf yüklenirken hata:", error);
        successMessage.style.display = 'none';
        errorMessage.style.display = 'block';
    });
});

// TXT dosyasını oluştur ve indir
function createAndDownloadTxtFile(fileName, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// Base64 fotoğraf dosyasını indir
function createAndDownloadImage(fileName, base64Content) {
    // 'data:image/jpeg;base64,' kısmını kaldırarak sadece base64 verisini alıyoruz
    const base64Data = base64Content.split(',')[1];  // İkinci kısmı alıyoruz
    const byteCharacters = atob(base64Data);  // Base64 verisini çöz

    // Byte dizisini Blob'a çevir
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });

    // Blob'u indirilebilir hale getir
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // URL'yi serbest bırak
    URL.revokeObjectURL(url);
}


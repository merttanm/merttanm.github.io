const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: 'uploads/temp/' }); // Geçici fotoğraf yükleme alanı

// JSON verilerini işlemek için middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Araç ekleme API'si
app.post('/add-car', upload.array('carImage'), async (req, res) => {
    try {
        // Araç verilerini alın
        const { model, year, km, color, fuel, transmission, vehicleType } = req.body;

        if (!model) {
            return res.status(400).json({ message: 'Model alanı zorunludur!' });
        }

        // Unique bir klasör adı oluşturun (UUID kullanarak)
        const uniqueFolderName = `${model}_${uuidv4()}`;
        const carFolderPath = path.join(__dirname, 'uploads', uniqueFolderName);

        // Klasörü oluştur
        await fs.mkdir(carFolderPath, { recursive: true });

        // Fotoğrafları kalıcı klasöre taşı
        const moveFiles = req.files.map(async (file) => {
            const destinationPath = path.join(carFolderPath, `${uuidv4()}_${file.originalname}`);
            await fs.rename(file.path, destinationPath);
        });

        // Tüm dosyalar taşındıktan sonra devam et
        await Promise.all(moveFiles);

        // Yanıt gönder
        res.status(200).json({
            message: 'Araç başarıyla eklendi!',
            folderName: uniqueFolderName,
            folderPath: carFolderPath,
        });
    } catch (error) {
        console.error('Araç eklenirken hata:', error);
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

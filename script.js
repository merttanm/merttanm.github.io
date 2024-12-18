// script.js
document.getElementById("carForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    // Formdan veri al
    const model = document.getElementById("model").value;
    const year = document.getElementById("year").value;
    const km = document.getElementById("km").value;
    const color = document.getElementById("color").value;
    const transmission = document.getElementById("transmission").value;
    const fuel = document.getElementById("fuel").value;
  
    // Yeni araç objesi
    const car = {
      model,
      year,
      km,
      color,
      transmission,
      fuel
    };
  
    // Envantere ekle
    addCarToInventory(car);
  
    // Formu temizle
    this.reset();
  });
  
  // Envantere araç ekleme fonksiyonu
  function addCarToInventory(car) {
    const inventoryList = document.getElementById("inventoryList");
  
    const li = document.createElement("li");
    li.textContent = `${car.year} ${car.model} - ${car.color} (${car.transmission}, ${car.fuel}, ${car.km} km)`;
  
    inventoryList.appendChild(li);
  }
  
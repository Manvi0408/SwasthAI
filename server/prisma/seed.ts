import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITY_COORDS: { [city: string]: { state: string; lat: number; lng: number } } = {
  "New Delhi": { state: "Delhi", lat: 28.6139, lng: 77.2090 },
  "Mumbai": { state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  "Kolkata": { state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  "Chennai": { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  "Bangalore": { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  "Hyderabad": { state: "Telangana", lat: 17.3850, lng: 78.4867 },
  "Ahmedabad": { state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  "Pune": { state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  "Jaipur": { state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  "Lucknow": { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  "Guwahati": { state: "Assam", lat: 26.1445, lng: 91.7362 },
  "Patna": { state: "Bihar", lat: 25.5941, lng: 85.1376 },
  "Bhopal": { state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  "Kochi": { state: "Kerala", lat: 9.9312, lng: 76.2673 },
  "Bhubaneswar": { state: "Odisha", lat: 20.2961, lng: 85.8245 },
  "Chandigarh": { state: "Punjab", lat: 30.7333, lng: 76.7794 },
  "Dehradun": { state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  "Srinagar": { state: "Jammu and Kashmir", lat: 34.0837, lng: 74.7973 },
  "Ranchi": { state: "Jharkhand", lat: 23.3441, lng: 85.3090 },
  "Raipur": { state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  "Panaji": { state: "Goa", lat: 15.4909, lng: 73.8278 },
  "Gurugram": { state: "Haryana", lat: 28.4595, lng: 77.0266 },
  "Noida": { state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
  "Kanpur": { state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  "Nagpur": { state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  "Indore": { state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  "Vadodara": { state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  "Surat": { state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  "Coimbatore": { state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  "Madurai": { state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  "Visakhapatnam": { state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  "Vijayawada": { state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  "Amritsar": { state: "Punjab", lat: 31.6340, lng: 74.8723 },
  "Ludhiana": { state: "Punjab", lat: 30.9010, lng: 75.8573 },
  "Agra": { state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  "Varanasi": { state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  "Ghaziabad": { state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  "Nashik": { state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  "Jodhpur": { state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  "Kota": { state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
  "Trivandrum": { state: "Kerala", lat: 8.5241, lng: 76.9366 },
  "Shimla": { state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  "Itanagar": { state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  "Imphal": { state: "Manipur", lat: 24.8170, lng: 93.9368 },
  "Shillong": { state: "Meghalaya", lat: 25.5788, lng: 91.8831 },
  "Aizawl": { state: "Mizoram", lat: 23.7271, lng: 92.7176 },
  "Kohima": { state: "Nagaland", lat: 25.6751, lng: 94.1086 },
  "Gangtok": { state: "Sikkim", lat: 27.3314, lng: 88.6138 },
  "Agartala": { state: "Tripura", lat: 23.8315, lng: 91.2868 }
};

const hospitalNames = [
  "Apollo Hospital", "Fortis Super Speciality", "Max Healthcare", "AIIMS", "Lifeline General Hospital",
  "Metro Emergency Hospital", "Red Cross Hospital", "Care Cardiac Center", "Medanta Health Center",
  "Holy Family Hospital", "Narayana Health", "Manipal Hospital", "KIMS Hospital", "Wockhardt Hospital",
  "Lilavati Hospital", "Columbia Asia", "Aster Medcity", "Yashoda Hospital", "Sahyadri Hospital", "Apex Trauma Center"
];

const bloodBankNames = [
  "Red Cross Blood Center", "Rotary Blood Bank", "Lions Club Donor Clinic", "Government Civil Blood Bank",
  "Jeevan Blood Bank", "Sanjeevani Donor Bank", "Samarpan Stock Center", "Metro Blood Bank",
  "Apollo Donor Center", "Pratham Blood Registry"
];

const hospitalTypes = ["AIIMS", "Government", "Private", "Trauma Center", "Cardiac Center", "Emergency Center"];
const servicesList = [
  "Emergency, ICU, Trauma, Cardiology, Oncology, Pediatrics, Neurology, Burn Unit",
  "Emergency, Trauma, Burn Unit, General Surgery, General Medicine, Pediatrics",
  "Emergency, Cardiology, Neurosurgery, ICU, Multi-specialty, Trauma",
  "Emergency, Ambulance, Trauma, ICU, General Medicine, First-Aid Response",
  "Emergency, Cardiac Care, Trauma, ICU, Orthopedics, Pediatrics"
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear existing data
  await prisma.hospital.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.healthRiskAssessment.deleteMany();
  await prisma.reportAnalysis.deleteMany();
  await prisma.medicalReport.deleteMany();
  await prisma.injuryAnalysis.deleteMany();

  console.log("🧹 Cleared old database tables.");

  // 2. Seed Expanded Hospitals (100+ hospitals across 28 states and 40+ cities)
  let hospitalCount = 0;
  const cities = Object.keys(CITY_COORDS);

  // We want to generate ~110 hospitals
  // Let's generate 2 to 3 hospitals per city
  for (const city of cities) {
    const info = CITY_COORDS[city];
    const state = info.state;
    const baseLat = info.lat;
    const baseLng = info.lng;

    // Generate 2 or 3 hospitals for this city
    const hospCountForCity = Math.random() > 0.4 ? 3 : 2;
    for (let i = 0; i < hospCountForCity; i++) {
      const idxName = (hospitalCount + i) % hospitalNames.length;
      const hType = hospitalTypes[(hospitalCount + i) % hospitalTypes.length];
      const services = servicesList[(hospitalCount + i) % servicesList.length];
      const name = `${city} ${hospitalNames[idxName]}`;
      const address = `Sector ${i + 4}, Near City Center, ${city}, ${state} - India`;
      
      // Jitter lat/lng so they aren't exactly stacked
      const latJitter = baseLat + (Math.random() - 0.5) * 0.04;
      const lngJitter = baseLng + (Math.random() - 0.5) * 0.04;

      const totalBedsVal = Math.floor(Math.random() * 500) + 50;
      const icuBedsVal = Math.floor(totalBedsVal * 0.15);
      const ventBedsVal = Math.floor(icuBedsVal * 0.4);
      const emergencyBedsVal = Math.floor(totalBedsVal * 0.1);

      await prisma.hospital.create({
        data: {
          name,
          address,
          type: hType,
          services,
          beds: `${totalBedsVal}+ beds`,
          rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
          phone: `+91-${9800000000 + hospitalCount}`,
          lat: latJitter,
          lng: lngJitter,
          city,
          state,
          icuBeds: icuBedsVal,
          ventilatorBeds: ventBedsVal,
          emergencyBeds: emergencyBedsVal
        }
      });
      hospitalCount++;
    }
  }
  console.log(`🏥 Programmatically seeded ${hospitalCount} hospitals.`);

  // 3. Seed Blood Banks (100+ blood banks across states/cities)
  let bloodBankCount = 0;
  for (const city of cities) {
    const info = CITY_COORDS[city];
    const state = info.state;
    const baseLat = info.lat;
    const baseLng = info.lng;

    const bbCountForCity = Math.random() > 0.4 ? 3 : 2;
    for (let i = 0; i < bbCountForCity; i++) {
      const idxName = (bloodBankCount + i) % bloodBankNames.length;
      const name = `${city} ${bloodBankNames[idxName]}`;
      const address = `Plot ${i + 20}, Institutional Area, ${city}, ${state} - India`;
      
      const latJitter = baseLat + (Math.random() - 0.5) * 0.04;
      const lngJitter = baseLng + (Math.random() - 0.5) * 0.04;

      await prisma.bloodBank.create({
        data: {
          name,
          address,
          city,
          state,
          phone: `+91-${8800000000 + bloodBankCount}`,
          lat: latJitter,
          lng: lngJitter,
          aPlus: Math.floor(Math.random() * 50) + 5,
          aMinus: Math.floor(Math.random() * 15),
          bPlus: Math.floor(Math.random() * 50) + 5,
          bMinus: Math.floor(Math.random() * 15),
          oPlus: Math.floor(Math.random() * 60) + 5,
          oMinus: Math.floor(Math.random() * 20) + 2,
          abPlus: Math.floor(Math.random() * 20) + 1,
          abMinus: Math.floor(Math.random() * 10),
        }
      });
      bloodBankCount++;
    }
  }
  console.log(`🩸 Programmatically seeded ${bloodBankCount} blood banks.`);

  // 4. Seed Pharmacies (40+ pharmacies, one for each city)
  let pharmacyCount = 0;
  for (const city of cities) {
    const info = CITY_COORDS[city];
    const state = info.state;
    const baseLat = info.lat;
    const baseLng = info.lng;

    await prisma.pharmacy.create({
      data: {
        name: `${city} Apollo Pharmacy`,
        address: `Shop 1A, Metro Station Market, ${city}, ${state}`,
        city,
        state,
        phone: `+91-${7700000000 + pharmacyCount}`,
        lat: baseLat + (Math.random() - 0.5) * 0.02,
        lng: baseLng + (Math.random() - 0.5) * 0.02,
      }
    });
    pharmacyCount++;
  }
  console.log(`🏪 Programmatically seeded ${pharmacyCount} pharmacies.`);

  // 5. Seed Medicines
  const medicines = [
    {
      name: "Crocin 650mg",
      genericName: "Paracetamol 650mg",
      brandPrice: 30.0,
      genericPrice: 4.5,
      savings: 25.5,
      description: "Effective for treating mild to moderate pain (headache, body ache) and reducing fever.",
      category: "Painkiller & Fever reducer",
      availability: "Available",
    },
    {
      name: "Augmentin 625 DUO",
      genericName: "Amoxicillin + Clavulanic Acid 625mg",
      brandPrice: 223.5,
      genericPrice: 62.0,
      savings: 161.5,
      description: "Broad-spectrum penicillin antibiotic used to treat bacterial infections of the lungs, ears, sinuses, urinary tract, and skin.",
      category: "Antibiotics",
      availability: "Available",
    },
    {
      name: "Lipitor 10mg",
      genericName: "Atorvastatin 10mg",
      brandPrice: 120.0,
      genericPrice: 15.0,
      savings: 105.0,
      description: "Statin medication used to lower blood cholesterol levels, reducing the risk of heart attacks and strokes.",
      category: "Cardiovascular Care",
      availability: "Available",
    },
    {
      name: "Glycomet GP2",
      genericName: "Glimepiride 2mg + Metformin 500mg",
      brandPrice: 112.0,
      genericPrice: 24.5,
      savings: 87.5,
      description: "Dual-action oral anti-diabetic medication used for managing Type 2 Diabetes Mellitus.",
      category: "Diabetes Management",
      availability: "Available",
    },
    {
      name: "Pantocid 40mg",
      genericName: "Pantoprazole 40mg",
      brandPrice: 156.0,
      genericPrice: 30.0,
      savings: 126.0,
      description: "Proton pump inhibitor (PPI) used to reduce stomach acid, treating acid reflux, GERD, and peptic ulcers.",
      category: "Antacids & Digestion",
      availability: "Available",
    },
    {
      name: "Azithral 500mg",
      genericName: "Azithromycin 500mg",
      brandPrice: 132.0,
      genericPrice: 34.0,
      savings: 98.0,
      description: "Macrolide antibiotic used for respiratory tract infections, throat infections, and soft tissue infections.",
      category: "Antibiotics",
      availability: "Available",
    },
    {
      name: "Montek LC",
      genericName: "Montelukast 10mg + Levocetirizine 5mg",
      brandPrice: 215.0,
      genericPrice: 48.0,
      savings: 167.0,
      description: "Combination antihistamine used to relieve allergy symptoms like runny nose, sneezing, watery eyes, and allergic asthma.",
      category: "Allergy & Asthma",
      availability: "Available",
    },
    {
      name: "Amlong 5mg",
      genericName: "Amlodipine 5mg",
      brandPrice: 45.0,
      genericPrice: 8.0,
      savings: 37.0,
      description: "Calcium channel blocker used to treat high blood pressure and chest pain (angina).",
      category: "Cardiovascular Care",
      availability: "Available",
    },
  ];

  for (const m of medicines) {
    await prisma.medicine.create({ data: m });
  }
  console.log(`💊 Seeded ${medicines.length} medicine records.`);
  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

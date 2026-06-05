import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear existing data
  await prisma.hospital.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.medicine.deleteMany();

  // 2. Seed Hospitals
  const hospitals = [
    {
      name: "AIIMS New Delhi",
      address: "Ansari Nagar East, Near Safdarjung Tomb, New Delhi, Delhi 110029",
      type: "AIIMS",
      services: "Emergency, ICU, Trauma, Cardiology, Oncology, Pediatrics, Neurology, Burn Unit",
      beds: "2200+ beds",
      rating: 4.9,
      phone: "+91-11-26588500",
      lat: 28.5672,
      lng: 77.2100,
    },
    {
      name: "Safdarjung Hospital",
      address: "Ansari Nagar West, Opp. AIIMS, New Delhi, Delhi 110029",
      type: "Government",
      services: "Emergency, Trauma, Burn Unit, General Surgery, General Medicine, Pediatrics",
      beds: "2900+ beds",
      rating: 4.2,
      phone: "+91-11-26707100",
      lat: 28.5685,
      lng: 77.2078,
    },
    {
      name: "Apollo Greams Road Chennai",
      address: "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
      type: "Private",
      services: "Emergency, Cardiology, Neurosurgery, ICU, Multi-specialty, Trauma",
      beds: "600+ beds",
      rating: 4.8,
      phone: "+91-44-28290200",
      lat: 13.0601,
      lng: 80.2520,
    },
    {
      name: "KEM Hospital Mumbai",
      address: "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
      type: "Government",
      services: "Emergency, Trauma Center, ICU, Pediatrics, General Surgery, General Medicine",
      beds: "1800+ beds",
      rating: 4.3,
      phone: "+91-22-24107000",
      lat: 19.0025,
      lng: 72.8420,
    },
    {
      name: "Fortis Hiranandani Hospital Mumbai",
      address: "Mini Sea Shore Road, Sector 10, Vashi, Navi Mumbai, Maharashtra 400703",
      type: "Private",
      services: "Emergency, Cardiac Care, Trauma, ICU, Orthopedics, Pediatrics",
      beds: "150+ beds",
      rating: 4.7,
      phone: "+91-22-68846146",
      lat: 19.0760,
      lng: 72.9980,
    },
    {
      name: "Max Super Speciality Hospital Saket",
      address: "1-2, Press Enclave Road, Saket, New Delhi, Delhi 110017",
      type: "Private",
      services: "Emergency, Cardiology, Oncology, ICU, Trauma, Organ Transplant",
      beds: "500+ beds",
      rating: 4.6,
      phone: "+91-11-26515050",
      lat: 28.5276,
      lng: 77.2144,
    },
    {
      name: "Jai Prakash Narayan Apex Trauma Center (AIIMS)",
      address: "Raj Nagar, Safdarjung Enclave, New Delhi, Delhi 110029",
      type: "Trauma Center",
      services: "Trauma, Emergency, Neurosurgery, Orthopedics, ICU, Blood Bank Access",
      beds: "250+ beds",
      rating: 4.8,
      phone: "+91-11-26189000",
      lat: 28.5644,
      lng: 77.1990,
    },
    {
      name: "Fortis Escorts Heart Institute",
      address: "Okhla Road, Sukhdev Vihar, Metro Station, New Delhi, Delhi 110025",
      type: "Cardiac Center",
      services: "Emergency, Cardiology, Cardiac Surgery, Pediatric Heart Care, ICU",
      beds: "310+ beds",
      rating: 4.8,
      phone: "+91-11-47135000",
      lat: 28.5604,
      lng: 77.2736,
    },
    {
      name: "Metro Emergency Hospital Hyderabad",
      address: "Road No 2, Banjara Hills, Hyderabad, Telangana 500034",
      type: "Emergency Center",
      services: "Emergency, Ambulance, Trauma, ICU, General Medicine, First-Aid Response",
      beds: "200+ beds",
      rating: 4.5,
      phone: "+91-40-45678900",
      lat: 17.4220,
      lng: 78.4480,
    },
  ];

  for (const h of hospitals) {
    await prisma.hospital.create({ data: h });
  }
  console.log(`🏥 Seeded ${hospitals.length} hospitals.`);

  // 3. Seed Blood Banks
  const bloodBanks = [
    {
      name: "Indian Red Cross Society Blood Bank",
      address: "1, Red Cross Road, Near Parliament House, Connaught Place, New Delhi, Delhi 110001",
      city: "New Delhi",
      state: "Delhi",
      phone: "+91-11-23716441",
      lat: 28.6200,
      lng: 77.2100,
      aPlus: 25,
      aMinus: 6,
      bPlus: 35,
      bMinus: 8,
      oPlus: 45,
      oMinus: 12,
      abPlus: 15,
      abMinus: 4,
    },
    {
      name: "Lions Club Blood Bank Mumbai",
      address: "Lions Community Hall, Juhu Scheme, Vile Parle West, Mumbai, Maharashtra 400049",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91-22-26207890",
      lat: 19.1026,
      lng: 72.8368,
      aPlus: 18,
      aMinus: 2,
      bPlus: 28,
      bMinus: 5,
      oPlus: 32,
      oMinus: 7,
      abPlus: 10,
      abMinus: 2,
    },
    {
      name: "Chennai Voluntary Blood Bank & Research Institute",
      address: "15, Spurtank Road, Chetpet, Chennai, Tamil Nadu 600031",
      city: "Chennai",
      state: "Tamil Nadu",
      phone: "+91-44-26412030",
      lat: 13.0760,
      lng: 80.2440,
      aPlus: 12,
      aMinus: 1,
      bPlus: 20,
      bMinus: 3,
      oPlus: 24,
      oMinus: 5,
      abPlus: 8,
      abMinus: 1,
    },
    {
      name: "Rotary TTK Blood Bank Bangalore",
      address: "20, Double Road, NH Compound, KH Road, Shanti Nagar, Bangalore, Karnataka 560027",
      city: "Bangalore",
      state: "Karnataka",
      phone: "+91-80-25293555",
      lat: 12.9560,
      lng: 77.5975,
      aPlus: 30,
      aMinus: 8,
      bPlus: 42,
      bMinus: 10,
      oPlus: 50,
      oMinus: 15,
      abPlus: 20,
      abMinus: 5,
    },
    {
      name: "Bengal Blood Bank & Research Society",
      address: "3A, Shakespeare Sarani, Kolkata, West Bengal 700071",
      city: "Kolkata",
      state: "West Bengal",
      phone: "+91-33-22823344",
      lat: 22.5448,
      lng: 88.3525,
      aPlus: 14,
      aMinus: 0,
      bPlus: 22,
      bMinus: 2,
      oPlus: 25,
      oMinus: 3,
      abPlus: 6,
      abMinus: 0,
    },
  ];

  for (const bb of bloodBanks) {
    await prisma.bloodBank.create({ data: bb });
  }
  console.log(`🩸 Seeded ${bloodBanks.length} blood banks.`);

  // 4. Seed Pharmacies
  const pharmacies = [
    {
      name: "Apollo Pharmacy Connaught Place",
      address: "E-Block, Inner Circle, Connaught Place, New Delhi, Delhi 110001",
      city: "New Delhi",
      state: "Delhi",
      phone: "+91-11-41510255",
      lat: 28.6300,
      lng: 77.2200,
    },
    {
      name: "Pradhan Mantri Bhartiya Janaushadhi Kendra Noida",
      address: "Shop 12, Sector 15 Metro Station Market, Noida, Uttar Pradesh 201301",
      city: "Noida",
      state: "Uttar Pradesh",
      phone: "+91-9999-XXXXXX",
      lat: 28.5830,
      lng: 77.3150,
    },
    {
      name: "Wellness Forever Bandra",
      address: "Turner Road, Patkar Hall, Bandra West, Mumbai, Maharashtra 400050",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91-22-66009999",
      lat: 19.0580,
      lng: 72.8300,
    },
    {
      name: "MedPlus T. Nagar Chennai",
      address: "G.N. Chetty Road, T. Nagar, Chennai, Tamil Nadu 600017",
      city: "Chennai",
      state: "Tamil Nadu",
      phone: "+91-44-42120000",
      lat: 13.0410,
      lng: 80.2330,
    },
  ];

  for (const ph of pharmacies) {
    await prisma.pharmacy.create({ data: ph });
  }
  console.log(`🏪 Seeded ${pharmacies.length} pharmacies.`);

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
  console.log(`💊 Seeded ${medicines.length} medicines.`);

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

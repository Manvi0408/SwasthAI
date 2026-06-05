import { RequestHandler } from "express";
import { db } from "../db";

// In-memory store for OTPs: phone -> otp
const otpStore = new Map<string, string>();

export const handleSendOtp: RequestHandler = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  // Generate 6-digit OTP (for local testing, we can use "123456" or random)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);

  // In production, this would call an SMS Gateway (e.g., Twilio or MSG91)
  console.log(`[OTP Gateway] Sent OTP ${otp} to phone ${phone}`);

  // Return the OTP in response for testing/demonstration convenience
  res.json({ message: "OTP sent successfully", otp });
};

export const handleVerifyOtp: RequestHandler = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP are required" });
    return;
  }

  const storedOtp = otpStore.get(phone);
  if (!storedOtp || storedOtp !== otp) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  // OTP is verified, clear it
  otpStore.delete(phone);

  // Find or create user
  let user = await db.user.findUnique({
    where: { phone },
    include: {
      profile: true,
      medicalInfo: true,
      emergencyContact: true,
      locationInfo: true,
    },
  });

  if (!user) {
    user = await db.user.create({
      data: { phone },
      include: {
        profile: true,
        medicalInfo: true,
        emergencyContact: true,
        locationInfo: true,
      },
    });
  }

  res.json({
    message: "Authenticated successfully",
    token: user.id, // Using user ID as session token
    user,
  });
};

export const handleGoogleLogin: RequestHandler = async (req, res) => {
  const { email, name, profilePic } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required for Google login" });
    return;
  }

  let user = await db.user.findUnique({
    where: { email },
    include: {
      profile: true,
      medicalInfo: true,
      emergencyContact: true,
      locationInfo: true,
    },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        profile: {
          create: {
            fullName: name || "Google User",
            profilePic: profilePic || null,
          },
        },
      },
      include: {
        profile: true,
        medicalInfo: true,
        emergencyContact: true,
        locationInfo: true,
      },
    });
  }

  res.json({
    message: "Google login successful",
    token: user.id,
    user,
  });
};

export const handleEmailLogin: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  let user = await db.user.findUnique({
    where: { email },
    include: {
      profile: true,
      medicalInfo: true,
      emergencyContact: true,
      locationInfo: true,
    },
  });

  if (!user) {
    // Register if user does not exist (Auto-registration flow)
    user = await db.user.create({
      data: {
        email,
        password, // Simple clear text password or simple hash for local deployment
        role: email === "admin@swasthai.com" ? "ADMIN" : "USER",
        profile: {
          create: {
            fullName: name || email.split("@")[0],
          },
        },
      },
      include: {
        profile: true,
        medicalInfo: true,
        emergencyContact: true,
        locationInfo: true,
      },
    });
  } else {
    // If user exists, check password
    if (user.password !== password) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
  }

  res.json({
    message: "Email login successful",
    token: user.id,
    user,
  });
};

export const handleGuestAccess: RequestHandler = async (req, res) => {
  // Create a guest user session
  const guestId = `guest_${Math.random().toString(36).substring(2, 11)}`;
  res.json({
    message: "Guest access granted",
    token: guestId,
    user: {
      id: guestId,
      role: "GUEST",
      language: "en",
      theme: "light",
      onboarded: false,
    },
  });
};

export const handleGetMe: RequestHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No authorization header" });
    return;
  }

  const userId = authHeader.replace("Bearer ", "");
  if (userId.startsWith("guest_")) {
    res.json({
      user: {
        id: userId,
        role: "GUEST",
        language: "en",
        theme: "light",
        onboarded: false,
      },
    });
    return;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      medicalInfo: true,
      emergencyContact: true,
      locationInfo: true,
      savedHospitals: true,
      savedMedicines: true,
      searchHistory: { orderBy: { timestamp: "desc" }, take: 20 },
      triageHistory: { orderBy: { timestamp: "desc" }, take: 10 },
      emergencyRequests: { orderBy: { timestamp: "desc" }, take: 10 },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
};

export const handleOnboard: RequestHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No authorization header" });
    return;
  }

  const userId = authHeader.replace("Bearer ", "");
  const {
    fullName,
    dob,
    age,
    gender,
    profilePic,
    bloodGroup,
    height,
    weight,
    diseases,
    allergies,
    medications,
    disability,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    country,
    state,
    city,
    pincode,
    lat,
    lng,
  } = req.body;

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
        profile: {
          upsert: {
            create: { fullName, dob, age: parseInt(age) || null, gender, profilePic },
            update: { fullName, dob, age: parseInt(age) || null, gender, profilePic },
          },
        },
        medicalInfo: {
          upsert: {
            create: {
              bloodGroup,
              height: parseFloat(height) || null,
              weight: parseFloat(weight) || null,
              diseases,
              allergies,
              medications,
              disability,
            },
            update: {
              bloodGroup,
              height: parseFloat(height) || null,
              weight: parseFloat(weight) || null,
              diseases,
              allergies,
              medications,
              disability,
            },
          },
        },
        emergencyContact: {
          upsert: {
            create: {
              name: emergencyContactName,
              phone: emergencyContactPhone,
              relationship: emergencyContactRelationship,
            },
            update: {
              name: emergencyContactName,
              phone: emergencyContactPhone,
              relationship: emergencyContactRelationship,
            },
          },
        },
        locationInfo: {
          upsert: {
            create: {
              country: country || "India",
              state,
              city,
              pincode,
              lat: parseFloat(lat) || null,
              lng: parseFloat(lng) || null,
            },
            update: {
              country: country || "India",
              state,
              city,
              pincode,
              lat: parseFloat(lat) || null,
              lng: parseFloat(lng) || null,
            },
          },
        },
      },
      include: {
        profile: true,
        medicalInfo: true,
        emergencyContact: true,
        locationInfo: true,
      },
    });

    res.json({ message: "Onboarding successful", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateProfile: RequestHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No authorization header" });
    return;
  }

  const userId = authHeader.replace("Bearer ", "");
  const {
    fullName,
    dob,
    age,
    gender,
    bloodGroup,
    height,
    weight,
    diseases,
    allergies,
    medications,
    disability,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    country,
    state,
    city,
    pincode,
    lat,
    lng,
    profilePic,
    language,
    theme,
  } = req.body;

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        language,
        theme,
        profile: {
          update: {
            fullName,
            dob,
            age: age ? parseInt(age) : undefined,
            gender,
            profilePic,
          },
        },
        medicalInfo: {
          update: {
            bloodGroup,
            height: height ? parseFloat(height) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            diseases,
            allergies,
            medications,
            disability,
          },
        },
        emergencyContact: {
          update: {
            name: emergencyContactName,
            phone: emergencyContactPhone,
            relationship: emergencyContactRelationship,
          },
        },
        locationInfo: {
          update: {
            country,
            state,
            city,
            pincode,
            lat: lat ? parseFloat(lat) : undefined,
            lng: lng ? parseFloat(lng) : undefined,
          },
        },
      },
      include: {
        profile: true,
        medicalInfo: true,
        emergencyContact: true,
        locationInfo: true,
      },
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

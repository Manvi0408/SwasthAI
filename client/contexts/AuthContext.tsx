import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  fullName: string;
  profilePic?: string | null;
  dob?: string | null;
  age?: number | null;
  gender?: string | null;
}

export interface MedicalInfo {
  bloodGroup: string;
  height?: number | null;
  weight?: number | null;
  diseases?: string | null;
  allergies?: string | null;
  medications?: string | null;
  disability?: string | null;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface LocationInfo {
  country: string;
  state: string;
  city: string;
  pincode: string;
  lat?: number | null;
  lng?: number | null;
}

export interface SavedHospital {
  id: string;
  hospitalId: string;
  name: string;
  address: string;
  distance: string;
  contact: string;
  rating: number;
  services: string;
}

export interface SavedMedicine {
  id: string;
  medicineId: string;
  name: string;
  brandPrice: number;
  genericPrice: number;
  savings: number;
  availability: string;
}

export interface SearchHistory {
  id: string;
  type: string;
  query: string;
  filters?: string | null;
  timestamp: string;
}

export interface TriageHistory {
  id: string;
  symptoms: string;
  conditions: string;
  severity: string;
  action: string;
  hospitalType: string;
  timestamp: string;
}

export interface EmergencyRequest {
  id: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
  address?: string | null;
  timestamp: string;
}

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: string; // USER, ADMIN, GUEST
  language: string;
  theme: string;
  onboarded: boolean;
  profile?: UserProfile | null;
  medicalInfo?: MedicalInfo | null;
  emergencyContact?: EmergencyContact | null;
  locationInfo?: LocationInfo | null;
  savedHospitals?: SavedHospital[];
  savedMedicines?: SavedMedicine[];
  searchHistory?: SearchHistory[];
  triageHistory?: TriageHistory[];
  emergencyRequests?: EmergencyRequest[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, name?: string, profilePic?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<{ success: boolean }>;
  logout: () => void;
  onboard: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  saveHospital: (hospital: any) => Promise<{ success: boolean; error?: string }>;
  unsaveHospital: (hospitalId: string) => Promise<{ success: boolean; error?: string }>;
  saveMedicine: (medicine: any) => Promise<{ success: boolean; error?: string }>;
  unsaveMedicine: (medicineId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token is invalid, log out
        localStorage.removeItem("auth_token");
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Error fetching user session", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, otp: data.otp };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async (email: string, name?: string, profilePic?: string) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, profilePic }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginAsGuest = async () => {
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const onboard = async (onboardData: any) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(onboardData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveHospital = async (hospital: any) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/hospitals/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, ...hospital }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const unsaveHospital = async (hospitalId: string) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/hospitals/unsave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, hospitalId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveMedicine = async (medicine: any) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/pharmacy/save-medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, ...medicine }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const unsaveMedicine = async (medicineId: string) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/pharmacy/unsave-medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, medicineId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const isAuthenticated = !!user && user.role !== "GUEST";
  const isGuest = !!user && user.role === "GUEST";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isGuest,
        loading,
        sendOtp,
        loginWithPhone,
        loginWithGoogle,
        loginWithEmail,
        loginAsGuest,
        logout,
        onboard,
        updateProfile,
        refreshUser,
        saveHospital,
        unsaveHospital,
        saveMedicine,
        unsaveMedicine,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

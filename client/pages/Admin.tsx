import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, Hospital, Droplet, Pill, ShieldAlert, Plus, Trash2, Edit2, ShieldCheck, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Route guarding
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      toast.error("Unauthorized access. Admin role required.");
      navigate("/");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<"users" | "hospitals" | "bloodbanks" | "medicines" | "sos">("users");
  
  // Data lists
  const [userList, setUserList] = useState<any[]>([]);
  const [hospitalList, setHospitalList] = useState<any[]>([]);
  const [bloodBankList, setBloodBankList] = useState<any[]>([]);
  const [medicineList, setMedicineList] = useState<any[]>([]);
  const [sosList, setSosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for creating resources
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHospital, setNewHospital] = useState({ name: "", address: "", type: "Private", services: "", beds: "100+ beds", rating: "4.5", phone: "", lat: "28.5", lng: "77.2" });
  const [newBloodBank, setNewBloodBank] = useState({ name: "", address: "", city: "", state: "", phone: "", lat: "28.5", lng: "77.2", aPlus: "10", bPlus: "10", oPlus: "10", abPlus: "10" });
  const [newMedicine, setNewMedicine] = useState({ name: "", genericName: "", brandPrice: "", genericPrice: "", description: "", category: "General" });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (activeTab === "users") {
        const res = await fetch("/api/admin/users", { headers });
        if (res.ok) setUserList(await res.json());
      } else if (activeTab === "hospitals") {
        const res = await fetch("/api/hospitals");
        if (res.ok) setHospitalList(await res.json());
      } else if (activeTab === "bloodbanks") {
        const res = await fetch("/api/blood-banks");
        if (res.ok) setBloodBankList(await res.json());
      } else if (activeTab === "medicines") {
        const res = await fetch("/api/pharmacy/medicines");
        if (res.ok) setMedicineList(await res.json());
      } else if (activeTab === "sos") {
        const res = await fetch("/api/admin/sos-requests", { headers });
        if (res.ok) setSosList(await res.json());
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync admin logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("User profile deleted");
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("Delete this hospital record?")) return;
    try {
      const res = await fetch(`/api/admin/hospitals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Hospital record removed");
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDeleteBloodBank = async (id: string) => {
    if (!confirm("Delete this blood bank record?")) return;
    try {
      const res = await fetch(`/api/admin/blood-banks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Blood bank record removed");
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Delete this medicine record?")) return;
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Medicine record removed");
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newHospital),
      });
      if (res.ok) {
        toast.success("Hospital added successfully");
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleCreateBloodBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/blood-banks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBloodBank),
      });
      if (res.ok) {
        toast.success("Blood bank added successfully");
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMedicine),
      });
      if (res.ok) {
        toast.success("Medicine drug added successfully");
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Administrative Command Center
            </h1>
            <p className="text-sm text-foreground/60">Manage healthcare resources, user records, and monitor SOS alerts.</p>
          </div>
          {activeTab !== "users" && activeTab !== "sos" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Create Resource
            </button>
          )}
        </div>

        {/* Console Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 mb-8 border border-border/20">
          {[
            { id: "users", label: "User Profiles", icon: Users },
            { id: "hospitals", label: "Hospitals", icon: Hospital },
            { id: "bloodbanks", label: "Blood Banks", icon: Droplet },
            { id: "medicines", label: "Medicines Catalog", icon: Pill },
            { id: "sos", label: "SOS Alerts Logs", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setShowAddModal(false);
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/30"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/20 dark:hover:bg-slate-800/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content tables */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-foreground/50">Fetching database logs...</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/20 overflow-x-auto p-4 sm:p-6 bg-white/40 dark:bg-slate-900/60">
            
            {activeTab === "users" && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-foreground/50 font-semibold">
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Credentials</th>
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Medical Snapshot</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((usr) => (
                    <tr key={usr.id} className="border-b border-border/30 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-semibold font-mono text-xs">{usr.id.substring(0, 8)}...</td>
                      <td className="py-3.5">
                        <div className="text-xs font-bold">{usr.email || usr.phone}</div>
                      </td>
                      <td className="py-3.5 font-bold text-foreground">{usr.profile?.fullName || "—"}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${usr.role === "ADMIN" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-foreground/70">
                        {usr.medicalInfo ? `Blood Group: ${usr.medicalInfo.bloodGroup} | Allergies: ${usr.medicalInfo.allergies || "None"}` : "Unconfigured"}
                      </td>
                      <td className="py-3.5 text-right">
                        {usr.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "hospitals" && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-foreground/50 font-semibold">
                    <th className="pb-3">Hospital Name</th>
                    <th className="pb-3">Address</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Beds</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalList.map((hosp) => (
                    <tr key={hosp.id} className="border-b border-border/30 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">{hosp.name}</td>
                      <td className="py-3.5 text-xs text-foreground/75 max-w-xs truncate">{hosp.address}</td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full">{hosp.type}</span>
                      </td>
                      <td className="py-3.5 font-semibold text-xs">{hosp.beds}</td>
                      <td className="py-3.5 text-xs font-mono">{hosp.phone}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteHospital(hosp.id)}
                          className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "bloodbanks" && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-foreground/50 font-semibold">
                    <th className="pb-3">Blood Bank</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Stock Overview (A+/B+/O+/AB+)</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodBankList.map((bb) => (
                    <tr key={bb.id} className="border-b border-border/30 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">{bb.name}</td>
                      <td className="py-3.5 text-xs text-foreground/75">{bb.city}, {bb.state}</td>
                      <td className="py-3.5 text-xs font-mono">{bb.phone}</td>
                      <td className="py-3.5">
                        <div className="flex gap-1.5 text-[10px] font-bold text-foreground/80">
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">A+: {bb.aPlus}U</span>
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">B+: {bb.bPlus}U</span>
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">O+: {bb.oPlus}U</span>
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">AB+: {bb.abPlus}U</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteBloodBank(bb.id)}
                          className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "medicines" && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-foreground/50 font-semibold">
                    <th className="pb-3">Drug Name (Branded)</th>
                    <th className="pb-3">Generic Alternative</th>
                    <th className="pb-3">Brand Price</th>
                    <th className="pb-3">Generic Price</th>
                    <th className="pb-3">Savings</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicineList.map((med) => (
                    <tr key={med.id} className="border-b border-border/30 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">{med.name}</td>
                      <td className="py-3.5 text-xs font-semibold text-foreground/70">{med.genericName}</td>
                      <td className="py-3.5 font-semibold text-xs text-foreground/60">₹{med.brandPrice.toFixed(2)}</td>
                      <td className="py-3.5 font-black text-green-500 text-sm">₹{med.genericPrice.toFixed(2)}</td>
                      <td className="py-3.5 font-bold text-xs text-green-600 bg-green-500/10 rounded px-1 max-w-[60px] text-center">Save ₹{med.savings.toFixed(2)}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "sos" && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-foreground/50 font-semibold">
                    <th className="pb-3">SOS ID</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Coordinates</th>
                    <th className="pb-3">Alert Trigger Time</th>
                    <th className="pb-3">Caller Identity</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sosList.map((sos) => (
                    <tr key={sos.id} className="border-b border-border/30 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-semibold font-mono text-xs text-red-500">{sos.id.substring(0, 8)}...</td>
                      <td className="py-3.5"><span className="font-extrabold text-red-500">{sos.category}</span></td>
                      <td className="py-3.5 font-mono text-xs">{sos.lat.toFixed(4)}, {sos.lng.toFixed(4)}</td>
                      <td className="py-3.5 text-xs text-foreground/60">{new Date(sos.timestamp).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 font-bold text-foreground">
                        {sos.user ? `${sos.user.profile?.fullName} (${sos.user.phone || sos.user.email})` : "Anonymous Guest"}
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/10 text-red-600 border border-red-600/20 animate-pulse">
                          {sos.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}

        {/* Creation Dialog Box */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass p-6 sm:p-8 border border-white/20 bg-white dark:bg-slate-900 shadow-2xl">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create New {activeTab === "hospitals" ? "Hospital" : activeTab === "bloodbanks" ? "Blood Bank" : "Medicine"}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-black/10 text-foreground/60"><Trash2 className="w-5 h-5" /></button>
              </div>

              {activeTab === "hospitals" && (
                <form onSubmit={handleCreateHospital} className="space-y-4 text-xs font-semibold text-foreground/80">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Hospital Name</label>
                      <input type="text" required value={newHospital.name} onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>Category Type</label>
                      <select value={newHospital.type} onChange={(e) => setNewHospital({ ...newHospital, type: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-2">
                        {["AIIMS", "Government", "Private", "Trauma Center", "Cardiac Center", "Emergency Center"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label>Full Address</label>
                    <input type="text" required value={newHospital.address} onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label>Services (comma separated)</label>
                    <input type="text" placeholder="Emergency, Trauma, ICU" required value={newHospital.services} onChange={(e) => setNewHospital({ ...newHospital, services: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Capacity Beds</label>
                      <input type="text" value={newHospital.beds} onChange={(e) => setNewHospital({ ...newHospital, beds: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>Phone Contact</label>
                      <input type="text" required value={newHospital.phone} onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Latitude Coordinates</label>
                      <input type="text" value={newHospital.lat} onChange={(e) => setNewHospital({ ...newHospital, lat: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>Longitude Coordinates</label>
                      <input type="text" value={newHospital.lng} onChange={(e) => setNewHospital({ ...newHospital, lng: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded mt-4">Save Hospital</button>
                </form>
              )}

              {activeTab === "bloodbanks" && (
                <form onSubmit={handleCreateBloodBank} className="space-y-4 text-xs font-semibold text-foreground/80">
                  <div>
                    <label>Blood Bank Name</label>
                    <input type="text" required value={newBloodBank.name} onChange={(e) => setNewBloodBank({ ...newBloodBank, name: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label>Address</label>
                    <input type="text" required value={newBloodBank.address} onChange={(e) => setNewBloodBank({ ...newBloodBank, address: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label>City</label>
                      <input type="text" required value={newBloodBank.city} onChange={(e) => setNewBloodBank({ ...newBloodBank, city: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>State</label>
                      <input type="text" required value={newBloodBank.state} onChange={(e) => setNewBloodBank({ ...newBloodBank, state: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>Phone</label>
                      <input type="text" required value={newBloodBank.phone} onChange={(e) => setNewBloodBank({ ...newBloodBank, phone: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label>A+ Units</label>
                      <input type="number" value={newBloodBank.aPlus} onChange={(e) => setNewBloodBank({ ...newBloodBank, aPlus: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2 py-1.5" />
                    </div>
                    <div>
                      <label>B+ Units</label>
                      <input type="number" value={newBloodBank.bPlus} onChange={(e) => setNewBloodBank({ ...newBloodBank, bPlus: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2 py-1.5" />
                    </div>
                    <div>
                      <label>O+ Units</label>
                      <input type="number" value={newBloodBank.oPlus} onChange={(e) => setNewBloodBank({ ...newBloodBank, oPlus: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2 py-1.5" />
                    </div>
                    <div>
                      <label>AB+ Units</label>
                      <input type="number" value={newBloodBank.abPlus} onChange={(e) => setNewBloodBank({ ...newBloodBank, abPlus: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2 py-1.5" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded mt-4">Save Blood Bank</button>
                </form>
              )}

              {activeTab === "medicines" && (
                <form onSubmit={handleCreateMedicine} className="space-y-4 text-xs font-semibold text-foreground/80">
                  <div>
                    <label>Medicine Name (Branded)</label>
                    <input type="text" required value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label>Generic Description Alternative</label>
                    <input type="text" required value={newMedicine.genericName} onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Branded Price (INR)</label>
                      <input type="text" required value={newMedicine.brandPrice} onChange={(e) => setNewMedicine({ ...newMedicine, brandPrice: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label>Generic Jan Aushadhi Price (INR)</label>
                      <input type="text" required value={newMedicine.genericPrice} onChange={(e) => setNewMedicine({ ...newMedicine, genericPrice: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                    </div>
                  </div>
                  <div>
                    <label>Category Category</label>
                    <input type="text" value={newMedicine.category} onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label>Drug Description</label>
                    <textarea rows={3} value={newMedicine.description} onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })} className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-border rounded px-2.5 py-1.5 resize-none" />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded mt-4">Save Medicine Record</button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

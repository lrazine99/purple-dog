"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  X,
  Check,
  Shield,
  User as UserIcon,
  Briefcase,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Camera,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "particular" | "professional";
  is_verified: boolean;
  address_line?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  siret?: string;
  age?: number;
  created_at?: string;
}

interface UserForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  address_line: string;
  city: string;
  postal_code: string;
  country: string;
  company_name: string;
  siret: string;
  age: string;
  rgpd_accepted: boolean;
  cgv_accepted: boolean;
  official_document_url: string;
  speciality: string;
  items_preference: string;
  profile_picture: string;
}

const initialForm: UserForm = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  role: "particular",
  address_line: "",
  city: "",
  postal_code: "",
  country: "France",
  company_name: "",
  siret: "",
  age: "",
  rgpd_accepted: true,
  cgv_accepted: false,
  official_document_url: "",
  speciality: "",
  items_preference: "",
  profile_picture: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // SIRET validation states
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretValid, setSiretValid] = useState<boolean | null>(null);
  const [siretError, setSiretError] = useState("");
  
  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler for official document
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Set the URL in the form
      setForm((prev) => ({
        ...prev,
        official_document_url: `http://localhost:3001${data.url}`,
      }));
      setUploadedFileName(data.originalname);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setUploadingPhoto(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Set the profile picture URL in the form
      setForm((prev) => ({
        ...prev,
        profile_picture: `http://localhost:3001${data.url}`,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(initialForm);
    setError("");
    setSiretValid(null);
    setSiretError("");
    setUploadedFileName("");
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      address_line: user.address_line || "",
      city: user.city || "",
      postal_code: user.postal_code || "",
      country: user.country || "France",
      company_name: user.company_name || "",
      siret: user.siret || "",
      age: user.age?.toString() || "",
      rgpd_accepted: true,
      cgv_accepted: user.role === "professional",
      official_document_url: (user as any).official_document_url || "",
      speciality: (user as any).speciality || "",
      items_preference: (user as any).items_preference || "",
      profile_picture: (user as any).profile_picture || "",
    });
    setError("");
    setSiretValid(user.siret ? true : null);
    setSiretError("");
    setShowModal(true);
  };

  // SIRET validation and auto-fill
  const validateSiret = async (siret: string) => {
    // Clean SIRET (remove spaces)
    const cleanSiret = siret.replace(/\s/g, "");
    
    // Check if SIRET has correct length (14 digits)
    if (cleanSiret.length !== 14) {
      setSiretValid(null);
      setSiretError("");
      return;
    }

    setSiretLoading(true);
    setSiretError("");
    setSiretValid(null);

    try {
      const response = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}`
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const company = data.results[0];
        const siege = company.siege;

        // Auto-fill form with company data
        setForm((prev) => ({
          ...prev,
          company_name: company.nom_complet || prev.company_name,
          address_line: siege?.adresse || prev.address_line,
          city: siege?.libelle_commune || prev.city,
          postal_code: siege?.code_postal || prev.postal_code,
          country: "France",
        }));

        setSiretValid(true);
      } else {
        setSiretValid(false);
        setSiretError("SIRET not found in database");
      }
    } catch (err) {
      console.error("SIRET validation error:", err);
      setSiretValid(false);
      setSiretError("Failed to validate SIRET");
    } finally {
      setSiretLoading(false);
    }
  };

  const handleSiretChange = (value: string) => {
    // Format SIRET with spaces (XXX XXX XXX XXXXX)
    const cleanValue = value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 14);
    let formattedValue = "";
    
    for (let i = 0; i < cleanValue.length; i++) {
      if (i === 3 || i === 6 || i === 9) {
        formattedValue += " ";
      }
      formattedValue += cleanValue[i];
    }

    setForm({ ...form, siret: formattedValue });
    setSiretValid(null);
    setSiretError("");

    // Auto-validate when 14 digits entered
    if (cleanValue.length === 14) {
      validateSiret(cleanValue);
    }
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      const isEdit = !!editingUser;

      const body: any = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        address_line: form.address_line,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
        rgpd_accepted: form.rgpd_accepted,
        profile_picture: form.profile_picture || undefined,
      };

      if (!isEdit) {
        body.password = form.password;
      } else if (form.password) {
        body.password = form.password;
      }

      if (form.age) {
        body.age = parseInt(form.age);
      }

      if (form.role === "professional") {
        body.company_name = form.company_name;
        body.siret = form.siret.replace(/\s/g, ""); // Store without spaces
        body.cgv_accepted = form.cgv_accepted;
        body.official_document_url = form.official_document_url;
        body.speciality = form.speciality;
        body.items_preference = form.items_preference;
      }

      const url = isEdit
        ? `http://localhost:3001/users/${editingUser.id}`
        : "http://localhost:3001/users";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save user");
      }

      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const toggleVerify = async (user: User) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_verified: !user.is_verified }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "professional":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "professional":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400 mt-1">{users.length} utilisateurs</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-40 h-4 bg-slate-700 rounded animate-pulse" />
                    <div className="w-32 h-3 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium">Rôle</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium">Statut</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium">Localisation</th>
                  <th className="text-right px-6 py-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {(user as any).profile_picture ? (
                          <img 
                            src={(user as any).profile_picture} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.first_name[0]}{user.last_name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVerify(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          user.is_verified
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                        }`}
                      >
                        {user.is_verified ? (
                          <>
                            <Check className="w-3 h-3" /> Vérifié
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> En attente
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">
                        {user.city ? `${user.city}, ${user.country || ""}` : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rôle</label>
                <div className="flex gap-2">
                  {["particular", "professional", "admin"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.role === role
                          ? "bg-purple-500/20 border-purple-500 text-purple-400"
                          : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {getRoleIcon(role)}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Picture & Name */}
              <div className="flex gap-6 items-start">
                {/* Profile Picture Upload */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                    Photo de profil
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadingPhoto}
                    />
                    <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                      form.profile_picture 
                        ? "border-emerald-500/50" 
                        : "border-slate-600 hover:border-purple-500/50"
                    }`}>
                      {uploadingPhoto ? (
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                      ) : form.profile_picture ? (
                        <img 
                          src={form.profile_picture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="w-8 h-8 text-slate-500" />
                          <span className="text-xs text-slate-500 mt-1">Télécharger</span>
                        </div>
                      )}
                    </div>
                    {form.profile_picture && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, profile_picture: "" })}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 z-20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Name fields */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Prénom</label>
                    <Input
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom</label>
                    <Input
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de passe {editingUser && "(laisser vide pour conserver)"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Âge</label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white w-32"
                  placeholder="25"
                />
              </div>

              {/* Professional fields - SIRET first */}
              {form.role === "professional" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                    Informations Entreprise (SIRET Auto-remplissage)
                  </h3>
                  
                  {/* SIRET with validation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Numéro SIRET
                    </label>
                    <div className="relative">
                      <Input
                        value={form.siret}
                        onChange={(e) => handleSiretChange(e.target.value)}
                        className={`bg-slate-900/50 border-slate-700 text-white pr-10 ${
                          siretValid === true ? "border-emerald-500" : ""
                        } ${siretValid === false ? "border-red-500" : ""}`}
                        placeholder="XXX XXX XXX XXXXX"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {siretLoading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
                        {siretValid === true && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        {siretValid === false && <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    </div>
                    {siretValid === true && (
                      <p className="text-emerald-400 text-xs mt-1">
                        ✓ SIRET vérifié - Infos entreprise auto-remplies
                      </p>
                    )}
                    {siretError && (
                      <p className="text-red-400 text-xs mt-1">{siretError}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      Entrez 14 chiffres pour auto-remplir les infos depuis la base officielle française
                    </p>
                  </div>

                  {/* Company name - auto-filled */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Nom de l'entreprise {siretValid && <span className="text-emerald-400">(auto-rempli)</span>}
                    </label>
                    <Input
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="Will be auto-filled from SIRET"
                    />
                  </div>

                  {/* Speciality */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Spécialité <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={form.speciality}
                      onChange={(e) => setForm({ ...form, speciality: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="ex: Mobilier, Électronique, etc."
                    />
                  </div>

                  {/* Items Preference */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Préférence d'articles <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={form.items_preference}
                      onChange={(e) => setForm({ ...form, items_preference: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="ex: Neuf, Occasion, Les deux"
                    />
                  </div>

                  {/* Official Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Document officiel (Kbis) <span className="text-red-400">*</span>
                    </label>
                    
                    {/* File upload area */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                      />
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        form.official_document_url 
                          ? "border-emerald-500/50 bg-emerald-500/10" 
                          : "border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/5"
                      }`}>
                        {uploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                            <span className="text-slate-400">Téléchargement...</span>
                          </div>
                        ) : form.official_document_url ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="w-6 h-6 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">
                              {uploadedFileName || "Document téléchargé"}
                            </span>
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-slate-500" />
                            <span className="text-slate-400">
                              Cliquer ou glisser pour télécharger
                            </span>
                            <span className="text-slate-500 text-xs">
                              PDF, JPG, PNG (max 10Mo)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Or manual URL */}
                    <div className="mt-3">
                      <p className="text-slate-500 text-xs mb-2">Ou entrer l'URL manuellement :</p>
                      <Input
                        value={form.official_document_url}
                        onChange={(e) => {
                          setForm({ ...form, official_document_url: e.target.value });
                          setUploadedFileName("");
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white text-sm"
                        placeholder="https://example.com/document.pdf"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.cgv_accepted}
                      onChange={(e) => setForm({ ...form, cgv_accepted: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-slate-300 text-sm">CGV Acceptées <span className="text-red-400">*</span></span>
                  </label>
                </div>
              )}

              {/* Address - can be auto-filled from SIRET */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                  Adresse {form.role === "professional" && siretValid && <span className="text-emerald-400">(auto-remplie depuis SIRET)</span>}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Rue</label>
                  <Input
                    value={form.address_line}
                    onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Ville</label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Code postal</label>
                    <Input
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="75001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Pays</label>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>

              {/* RGPD */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rgpd_accepted}
                  onChange={(e) => setForm({ ...form, rgpd_accepted: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-slate-300 text-sm">RGPD Accepté</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {saving ? "Enregistrement..." : editingUser ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

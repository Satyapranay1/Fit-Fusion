import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Lock, Save } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const backend = "https://health4-lmzi.onrender.com";

  // ✅ Fetch profile details from backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access your profile.");
        return;
      }

      try {
        const res = await fetch(`${backend}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setFormData({ name: data.name, email: data.email });
      } catch (err) {
        console.error(err);
        toast.error("Unable to fetch user details");
      }
    };

    fetchProfile();
  }, []);

  // ✅ Update Profile (name & email)
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change Password
  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = passwords;
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in first!");
      return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("All password fields are required!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");

      toast.success("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Avatar className="h-24 w-24 mx-auto ring-4 ring-primary/20">
          <AvatarImage src="" />
          <AvatarFallback className="text-2xl gradient-primary text-white">
            {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and password
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <Card className="shadow-lg border border-primary/10">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full gradient-primary text-white shadow-glow"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change Form */}
      <Card className="shadow-lg border border-primary/10">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Old Password</Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="Enter your old password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirmNewPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full gradient-primary text-white shadow-glow"
          >
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

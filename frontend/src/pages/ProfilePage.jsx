import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const currencies = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "AUD",
  "CAD",
  "JPY",
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    setValue,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName,
      defaultCurrency: user?.defaultCurrency,
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset,
  } = useForm();

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await api.patch("/users/me", data);
      updateUser(res.data.user);
      toast({ title: "Profile updated successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error?.message,
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await api.patch("/users/me/password", data);
      toast({ title: "Password changed successfully" });
      reset();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error?.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-200">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user?.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {user?.authProvider} account
              </p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...regProfile("fullName", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select
                onValueChange={(v) => setValue("defaultCurrency", v)}
                defaultValue={user?.defaultCurrency}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      {user?.authProvider === "local" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePassword(onPasswordSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  {...regPassword("currentPassword", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  {...regPassword("newPassword", {
                    required: true,
                    minLength: 8,
                  })}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="text-gray-700 font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email Verified</span>
            <span
              className={
                user?.isEmailVerified ? "text-green-600" : "text-yellow-600"
              }
            >
              {user?.isEmailVerified ? "Verified" : "Not verified"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member Since</span>
            <span className="text-gray-700">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

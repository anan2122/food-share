'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Input, Select, Toggle, Textarea, Badge } from '@/components/ui';

// Mock user data
const initialUserData = {
  name: 'Grand Hotel',
  email: 'manager@grandhotel.com',
  phone: '+91 98765 43210',
  role: 'donor',
  organizationType: 'hotel',
  address: '123 MG Road, Bangalore',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  fssaiNumber: 'FSSAI/2023/12345678',
  gstNumber: 'GST123456789',
  isVerified: true,
  trustBadge: 'gold',
  joinedAt: '2023-06-15',
  avatar: null,
};

const notificationPreferences = {
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,
  donationRequests: true,
  pickupUpdates: true,
  deliveryComplete: true,
  weeklyDigest: false,
  marketingEmails: false,
};

const organizationTypeOptions = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'catering', label: 'Catering Service' },
  { value: 'corporate', label: 'Corporate Cafeteria' },
  { value: 'event', label: 'Event Organizer' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'other', label: 'Other' },
];

export default function SettingsPage() {
  const [userData, setUserData] = useState(initialUserData);
  const [notifications, setNotifications] = useState(notificationPreferences);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'organization', label: 'Organization', icon: Building },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <Button 
          leftIcon={showSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          onClick={handleSave}
          isLoading={isSaving}
          className={showSaved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {showSaved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </Card>

          {/* Verification Status */}
          <Card className="mt-4 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className={userData.isVerified ? 'text-emerald-600' : 'text-amber-600'} size={24} />
              <div>
                <p className="font-medium text-gray-900">
                  {userData.isVerified ? 'Verified Account' : 'Pending Verification'}
                </p>
                <p className="text-xs text-gray-500">
                  {userData.isVerified ? 'Your account is fully verified' : 'Verification in progress'}
                </p>
              </div>
            </div>
            {userData.trustBadge && (
              <Badge variant="success" className="w-full justify-center">
                {userData.trustBadge.charAt(0).toUpperCase() + userData.trustBadge.slice(1)} Trust Badge
              </Badge>
            )}
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-600">
                    {userData.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Camera size={14} className="text-gray-600" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userData.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{userData.role}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Change Photo
                  </Button>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Organization Name"
                  value={userData.name}
                  onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                  leftIcon={<Building size={18} />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                  leftIcon={<Mail size={18} />}
                />
                <Input
                  label="Phone Number"
                  value={userData.phone}
                  onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                  leftIcon={<Phone size={18} />}
                />
                <Select
                  label="Organization Type"
                  options={organizationTypeOptions}
                  value={userData.organizationType}
                  onChange={(e) => setUserData((prev) => ({ ...prev, organizationType: e.target.value }))}
                />
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Textarea
                      label="Street Address"
                      value={userData.address}
                      onChange={(e) => setUserData((prev) => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Input
                    label="City"
                    value={userData.city}
                    onChange={(e) => setUserData((prev) => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    label="State"
                    value={userData.state}
                    onChange={(e) => setUserData((prev) => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    label="PIN Code"
                    value={userData.pincode}
                    onChange={(e) => setUserData((prev) => ({ ...prev, pincode: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Details</h2>

              <div className="space-y-6">
                <Input
                  label="FSSAI License Number"
                  value={userData.fssaiNumber}
                  onChange={(e) => setUserData((prev) => ({ ...prev, fssaiNumber: e.target.value }))}
                  helperText="Your food safety license number"
                />
                <Input
                  label="GST Number (Optional)"
                  value={userData.gstNumber}
                  onChange={(e) => setUserData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                  helperText="Required for donations above ₹50,000"
                />

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-amber-800">Document Verification</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Any changes to organization details will require re-verification. 
                        This process typically takes 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Uploaded Documents</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'FSSAI License', status: 'verified' },
                      { name: 'Business Registration', status: 'verified' },
                      { name: 'Health & Safety Certificate', status: 'verified' },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                        <div className="flex items-center gap-2">
                          {doc.status === 'verified' && (
                            <Badge variant="success" size="sm">
                              <CheckCircle2 size={12} className="mr-1" /> Verified
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">Update</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {/* Channels */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get SMS alerts for urgent updates' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Types */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Event Types</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'donationRequests', label: 'Donation Requests', desc: 'When NGOs request your donations' },
                      { key: 'pickupUpdates', label: 'Pickup Updates', desc: 'Volunteer assignment and pickup status' },
                      { key: 'deliveryComplete', label: 'Delivery Completion', desc: 'When your donation is delivered' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your impact and activity' },
                      { key: 'marketingEmails', label: 'Marketing & Updates', desc: 'News, tips, and platform updates' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label="Current Password"
                      value={passwords.current}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Input
                    type="password"
                    label="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                    helperText="At least 8 characters with uppercase, lowercase, and number"
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  />
                  <Button>Update Password</Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Download Your Data</p>
                      <p className="text-sm text-gray-500">Get a copy of all your data</p>
                    </div>
                    <Button variant="outline">Download</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger">Delete Account</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

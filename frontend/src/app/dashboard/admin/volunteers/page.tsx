'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { 
  UserCheck, 
  Search, 
  MapPin, 
  Phone,
  Mail,
  Star,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  address: {
    city: string;
    state: string;
  };
  volunteerInfo?: {
    availability?: Record<string, { available: boolean; startTime: string; endTime: string }>;
    preferredAreas?: string[];
    hasVehicle?: boolean;
    vehicleType?: string;
    maxDistance?: number;
  };
  completedDonations: number;
  trustScore: number;
  createdAt: string;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | boolean> = { role: 'volunteer' };
      if (statusFilter === 'verified') params.isVerified = true;
      if (statusFilter === 'unverified') params.isVerified = false;
      
      const response = await apiClient.getUsers(params);
      if (response.success) {
        setVolunteers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await apiClient.verifyUser(id, verified);
      fetchVolunteers();
    } catch (error) {
      console.error('Failed to verify volunteer:', error);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: volunteers.length,
    verified: volunteers.filter(v => v.isVerified).length,
    active: volunteers.filter(v => v.isActive).length,
    withVehicle: volunteers.filter(v => v.volunteerInfo?.hasVehicle).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor volunteer accounts and activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Volunteers</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.verified}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Now</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.withVehicle}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">With Vehicle</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Volunteers' },
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Pending Verification' },
            ]}
          />
        </div>
      </Card>

      {/* Volunteers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <Card className="text-center py-12">
          <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No volunteers found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer) => (
            <Card key={volunteer._id} className="relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant={volunteer.isVerified ? 'success' : 'warning'}>
                  {volunteer.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
                  {volunteer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{volunteer.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>{volunteer.trustScore || 0} Trust Score</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={14} />
                  <span className="truncate">{volunteer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={14} />
                  <span>{volunteer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} />
                  <span>{volunteer.address?.city}, {volunteer.address?.state}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{volunteer.completedDonations || 0}</p>
                  <p className="text-xs text-gray-500">Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {volunteer.volunteerInfo?.hasVehicle ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs text-gray-500">Has Vehicle</p>
                </div>
              </div>

              {/* Vehicle Info */}
              {volunteer.volunteerInfo?.hasVehicle && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Truck size={14} className="text-emerald-600" />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {volunteer.volunteerInfo.vehicleType || 'Vehicle Available'}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!volunteer.isVerified && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVerify(volunteer._id, true)}
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    Verify
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

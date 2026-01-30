'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { 
  UtensilsCrossed, 
  Search, 
  Filter, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

interface Donation {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  expiryDate: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
  };
  donor: {
    _id: string;
    name: string;
    organizationName?: string;
    phone: string;
  };
  claimedBy?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
  isVerified: boolean;
  createdAt: string;
}

export default function FoodManagementPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, categoryFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const response = await apiClient.getDonations(params);
      if (response.success) {
        setDonations(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await apiClient.verifyDonation(id, { verified });
      fetchDonations();
    } catch (error) {
      console.error('Failed to verify donation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;
    try {
      await apiClient.deleteDonation(id);
      fetchDonations();
    } catch (error) {
      console.error('Failed to delete donation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
      'available': { variant: 'success', label: 'Available' },
      'claimed': { variant: 'info', label: 'Claimed' },
      'in_transit': { variant: 'warning', label: 'In Transit' },
      'completed': { variant: 'success', label: 'Completed' },
      'expired': { variant: 'danger', label: 'Expired' },
      'cancelled': { variant: 'danger', label: 'Cancelled' },
    };
    return statusMap[status] || { variant: 'default', label: status };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  const filteredDonations = donations.filter(donation => 
    donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donor?.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: donations.length,
    available: donations.filter(d => d.status === 'available').length,
    claimed: donations.filter(d => d.status === 'claimed').length,
    expiringSoon: donations.filter(d => isExpiringSoon(d.expiryDate)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all food donations on the platform
          </p>
        </div>
        <Button onClick={fetchDonations}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.claimed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Claimed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.expiringSoon}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'available', label: 'Available' },
              { value: 'claimed', label: 'Claimed' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'completed', label: 'Completed' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'cooked_food', label: 'Cooked Food' },
              { value: 'raw_ingredients', label: 'Raw Ingredients' },
              { value: 'packaged_food', label: 'Packaged Food' },
              { value: 'beverages', label: 'Beverages' },
              { value: 'bakery', label: 'Bakery' },
              { value: 'dairy', label: 'Dairy' },
              { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
            ]}
          />
        </div>
      </Card>

      {/* Donations Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No donations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Donation</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Donor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Expiry</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Verified</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const statusBadge = getStatusBadge(donation.status);
                  const expiringSoon = isExpiringSoon(donation.expiryDate);
                  return (
                    <tr key={donation._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <UtensilsCrossed size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{donation.title}</p>
                            <p className="text-sm text-gray-500 capitalize">{donation.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {donation.donor?.organizationName || donation.donor?.name}
                        </p>
                        <p className="text-xs text-gray-500">{donation.pickupAddress?.city}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {donation.quantity} {donation.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {expiringSoon && <AlertTriangle size={14} className="text-amber-500" />}
                          <span className={`text-sm ${expiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {new Date(donation.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {donation.isVerified ? (
                          <CheckCircle2 size={20} className="text-emerald-600" />
                        ) : (
                          <XCircle size={20} className="text-gray-400" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          {!donation.isVerified && (
                            <button 
                              onClick={() => handleVerify(donation._id, true)}
                              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg"
                            >
                              <CheckCircle2 size={16} className="text-emerald-600" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(donation._id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

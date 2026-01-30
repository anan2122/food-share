'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Globe,
  FileText
} from 'lucide-react';

interface NGO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  organizationName?: string;
  isVerified: boolean;
  isActive: boolean;
  address: {
    street: string;
    city: string;
    state: string;
  };
  completedDonations: number;
  trustScore: number;
  trustBadge: string;
  createdAt: string;
}

export default function NGOsPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchNGOs();
  }, [statusFilter]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | boolean> = { role: 'ngo' };
      if (statusFilter === 'verified') params.isVerified = true;
      if (statusFilter === 'unverified') params.isVerified = false;
      
      const response = await apiClient.getUsers(params);
      if (response.success) {
        setNgos(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await apiClient.verifyUser(id, verified);
      fetchNGOs();
    } catch (error) {
      console.error('Failed to verify NGO:', error);
    }
  };

  const filteredNGOs = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'platinum': 'from-gray-400 to-gray-600',
      'gold': 'from-amber-400 to-amber-600',
      'silver': 'from-gray-300 to-gray-500',
      'bronze': 'from-orange-400 to-orange-600',
      'none': 'from-gray-200 to-gray-400',
    };
    return colors[badge] || colors['none'];
  };

  const stats = {
    total: ngos.length,
    verified: ngos.filter(n => n.isVerified).length,
    active: ngos.filter(n => n.isActive).length,
    totalReceived: ngos.reduce((acc, n) => acc + (n.completedDonations || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NGO Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage partner NGOs, shelters, and community kitchens
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total NGOs</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.verified}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.totalReceived}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Donations Received</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All NGOs' },
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Pending Verification' },
            ]}
          />
        </div>
      </Card>

      {/* NGO List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredNGOs.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No NGOs found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNGOs.map((ngo) => (
            <Card key={ngo._id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getBadgeColor(ngo.trustBadge)} flex items-center justify-center text-white`}>
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ngo.organizationName || ngo.name}
                    </h3>
                    <p className="text-sm text-gray-500">{ngo.name}</p>
                  </div>
                </div>
                <Badge variant={ngo.isVerified ? 'success' : 'warning'}>
                  {ngo.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              {/* Contact & Location */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{ngo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} />
                    <span>{ngo.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={14} />
                    <span>{ngo.address?.city}, {ngo.address?.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <span>Since {new Date(ngo.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{ngo.completedDonations || 0}</p>
                  <p className="text-xs text-gray-500">Received</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{ngo.trustScore || 0}</p>
                  <p className="text-xs text-gray-500">Trust Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                      {ngo.trustBadge || 'None'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Badge</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!ngo.isVerified && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVerify(ngo._id, true)}
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    Verify
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText size={14} className="mr-1" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

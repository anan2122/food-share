'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Search, 
  MapPin, 
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Navigation,
  Phone,
  Building2,
  AlertTriangle
} from 'lucide-react';

interface Pickup {
  _id: string;
  title: string;
  description: string;
  foodType: string;
  quantity: number;
  status: string;
  expiryTime: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  donor: {
    _id: string;
    name: string;
    phone: string;
  };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  receivedBy?: {
    _id: string;
    name: string;
    organizationName: string;
  };
  createdAt: string;
}

export default function PickupsPage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('assigned');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  useEffect(() => {
    fetchPickups();
  }, [statusFilter, activeTab]);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { assignedVolunteer: user?._id || '' };
      
      if (activeTab === 'upcoming') {
        params.status = 'assigned';
      } else if (activeTab === 'completed') {
        params.status = 'delivered';
      }
      
      const response = await apiClient.getDonations(params);
      if (response.success) {
        setPickups(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPickup = async (id: string) => {
    try {
      await apiClient.updateDonationStatus(id, 'in_transit');
      fetchPickups();
    } catch (error) {
      console.error('Failed to start pickup:', error);
    }
  };

  const handleCompletePickup = async (id: string) => {
    try {
      await apiClient.updateDonationStatus(id, 'delivered');
      fetchPickups();
    } catch (error) {
      console.error('Failed to complete pickup:', error);
    }
  };

  const handleCancelPickup = async (id: string) => {
    try {
      // Remove volunteer assignment
      await apiClient.updateDonationStatus(id, 'available');
      fetchPickups();
    } catch (error) {
      console.error('Failed to cancel pickup:', error);
    }
  };

  const getUrgency = (expiryTime: string) => {
    const hours = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 2) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (hours < 6) return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (hours < 12) return { level: 'medium', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      delivered: 'success',
      in_transit: 'warning',
      assigned: 'default',
      cancelled: 'danger',
    };
    return colors[status] || 'default';
  };

  const filteredPickups = pickups.filter(pickup =>
    pickup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.donor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.pickupAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    upcoming: pickups.filter(p => p.status === 'assigned').length,
    inProgress: pickups.filter(p => p.status === 'in_transit').length,
    completed: pickups.filter(p => p.status === 'delivered').length,
    total: pickups.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Pickups</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your assigned pickup tasks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Pickups
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pickups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Pickups List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredPickups.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pickups Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'upcoming' 
              ? 'You have no upcoming pickups. Check available assignments.'
              : 'No pickups match your search criteria.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((pickup) => {
            const urgency = getUrgency(pickup.expiryTime);
            return (
              <Card key={pickup._id}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {pickup.title}
                          </h3>
                          <Badge variant={getStatusColor(pickup.status)}>
                            {pickup.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{pickup.description}</p>
                      </div>
                      {pickup.status !== 'delivered' && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                          <AlertTriangle size={12} className="inline mr-1" />
                          {urgency.level}
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Package size={14} />
                        <span>{pickup.quantity} servings</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={14} />
                        <span>{pickup.pickupTimeStart} - {pickup.pickupTimeEnd}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Expires {new Date(pickup.expiryTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 capitalize">
                        <span>{pickup.foodType}</span>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={14} className="text-green-600" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">PICKUP</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {pickup.pickupAddress?.street}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pickup.pickupAddress?.city}, {pickup.pickupAddress?.state}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Phone size={12} />
                          <span>{pickup.donor?.phone || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {pickup.receivedBy && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 size={14} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">DELIVER TO</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {pickup.receivedBy.organizationName || pickup.receivedBy.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                    {pickup.status === 'assigned' && (
                      <>
                        <Button 
                          className="flex-1 lg:flex-none"
                          onClick={() => handleStartPickup(pickup._id)}
                        >
                          <Navigation size={14} className="mr-1" />
                          Start Pickup
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 lg:flex-none text-red-600"
                          onClick={() => handleCancelPickup(pickup._id)}
                        >
                          <XCircle size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {pickup.status === 'in_transit' && (
                      <Button 
                        className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompletePickup(pickup._id)}
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                    {pickup.status === 'delivered' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 size={20} />
                        <span className="font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

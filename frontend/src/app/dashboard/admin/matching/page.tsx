'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { 
  Link2, 
  Search, 
  MapPin, 
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Package,
  Building2,
  Zap
} from 'lucide-react';

interface Match {
  _id: string;
  donationId: {
    _id: string;
    title: string;
    foodType: string;
    quantity: number;
    status: string;
    donor: {
      name: string;
    };
    pickupAddress: {
      city: string;
    };
  };
  ngoId: {
    _id: string;
    name: string;
    organizationName: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  matchScore: number;
  matchReason: string;
  distance: number;
  createdAt: string;
}

interface PendingDonation {
  _id: string;
  title: string;
  foodType: string;
  quantity: number;
  expiryTime: string;
  pickupAddress: {
    city: string;
  };
  donor: {
    name: string;
  };
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'matches' | 'pending'>('matches');
  const [autoMatching, setAutoMatching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch matches and pending donations
      const [donationsRes] = await Promise.all([
        apiClient.getDonations({ status: 'available' }),
      ]);
      
      if (donationsRes.success) {
        setPendingDonations(donationsRes.data || []);
      }
      
      // Generate mock matches for demo (in production, would come from backend)
      setMatches([]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      setAutoMatching(true);
      // Call auto-matching API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      fetchData();
    } catch (error) {
      console.error('Failed to run auto-matching:', error);
    } finally {
      setAutoMatching(false);
    }
  };

  const handleManualMatch = async (donationId: string, ngoId: string) => {
    try {
      await apiClient.createMatch({ donationId, ngoId });
      fetchData();
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      completed: 'success',
      accepted: 'success',
      pending: 'warning',
      rejected: 'danger',
    };
    return colors[status] || 'default';
  };

  const getUrgencyLevel = (expiryTime: string) => {
    const hours = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 2) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (hours < 6) return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (hours < 12) return { level: 'medium', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const stats = {
    totalMatches: matches.length,
    successRate: matches.length > 0 
      ? Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100) 
      : 0,
    avgDistance: matches.length > 0
      ? (matches.reduce((acc, m) => acc + (m.distance || 0), 0) / matches.length).toFixed(1)
      : '0',
    pending: pendingDonations.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Matching</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered donation matching and optimization
          </p>
        </div>
        <Button 
          onClick={handleAutoMatch}
          disabled={autoMatching}
          className="flex items-center gap-2"
        >
          {autoMatching ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          {autoMatching ? 'Matching...' : 'Run Auto-Match'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link2 size={20} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMatches}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Matches</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgDistance}km</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Distance</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Donations</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'matches'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Matches
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Donations
          {pendingDonations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
              {pendingDonations.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search donations or NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {activeTab === 'matches' && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'completed', label: 'Completed' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          )}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'matches' ? (
        matches.length === 0 ? (
          <Card className="text-center py-12">
            <Link2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Matches</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Run auto-matching to create new donation-NGO pairs
            </p>
            <Button onClick={handleAutoMatch}>
              <Zap size={16} className="mr-2" />
              Run Auto-Match
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match._id}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Donation */}
                  <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={18} className="text-emerald-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {match.donationId.title}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{match.donationId.quantity} servings • {match.donationId.foodType}</p>
                      <p>From: {match.donationId.donor?.name}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center lg:px-4">
                    <div className="flex flex-col items-center">
                      <ArrowRight size={24} className="text-emerald-600 hidden lg:block" />
                      <span className="text-xs text-gray-500 mt-1">
                        {match.distance}km
                      </span>
                      <div className="text-xs text-emerald-600 font-medium">
                        {match.matchScore}% match
                      </div>
                    </div>
                  </div>

                  {/* NGO */}
                  <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={18} className="text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {match.ngoId.organizationName || match.ngoId.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{match.matchReason}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(match.status)}>
                      {match.status}
                    </Badge>
                    {match.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle2 size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <XCircle size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Pending Donations Tab */
        pendingDonations.length === 0 ? (
          <Card className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pending donations</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingDonations.map((donation) => {
              const urgency = getUrgencyLevel(donation.expiryTime);
              return (
                <Card key={donation._id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {donation.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        From {donation.donor?.name}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                      {urgency.level.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package size={14} />
                      <span>{donation.quantity} servings</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={14} />
                      <span>{donation.pickupAddress?.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="capitalize">{donation.foodType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={14} />
                      <span>Expires {new Date(donation.expiryTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Link2 size={14} className="mr-1" />
                      Find Match
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Manual Assign
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

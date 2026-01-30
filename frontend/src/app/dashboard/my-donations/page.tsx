'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  LucideIcon,
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '@/components/ui';

interface Donation {
  _id: string;
  title: string;
  quantity: number;
  unit?: string;
  status: string;
  createdAt: string;
  expiryDate?: string;
  receivedBy?: {
    name: string;
    organizationName: string;
  };
  assignedVolunteer?: {
    name: string;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; icon: LucideIcon }> = {
  pending: { label: 'Pending Verification', variant: 'warning', icon: Clock },
  approved: { label: 'Approved - Awaiting Match', variant: 'info', icon: CheckCircle2 },
  matched: { label: 'Matched with NGO', variant: 'purple', icon: CheckCircle2 },
  pickup_assigned: { label: 'Pickup Assigned', variant: 'info', icon: Truck },
  in_transit: { label: 'In Transit', variant: 'info', icon: Truck },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'danger', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', variant: 'default', icon: AlertTriangle },
  rejected: { label: 'Rejected', variant: 'danger', icon: AlertTriangle },
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'matched', label: 'Matched' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'expired', label: 'Expired' },
];

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDonations({});
      if (response.success && response.data) {
        setDonations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Donations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your food donations</p>
        </div>
        <Button leftIcon={<UtensilsCrossed size={18} />} onClick={() => window.location.href = '/dashboard/donate'}>
          New Donation
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Donations', value: donations.length, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
          { label: 'Delivered', value: donations.filter(d => d.status === 'delivered').length, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'In Progress', value: donations.filter(d => ['in_transit', 'pickup_assigned', 'matched', 'approved'].includes(d.status)).length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
          { label: 'Pending', value: donations.filter(d => d.status === 'pending').length, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Donations List */}
      {!loading && (
        <div className="space-y-4">
          {filteredDonations.length === 0 ? (
            <Card className="text-center py-12">
              <UtensilsCrossed className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No donations found</p>
            </Card>
          ) : (
            filteredDonations.map((donation) => {
              const status = statusConfig[donation.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={donation._id} hover onClick={() => setSelectedDonation(donation)}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="text-emerald-600" size={28} />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{donation.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {donation.quantity} {donation.unit || 'servings'} • {getTimeAgo(donation.createdAt)}
                          </p>
                        </div>
                        <Badge variant={status.variant} icon={StatusIcon}>
                          {status.label}
                        </Badge>
                      </div>

                      {/* Progress Info */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        {donation.receivedBy && (
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin size={14} />
                            {donation.receivedBy.organizationName || donation.receivedBy.name}
                          </span>
                        )}
                        {donation.assignedVolunteer && (
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Truck size={14} />
                            {donation.assignedVolunteer.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
                      View
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        title="Donation Details"
        size="lg"
      >
        {selectedDonation && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedDonation.title}</h3>
              <Badge variant={statusConfig[selectedDonation.status]?.variant || 'default'}>
                {statusConfig[selectedDonation.status]?.label}
              </Badge>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Tracking Timeline</h4>
              <div className="space-y-3">
                {[
                  { label: 'Donation Created', time: selectedDonation.createdAt, done: true },
                  { label: 'Verified by Admin', done: selectedDonation.status !== 'pending' },
                  { label: 'Matched with NGO', done: !!selectedDonation.receivedBy },
                  { label: 'Pickup Assigned', done: ['pickup_assigned', 'in_transit', 'delivered'].includes(selectedDonation.status) },
                  { label: 'In Transit', done: ['in_transit', 'delivered'].includes(selectedDonation.status) },
                  { label: 'Delivered', done: selectedDonation.status === 'delivered' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>
                      {step.done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className={step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{step.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.quantity} {selectedDonation.unit || 'servings'}</p>
              </div>
              {selectedDonation.receivedBy && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receiving NGO</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.receivedBy.organizationName || selectedDonation.receivedBy.name}</p>
                </div>
              )}
              {selectedDonation.assignedVolunteer && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Volunteer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.assignedVolunteer.name}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedDonation(null)}>
                Close
              </Button>
              {selectedDonation.status === 'in_transit' && (
                <Button className="flex-1" leftIcon={<MapPin size={18} />}>
                  Track Live
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

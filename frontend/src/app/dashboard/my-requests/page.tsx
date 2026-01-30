'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import {
  Package,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  Filter,
  Calendar,
  ChevronRight,
  User,
} from 'lucide-react';
import { Card, Button, Badge, Select, Modal } from '@/components/ui';

interface FoodRequest {
  _id: string;
  title: string;
  quantity: number;
  unit?: string;
  status: string;
  createdAt: string;
  donor?: {
    name: string;
    phone?: string;
    organizationName?: string;
  };
  pickupAddress?: string;
  assignedVolunteer?: {
    name: string;
    phone?: string;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'info', icon: CheckCircle2 },
  volunteer_assigned: { label: 'Volunteer Assigned', variant: 'info', icon: User },
  pickup_assigned: { label: 'Pickup Assigned', variant: 'info', icon: User },
  pickup_started: { label: 'Pickup Started', variant: 'info', icon: Truck },
  in_transit: { label: 'In Transit', variant: 'info', icon: Truck },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // For NGOs, fetch donations they've claimed/requested
      const response = await apiClient.getDonations({});
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    return !statusFilter || r.status === statusFilter;
  });

  const activeRequests = requests.filter(r => !['delivered', 'cancelled'].includes(r.status)).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your food requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: requests.length, icon: Package, color: 'text-blue-600' },
          { label: 'Active', value: activeRequests, icon: Truck, color: 'text-amber-600' },
          { label: 'Delivered', value: requests.filter(r => r.status === 'delivered').length, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Cancelled', value: requests.filter(r => r.status === 'cancelled').length, icon: XCircle, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <stat.icon className={stat.color} size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Requests List */}
      {!loading && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No requests found</p>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={request._id} hover onClick={() => setSelectedRequest(request)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Request Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                        <Badge variant={status.variant}>
                          <StatusIcon size={12} className="mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {request.quantity} {request.unit || 'servings'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {request.donor?.organizationName || request.donor?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Volunteer Info (if assigned) */}
                      {request.assignedVolunteer && request.status !== 'delivered' && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                          <User size={14} className="text-blue-600" />
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            Volunteer: <strong>{request.assignedVolunteer.name}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Action */}
                    <div className="flex items-center gap-4">
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedRequest.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedRequest.quantity} {selectedRequest.unit || 'servings'}</p>
              </div>
              <Badge variant={statusConfig[selectedRequest.status]?.variant || 'info'}>
                {statusConfig[selectedRequest.status]?.label}
              </Badge>
            </div>

            {/* Donor Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Donor Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{selectedRequest.donor?.organizationName || selectedRequest.donor?.name || 'Unknown'}</span>
                </div>
                {selectedRequest.donor?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedRequest.donor.phone}</span>
                  </div>
                )}
              </div>
              {selectedRequest.pickupAddress && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.pickupAddress}</p>
              )}
            </div>

            {/* Volunteer Info */}
            {selectedRequest.assignedVolunteer && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-3">
                <h4 className="font-medium text-blue-900 dark:text-blue-200">Assigned Volunteer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">{selectedRequest.assignedVolunteer.name}</span>
                  </div>
                  {selectedRequest.assignedVolunteer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-800 dark:text-blue-300">{selectedRequest.assignedVolunteer.phone}</span>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" leftIcon={<MessageSquare size={14} />}>
                  Chat with Volunteer
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
                <Button variant="danger" className="flex-1">
                  Cancel Request
                </Button>
              )}
              {selectedRequest.status === 'delivered' && (
                <Button className="flex-1">
                  Rate Experience
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

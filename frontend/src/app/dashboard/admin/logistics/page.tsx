'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { 
  Truck, 
  Search, 
  MapPin, 
  Clock,
  Package,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Navigation,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Delivery {
  _id: string;
  donationId: {
    _id: string;
    title: string;
    quantity: number;
    foodType: string;
    pickupAddress: {
      street: string;
      city: string;
    };
    deliveryAddress?: {
      street: string;
      city: string;
    };
  };
  volunteer?: {
    _id: string;
    name: string;
    phone: string;
  };
  ngo?: {
    _id: string;
    name: string;
    organizationName: string;
  };
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  pickupTime: string;
  deliveryTime?: string;
  distance: number;
  estimatedDuration: number;
  route?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
  createdAt: string;
}

interface Route {
  id: string;
  name: string;
  stops: {
    type: 'pickup' | 'delivery';
    address: string;
    donationId: string;
    time: string;
  }[];
  totalDistance: number;
  estimatedTime: number;
  volunteer?: {
    name: string;
    phone: string;
  };
  status: 'planned' | 'active' | 'completed';
}

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'deliveries' | 'routes' | 'tracking'>('deliveries');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await apiClient.getDonations({ status: 'in_transit' });
      if (response.success) {
        // Transform donations to deliveries format
        const deliveryData: Delivery[] = (response.data || []).map((d: any) => ({
          _id: d._id,
          donationId: d,
          volunteer: d.assignedVolunteer,
          ngo: d.receivedBy,
          status: (d.status === 'in_transit' ? 'in_transit' : 'pending') as 'pending' | 'in_transit' | 'delivered' | 'cancelled',
          pickupTime: d.pickupTime,
          deliveryTime: d.deliveryTime,
          distance: Math.random() * 10 + 1,
          estimatedDuration: Math.random() * 30 + 15,
          createdAt: d.createdAt,
        }));
        setDeliveries(deliveryData);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      delivered: 'success',
      in_transit: 'warning',
      pending: 'default',
      cancelled: 'danger',
    };
    return colors[status] || 'default';
  };

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    avgDistance: deliveries.length > 0
      ? (deliveries.reduce((acc, d) => acc + (d.distance || 0), 0) / deliveries.length).toFixed(1)
      : '0',
  };

  // Mock routes for demo
  const routes: Route[] = [
    {
      id: '1',
      name: 'Morning Route A',
      stops: [
        { type: 'pickup', address: 'Restaurant ABC, Downtown', donationId: '1', time: '09:00' },
        { type: 'delivery', address: 'Hope Shelter, Main St', donationId: '1', time: '09:30' },
        { type: 'pickup', address: 'Cafe XYZ, Central', donationId: '2', time: '10:00' },
        { type: 'delivery', address: 'Food Bank, 5th Ave', donationId: '2', time: '10:30' },
      ],
      totalDistance: 15.5,
      estimatedTime: 90,
      volunteer: { name: 'John Volunteer', phone: '+1 234-567-8900' },
      status: 'active',
    },
    {
      id: '2',
      name: 'Afternoon Route B',
      stops: [
        { type: 'pickup', address: 'Hotel Grand, Park Ave', donationId: '3', time: '14:00' },
        { type: 'delivery', address: 'Community Kitchen, Oak St', donationId: '3', time: '14:45' },
      ],
      totalDistance: 8.2,
      estimatedTime: 45,
      status: 'planned',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logistics & Routing</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage deliveries, optimize routes, and track shipments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck size={20} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Deliveries</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Navigation size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inTransit}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgDistance}km</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Distance</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'deliveries'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Deliveries
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'routes'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Route Planning
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'tracking'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Live Tracking
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search deliveries..."
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
              { value: 'pending', label: 'Pending' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'deliveries' ? (
        deliveries.length === 0 ? (
          <Card className="text-center py-12">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Deliveries</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Deliveries will appear here once donations are matched and assigned
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery._id}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Package size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {delivery.donationId.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {delivery.donationId.quantity} servings • {delivery.donationId.foodType}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {delivery.donationId.pickupAddress?.street}, {delivery.donationId.pickupAddress?.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-red-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Delivery</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {delivery.donationId.deliveryAddress?.street || 'TBD'}, {delivery.donationId.deliveryAddress?.city || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(delivery.status)}>
                      {delivery.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      <p>{delivery.distance.toFixed(1)}km • ~{Math.round(delivery.estimatedDuration)}min</p>
                    </div>
                    {delivery.volunteer && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>{delivery.volunteer.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeTab === 'routes' ? (
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    route.status === 'active' ? 'bg-green-100 text-green-600' :
                    route.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{route.name}</h3>
                    <p className="text-sm text-gray-500">
                      {route.stops.length} stops • {route.totalDistance}km • ~{route.estimatedTime}min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={route.status === 'active' ? 'success' : route.status === 'completed' ? 'default' : 'warning'}>
                    {route.status}
                  </Badge>
                  {route.status === 'planned' && (
                    <Button size="sm">
                      <Play size={14} className="mr-1" />
                      Start
                    </Button>
                  )}
                  {route.status === 'active' && (
                    <Button size="sm" variant="outline">
                      <Pause size={14} className="mr-1" />
                      Pause
                    </Button>
                  )}
                </div>
              </div>

              {/* Route Timeline */}
              <div className="relative pl-8 space-y-4">
                {route.stops.map((stop, index) => (
                  <div key={index} className="relative">
                    <div className={`absolute left-[-24px] w-4 h-4 rounded-full border-2 ${
                      stop.type === 'pickup' ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'
                    }`} />
                    {index < route.stops.length - 1 && (
                      <div className="absolute left-[-18px] top-4 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-medium uppercase ${
                          stop.type === 'pickup' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stop.type}
                        </span>
                        <p className="text-sm text-gray-900 dark:text-white">{stop.address}</p>
                      </div>
                      <span className="text-sm text-gray-500">{stop.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {route.volunteer && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{route.volunteer.name}</p>
                      <p className="text-xs text-gray-500">{route.volunteer.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Live Tracking Tab */
        <Card className="text-center py-12">
          <Navigation size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Live Tracking</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Real-time GPS tracking will be displayed here when deliveries are in transit
          </p>
          <div className="aspect-video max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Map will load here</p>
          </div>
        </Card>
      )}
    </div>
  );
}

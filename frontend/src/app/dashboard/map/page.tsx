'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Package,
  Filter,
  RefreshCw,
  Truck,
  Building2,
  UtensilsCrossed
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Donation {
  _id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  expiryDate: string;
  pickupAddress: {
    street: string;
    city: string;
  };
  location?: {
    coordinates: [number, number];
  };
  donor: {
    name: string;
    phone: string;
    organizationName?: string;
  };
}

interface Pickup {
  _id: string;
  status: string;
  donation: Donation;
  volunteer?: {
    name: string;
    phone: string;
  };
  currentLocation?: {
    coordinates: [number, number];
  };
}

export default function MapPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'in_transit'>('all');
  const [selectedItem, setSelectedItem] = useState<Donation | Pickup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default center (Mumbai, India)
  const defaultCenter: [number, number] = [19.076, 72.8777];

  useEffect(() => {
    setMapReady(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, pickupsRes] = await Promise.all([
        apiClient.getDonations({ status: 'available' }),
        apiClient.getPickups({ status: 'in_progress' })
      ]);

      if (donationsRes.success) {
        setDonations(donationsRes.data || []);
      }
      if (pickupsRes.success) {
        setPickups(pickupsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (filter === 'available') {
      return { donations, pickups: [] };
    }
    if (filter === 'in_transit') {
      return { donations: [], pickups };
    }
    return { donations, pickups };
  };

  const { donations: filteredDonations, pickups: filteredPickups } = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Map</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time view of donations and deliveries in your area
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['all', 'available', 'in_transit'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {f === 'all' ? 'All' : f === 'available' ? 'Available' : 'In Transit'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden h-[600px]">
            {mapReady && typeof window !== 'undefined' && (
              <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Donation markers */}
                {filteredDonations.map((donation) => {
                  if (!donation.location?.coordinates) return null;
                  return (
                    <Marker
                      key={donation._id}
                      position={[
                        donation.location.coordinates[1],
                        donation.location.coordinates[0]
                      ]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{donation.title}</h3>
                          <p className="text-sm text-gray-600">
                            {donation.quantity} {donation.unit}
                          </p>
                          <Badge variant="success" className="mt-2">Available</Badge>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Active pickup markers */}
                {filteredPickups.map((pickup) => {
                  if (!pickup.currentLocation?.coordinates) return null;
                  return (
                    <Marker
                      key={pickup._id}
                      position={[
                        pickup.currentLocation.coordinates[1],
                        pickup.currentLocation.coordinates[0]
                      ]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">Delivery in Progress</h3>
                          <p className="text-sm text-gray-600">
                            {pickup.volunteer?.name}
                          </p>
                          <Badge variant="info" className="mt-2">In Transit</Badge>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - List View */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span className="text-gray-600 dark:text-gray-400">Available Donations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">NGO Locations</span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{donations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Transit</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{pickups.length}</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Nearby Donations</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {filteredDonations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No donations available in your area
                </p>
              ) : (
                filteredDonations.slice(0, 5).map((donation) => (
                  <div
                    key={donation._id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedItem(donation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <UtensilsCrossed size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {donation.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {donation.quantity} {donation.unit}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {donation.pickupAddress?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

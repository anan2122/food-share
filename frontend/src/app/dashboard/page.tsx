'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { 
  UtensilsCrossed, 
  Heart, 
  Truck, 
  Clock, 
  TrendingUp, 
  Users, 
  Leaf,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '@/components/ui';
import Link from 'next/link';

interface Donation {
  _id: string;
  title: string;
  quantity: number;
  status: string;
  createdAt: string;
  receivedBy?: {
    name: string;
    organizationName: string;
  };
}

interface DashboardStats {
  totalDonations: number;
  mealsProvided: number;
  foodSaved: number;
  co2Saved: number;
  activeDeliveries: number;
  pendingVerifications: number;
  activeUsers: number;
}

const alertsData = [
  { id: 1, type: 'warning', message: '3 donations expiring in next 2 hours', action: 'View all' },
  { id: 2, type: 'info', message: '5 new NGO requests pending', action: 'Review' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'donor';
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    mealsProvided: 0,
    foodSaved: 0,
    co2Saved: 0,
    activeDeliveries: 0,
    pendingVerifications: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch donations based on role
      const donationsRes = await apiClient.getDonations({ limit: 5 });
      if (donationsRes.success && donationsRes.data) {
        setRecentDonations(donationsRes.data.slice(0, 5));
      }

      // Try to fetch analytics/dashboard data
      try {
        const analyticsRes = await apiClient.getDashboardData();
        if (analyticsRes.success && analyticsRes.data) {
          setStats({
            totalDonations: analyticsRes.data.totalDonations || donationsRes.data?.length || 0,
            mealsProvided: analyticsRes.data.mealsProvided || 0,
            foodSaved: analyticsRes.data.foodSaved || 0,
            co2Saved: analyticsRes.data.co2Saved || 0,
            activeDeliveries: analyticsRes.data.activeDeliveries || 0,
            pendingVerifications: analyticsRes.data.pendingVerifications || 0,
            activeUsers: analyticsRes.data.activeUsers || 0,
          });
        }
      } catch {
        // Use donation data to estimate stats
        const donations = donationsRes.data || [];
        const totalQuantity = donations.reduce((acc: number, d: any) => acc + (d.quantity || 0), 0);
        setStats({
          totalDonations: donations.length,
          mealsProvided: totalQuantity,
          foodSaved: Math.round(totalQuantity * 0.3),
          co2Saved: Math.round(totalQuantity * 0.5),
          activeDeliveries: donations.filter((d: any) => d.status === 'in_transit').length,
          pendingVerifications: donations.filter((d: any) => d.status === 'pending').length,
          activeUsers: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const renderDonorDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          icon={<UtensilsCrossed size={24} />}
          trend={{ value: 12, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Meals Provided"
          value={stats.mealsProvided.toLocaleString()}
          icon={<Heart size={24} />}
          trend={{ value: 8, isPositive: true }}
          color="pink"
        />
        <StatCard
          title="Food Saved (kg)"
          value={stats.foodSaved.toString()}
          icon={<Leaf size={24} />}
          trend={{ value: 15, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="CO2 Saved (kg)"
          value={stats.co2Saved.toString()}
          icon={<TrendingUp size={24} />}
          trend={{ value: 10, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/donate" className="block">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <UtensilsCrossed size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Donate Food</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Report surplus food for redistribution</p>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/my-donations" className="block">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Clock size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Track Donations</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View status of your donations</p>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/impact" className="block">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <TrendingUp size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">View Impact</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See your environmental impact</p>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Donations</h3>
          <Link href="/dashboard/my-donations">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : recentDonations.length === 0 ? (
          <div className="text-center py-8">
            <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No donations yet. Start by donating food!</p>
            <Link href="/dashboard/donate">
              <Button className="mt-4">Donate Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <UtensilsCrossed className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{donation.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{donation.quantity} servings • {formatTimeAgo(donation.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      donation.status === 'delivered' ? 'success' :
                      donation.status === 'in_transit' ? 'info' : 'warning'
                    }
                  >
                    {donation.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {donation.receivedBy?.organizationName || donation.receivedBy?.name || 'Pending Match'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );

  const renderNGODashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Food Received"
          value={recentDonations.filter(d => d.status === 'delivered').length}
          icon={<Heart size={24} />}
          trend={{ value: 20, isPositive: true }}
          color="pink"
        />
        <StatCard
          title="Meals Distributed"
          value={stats.mealsProvided.toLocaleString()}
          icon={<Users size={24} />}
          trend={{ value: 15, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingVerifications}
          icon={<Clock size={24} />}
          color="orange"
        />
        <StatCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={<Truck size={24} />}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/available-food" className="block">
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <UtensilsCrossed size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Browse Available Food</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find and request surplus food nearby</p>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/my-requests" className="block">
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Clock size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">My Requests</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your food requests</p>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Incoming Deliveries */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Deliveries</h3>
          <Badge variant="info">{stats.activeDeliveries} Active</Badge>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : recentDonations.filter(d => d.status === 'in_transit').length === 0 ? (
          <div className="text-center py-8">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No active deliveries at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDonations.filter(d => d.status === 'in_transit').map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Truck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{donation.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{donation.quantity} servings</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="info">In Transit</Badge>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ETA: Soon</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );

  const renderVolunteerDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pickups Completed"
          value={recentDonations.filter(d => d.status === 'delivered').length}
          icon={<Truck size={24} />}
          trend={{ value: 8, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Meals Delivered"
          value={stats.mealsProvided.toLocaleString()}
          icon={<TrendingUp size={24} />}
          color="blue"
        />
        <StatCard
          title="Active Assignments"
          value={stats.activeDeliveries}
          icon={<Clock size={24} />}
          color="orange"
        />
        <StatCard
          title="Rating"
          value="4.9"
          icon={<Heart size={24} />}
          color="pink"
        />
      </div>

      {/* Availability Toggle */}
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Availability</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle to receive pickup assignments</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success" icon={CheckCircle2}>Online</Badge>
            <Button variant="outline" size="sm">Update Schedule</Button>
          </div>
        </div>
      </Card>

      {/* Active Assignments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Assignments</h3>
          <Link href="/dashboard/assignments">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : recentDonations.filter(d => d.status === 'pending' || d.status === 'in_transit').length === 0 ? (
          <div className="text-center py-8">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No active assignments. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDonations.filter(d => d.status === 'pending' || d.status === 'in_transit').map((donation) => (
              <div key={donation._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Truck className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{donation.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{donation.quantity} servings</p>
                    </div>
                  </div>
                  <Badge variant={donation.status === 'in_transit' ? 'info' : 'warning'}>
                    {donation.status === 'in_transit' ? 'In Transit' : 'Pending Pickup'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(donation.createdAt)}</span>
                  <span className="font-medium text-emerald-600">
                    {donation.receivedBy?.organizationName || 'Awaiting Assignment'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    {donation.status === 'pending' ? 'Accept' : 'Complete Delivery'}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          icon={<UtensilsCrossed size={24} />}
          trend={{ value: 12, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers || 'N/A'}
          icon={<Users size={24} />}
          trend={{ value: 5, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={<Clock size={24} />}
          color="orange"
        />
        <StatCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={<Truck size={24} />}
          color="purple"
        />
      </div>

      {/* Alerts */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Alerts</h3>
        <div className="space-y-3">
          {alertsData.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                alert.type === 'warning' 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className={alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'} />
                <span className={alert.type === 'warning' ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'}>
                  {alert.message}
                </span>
              </div>
              <Button variant="ghost" size="sm">{alert.action}</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <Link href="/dashboard/admin/food">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {recentDonations.slice(0, 3).map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <UtensilsCrossed className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{donation.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{donation.quantity} servings • {formatTimeAgo(donation.createdAt)}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    donation.status === 'delivered' ? 'success' :
                    donation.status === 'in_transit' ? 'info' : 'warning'
                  }
                >
                  {donation.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'User Management', href: '/dashboard/admin/users', icon: Users, color: 'emerald' },
          { title: 'Verification Queue', href: '/dashboard/admin/food', icon: CheckCircle2, color: 'blue' },
          { title: 'Logistics', href: '/dashboard/admin/logistics', icon: Truck, color: 'purple' },
          { title: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, color: 'orange' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card hover className="text-center">
              <div className={`w-14 h-14 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mx-auto mb-4`}>
                <item.icon className={`text-${item.color}-600`} size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {userRole === 'donor' && 'Ready to make a difference? Report surplus food to help those in need.'}
          {userRole === 'ngo' && 'Check available food donations and manage your requests.'}
          {userRole === 'volunteer' && 'You have new pickup assignments waiting for you.'}
          {userRole === 'admin' && 'Here\'s an overview of the platform activity.'}
        </p>
      </div>

      {/* Role-specific Dashboard */}
      {userRole === 'donor' && renderDonorDashboard()}
      {userRole === 'ngo' && renderNGODashboard()}
      {userRole === 'volunteer' && renderVolunteerDashboard()}
      {userRole === 'admin' && renderAdminDashboard()}
    </div>
  );
}

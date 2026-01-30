'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Truck,
  Heart,
  Clock,
  Calendar,
  ChevronDown,
  Download,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Activity,
  Leaf,
} from 'lucide-react';
import { Card, Button, Badge, Select } from '@/components/ui';

// Mock analytics data
const overviewStats = {
  totalDonations: { value: 2456, change: 12.5, trend: 'up' as const, unit: '' },
  totalServings: { value: 89234, change: 8.3, trend: 'up' as const, unit: '' },
  activeUsers: { value: 1847, change: 5.2, trend: 'up' as const, unit: '' },
  wasteReduced: { value: 12500, change: 15.7, trend: 'up' as const, unit: 'kg' },
  avgDeliveryTime: { value: 42, change: -8.5, trend: 'down' as const, unit: 'min' },
  successRate: { value: 94.5, change: 2.1, trend: 'up' as const, unit: '%' },
};

const weeklyData = [
  { day: 'Mon', donations: 45, deliveries: 42, servings: 2100 },
  { day: 'Tue', donations: 52, deliveries: 48, servings: 2450 },
  { day: 'Wed', donations: 38, deliveries: 35, servings: 1800 },
  { day: 'Thu', donations: 61, deliveries: 58, servings: 2900 },
  { day: 'Fri', donations: 55, deliveries: 52, servings: 2600 },
  { day: 'Sat', donations: 42, deliveries: 40, servings: 2000 },
  { day: 'Sun', donations: 35, deliveries: 33, servings: 1650 },
];

const topDonors = [
  { name: 'Grand Hotel', donations: 156, servings: 7800, badge: 'platinum' },
  { name: 'Spice Kitchen', donations: 124, servings: 6200, badge: 'gold' },
  { name: 'Metro Supermarket', donations: 98, servings: 4900, badge: 'gold' },
  { name: 'Tech Corp Cafeteria', donations: 87, servings: 4350, badge: 'silver' },
  { name: 'City Bakery', donations: 76, servings: 3800, badge: 'silver' },
];

const topNGOs = [
  { name: 'Hope Foundation', received: 89, beneficiaries: 2000 },
  { name: 'Children\'s Home', received: 72, beneficiaries: 150 },
  { name: 'Food for All', received: 65, beneficiaries: 500 },
  { name: 'Elder Care Center', received: 54, beneficiaries: 100 },
  { name: 'Community Kitchen', received: 48, beneficiaries: 300 },
];

const topVolunteers = [
  { name: 'Rahul Kumar', deliveries: 145, distance: 580, rating: 4.9 },
  { name: 'Priya Sharma', deliveries: 128, distance: 512, rating: 4.8 },
  { name: 'Amit Singh', deliveries: 112, distance: 448, rating: 4.9 },
  { name: 'Sneha Reddy', deliveries: 98, distance: 392, rating: 4.7 },
  { name: 'Vikram Patel', deliveries: 87, distance: 348, rating: 4.8 },
];

const foodTypeDistribution = [
  { type: 'Cooked Food', percentage: 45, color: 'bg-emerald-500' },
  { type: 'Bakery Items', percentage: 20, color: 'bg-amber-500' },
  { type: 'Fruits & Vegetables', percentage: 18, color: 'bg-green-500' },
  { type: 'Packaged Food', percentage: 12, color: 'bg-blue-500' },
  { type: 'Other', percentage: 5, color: 'bg-gray-400' },
];

const recentActivity = [
  { type: 'donation', message: 'Grand Hotel donated 50 servings', time: '5 min ago' },
  { type: 'delivery', message: 'Rahul completed delivery to Hope Foundation', time: '12 min ago' },
  { type: 'user', message: 'New NGO "Care Home" registered', time: '25 min ago' },
  { type: 'donation', message: 'City Bakery donated 30 bread loaves', time: '45 min ago' },
  { type: 'delivery', message: 'Priya completed delivery to Children\'s Home', time: '1 hour ago' },
];

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

const badgeColors: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-100',
  silver: 'text-gray-600 bg-gray-200',
  gold: 'text-yellow-700 bg-yellow-100',
  platinum: 'text-cyan-700 bg-cyan-100',
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const maxDonations = Math.max(...weeklyData.map((d) => d.donations));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform performance and impact metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-40"
          />
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button variant="outline" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Donations', ...overviewStats.totalDonations, icon: Package, color: 'text-blue-600' },
          { label: 'Servings Distributed', ...overviewStats.totalServings, icon: Heart, color: 'text-pink-600' },
          { label: 'Active Users', ...overviewStats.activeUsers, icon: Users, color: 'text-purple-600' },
          { label: 'Waste Reduced', ...overviewStats.wasteReduced, icon: Leaf, color: 'text-emerald-600' },
          { label: 'Avg Delivery Time', ...overviewStats.avgDeliveryTime, icon: Clock, color: 'text-amber-600' },
          { label: 'Success Rate', ...overviewStats.successRate, icon: Activity, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color} size={20} />
              <div className={`flex items-center text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="ml-1">{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stat.value.toLocaleString()}{stat.unit || ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Weekly Donations</h3>
              <p className="text-sm text-gray-500">Daily donation trend</p>
            </div>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="h-48 flex items-end gap-3">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all"
                    style={{ height: `${(day.donations / maxDonations) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">
                {weeklyData.reduce((sum, d) => sum + d.donations, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Donations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {weeklyData.reduce((sum, d) => sum + d.deliveries, 0)}
              </p>
              <p className="text-xs text-gray-500">Deliveries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-pink-600">
                {weeklyData.reduce((sum, d) => sum + d.servings, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Servings</p>
            </div>
          </div>
        </Card>

        {/* Food Type Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Food Type Distribution</h3>
              <p className="text-sm text-gray-500">Breakdown by food category</p>
            </div>
            <PieChart className="text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-8">
            {/* Simple Pie Representation */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {foodTypeDistribution.reduce((acc, item, i) => {
                  const offset = acc.offset;
                  acc.elements.push(
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={item.color.replace('bg-', 'rgb(var(--')}
                      strokeWidth="20"
                      strokeDasharray={`${item.percentage * 2.51} 251`}
                      strokeDashoffset={-offset}
                      className={item.color.replace('bg-', 'stroke-').replace('-500', '-500')}
                      style={{ stroke: `var(--${item.color.replace('bg-', '')})` }}
                    />
                  );
                  acc.offset += item.percentage * 2.51;
                  return acc;
                }, { elements: [] as React.JSX.Element[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-3">
              {foodTypeDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Top Donors */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Donors</h3>
            <Button variant="ghost" size="sm">View All <ArrowUpRight size={14} /></Button>
          </div>
          <div className="space-y-3">
            {topDonors.map((donor, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-200 text-gray-600' :
                    i === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{donor.name}</p>
                    <p className="text-xs text-gray-500">{donor.donations} donations</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[donor.badge]}`}>
                  {donor.badge}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top NGOs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top NGOs</h3>
            <Button variant="ghost" size="sm">View All <ArrowUpRight size={14} /></Button>
          </div>
          <div className="space-y-3">
            {topNGOs.map((ngo, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-purple-100 text-purple-700' :
                    i === 1 ? 'bg-purple-50 text-purple-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{ngo.name}</p>
                    <p className="text-xs text-gray-500">{ngo.received} received</p>
                  </div>
                </div>
                <span className="text-sm text-purple-600 font-medium">
                  {ngo.beneficiaries.toLocaleString()} served
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Volunteers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Volunteers</h3>
            <Button variant="ghost" size="sm">View All <ArrowUpRight size={14} /></Button>
          </div>
          <div className="space-y-3">
            {topVolunteers.map((volunteer, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{volunteer.name}</p>
                    <p className="text-xs text-gray-500">{volunteer.deliveries} deliveries</p>
                  </div>
                </div>
                <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                  ⭐ {volunteer.rating}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <Button variant="ghost" size="sm">View All <ArrowUpRight size={14} /></Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'donation' ? 'bg-emerald-100' :
                activity.type === 'delivery' ? 'bg-blue-100' :
                'bg-purple-100'
              }`}>
                {activity.type === 'donation' && <Package className="text-emerald-600" size={16} />}
                {activity.type === 'delivery' && <Truck className="text-blue-600" size={16} />}
                {activity.type === 'user' && <Users className="text-purple-600" size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

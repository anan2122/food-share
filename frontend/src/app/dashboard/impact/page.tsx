'use client';

import { useState } from 'react';
import {
  Leaf,
  Droplets,
  Factory,
  Heart,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Share2,
  Target,
  Zap,
  TreeDeciduous,
  Car,
  Utensils,
} from 'lucide-react';
import { Card, Button, Badge, Select } from '@/components/ui';

// Mock impact data
const impactStats = {
  foodSaved: { value: 12500, unit: 'kg', change: 15.7 },
  mealsProvided: { value: 89234, change: 12.3 },
  co2Prevented: { value: 31250, unit: 'kg', change: 14.2 },
  waterSaved: { value: 6250000, unit: 'L', change: 11.8 },
  beneficiaries: { value: 15420, change: 8.5 },
  donors: { value: 287, change: 22.1 },
  volunteers: { value: 156, change: 18.4 },
  deliveries: { value: 4521, change: 16.9 },
};

const monthlyProgress = [
  { month: 'Jan', meals: 8500, target: 10000 },
  { month: 'Feb', meals: 9200, target: 10000 },
  { month: 'Mar', meals: 11500, target: 10000 },
  { month: 'Apr', meals: 10800, target: 10000 },
  { month: 'May', meals: 12300, target: 12000 },
  { month: 'Jun', meals: 14500, target: 12000 },
];

const equivalencies = [
  { 
    icon: Car, 
    value: '78,125', 
    label: 'km not driven', 
    description: 'Equivalent to driving around Earth twice!' 
  },
  { 
    icon: TreeDeciduous, 
    value: '521', 
    label: 'trees planted equivalent', 
    description: 'CO₂ absorption over 10 years' 
  },
  { 
    icon: Factory, 
    value: '2,604', 
    label: 'hours of factory emissions saved', 
    description: 'Industrial emissions prevented' 
  },
  { 
    icon: Droplets, 
    value: '6.25M', 
    label: 'liters of water conserved', 
    description: 'Enough to fill 2.5 Olympic pools' 
  },
];

const sdgContributions = [
  { goal: 'SDG 2: Zero Hunger', progress: 78, color: 'bg-amber-500' },
  { goal: 'SDG 12: Responsible Consumption', progress: 85, color: 'bg-emerald-500' },
  { goal: 'SDG 13: Climate Action', progress: 62, color: 'bg-blue-500' },
  { goal: 'SDG 11: Sustainable Cities', progress: 54, color: 'bg-purple-500' },
];

const topContributors = [
  { name: 'Grand Hotel', impact: 1250, badge: 'platinum', type: 'donor' },
  { name: 'Hope Foundation', impact: 8900, badge: 'gold', type: 'ngo', metric: 'beneficiaries' },
  { name: 'Rahul Kumar', impact: 145, badge: 'silver', type: 'volunteer', metric: 'deliveries' },
  { name: 'Metro Supermarket', impact: 980, badge: 'gold', type: 'donor' },
  { name: 'Priya Sharma', impact: 128, badge: 'bronze', type: 'volunteer', metric: 'deliveries' },
];

const periodOptions = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const badgeConfig: Record<string, { color: string; icon: string }> = {
  bronze: { color: 'text-amber-700 bg-amber-100', icon: '🥉' },
  silver: { color: 'text-gray-600 bg-gray-200', icon: '🥈' },
  gold: { color: 'text-yellow-700 bg-yellow-100', icon: '🥇' },
  platinum: { color: 'text-cyan-700 bg-cyan-100', icon: '💎' },
};

export default function ImpactPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('year');

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">Measuring our collective contribution to reducing food waste</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" leftIcon={<Share2 size={16} />}>
            Share Impact
          </Button>
          <Button variant="outline" leftIcon={<Download size={16} />}>
            Download Report
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Food Saved */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Leaf size={28} />
            <Badge className="bg-white/20 text-white border-0">+{impactStats.foodSaved.change}%</Badge>
          </div>
          <p className="text-4xl font-bold mb-1">
            {impactStats.foodSaved.value.toLocaleString()}
            <span className="text-lg font-normal"> {impactStats.foodSaved.unit}</span>
          </p>
          <p className="text-emerald-100">Food Saved from Waste</p>
        </div>

        {/* Meals Provided */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Utensils size={28} />
            <Badge className="bg-white/20 text-white border-0">+{impactStats.mealsProvided.change}%</Badge>
          </div>
          <p className="text-4xl font-bold mb-1">
            {impactStats.mealsProvided.value.toLocaleString()}
          </p>
          <p className="text-pink-100">Meals Provided</p>
        </div>

        {/* CO2 Prevented */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Factory size={28} />
            <Badge className="bg-white/20 text-white border-0">+{impactStats.co2Prevented.change}%</Badge>
          </div>
          <p className="text-4xl font-bold mb-1">
            {impactStats.co2Prevented.value.toLocaleString()}
            <span className="text-lg font-normal"> {impactStats.co2Prevented.unit}</span>
          </p>
          <p className="text-blue-100">CO₂ Emissions Prevented</p>
        </div>

        {/* Water Saved */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Droplets size={28} />
            <Badge className="bg-white/20 text-white border-0">+{impactStats.waterSaved.change}%</Badge>
          </div>
          <p className="text-4xl font-bold mb-1">
            {(impactStats.waterSaved.value / 1000000).toFixed(2)}M
            <span className="text-lg font-normal"> L</span>
          </p>
          <p className="text-cyan-100">Water Conserved</p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Beneficiaries Served', value: impactStats.beneficiaries.value, icon: Heart, color: 'text-pink-600', change: impactStats.beneficiaries.change },
          { label: 'Active Donors', value: impactStats.donors.value, icon: Users, color: 'text-blue-600', change: impactStats.donors.change },
          { label: 'Volunteers', value: impactStats.volunteers.value, icon: Users, color: 'text-amber-600', change: impactStats.volunteers.change },
          { label: 'Successful Deliveries', value: impactStats.deliveries.value, icon: Zap, color: 'text-purple-600', change: impactStats.deliveries.change },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color} size={20} />
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Environmental Equivalencies */}
      <Card className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-6">Environmental Impact Equivalencies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equivalencies.map((eq, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <eq.icon className="text-emerald-600" size={28} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{eq.value}</p>
              <p className="text-sm font-medium text-gray-700">{eq.label}</p>
              <p className="text-xs text-gray-500 mt-1">{eq.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Progress */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Progress</h3>
              <p className="text-sm text-gray-500">Meals provided vs target</p>
            </div>
            <Target className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {monthlyProgress.map((month, i) => {
              const percentage = Math.min((month.meals / month.target) * 100, 100);
              const exceeded = month.meals > month.target;

              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{month.month}</span>
                    <span className={`font-medium ${exceeded ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {month.meals.toLocaleString()} / {month.target.toLocaleString()}
                      {exceeded && ' 🎉'}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        exceeded ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* SDG Contributions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">UN SDG Contributions</h3>
              <p className="text-sm text-gray-500">Our impact on global goals</p>
            </div>
            <Award className="text-gray-400" size={20} />
          </div>
          <div className="space-y-5">
            {sdgContributions.map((sdg, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{sdg.goal}</span>
                  <span className="text-gray-600">{sdg.progress}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${sdg.color}`}
                    style={{ width: `${sdg.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Did you know?</strong> Every meal we redistribute contributes to multiple 
              Sustainable Development Goals, creating a ripple effect of positive impact.
            </p>
          </div>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Top Impact Contributors</h3>
            <p className="text-sm text-gray-500">Recognizing our community heroes</p>
          </div>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topContributors.map((contributor, i) => {
            const badge = badgeConfig[contributor.badge];
            return (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-xl relative overflow-hidden">
                {i === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                )}
                <span className="text-2xl mb-2 block">{badge.icon}</span>
                <p className="font-semibold text-gray-900 mb-1">{contributor.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                  {contributor.badge}
                </span>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {contributor.impact.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {contributor.type === 'donor' && 'kg food donated'}
                  {contributor.type === 'ngo' && 'beneficiaries served'}
                  {contributor.type === 'volunteer' && 'deliveries completed'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Together, We're Making a Difference! 🌍</h2>
        <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
          Every contribution counts. Whether you're a donor, volunteer, or NGO partner, 
          you're part of a movement to end hunger and reduce waste.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="bg-white text-emerald-600 hover:bg-gray-100">
            Share Your Impact
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Invite Others to Join
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Eye,
  Ban,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '@/components/ui';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Grand Hotel',
    email: 'manager@grandhotel.com',
    phone: '+91 98765 43210',
    role: 'donor',
    organizationType: 'hotel',
    status: 'verified',
    joinedAt: '2023-06-15',
    lastActive: '2024-01-15T10:30:00',
    address: '123 MG Road, Bangalore',
    totalDonations: 156,
    trustBadge: 'gold',
  },
  {
    id: '2',
    name: 'Hope Foundation',
    email: 'contact@hopefoundation.org',
    phone: '+91 87654 32109',
    role: 'ngo',
    organizationType: 'ngo',
    status: 'verified',
    joinedAt: '2023-03-20',
    lastActive: '2024-01-15T09:00:00',
    address: '456 Church Street, Bangalore',
    totalReceived: 89,
    trustBadge: 'silver',
    ngoRegistrationNumber: 'NGO/BLR/2020/1234',
  },
  {
    id: '3',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    phone: '+91 76543 21098',
    role: 'volunteer',
    status: 'active',
    joinedAt: '2023-09-10',
    lastActive: '2024-01-15T11:00:00',
    address: 'Koramangala, Bangalore',
    totalDeliveries: 45,
    trustBadge: 'bronze',
    vehicleType: 'two_wheeler',
  },
  {
    id: '4',
    name: 'City Bakery',
    email: 'orders@citybakery.com',
    phone: '+91 65432 10987',
    role: 'donor',
    organizationType: 'restaurant',
    status: 'pending_verification',
    joinedAt: '2024-01-10',
    lastActive: '2024-01-14T15:00:00',
    address: '45 Park Street, Bangalore',
    totalDonations: 0,
  },
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 54321 09876',
    role: 'volunteer',
    status: 'suspended',
    joinedAt: '2023-07-05',
    lastActive: '2023-12-20T08:00:00',
    address: 'Indiranagar, Bangalore',
    totalDeliveries: 23,
    suspendedReason: 'Multiple no-shows for assigned pickups',
  },
  {
    id: '6',
    name: 'Children\'s Home',
    email: 'info@childrenshome.org',
    phone: '+91 43210 98765',
    role: 'ngo',
    organizationType: 'orphanage',
    status: 'pending_verification',
    joinedAt: '2024-01-12',
    lastActive: '2024-01-15T08:30:00',
    address: '789 Residency Road, Bangalore',
    ngoRegistrationNumber: 'NGO/BLR/2019/5678',
  },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'donor', label: 'Donors' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'admin', label: 'Admins' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'suspended', label: 'Suspended' },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  active: { label: 'Active', variant: 'success' },
  verified: { label: 'Verified', variant: 'success' },
  pending_verification: { label: 'Pending', variant: 'warning' },
  suspended: { label: 'Suspended', variant: 'danger' },
};

const roleConfig: Record<string, { label: string; color: string }> = {
  donor: { label: 'Donor', color: 'text-blue-600 bg-blue-100' },
  ngo: { label: 'NGO', color: 'text-purple-600 bg-purple-100' },
  volunteer: { label: 'Volunteer', color: 'text-amber-600 bg-amber-100' },
  admin: { label: 'Admin', color: 'text-red-600 bg-red-100' },
};

const trustBadgeConfig: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700 bg-amber-100' },
  silver: { label: 'Silver', color: 'text-gray-600 bg-gray-200' },
  gold: { label: 'Gold', color: 'text-yellow-700 bg-yellow-100' },
  platinum: { label: 'Platinum', color: 'text-cyan-700 bg-cyan-100' },
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage platform users, verify accounts, and monitor activity</p>
        </div>
        <Button leftIcon={<Users size={18} />}>
          Add New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Users', value: mockUsers.length, icon: Users, color: 'text-blue-600' },
          { label: 'Donors', value: mockUsers.filter(u => u.role === 'donor').length, color: 'text-emerald-600' },
          { label: 'NGOs', value: mockUsers.filter(u => u.role === 'ngo').length, color: 'text-purple-600' },
          { label: 'Volunteers', value: mockUsers.filter(u => u.role === 'volunteer').length, color: 'text-amber-600' },
          { label: 'Pending Verification', value: mockUsers.filter(u => u.status === 'pending_verification').length, icon: Clock, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Trust Badge</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Joined</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Last Active</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const status = statusConfig[user.status] || statusConfig.active;
                  const role = roleConfig[user.role] || roleConfig.donor;
                  const trustBadge = user.trustBadge ? trustBadgeConfig[user.trustBadge] : null;

                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {trustBadge ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${trustBadge.color}`}>
                            <Award size={12} />
                            {trustBadge.label}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical size={18} className="text-gray-600" />
                          </button>

                          {showActionMenu === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye size={16} /> View Details
                              </button>
                              {user.status === 'pending_verification' && (
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                  <CheckCircle2 size={16} /> Verify Account
                                </button>
                              )}
                              {user.status !== 'suspended' ? (
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Ban size={16} /> Suspend User
                                </button>
                              ) : (
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                  <CheckCircle2 size={16} /> Reactivate User
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig[selectedUser.role]?.color}`}>
                    {roleConfig[selectedUser.role]?.label}
                  </span>
                  <Badge variant={statusConfig[selectedUser.status]?.variant || 'info'}>
                    {statusConfig[selectedUser.status]?.label}
                  </Badge>
                </div>
              </div>
              {selectedUser.trustBadge && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${trustBadgeConfig[selectedUser.trustBadge]?.color}`}>
                  <Award size={16} />
                  {trustBadgeConfig[selectedUser.trustBadge]?.label}
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">{selectedUser.address}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">
                  {selectedUser.totalDonations || selectedUser.totalReceived || selectedUser.totalDeliveries || 0}
                </p>
                <p className="text-xs text-emerald-700">
                  {selectedUser.role === 'donor' && 'Total Donations'}
                  {selectedUser.role === 'ngo' && 'Food Received'}
                  {selectedUser.role === 'volunteer' && 'Deliveries Made'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">
                  {new Date(selectedUser.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-blue-700">Member Since</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">
                  {new Date(selectedUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-purple-700">Last Active</p>
              </div>
            </div>

            {/* NGO Specific */}
            {selectedUser.role === 'ngo' && selectedUser.ngoRegistrationNumber && (
              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="font-medium text-purple-900 mb-2">NGO Registration</h4>
                <p className="text-purple-700 font-mono">{selectedUser.ngoRegistrationNumber}</p>
              </div>
            )}

            {/* Volunteer Specific */}
            {selectedUser.role === 'volunteer' && selectedUser.vehicleType && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <h4 className="font-medium text-amber-900 mb-2">Vehicle Information</h4>
                <p className="text-amber-700 capitalize">{selectedUser.vehicleType.replace('_', ' ')}</p>
              </div>
            )}

            {/* Suspension Reason */}
            {selectedUser.status === 'suspended' && selectedUser.suspendedReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-medium text-red-900 mb-1">Suspension Reason</h4>
                <p className="text-sm text-red-700">{selectedUser.suspendedReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              {selectedUser.status === 'pending_verification' && (
                <Button className="flex-1" leftIcon={<CheckCircle2 size={16} />}>
                  Verify Account
                </Button>
              )}
              {selectedUser.status === 'suspended' && (
                <Button className="flex-1" leftIcon={<CheckCircle2 size={16} />}>
                  Reactivate Account
                </Button>
              )}
              {selectedUser.status !== 'suspended' && (
                <Button variant="danger" className="flex-1" leftIcon={<Ban size={16} />}>
                  Suspend Account
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

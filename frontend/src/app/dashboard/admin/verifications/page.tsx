'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Building,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal, Textarea } from '@/components/ui';

// Mock verification requests
const verificationRequests = [
  {
    id: '1',
    type: 'ngo',
    name: 'Children\'s Home',
    email: 'info@childrenshome.org',
    phone: '+91 43210 98765',
    address: '789 Residency Road, Bangalore',
    submittedAt: '2024-01-12T10:00:00',
    status: 'pending',
    documents: [
      { name: 'NGO Registration Certificate', url: '#', verified: null },
      { name: 'PAN Card', url: '#', verified: null },
      { name: 'Address Proof', url: '#', verified: null },
    ],
    organizationType: 'orphanage',
    registrationNumber: 'NGO/BLR/2019/5678',
    establishedYear: 2019,
    beneficiariesCount: 50,
    operatingAreas: ['Bangalore', 'Mysore'],
    notes: '',
  },
  {
    id: '2',
    type: 'donor',
    name: 'City Bakery',
    email: 'orders@citybakery.com',
    phone: '+91 65432 10987',
    address: '45 Park Street, Bangalore',
    submittedAt: '2024-01-10T14:00:00',
    status: 'pending',
    documents: [
      { name: 'FSSAI License', url: '#', verified: null },
      { name: 'Business Registration', url: '#', verified: null },
      { name: 'Health & Safety Certificate', url: '#', verified: null },
    ],
    organizationType: 'restaurant',
    fssaiNumber: 'FSSAI/2023/12345678',
    establishedYear: 2018,
    averageMonthlyDonation: '100-200 servings',
    notes: '',
  },
  {
    id: '3',
    type: 'volunteer',
    name: 'Amit Singh',
    email: 'amit.singh@gmail.com',
    phone: '+91 98765 55555',
    address: 'BTM Layout, Bangalore',
    submittedAt: '2024-01-13T09:00:00',
    status: 'under_review',
    documents: [
      { name: 'ID Proof (Aadhaar)', url: '#', verified: true },
      { name: 'Driving License', url: '#', verified: true },
      { name: 'Vehicle RC', url: '#', verified: null },
    ],
    vehicleType: 'car',
    vehicleNumber: 'KA-03-MN-9876',
    availableHours: 20,
    preferredAreas: ['BTM Layout', 'Koramangala', 'HSR Layout'],
    notes: 'Background verification in progress',
    assignedTo: 'Admin User',
  },
  {
    id: '4',
    type: 'ngo',
    name: 'Food for All',
    email: 'connect@foodforall.org',
    phone: '+91 87654 66666',
    address: '100 Gandhi Road, Bangalore',
    submittedAt: '2024-01-08T11:00:00',
    status: 'approved',
    documents: [
      { name: 'NGO Registration Certificate', url: '#', verified: true },
      { name: 'PAN Card', url: '#', verified: true },
      { name: 'Address Proof', url: '#', verified: true },
    ],
    organizationType: 'community_kitchen',
    registrationNumber: 'NGO/BLR/2015/1234',
    establishedYear: 2015,
    beneficiariesCount: 500,
    operatingAreas: ['Bangalore'],
    approvedAt: '2024-01-10T16:00:00',
    approvedBy: 'Admin User',
    notes: 'All documents verified. Organization has good track record.',
  },
  {
    id: '5',
    type: 'donor',
    name: 'Quick Bites',
    email: 'manager@quickbites.com',
    phone: '+91 76543 77777',
    address: '222 Brigade Road, Bangalore',
    submittedAt: '2024-01-05T15:00:00',
    status: 'rejected',
    documents: [
      { name: 'FSSAI License', url: '#', verified: false },
      { name: 'Business Registration', url: '#', verified: true },
    ],
    organizationType: 'restaurant',
    fssaiNumber: 'EXPIRED',
    rejectedAt: '2024-01-07T10:00:00',
    rejectedBy: 'Admin User',
    rejectionReason: 'FSSAI license has expired. Please renew and resubmit.',
  },
];

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  pending: { label: 'Pending Review', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  donor: { label: 'Donor', color: 'text-blue-600 bg-blue-100' },
  ngo: { label: 'NGO', color: 'text-purple-600 bg-purple-100' },
  volunteer: { label: 'Volunteer', color: 'text-amber-600 bg-amber-100' },
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'donor', label: 'Donors' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'volunteer', label: 'Volunteers' },
];

export default function VerificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<typeof verificationRequests[0] | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState<{ type: 'approve' | 'reject'; request: typeof verificationRequests[0] } | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredRequests = verificationRequests.filter((request) => {
    const matchesSearch = 
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesType = !typeFilter || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = verificationRequests.filter(r => r.status === 'pending').length;
  const underReviewCount = verificationRequests.filter(r => r.status === 'under_review').length;

  const handleDecision = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowDecisionModal(null);
    setDecisionNotes('');
    setSelectedRequest(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
        <p className="text-gray-600 mt-1">Review and process account verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Under Review', value: underReviewCount, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Approved (Today)', value: verificationRequests.filter(r => r.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected (Today)', value: verificationRequests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl p-4 flex items-center gap-3 ${stat.bg}`}>
            <stat.icon className={stat.color} size={24} />
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Alert */}
      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-amber-800">
              {pendingCount} verification request{pendingCount > 1 ? 's' : ''} pending review
            </p>
            <p className="text-sm text-amber-700">
              Please review pending requests to ensure timely onboarding of new users.
            </p>
          </div>
        </div>
      )}

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
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-40"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-12">
            <Shield className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No verification requests found</p>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const status = statusConfig[request.status] || statusConfig.pending;
            const type = typeConfig[request.type] || typeConfig.donor;
            const verifiedDocs = request.documents.filter(d => d.verified === true).length;
            const totalDocs = request.documents.length;

            return (
              <Card key={request.id} hover onClick={() => setSelectedRequest(request)}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                        {type.label}
                      </span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {request.status === 'pending' && (
                        <span className="text-xs text-gray-500">
                          Submitted {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-500">{request.email} • {request.phone}</p>

                    {/* Document Progress */}
                    <div className="flex items-center gap-3 mt-3">
                      <FileText size={14} className="text-gray-400" />
                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Documents Verified</span>
                          <span>{verifiedDocs}/{totalDocs}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${(verifiedDocs / totalDocs) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3">
                    {['pending', 'under_review'].includes(request.status) && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          leftIcon={<ThumbsDown size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDecisionModal({ type: 'reject', request });
                          }}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          leftIcon={<ThumbsUp size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDecisionModal({ type: 'approve', request });
                          }}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRequest && !showDecisionModal}
        onClose={() => setSelectedRequest(null)}
        title="Verification Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedRequest.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[selectedRequest.type]?.color}`}>
                    {typeConfig[selectedRequest.type]?.label}
                  </span>
                  <Badge variant={statusConfig[selectedRequest.status]?.variant || 'info'}>
                    {statusConfig[selectedRequest.status]?.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Submitted</p>
                <p className="font-medium">
                  {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="text-sm"><strong>Email:</strong> {selectedRequest.email}</p>
              <p className="text-sm"><strong>Phone:</strong> {selectedRequest.phone}</p>
              <p className="text-sm"><strong>Address:</strong> {selectedRequest.address}</p>
            </div>

            {/* Organization Details */}
            <div className="p-4 bg-blue-50 rounded-xl space-y-2">
              <h4 className="font-medium text-blue-900">Organization Details</h4>
              {selectedRequest.type === 'ngo' && (
                <>
                  <p className="text-sm"><strong>Type:</strong> {selectedRequest.organizationType}</p>
                  <p className="text-sm"><strong>Registration No:</strong> {selectedRequest.registrationNumber}</p>
                  <p className="text-sm"><strong>Established:</strong> {selectedRequest.establishedYear}</p>
                  <p className="text-sm"><strong>Beneficiaries:</strong> {selectedRequest.beneficiariesCount}</p>
                </>
              )}
              {selectedRequest.type === 'donor' && (
                <>
                  <p className="text-sm"><strong>Type:</strong> {selectedRequest.organizationType}</p>
                  <p className="text-sm"><strong>FSSAI Number:</strong> {selectedRequest.fssaiNumber}</p>
                  <p className="text-sm"><strong>Established:</strong> {selectedRequest.establishedYear}</p>
                  <p className="text-sm"><strong>Expected Donation:</strong> {selectedRequest.averageMonthlyDonation}</p>
                </>
              )}
              {selectedRequest.type === 'volunteer' && (
                <>
                  <p className="text-sm"><strong>Vehicle:</strong> {selectedRequest.vehicleType}</p>
                  <p className="text-sm"><strong>Vehicle Number:</strong> {selectedRequest.vehicleNumber}</p>
                  <p className="text-sm"><strong>Available Hours/Week:</strong> {selectedRequest.availableHours}</p>
                  <p className="text-sm"><strong>Preferred Areas:</strong> {selectedRequest.preferredAreas?.join(', ')}</p>
                </>
              )}
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Submitted Documents</h4>
              <div className="space-y-2">
                {selectedRequest.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                        View
                      </Button>
                      {doc.verified === true && (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      )}
                      {doc.verified === false && (
                        <XCircle size={18} className="text-red-600" />
                      )}
                      {doc.verified === null && (
                        <Clock size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Reason */}
            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-medium text-red-900 mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                <p className="text-xs text-red-600 mt-2">
                  Rejected by {selectedRequest.rejectedBy} on{' '}
                  {new Date(selectedRequest.rejectedAt!).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Approval Info */}
            {selectedRequest.status === 'approved' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-medium text-emerald-900 mb-1">Approval Notes</h4>
                <p className="text-sm text-emerald-700">{selectedRequest.notes}</p>
                <p className="text-xs text-emerald-600 mt-2">
                  Approved by {selectedRequest.approvedBy} on{' '}
                  {new Date(selectedRequest.approvedAt!).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {['pending', 'under_review'].includes(selectedRequest.status) && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    leftIcon={<ThumbsDown size={16} />}
                    onClick={() => setShowDecisionModal({ type: 'reject', request: selectedRequest })}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="flex-1"
                    leftIcon={<ThumbsUp size={16} />}
                    onClick={() => setShowDecisionModal({ type: 'approve', request: selectedRequest })}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Decision Modal */}
      <Modal
        isOpen={!!showDecisionModal}
        onClose={() => {
          setShowDecisionModal(null);
          setDecisionNotes('');
        }}
        title={showDecisionModal?.type === 'approve' ? 'Approve Verification' : 'Reject Verification'}
      >
        {showDecisionModal && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                showDecisionModal.type === 'approve' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {showDecisionModal.type === 'approve' ? (
                  <CheckCircle2 className="text-emerald-600" size={32} />
                ) : (
                  <XCircle className="text-red-600" size={32} />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {showDecisionModal.type === 'approve' ? 'Approve' : 'Reject'} {showDecisionModal.request.name}?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {showDecisionModal.type === 'approve' 
                  ? 'This will grant the user full access to the platform.'
                  : 'The user will be notified and can resubmit after addressing issues.'}
              </p>
            </div>

            <Textarea
              label={showDecisionModal.type === 'approve' ? 'Notes (optional)' : 'Rejection Reason (required)'}
              placeholder={showDecisionModal.type === 'approve' 
                ? 'Add any notes about this verification...'
                : 'Explain why the verification was rejected...'}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              rows={4}
            />

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowDecisionModal(null);
                  setDecisionNotes('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant={showDecisionModal.type === 'approve' ? 'primary' : 'danger'}
                className="flex-1"
                onClick={handleDecision}
                isLoading={isProcessing}
                disabled={showDecisionModal.type === 'reject' && !decisionNotes.trim()}
              >
                {showDecisionModal.type === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

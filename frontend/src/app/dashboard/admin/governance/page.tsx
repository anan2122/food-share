'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  MoreVertical
} from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  user: {
    _id: string;
    name: string;
    role: string;
  };
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

interface ComplianceMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export default function GovernancePage() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  // Compliance metrics
  const complianceMetrics: ComplianceMetric[] = [
    { name: 'Data Privacy Compliance', value: 98, status: 'good', description: 'GDPR & local data protection compliance' },
    { name: 'Food Safety Standards', value: 95, status: 'good', description: 'FSSAI guidelines adherence' },
    { name: 'Verification Rate', value: 87, status: 'warning', description: 'User verification completion rate' },
    { name: 'Response Time SLA', value: 92, status: 'good', description: 'Average response time to donations' },
    { name: 'Audit Trail Coverage', value: 100, status: 'good', description: 'Actions logged with full audit trail' },
    { name: 'Incident Resolution', value: 78, status: 'warning', description: 'Issues resolved within 24 hours' },
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAnalyticsReports('audit');
      if (response.success) {
        setAuditLogs(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      'create': { variant: 'success', label: 'Create' },
      'update': { variant: 'info', label: 'Update' },
      'delete': { variant: 'danger', label: 'Delete' },
      'login': { variant: 'success', label: 'Login' },
      'logout': { variant: 'warning', label: 'Logout' },
      'verify': { variant: 'success', label: 'Verify' },
      'claim': { variant: 'info', label: 'Claim' },
    };
    return actionMap[action] || { variant: 'info', label: action };
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Details'],
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.user?.name || 'System',
        log.action,
        log.entity,
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance & Compliance</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor compliance, audit logs, and platform governance
          </p>
        </div>
        <Button onClick={exportLogs}>
          <Download size={16} className="mr-2" />
          Export Audit Logs
        </Button>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complianceMetrics.map((metric) => (
          <Card key={metric.name}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={20} className={
                  metric.status === 'good' ? 'text-emerald-600' :
                  metric.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                } />
                <span className="font-medium text-gray-900 dark:text-white">{metric.name}</span>
              </div>
              <Badge variant={
                metric.status === 'good' ? 'success' :
                metric.status === 'warning' ? 'warning' : 'danger'
              }>
                {metric.value}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${
                  metric.status === 'good' ? 'bg-emerald-500' :
                  metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.description}</p>
          </Card>
        ))}
      </div>

      {/* Policies Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Food Safety Guidelines', status: 'active', lastUpdated: '2025-01-15' },
            { name: 'User Verification Policy', status: 'active', lastUpdated: '2025-01-10' },
            { name: 'Data Retention Policy', status: 'active', lastUpdated: '2024-12-01' },
            { name: 'Volunteer Code of Conduct', status: 'active', lastUpdated: '2025-01-05' },
            { name: 'NGO Partnership Agreement', status: 'active', lastUpdated: '2024-11-20' },
            { name: 'Donation Quality Standards', status: 'review', lastUpdated: '2025-01-28' },
          ].map((policy) => (
            <div 
              key={policy.name}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{policy.name}</p>
                  <p className="text-sm text-gray-500">Updated: {policy.lastUpdated}</p>
                </div>
              </div>
              <Badge variant={policy.status === 'active' ? 'success' : 'warning'}>
                {policy.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Logs */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              options={[
                { value: 'all', label: 'All Actions' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
                { value: 'login', label: 'Login' },
                { value: 'verify', label: 'Verify' },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Entity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 20).map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.user?.name || 'System'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{log.user?.role}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{log.entity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-emerald-600 hover:text-emerald-700">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

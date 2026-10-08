import { useQuery } from '@tanstack/react-query';
import { 
  getModelStatusDashboardModelsStatusGet,
  getUsersClinicsDashboardUsersClinicsGet,
  getRecentActivityDashboardAuditActivityGet
} from '../client';
import { AppShell } from '../components/AppShell';

export function AdminDashboard() {
  const { data: modelsData, isLoading: loadingModels } = useQuery({
    queryKey: ['modelsStatus'],
    queryFn: () => getModelStatusDashboardModelsStatusGet()
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['usersClinics'],
    queryFn: () => getUsersClinicsDashboardUsersClinicsGet()
  });

  const { data: auditData, isLoading: loadingAudit } = useQuery({
    queryKey: ['auditActivity'],
    queryFn: () => getRecentActivityDashboardAuditActivityGet()
  });

  const models = modelsData?.data || [];
  const users = usersData?.data || [];
  const auditLogs = auditData?.data || [];

  return (
    <AppShell userRole="admin" userName="Dr. Rajesh Kulkarni">
      <div className="w-full transition-all duration-300 flex flex-col gap-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs">
              <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-medium">ABDM NODE: KASHTI-PHC-04</span>
              <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">•</span>
              <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">CDSCO CLASS-B CDSS</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Model & User Management</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Clinical AI Governance, Edge Inference Nodes & User Access Control • Kashti PHC Cluster #04
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Registered Clinical Inference Models</h2>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm font-body-sm">
                  {loadingModels ? (
                    <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                  ) : models.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center">No models found</td></tr>
                  ) : models.map((model, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">{model.name}</td>
                      <td className="py-3.5 px-4">{model.version}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary-container font-label-sm text-label-sm font-semibold">
                          {model.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface">
                        <span className="bg-surface-container px-2 py-0.5 rounded">{model.sha256}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Clinical Users & Access Permissions</h2>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Clinic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm font-body-sm">
                  {loadingUsers ? (
                    <tr><td colSpan={3} className="py-4 text-center">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 text-center">No users found</td></tr>
                  ) : users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">{u.name}</td>
                      <td className="py-3 px-4 capitalize">{u.role.replace('_', ' ')}</td>
                      <td className="py-3 px-4">{u.clinic_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Audit Log</h2>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm font-body-sm">
                  {loadingAudit ? (
                    <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                  ) : auditLogs.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center">No audit activity found</td></tr>
                  ) : auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">{log.user_name || 'System'}</td>
                      <td className="py-3 px-4 font-semibold capitalize">{log.action}</td>
                      <td className="py-3 px-4">{log.entity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

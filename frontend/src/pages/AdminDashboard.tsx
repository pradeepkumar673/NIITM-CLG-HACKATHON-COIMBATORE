import { useQuery } from '@tanstack/react-query';
import { getUsersClinicsDashboardUsersClinicsGet, getModelStatusDashboardModelsStatusGet } from '../client';
import { AppShell } from '../components/AppShell';
import { getAuthUser } from '../utils/auth';

export function AdminDashboardContent() {
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getUsersClinicsDashboardUsersClinicsGet()
  });

  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['adminModels'],
    queryFn: () => getModelStatusDashboardModelsStatusGet()
  });

  const users = usersData?.data || [];
  const models = modelsData?.data || [];

  return (
      <div className="flex flex-col w-full gap-8 pb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Admin Control Center</h1>
          <p className="text-on-surface-variant text-sm">Manage system models and active personnel access.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Model Registry Status</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                <tr>
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">SHA-256 Checksum</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Metrics / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {isLoadingModels ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Loading models...</td></tr>
                ) : models.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No models registered.</td></tr>
                ) : (
                  models.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 font-bold text-primary">{m.name}</td>
                      <td className="py-3 px-4 font-mono text-xs bg-surface-container rounded inline-block mt-2 ml-4">{m.version}</td>
                      <td className="py-3 px-4 font-mono text-xs">{m.sha256}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.status.toLowerCase() === 'active' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-error'}`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={m.metrics_link} target="_blank" className="text-primary hover:underline font-semibold text-xs inline-flex items-center gap-1">
                          View Specs <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Registered Personnel (Clinics & Physicians)</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Clinic / Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {isLoadingUsers ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No users found.</td></tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 text-on-surface-variant">UID-{u.id.toString().padStart(4, '0')}</td>
                      <td className="py-3 px-4 font-bold">{u.name}</td>
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded bg-surface-container font-semibold text-xs text-on-surface-variant">{u.role.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">{u.clinic_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

export function AdminDashboard() {
  const authUser = getAuthUser();
  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name}>
      <AdminDashboardContent />
    </AppShell>
  );
}

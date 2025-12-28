import { useState } from 'react';
import { useAdminUsers, type User, type UserUpdateData, type UserCreateData } from '@/hooks/useAdminUsers';

export default function AdminPanel() {
  const {
    users,
    isLoading,
    statistics,
    statisticsLoading,
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
    isCreating,
    isUpdating,
    isToggling,
    isDeleting,
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState<UserCreateData>({
    email: '',
    password: '',
    full_name: '',
    role: 'full_user',
  });
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateUser = (userId: string, data: UserUpdateData) => {
    updateUser({ userId, data }, {
      onSuccess: () => {
        setEditingUser(null);
      },
    });
  };

  const handleToggleActive = (userId: string) => {
    if (window.confirm('¿Estás seguro de cambiar el estado de este usuario?')) {
      toggleUserActive(userId);
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId, {
      onSuccess: () => {
        setShowDeleteConfirm(null);
      },
    });
  };

  const handleCreateUser = () => {
    createUser(newUser, {
      onSuccess: (data) => {
        setCreatedPassword(data.temporary_password);
        setNewUser({
          email: '',
          password: '',
          full_name: '',
          role: 'full_user',
        });
        // Don't close modal yet, show password first
      },
      onError: (error: any) => {
        // Show error message to user
        const errorMessage = error?.response?.data?.detail || error?.message || 'Error desconocido';
        alert(`Error al crear usuario: ${errorMessage}`);
        console.error('Create user error:', error);
      },
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreatedPassword(null);
    setNewUser({
      email: '',
      password: '',
      full_name: '',
      role: 'full_user',
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'full_user': 'Usuario Pro',
      'partial_user': 'Usuario Básico',
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'admin': 'bg-error/10 text-error',
      'full_user': 'bg-primary/10 text-primary',
      'partial_user': 'bg-warning/10 text-warning',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || statisticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-surface">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">Panel de Administración</h1>
            <p className="text-text-secondary mt-1">Gestiona usuarios y permisos del sistema</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Usuario
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Usuarios</p>
                  <p className="text-3xl font-semibold text-text-primary mt-1">{statistics.users.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Usuarios Activos</p>
                  <p className="text-3xl font-semibold text-success mt-1">{statistics.users.active}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Transacciones</p>
                  <p className="text-3xl font-semibold text-text-primary mt-1">{statistics.transactions.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Categorías</p>
                  <p className="text-3xl font-semibold text-text-primary mt-1">{statistics.categories.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="full_user">Usuario Pro</option>
                <option value="partial_user">Usuario Básico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Términos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-card divide-y divide-border-light">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{user.full_name || 'Sin nombre'}</div>
                        <div className="text-sm text-text-secondary">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="input text-sm"
                        >
                          <option value="admin">Administrador</option>
                          <option value="full_user">Usuario Pro</option>
                          <option value="partial_user">Usuario Básico</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        user.is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.transaction_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      {user.terms_accepted_at ? (
                        <span className="text-xs text-success">✓ Aceptados</span>
                      ) : (
                        <span className="text-xs text-warning">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingUser?.id === user.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(user.id, {
                                role: editingUser.role,
                                full_name: editingUser.full_name || undefined,
                              })}
                              disabled={isUpdating}
                              className="btn-primary px-3 py-1 text-xs"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="btn-secondary px-3 py-1 text-xs"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              disabled={isToggling}
                              className={`${user.is_active ? 'text-error hover:text-error/80' : 'text-success hover:text-success/80'} transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                              title={user.is_active ? 'Desactivar' : 'Activar'}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.is_active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="text-error hover:text-error/80 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Confirmar Eliminación</h3>
            <p className="text-text-secondary mb-6">
              ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer y eliminará todos sus datos.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={isDeleting}
                className="btn-primary bg-error hover:bg-error/90"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Crear Nuevo Usuario</h3>

            {createdPassword ? (
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success font-medium mb-2">✓ Usuario creado exitosamente</p>
                  <p className="text-sm text-text-secondary mb-3">
                    Guarda esta contraseña temporal. No se podrá recuperar después:
                  </p>
                  <div className="bg-background-card p-3 rounded border border-border-light font-mono text-sm break-all">
                    {createdPassword}
                  </div>
                </div>
                <button
                  onClick={closeCreateModal}
                  className="btn-primary w-full"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="input w-full"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="input w-full"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Contraseña Temporal *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      className="input flex-1"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="btn-secondary whitespace-nowrap"
                      title="Generar contraseña"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Rol *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="full_user">Usuario Pro</option>
                    <option value="partial_user">Usuario Básico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-primary"
                  >
                    {isCreating ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

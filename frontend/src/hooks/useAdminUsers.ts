import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'full_user' | 'partial_user';
  is_active: boolean;
  terms_accepted_at: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
  transaction_count?: number;
}

export interface UserStatistics {
  total_transactions: number;
  total_income: number;
  total_expenses: number;
  balance: number;
  budgets_count: number;
  savings_goals_count: number;
}

export interface UserDetails extends User {
  statistics: UserStatistics;
}

export interface SystemStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: {
      admin: number;
      full_user: number;
      partial_user: number;
    };
  };
  transactions: {
    total: number;
  };
  categories: {
    total: number;
  };
}

export interface UserUpdateData {
  full_name?: string;
  role?: 'admin' | 'full_user' | 'partial_user';
  is_active?: boolean;
  avatar_url?: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  full_name?: string;
  role: 'admin' | 'full_user' | 'partial_user';
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  // Get all users
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    },
  });

  // Get system statistics
  const {
    data: statistics,
    isLoading: statisticsLoading
  } = useQuery<SystemStatistics>({
    queryKey: ['admin', 'statistics'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/statistics');
      return response.data;
    },
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: async (data: UserCreateData) => {
      const response = await apiClient.post('/admin/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    },
  });

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UserUpdateData }) => {
      const response = await apiClient.put(`/admin/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    },
  });

  // Toggle user active status
  const toggleUserActiveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.put(`/admin/users/${userId}/toggle-active`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    },
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    refetch,
    statistics,
    statisticsLoading,
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    toggleUserActive: toggleUserActiveMutation.mutate,
    toggleUserActiveAsync: toggleUserActiveMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isToggling: toggleUserActiveMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};

// Hook for getting user details
export const useUserDetails = (userId: string | null) => {
  return useQuery<UserDetails>({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID provided');
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

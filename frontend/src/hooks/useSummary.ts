import { useQuery } from '@tanstack/react-query';
import { summaryApi } from '@/api/endpoints';

export const useSummary = (params?: { month?: number; year?: number }) => {
  return useQuery({
    queryKey: ['summary', params],
    queryFn: () => summaryApi.get(params).then(res => res.data),
  });
};

export const useMonthlySummaries = (year: number) => {
  return useQuery({
    queryKey: ['monthlySummaries', year],
    queryFn: () => summaryApi.monthly(year).then(res => res.data),
  });
};

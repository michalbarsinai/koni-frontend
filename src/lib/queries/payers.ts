import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Payer, PayerWithBalance } from "../types";

export function usePayers() {
  return useQuery({
    queryKey: ["payers"],
    queryFn: async () => (await api.get<PayerWithBalance[]>("/payers/")).data,
  });
}

export interface CreatePayerInput {
  name: string;
  phone?: string;
  notes?: string;
}

export function useCreatePayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePayerInput) => (await api.post<Payer>("/payers/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payers"] }),
  });
}

export interface UpdatePayerInput {
  id: number;
  name?: string;
  phone?: string | null;
  notes?: string | null;
}

export function useUpdatePayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePayerInput) =>
      (await api.patch<Payer>(`/payers/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payers"] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Payment, PaymentMethod } from "../types";

export function usePayments(payerId?: number) {
  return useQuery({
    queryKey: ["payments", { payerId }],
    queryFn: async () =>
      (await api.get<Payment[]>("/payments/", { params: payerId ? { payer_id: payerId } : {} })).data,
  });
}

export interface CreatePaymentInput {
  payer_id: number;
  date: string;
  amount: string;
  method: PaymentMethod;
  notes?: string;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => (await api.post<Payment>("/payments/", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payers"] });
    },
  });
}

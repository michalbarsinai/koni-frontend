import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Student } from "../types";

export function useStudents(activeOnly = false) {
  return useQuery({
    queryKey: ["students", { activeOnly }],
    queryFn: async () =>
      (await api.get<Student[]>("/students/", { params: { active_only: activeOnly } })).data,
  });
}

export interface CreateStudentInput {
  name: string;
  payer_id: number;
  phone?: string;
  notes?: string;
  active?: boolean;
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStudentInput) => (await api.post<Student>("/students/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}

export interface CreateSoloStudentInput {
  name: string;
  phone?: string;
  notes?: string;
}

export function useCreateSoloStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSoloStudentInput) =>
      (await api.post<Student>("/students/solo", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["payers"] });
    },
  });
}

export interface UpdateStudentInput {
  id: number;
  name?: string;
  payer_id?: number;
  phone?: string | null;
  notes?: string | null;
  active?: boolean;
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateStudentInput) =>
      (await api.patch<Student>(`/students/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}

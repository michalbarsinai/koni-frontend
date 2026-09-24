import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { LessonType } from "../types";

export function useLessonTypes() {
  return useQuery({
    queryKey: ["lessonTypes"],
    queryFn: async () => (await api.get<LessonType[]>("/lesson-types/")).data,
  });
}

export interface CreateLessonTypeInput {
  name: string;
  default_price_per_student: string;
  default_student_count?: number;
  student_ids?: number[];
}

export function useCreateLessonType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLessonTypeInput) =>
      (await api.post<LessonType>("/lesson-types/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessonTypes"] }),
  });
}

export interface UpdateLessonTypeInput {
  id: number;
  name?: string;
  default_price_per_student?: string;
  default_student_count?: number;
  student_ids?: number[];
}

export function useUpdateLessonType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLessonTypeInput) =>
      (await api.patch<LessonType>(`/lesson-types/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessonTypes"] }),
  });
}

export function useDeleteLessonType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/lesson-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessonTypes"] }),
  });
}

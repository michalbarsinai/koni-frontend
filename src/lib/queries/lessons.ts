import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Lesson } from "../types";

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => (await api.get<Lesson[]>("/lessons/")).data,
  });
}

export interface LessonStudentInput {
  student_id: number;
  amount_paid: string;
}

export interface CreateLessonInput {
  date: string;
  lesson_type_id: number;
  notes?: string;
  students: LessonStudentInput[];
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLessonInput) => (await api.post<Lesson>("/lessons/", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["payers"] });
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { ReportChannel, ReportPreviewResponse, ReportSendResponse } from "../types";

export interface SendReportInput {
  start_date: string;
  end_date: string;
  channel: ReportChannel;
}

export function useSendReport() {
  return useMutation({
    mutationFn: async (input: SendReportInput) =>
      (await api.post<ReportSendResponse>("/reports/send", input)).data,
  });
}

export function usePreviewReport() {
  return useMutation({
    mutationFn: async ({ start_date, end_date }: { start_date: string; end_date: string }) =>
      (await api.get<ReportPreviewResponse>(`/reports/preview?start_date=${start_date}&end_date=${end_date}`)).data,
  });
}

export type PaymentMethod = "bit" | "paybox" | "cash" | "bank_transfer" | "other";

export interface LessonTypeStudentBrief {
  id: number;
  name: string;
  active: boolean;
}

export interface LessonType {
  id: number;
  name: string;
  default_price_per_student: string;
  default_student_count: number | null;
  students: LessonTypeStudentBrief[];
}

export interface Payer {
  id: number;
  name: string;
  phone: string | null;
  notes: string | null;
}

export interface PayerWithBalance extends Payer {
  balance: string;
}

export interface Student {
  id: number;
  name: string;
  payer_id: number;
  phone: string | null;
  notes: string | null;
  active: boolean;
}

export interface LessonStudent {
  id: number;
  student_id: number;
  price_charged: string;
  amount_paid: string;
}

export interface Lesson {
  id: number;
  date: string;
  lesson_type_id: number;
  notes: string | null;
  lesson_type: LessonType;
  lesson_students: LessonStudent[];
}

export interface Payment {
  id: number;
  payer_id: number;
  date: string;
  amount: string;
  method: PaymentMethod;
  notes: string | null;
}

export type ReportChannel = "whatsapp";

export interface ReportLessonLine {
  date: string;
  student_name: string;
  lesson_type: string;
  price_charged: string;
  amount_paid: string;
}

export interface ReportPayerResult {
  payer_id: number;
  payer_name: string;
  phone: string | null;
  balance: string;
  lessons_in_period: ReportLessonLine[];
  sent: boolean;
  skip_reason: string | null;
}

export interface ReportSendResponse {
  start_date: string;
  end_date: string;
  channel: ReportChannel;
  payers: ReportPayerResult[];
}

export interface ReportPreviewPayer {
  payer_id: number;
  payer_name: string;
  phone: string | null;
  balance: string;
  lessons_in_period: ReportLessonLine[];
}

export interface ReportPreviewResponse {
  start_date: string;
  end_date: string;
  payers: ReportPreviewPayer[];
}

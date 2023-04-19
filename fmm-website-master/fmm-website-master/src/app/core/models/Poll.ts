export interface Poll {
  id: number;
  question: string;
  options: string[];
  allow_multiple: boolean;
  created_at: Date;
  updated_at: Date;
  workshop: number;
  appointment: number;
}

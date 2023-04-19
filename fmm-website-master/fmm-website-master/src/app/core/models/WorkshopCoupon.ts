export interface WorkshopCoupon {
  id: number;
  discount: number;
  code: string;
  created_at: Date;
  updated_at: Date;
  workshop: number;
}

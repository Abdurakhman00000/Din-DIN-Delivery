export type Shift = {
  id: string;
  courier_id: string;
  started_at: string;
  ended_at: string | null;
  end_reason: string | null;
};

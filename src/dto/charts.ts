export interface ScoreTrendPointDto {
  date: string;
  score: number;
}

export interface CatchBreakdownPointDto {
  name: string;
  caught: number;
  lost: number;
  missed: number;
}

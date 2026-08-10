export interface Outing {
  id: number;
  userId: string;
  date: Date;
  location: string;
  caught: number;
  lost: number;
  missed: number;
  score: number;
  weather: string | null;
  waterConditions: string | null;
  waterTemp: number | null;
  timeSpentMin: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutingWithUserName extends Outing {
  userDisplayName: string;
}

export interface Photo {
  id: number;
  outingId: number;
  filename: string;
  caption: string | null;
}

export interface OutingDetail extends OutingWithUserName {
  photos: Photo[];
}

export interface UserProfile {
  userId: string;
  displayName: string;
  createdAt: Date;
}

export type OutingSortField = "date" | "location" | "score" | "author";
export type SortDir = "asc" | "desc";

export type OutingInput = {
  date: string;
  location: string;
  caught: number;
  lost: number;
  missed: number;
  score: number;
  weather: string | null;
  waterConditions: string | null;
  waterTemp: number | null;
  timeSpentMin: number | null;
  notes: string | null;
};

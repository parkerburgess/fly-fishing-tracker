import type {
  Outing,
  OutingDetail,
  OutingInput,
  OutingSortField,
  OutingWithUserName,
  Photo,
  SortDir,
  UserProfile,
} from "@/types";

export interface IDataAccess {
  getAllOutings(
    sortField?: OutingSortField,
    sortDir?: SortDir
  ): Promise<OutingWithUserName[]>;
  getOutingsByUser(userId: string): Promise<Outing[]>;
  getOuting(id: number): Promise<OutingDetail | null>;
  createOuting(userId: string, data: OutingInput): Promise<Outing>;
  updateOuting(userId: string, id: number, data: OutingInput): Promise<Outing>;
  deleteOuting(userId: string, id: number): Promise<void>;

  addPhoto(
    userId: string,
    outingId: number,
    data: { filename: string; caption: string | null }
  ): Promise<Photo>;

  getUserProfile(userId: string): Promise<UserProfile | null>;
  upsertUserProfile(userId: string, displayName: string): Promise<void>;
}

import type {
  Outing,
  OutingDetail,
  OutingInput,
  OutingWithUserName,
  Photo,
  UserProfile,
} from "@/types";

// The DAL only reads/writes the data source and casts rows to domain types.
// Ordering, filtering, and other manipulation belong to the consumer.
export interface IDataAccess {
  getAllOutings(): Promise<OutingWithUserName[]>;
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

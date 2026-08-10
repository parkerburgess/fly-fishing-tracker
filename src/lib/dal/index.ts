import type { IDataAccess } from "./IDataAccess";
import { SqlDataAccess } from "./SqlDataAccess";

const dal: IDataAccess = new SqlDataAccess();

export default dal;

import { UserContext } from '../../user-context.js';
import { nowTimestamp } from '../../utils.js';
import { TimestampedRec } from '../records/bases.js';
const { freeze } = Object;

export interface BaseDaoOptions {
  table: string;
  stamped: boolean;
  idNames: string | string[];
  /** Default column names for this DAO (get, first, list will filter through those)  */
  columns: readonly string[];
  /** set the default orderBy. '!' prefix make it DESC. .e.g., 'odr' or '!age' */
  orderBy?: string | null;
}


export class BaseDao {

  #table: string
  #stamped: boolean
  #idNames: string | string[]
  #columns: readonly string[]

  get stamped(): boolean { return this.#stamped }
  get idNames(): string | string[] { return this.#idNames }
  get table(): string { return this.#table }

  constructor(opts: BaseDaoOptions) {
    this.#table = opts.table;
    this.#idNames = opts.idNames;
    this.#stamped = opts.stamped;
    this.#columns = freeze(opts.columns);
  }

  protected static Stamp<T>(utx: UserContext, data: T, forCreate?: boolean) {
    const stampedData: Partial<T> & Partial<TimestampedRec> = data;
    const now = nowTimestamp();
    if (forCreate) {
      stampedData.cid = utx.userId;
      stampedData.ctime = now;
    } else {
      if (stampedData.cid != null || stampedData.ctime != null) {
        delete stampedData.cid;
        delete stampedData.ctime;
      }
    }
    stampedData.mid = utx.userId;
    stampedData.mtime = now;
    return stampedData;
  }
}
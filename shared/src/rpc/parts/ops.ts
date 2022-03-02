
export enum Opts {
  '$eq' = '$eq',
  '$notEq' = '$notEq',
  '$in' = '$in',
  '$notIn' = '$notIn',
  '$contains' = '$contains',
  '$containsIn' = '$containsIn',
  '$startsWith' = '$startsWith',
  '$startsWithIn' = '$startsWithIn',
  '$endsWith' = '$endsWith',
  '$endsWithIn' = '$endsWithIn',
  '$lt' = '$lt',
  '$lte' = '$lte',
  '$gt' = '$gt',
  '$gte' = '$gte',
}


type Opt = keyof typeof Opts;

// #region    --- Aliasing
// All operations keys with their aliases
type OptsAliases = { [name in Opt]: string[] };
const OPTS_ALIASES: OptsAliases = {
  // Exact match with one value 
  '$eq': ['$eq', '$$eq'],
  // Exclude any exact match 
  '$notEq': ['$notEq', '$$notEq'],
  // Exact match with within a list of values (or)
  '$in': ['$in', '$$in'],
  // Exclude any exact withing a list
  '$notIn': ['$notIn', '$$notIn'],
  // For string, does a contains 
  '$contains': ['$contains', '$$contains'],
  // For string, match if contained in any of items 
  '$containsIn': ['$containsIn', '$$containsIn'],
  // For string, does a startsWith
  '$startsWith': ['$startsWith', '$$startsWith'],
  // For string, match if startsWith in any of items
  '$startsWithIn': ['$startsWithIn', '$$startsWithIn'],
  // For string, does and end with 
  '$endsWith': ['$endsWith', '$$endsWith'],
  // For string, does a contains  (or) 
  '$endsWithIn': ['$endsWithIn', '$$endsWithIn'],
  // Lesser Than
  '$lt': ['$lt', '$$lt'],
  // Lesser Than or =
  '$lte': ['$lte', '$$lte'],
  // Greater Than 
  '$gt': ['$gt', '$$gt'],
  // Greater Than or =
  '$gte': ['$gte', '$$gte'],
};

// TODO - Will need to put a Map of alias to key
// #endregion --- Aliasing



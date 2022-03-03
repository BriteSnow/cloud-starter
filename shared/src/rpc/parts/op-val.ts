export type StringOpVal =
  string |
  { '$eq': string } |
  { '$notEq': string } |
  { '$in': string[] } |
  { '$notIn': string } |
  { '$contains': string } |
  { '$containsIn': string[] } |
  { '$startsWith': string } |
  { '$startsWithIn': string[] } |
  { '$endsWith': string } |
  { '$endsWithIn': string[] } |
  { '$lt': string } |
  { '$lte': string } |
  { '$gt': string } |
  { '$gte': string };
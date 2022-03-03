

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

export type IdOpVal =
  number |
  { '$eq': number } |
  { '$notEq': number } |
  { '$in': number[] } |
  { '$notIn': number } |
  { '$lt': number } |
  { '$lte': number } |
  { '$gt': number } |
  { '$gte': number };

export type TimeOpVal =
  string |
  { '$eq': string } |
  { '$notEq': string } |
  { '$in': string[] } |
  { '$notIn': string } |
  { '$startsWith': string } |
  { '$startsWithIn': string[] } |
  { '$lt': string } |
  { '$lte': string } |
  { '$gt': string } |
  { '$gte': string };    
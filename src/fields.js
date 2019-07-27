const murmurHash = require('murmurhash-native').murmurHash;

function dateUTC(value) {
  if (value === null)
    return null;

  const date = new Date(value);

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
}

function integer(value) {
  if (value === null)
    return null;

  return parseInt(value, 10);
}

function boolean(value) {
  if (value === null)
    return null;

  return value === 1;
}

function page(value) {
  if (value === null)
    return null;

  return parseInt(value, 10) * 8 * 1024;
}

function hex(value) {
  if (value === null)
    return null;

  return '0x' + value.toString('hex');
}

function queryHash(value) {
  if (value === null)
    return null;

  if (value.indexOf('exec sp_executesql') === 0) {
    value = value.replace(/,@\w+=.*/g, ''); // Remove everything after ',@Param1='
    value = value.replace(/varchar\(\d+\)/g, 'varchar()'); // Change 'varchar(xxx)' to 'varchar()'
  }

  value = value.replace(/[^0-9A-Za-z]+/g, ''); // Remove all non-alphanumeric characters

  return murmurHash(value || '', 0x12345789, 'hex');
}

const Fields = {
  TextData:          { id:  1, name: 'TextData' },
  QueryHash:         { id:  1, name: 'TextData', transform: queryHash, alias: 'QueryHash' },
  BinaryData:        { id:  2, name: 'BinaryData', transform: hex },
  DatabaseID:        { id:  3, name: 'DatabaseID' },
  TransactionID:     { id:  4, name: 'TransactionID', transform: integer },
  LineNumber:        { id:  5, name: 'LineNumber' },
  NTUserName:        { id:  6, name: 'NTUserName' },
  NTDomainName:      { id:  7, name: 'NTDomainName' },
  HostName:          { id:  8, name: 'HostName' },
  ClientProcessID:   { id:  9, name: 'ClientProcessID' },
  ApplicationName:   { id: 10, name: 'ApplicationName' },
  LoginName:         { id: 11, name: 'LoginName' },
  SPID:              { id: 12, name: 'SPID' },
  Duration:          { id: 13, name: 'Duration', transform: integer },
  StartTime:         { id: 14, name: 'StartTime', transform: dateUTC, alias: '@timestamp' },
  EndTime:           { id: 15, name: 'EndTime', transform: dateUTC },
  Reads:             { id: 16, name: 'Reads', transform: page },
  Writes:            { id: 17, name: 'Writes', transform: page },
  CPU:               { id: 18, name: 'CPU' },
  Permissions:       { id: 19, name: 'Permissions', transform: integer },
  Severity:          { id: 20, name: 'Severity', transform: integer },
  EventSubClass:     { id: 21, name: 'EventSubClass' },
  ObjectID:          { id: 22, name: 'ObjectID' },
  Success:           { id: 23, name: 'Success', transform: boolean },
  IndexID:           { id: 24, name: 'IndexID' },
  IntegerData:       { id: 25, name: 'IntegerData' },
  ServerName:        { id: 26, name: 'ServerName' },
  EventClass:        { id: 27, name: 'EventClass' },
  ObjectType:        { id: 28, name: 'ObjectType' },
  NestLevel:         { id: 29, name: 'NestLevel' },
  State:             { id: 30, name: 'State', transform: integer },
  Error:             { id: 31, name: 'Error' },
  Mode:              { id: 32, name: 'Mode' },
  Handle:            { id: 33, name: 'Handle' }, // transform?
  ObjectName:        { id: 34, name: 'ObjectName' },
  DatabaseName:      { id: 35, name: 'DatabaseName' },
  FileName:          { id: 36, name: 'FileName' },
  OwnerName:         { id: 37, name: 'OwnerName' },
  RoleName:          { id: 38, name: 'RoleName' },
  TargetUserName:    { id: 39, name: 'TargetUserName' },
  DBUserName:        { id: 40, name: 'DBUserName' },
  LoginSid:          { id: 41, name: 'LoginSid', transform: hex },
  TargetLoginName:   { id: 42, name: 'TargetLoginName' },
  TargetLoginSid:    { id: 43, name: 'TargetLoginSid', transform: hex },
  ColumnPermissions: { id: 44, name: 'ColumnPermissions' },
  LinkedServerName:  { id: 45, name: 'LinkedServerName' },
  ProviderName:      { id: 46, name: 'ProviderName' },
  MethodName:        { id: 47, name: 'MethodName' },
  RowCounts:         { id: 48, name: 'RowCounts', transform: integer },
  RequestID:         { id: 49, name: 'RequestID' },
  XactSequence:      { id: 50, name: 'XactSequence', transform: integer },
  EventSequence:     { id: 51, name: 'EventSequence', transform: integer },
  BigintData1:       { id: 52, name: 'BigintData1', transform: integer },
  BigintData2:       { id: 53, name: 'BigintData2', transform: integer },
  GUID:              { id: 54, name: 'GUID' }, // transform?
  IntegerData2:      { id: 55, name: 'IntegerData2' },
  ObjectID2:         { id: 56, name: 'ObjectID2', transform: integer },
  Type:              { id: 57, name: 'Type' },
  OwnerID:           { id: 58, name: 'OwnerID' },
  ParentName:        { id: 59, name: 'ParentName' },
  IsSystem:          { id: 60, name: 'IsSystem', transform: boolean },
  Offset:            { id: 61, name: 'Offset' },
  SourceDatabaseID:  { id: 62, name: 'SourceDatabaseID' },
  SqlHandle:         { id: 63, name: 'SqlHandle', transform: hex },
  SessionLoginName:  { id: 64, name: 'SessionLoginName' },
}

module.exports = Fields;

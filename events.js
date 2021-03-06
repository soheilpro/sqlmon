const Events =  {
  RPCCompleted:                             { id:  10 },
  RPCStarting:                              { id:  11 },
  SQLBatchCompleted:                        { id:  12 },
  SQLBatchStarting:                         { id:  13 },
  AuditLogin:                               { id:  14 },
  AuditLogout:                              { id:  15 },
  Attention:                                { id:  16 },
  ExistingConnection:                       { id:  17 },
  AuditServerStartsandStops:                { id:  18 },
  DTCTransaction:                           { id:  19 },
  AuditLoginFailed:                         { id:  20 },
  EventLog:                                 { id:  21 },
  ErrorLog:                                 { id:  22 },
  LockReleased:                             { id:  23 },
  LockAcquired:                             { id:  24 },
  LockDeadlock:                             { id:  25 },
  LockCancel:                               { id:  26 },
  LockTimeout:                              { id:  27 },
  DegreeofParallelism:                      { id:  28 },
  Exception:                                { id:  33 },
  SPCacheMiss:                              { id:  34 },
  SPCacheInsert:                            { id:  35 },
  SPCacheRemove:                            { id:  36 },
  SPRecompile:                              { id:  37 },
  SPCacheHit:                               { id:  38 },
  Deprecated:                               { id:  39 },
  SQLStmtStarting:                          { id:  40 },
  SQLStmtCompleted:                         { id:  41 },
  SPStarting:                               { id:  42 },
  SPCompleted:                              { id:  43 },
  SPStmtStarting:                           { id:  44 },
  SPStmtCompleted:                          { id:  45 },
  ObjectCreated:                            { id:  46 },
  ObjectDeleted:                            { id:  47 },
  SQLTransaction:                           { id:  50 },
  ScanStarted:                              { id:  51 },
  ScanStopped:                              { id:  52 },
  CursorOpen:                               { id:  53 },
  TransactionLog:                           { id:  54 },
  HashWarning:                              { id:  55 },
  AutoStats:                                { id:  58 },
  LockDeadlockChain:                        { id:  59 },
  LockEscalation:                           { id:  60 },
  OLEDBErrors:                              { id:  61 },
  ExecutionWarnings:                        { id:  67 },
  ShowplanTextUnencoded:                    { id:  68 },
  SortWarnings:                             { id:  69 },
  CursorPrepare:                            { id:  70 },
  PrepareSQL:                               { id:  71 },
  ExecPreparedSQL:                          { id:  72 },
  UnprepareSQL:                             { id:  73 },
  CursorExecute:                            { id:  74 },
  CursorRecompile:                          { id:  75 },
  CursorImplicitConversion:                 { id:  76 },
  CursorUnprepare:                          { id:  77 },
  CursorClose:                              { id:  78 },
  MissingColumnStatistics:                  { id:  79 },
  MissingJoinPredicate:                     { id:  80 },
  ServerMemoryChange:                       { id:  81 },
  User0:                                    { id:  82 },
  User1:                                    { id:  83 },
  User2:                                    { id:  84 },
  User3:                                    { id:  85 },
  User4:                                    { id:  86 },
  User5:                                    { id:  87 },
  User6:                                    { id:  88 },
  User7:                                    { id:  89 },
  User8:                                    { id:  90 },
  User9:                                    { id:  91 },
  DataFileAutoGrow:                         { id:  92 },
  LogFileAutoGrow:                          { id:  93 },
  DataFileAutoShrink:                       { id:  94 },
  LogFileAutoShrink:                        { id:  95 },
  ShowplanText:                             { id:  96 },
  ShowplanAll:                              { id:  97 },
  ShowplanStatisticsProfile:                { id:  98 },
  RPCOutputParameter:                       { id: 100 },
  AuditDatabaseScopeGDR:                    { id: 102 },
  AuditObjectGDREvent:                      { id: 103 },
  AuditAddLoginEvent:                       { id: 104 },
  AuditLoginGDREvent:                       { id: 105 },
  AuditLoginChangePropertyEvent:            { id: 106 },
  AuditLoginChangePasswordEvent:            { id: 107 },
  AuditAddLogintoServerRoleEvent:           { id: 108 },
  AuditAddDBUserEvent:                      { id: 109 },
  AuditAddMembertoDBRoleEvent:              { id: 110 },
  AuditAddRoleEvent:                        { id: 111 },
  AuditAppRoleChangePasswordEvent:          { id: 112 },
  AuditStatementPermissionEvent:            { id: 113 },
  AuditSchemaObjectAccessEvent:             { id: 114 },
  AuditBackupRestoreEvent:                  { id: 115 },
  AuditDBCCEvent:                           { id: 116 },
  AuditChangeAuditEvent:                    { id: 117 },
  AuditObjectDerivedPermissionEvent:        { id: 118 },
  OLEDBCallEvent:                           { id: 119 },
  OLEDBQueryInterfaceEvent:                 { id: 120 },
  OLEDBDataReadEvent:                       { id: 121 },
  ShowplanXML:                              { id: 122 },
  SQLFullTextQuery:                         { id: 123 },
  BrokerConversation:                       { id: 124 },
  DeprecationAnnouncement:                  { id: 125 },
  DeprecationFinalSupport:                  { id: 126 },
  ExchangeSpillEvent:                       { id: 127 },
  AuditDatabaseManagementEvent:             { id: 128 },
  AuditDatabaseObjectManagementEvent:       { id: 129 },
  AuditDatabasePrincipalManagementEvent:    { id: 130 },
  AuditSchemaObjectManagementEvent:         { id: 131 },
  AuditServerPrincipalImpersonationEvent:   { id: 132 },
  AuditDatabasePrincipalImpersonationEvent: { id: 133 },
  AuditServerObjectTakeOwnershipEvent:      { id: 134 },
  AuditDatabaseObjectTakeOwnershipEvent:    { id: 135 },
  BrokerConversationGroup:                  { id: 136 },
  BlockedProcessReport:                     { id: 137 },
  BrokerConnection:                         { id: 138 },
  BrokerForwardedMessageSent:               { id: 139 },
  BrokerForwardedMessageDropped:            { id: 140 },
  BrokerMessageClassify:                    { id: 141 },
  BrokerTransmission:                       { id: 142 },
  BrokerQueueDisabled:                      { id: 143 },
  ShowplanXMLStatisticsProfile:             { id: 146 },
  DeadlockGraph:                            { id: 148 },
  BrokerRemoteMessageAcknowledgement:       { id: 149 },
  TraceFileClose:                           { id: 150 },
  AuditChangeDatabaseOwner:                 { id: 152 },
  AuditSchemaObjectTakeOwnershipEvent:      { id: 153 },
  FTCrawlStarted:                           { id: 155 },
  FTCrawlStopped:                           { id: 156 },
  FTCrawlAborted:                           { id: 157 },
  AuditBrokerConversation:                  { id: 158 },
  AuditBrokerLogin:                         { id: 159 },
  BrokerMessageUndeliverable:               { id: 160 },
  BrokerCorruptedMessage:                   { id: 161 },
  UserErrorMessage:                         { id: 162 },
  BrokerActivation:                         { id: 163 },
  ObjectAltered:                            { id: 164 },
  Performancestatistics:                    { id: 165 },
  SQLStmtRecompile:                         { id: 166 },
  DatabaseMirroringStateChange:             { id: 167 },
  ShowplanXMLForQueryCompile:               { id: 168 },
  ShowplanAllForQueryCompile:               { id: 169 },
  AuditServerScopeGDREvent:                 { id: 170 },
  AuditServerObjectGDREvent:                { id: 171 },
  AuditDatabaseObjectGDREvent:              { id: 172 },
  AuditServerOperationEvent:                { id: 173 },
  AuditServerAlterTraceEvent:               { id: 175 },
  AuditServerObjectManagementEvent:         { id: 176 },
  AuditServerPrincipalManagementEvent:      { id: 177 },
  AuditDatabaseOperationEvent:              { id: 178 },
  AuditDatabaseObjectAccessEvent:           { id: 180 },
  TMBeginTranstarting:                      { id: 181 },
  TMBeginTrancompleted:                     { id: 182 },
  TMPromoteTranstarting:                    { id: 183 },
  TMPromoteTrancompleted:                   { id: 184 },
  TMCommitTranstarting:                     { id: 185 },
  TMCommitTrancompleted:                    { id: 186 },
  TMRollbackTranstarting:                   { id: 187 },
  TMRollbackTrancompleted:                  { id: 188 },
  LockTimeoutNonZero:                       { id: 189 },
  ProgressReportOnlineIndexOperation:       { id: 190 },
  TMSaveTranstarting:                       { id: 191 },
  TMSaveTrancompleted:                      { id: 192 },
  BackgroundJobError:                       { id: 193 },
  OLEDBProviderInformation:                 { id: 194 },
  MountTape:                                { id: 195 },
  AssemblyLoad:                             { id: 196 },
  XQueryStaticType:                         { id: 198 },
  QNsubscription:                           { id: 199 },
  QNparametertable:                         { id: 200 },
  QNtemplate:                               { id: 201 },
  QNdynamics:                               { id: 202 },
  BitmapWarning:                            { id: 212 },
  DatabaseSuspectDataPage:                  { id: 213 },
  CPUthresholdexceeded:                     { id: 214 },
  PreConnectStarting:                       { id: 215 },
  PreConnectCompleted:                      { id: 216 },
  PlanGuideSuccessful:                      { id: 217 },
  PlanGuideUnsuccessful:                    { id: 218 },
  AuditFulltext:                            { id: 235 },
};

module.exports = Events;

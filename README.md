# sqlmon
Collects events from SQL Server and saves them to Elasticsearch for further analysis.

## Installation

```
npm install -g sqlmon
```

## Sample
```
$ sqlmon \
    --ss-address sql.example.com \
    --ss-user sa \
    --ss-password p@ssw0rd \
    --es-address elasticsearch.example.com \
    --trace-directory 'c:\trace' \
    --events RPCCompleted SQLBatchCompleted \
    --fields TextData QueryHash LoginName Duration Reads Writes CPU \
    --duration 60s

Connecting to sql.example.com...
Starting trace...
Collecting events for 60s until 14:13:20... (Press [c] to stop)
Stopping trace...
Saving 18120 events to elasticsearch.example.com...
100.00% 18120/18120
Disconnecting...
```

## Usage
### Trace directory
sqlmon needs to write trace files to a temporary directory on the server first. Use the `---trace-directory` option to specify the location of this directory:
```
--trace-directory 'c:\trace'
```

**Note 1**: The SQL Server service account (usually NT Service\MSSQLSERVER) must have Write permission on this directory.

**Note 2**: These files are not removed when the program ends and must be manually deleted.

### Duration
Use the `--duration` or `-d` parameter to specify the duration that the trace must run:

```
--duration 1m
```

You can use any specifier like `30s`, `10m`, `2h`, or `1d`. The default is `60s`.

### Max trace size
By default, sqlmon limits the size of trace files to 1 GB. You can change this by using the `--max-size` option (in megabytes):

```
--max-size 2048 # 2 GB
```

### Events to capture
Use the `--events` parameter to specify the events to be captured:

```
--events RPCCompleted SQLBatchCompleted
```

See [all supported events](#supported-events-and-fields).

### Fields to include
Use the `--fields` parameter to specify the fields to be included:

```
--fields TextData Reads Writes CPU Duration RowCounts
```

See [all supported fields](#supported-events-and-fields).

### Index name
The default Elasticsearch index name is `sql-YY.MM.DD` which can be changed using the `--index-prefix` option:

```
--index-prefix trace-
```

### Importing trace files
If you have a saved trace file (created by either sqlmon or SQL Server Profiler), you can import it into Elasticsearch using the `--import` option:

```
--import 'c:\trace\20190728042508732.trc'
```

## QueryHash
QueryHash is a special field that is created by removing all parameters and variables from the query (TextData) and then hashing it. It can be used to group events to find the top resource consuming queries.

<img src="kibana.png" width="800" alt="Kibana" >

## Supported events and fields
See [SQL Server Event Class Reference](https://docs.microsoft.com/en-us/sql/relational-databases/event-classes/sql-server-event-class-reference) for detailed information about these fields and events.

### Events
* AssemblyLoad
* Attention
* AuditAddDBUserEvent
* AuditAddLoginEvent
* AuditAddLogintoServerRoleEvent
* AuditAddMembertoDBRoleEvent
* AuditAddRoleEvent
* AuditAppRoleChangePasswordEvent
* AuditBackupRestoreEvent
* AuditBrokerConversation
* AuditBrokerLogin
* AuditChangeAuditEvent
* AuditChangeDatabaseOwner
* AuditDatabaseManagementEvent
* AuditDatabaseObjectAccessEvent
* AuditDatabaseObjectGDREvent
* AuditDatabaseObjectManagementEvent
* AuditDatabaseObjectTakeOwnershipEvent
* AuditDatabaseOperationEvent
* AuditDatabasePrincipalImpersonationEvent
* AuditDatabasePrincipalManagementEvent
* AuditDatabaseScopeGDR
* AuditDBCCEvent
* AuditFulltext
* AuditLogin
* AuditLoginChangePasswordEvent
* AuditLoginChangePropertyEvent
* AuditLoginFailed
* AuditLoginGDREvent
* AuditLogout
* AuditObjectDerivedPermissionEvent
* AuditObjectGDREvent
* AuditSchemaObjectAccessEvent
* AuditSchemaObjectManagementEvent
* AuditSchemaObjectTakeOwnershipEvent
* AuditServerAlterTraceEvent
* AuditServerObjectGDREvent
* AuditServerObjectManagementEvent
* AuditServerObjectTakeOwnershipEvent
* AuditServerOperationEvent
* AuditServerPrincipalImpersonationEvent
* AuditServerPrincipalManagementEvent
* AuditServerScopeGDREvent
* AuditServerStartsandStops
* AuditStatementPermissionEvent
* AutoStats
* BackgroundJobError
* BitmapWarning
* BlockedProcessReport
* BrokerActivation
* BrokerConnection
* BrokerConversation
* BrokerConversationGroup
* BrokerCorruptedMessage
* BrokerForwardedMessageDropped
* BrokerForwardedMessageSent
* BrokerMessageClassify
* BrokerMessageUndeliverable
* BrokerQueueDisabled
* BrokerRemoteMessageAcknowledgement
* BrokerTransmission
* CPUthresholdexceeded
* CursorClose
* CursorExecute
* CursorImplicitConversion
* CursorOpen
* CursorPrepare
* CursorRecompile
* CursorUnprepare
* DatabaseMirroringStateChange
* DatabaseSuspectDataPage
* DataFileAutoGrow
* DataFileAutoShrink
* DeadlockGraph
* DegreeofParallelism
* Deprecated
* DeprecationAnnouncement
* DeprecationFinalSupport
* DTCTransaction
* ErrorLog
* EventLog
* Exception
* ExchangeSpillEvent
* ExecPreparedSQL
* ExecutionWarnings
* ExistingConnection
* FTCrawlAborted
* FTCrawlStarted
* FTCrawlStopped
* HashWarning
* LockAcquired
* LockCancel
* LockDeadlock
* LockDeadlockChain
* LockEscalation
* LockReleased
* LockTimeout
* LockTimeoutNonZero
* LogFileAutoGrow
* LogFileAutoShrink
* MissingColumnStatistics
* MissingJoinPredicate
* MountTape
* ObjectAltered
* ObjectCreated
* ObjectDeleted
* OLEDBCallEvent
* OLEDBDataReadEvent
* OLEDBErrors
* OLEDBProviderInformation
* OLEDBQueryInterfaceEvent
* Performancestatistics
* PlanGuideSuccessful
* PlanGuideUnsuccessful
* PreConnectCompleted
* PreConnectStarting
* PrepareSQL
* ProgressReportOnlineIndexOperation
* QNdynamics
* QNparametertable
* QNsubscription
* QNtemplate
* RPCCompleted
* RPCOutputParameter
* RPCStarting
* ScanStarted
* ScanStopped
* ServerMemoryChange
* ShowplanAll
* ShowplanAllForQueryCompile
* ShowplanStatisticsProfile
* ShowplanText
* ShowplanTextUnencoded
* ShowplanXML
* ShowplanXMLForQueryCompile
* ShowplanXMLStatisticsProfile
* SortWarnings
* SPCacheHit
* SPCacheInsert
* SPCacheMiss
* SPCacheRemove
* SPCompleted
* SPRecompile
* SPStarting
* SPStmtCompleted
* SPStmtStarting
* SQLBatchCompleted
* SQLBatchStarting
* SQLFullTextQuery
* SQLStmtCompleted
* SQLStmtRecompile
* SQLStmtStarting
* SQLTransaction
* TMBeginTrancompleted
* TMBeginTranstarting
* TMCommitTrancompleted
* TMCommitTranstarting
* TMPromoteTrancompleted
* TMPromoteTranstarting
* TMRollbackTrancompleted
* TMRollbackTranstarting
* TMSaveTrancompleted
* TMSaveTranstarting
* TraceFileClose
* TransactionLog
* UnprepareSQL
* User0
* User1
* User2
* User3
* User4
* User5
* User6
* User7
* User8
* User9
* UserErrorMessage
* XQueryStaticType

### Fields
* ApplicationName
* BigintData1
* BigintData2
* BinaryData
* ClientProcessID
* ColumnPermissions
* CPU
* DatabaseID
* DatabaseName
* DBUserName
* Duration
* EndTime
* Error
* EventClass
* EventSequence
* EventSubClass
* FileName
* GUID
* Handle
* HostName
* IndexID
* IntegerData
* IntegerData2
* IsSystem
* LineNumber
* LinkedServerName
* LoginName
* LoginSid
* MethodName
* Mode
* NestLevel
* NTDomainName
* NTUserName
* ObjectID
* ObjectID2
* ObjectName
* ObjectType
* Offset
* OwnerID
* OwnerName
* ParentName
* Permissions
* ProviderName
* [QueryHash](#queryhash)
* Reads
* RequestID
* RoleName
* RowCounts
* ServerName
* SessionLoginName
* Severity
* SourceDatabaseID
* SPID
* SqlHandle
* StartTime
* State
* Success
* TargetLoginName
* TargetLoginSid
* TargetUserName
* TextData
* TransactionID
* Type
* Writes
* XactSequence

## Version History
+ **1.0**
	+ Initial release.

## Author
**Soheil Rashidi**

+ http://soheilrashidi.com
+ http://twitter.com/soheilpro
+ http://github.com/soheilpro

## Copyright and License
Copyright 2019 Soheil Rashidi.

Licensed under the The MIT License (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

http://www.opensource.org/licenses/mit-license.php

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

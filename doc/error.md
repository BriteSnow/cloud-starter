_[home](../README.md)_

# Error handling

This code design is mostly for backend services/servers code but can be applied to the client-side In this code sample, we use it only on the server-side as this is where it brings the most value.

## Design Goal

The main design goals of this error handling pattern is to be: 
- **Simple** by leveraging what is available in the runtime (e.g., Error and try/catch/throw)
- **Safe** by adopting the "least path of resistance is the safest path" code design approach. Making error for server logs the default and client-side error information explicit.
- **Scalable** keep the code complexity flat as feature and code base grows


Those three top design goals derive to the following implementation goals:

- Leverage JavaScript native `Error` `try/catch/throw` system
- Use **Error Code** scheme as **error** classification scheme.
  - This avoids class hierarchy explosion and dramatically simplifies error handling through the codebase.
 - Split **server** code/message (for backend logs) from **user** code/message for user information (send to client-side, API caller or browser AJAX).
- Make server code/message by default and allow developers to add user code/message as needed explicitly.
- This pattern, combined with the common `request-wrapper-mdw.ts` web request error handling, guarantees that no explicitly set user error code and the message is sent to the client. 
- Make code (server and user code) `Symbol` typed to alleviate possible mistake to send string message as error code. 

## Design Implementation

- The base module is shared for the server at [services/_common/src/error.ts](../services/_common/src/error.ts)
  - _could be moved to `shared/src/` if the same system needs to be used for client code_
- [error.ts](../services/_common/src/error.ts) provides the base implementation for `Err` class, which `extends Error` and should be used for all errors. 
  - The `new Err(SERVER_CODE, SERVER_MESSAGE?)` creates a new `Err` with a server code and optional server message. 
  - To add more information, service code can use the full `ErrRec` types `new Err({svrCode: SERVER_CODE, svrCode?:..., usrCode?: ..., usrMsg?: ...})`
- **Common error** codes are in [services/_common/src/error-common.ts](../services/_common/src/error-common.ts) and each are exported as 
  - This is important to leverage JS/TS importing system to explicitly declare what common error a specific module (i.e., .ts file)  uses (e.g., `import { CODE_ERROR } from '../error-common';`). 
- **Module error** are defined at the top of their respective .ts files as such
  - **just after the last import, one empty line before and after**:
```ts
...
// since we have import reformat, will be removed if not used
import { CODE_ERROR } from '../error-common'; 
import { b64dec, b64enc, symbolDic } from '../utils';

const ERROR = symbolDic(
	'WRONG_TOKEN',
	'WRONG_TOKEN_FORMAT',
	'TOKEN_EXPIRED'
);

```
- `symbolDic` will create a `{key: Symbol}` object map for each string argument and will be fully typed (i.e., autocomplete)
- Usage is as follow:
```ts

// Module error needs to be thrown
throw new Err(ERROR.WRONG_TOKEN);

// Common error needs to be thrown
throw new Err(CODE_ERROR, `The key object can have only one property');
```
- Then, in the [request-wrapper-mdw](..services/_common/src/web/request-wrapper-mdw.ts) the server error code/message are logged to the server logs, and the eventual user code/message sent to the client (or a generic error is sent)
- When user error code are needed, after the `const ERROR = ... ` create a `const USR_ERROR = symbolDic(...)` like:
```ts
import ...

const ERROR = symbolDic(
	'SVR_ERROR'// GENERIC SERVER ERROR, not from AppERR
)

const USR_ERROR = symbolDic(
	'ERROR'// GENERIC SERVER ERROR, not from AppERR
)
```
- Usage examples:
   -[services/_common/src/da/dao-user.ts](../services/_common/src/da/dao-user.ts)
  - [services/_common/src/security/token.ts](../services/_common/src/security/token.ts)
  - [services/_common/src/da/dao-wks-scoped.ts](../services/_common/src/da/dao-wks-scoped.ts)
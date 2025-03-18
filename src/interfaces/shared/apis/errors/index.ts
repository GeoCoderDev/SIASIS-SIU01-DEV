import { DataConflictErrorTypes } from "./DataConflictErrorTypes";
import { PermissionErrorTypes } from "./PermissionErrorTypes";
import { RequestErrorTypes } from "./RequestErrorTypes";
import { SystemErrorTypes } from "./SystemErrorTypes";
import { TokenErrorTypes } from "./TokenErrorTypes";
import { UserErrorTypes } from "./UserErrorTypes";
import { ValidationErrorTypes } from "./ValidationErrorTyoes";

type AllErrorTypes =
  | RequestErrorTypes
  | TokenErrorTypes
  | UserErrorTypes
  | PermissionErrorTypes
  | SystemErrorTypes
  | ValidationErrorTypes
  | DataConflictErrorTypes;

export default AllErrorTypes;

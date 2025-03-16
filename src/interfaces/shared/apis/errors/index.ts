import { PermissionErrorTypes } from "./PermissionErrorTypes";
import { RequestErrorTypes } from "./RequestErrorTypes";
import { SystemErrorTypes } from "./SystemErrorTypes";
import { TokenErrorTypes } from "./TokenErrorTypes";
import { UserErrorTypes } from "./UserErrorTypes";

type AllErrorTypes =
  | RequestErrorTypes
  | TokenErrorTypes
  | UserErrorTypes
  | PermissionErrorTypes
  | SystemErrorTypes;

export default AllErrorTypes;

export class CustomError extends Error {
    type: number;
    constructor(type: number, message: string = "") {
      super(message);
      this.type = type;
    }
  }
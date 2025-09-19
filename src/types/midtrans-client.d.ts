// src/types/midtrans-client.d.ts
declare module "midtrans-client" {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(parameter: object): Promise<any>;
    createTransactionToken(parameter: object): Promise<any>;
    createTransactionRedirectUrl(parameter: object): Promise<any>;
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    charge(parameter: object): Promise<any>;
    capture(parameter: object): Promise<any>;
  }
}

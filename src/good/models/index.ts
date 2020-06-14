import {ISODateTime, Seconds} from "temporal-types";

/*
 * Define data types from the perspective of the business logic.
 * Nothing specific to external services here, just interfaces.
 * (Typically you'll have more models, categorized into separate files
 *  in this folder and exported from this index.ts.)
 */

export interface AppUser {
  id: string;
  name: string;
}

export interface PackageRequest {
  name: string;
  contentType?: string;
  fileName?: string;
}

export interface Package extends PackageRequest {
  userId: string;
  userName: string;
  createdOn: ISODateTime;
  ttl: Seconds;
}

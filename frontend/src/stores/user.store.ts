import VueStore from "vue-class-store";
import { LocallyPersisted } from "../services/locally-persisted";
import router from "../router/router";
import firebase from "firebase";

export type UserArgyleInfo =
  | undefined
  | {
      userId: string
      userToken: string
    };

export type GigExperienceAwardDTO = {
  label: string
  badgeUrl: string
  description: string
};

export type GigExperienceDTO = {
  id: string
  employer: string
  hireDatetime: Date
  terminationDatetime: Date
  rating: string
  trips: number
  awards: GigExperienceAwardDTO[]
};

export interface Doc {
  id: string
  number: string // document_number
  type:
    | "drivers-license"
    | "vehicle-registration"
    | "profile-picture"
    | "vehicle-insurance"
    | "vehicle-inspection"
    | "lax-placard"
    | "other" // document_type
  name: string // document_type_description
  expirationDate: string // expiration_date
  url: string // file_url
}
export interface VehicleDoc extends Doc {
  type: "vehicle-registration" | "vehicle-insurance" | "vehicle-inspection"
}

export interface VehicleDocRegistration extends VehicleDoc {
  type: "vehicle-registration"
}

export interface VehicleDocInsurance extends VehicleDoc {
  type: "vehicle-insurance"
}

export interface VehicleDocInspection extends VehicleDoc {
  type: "vehicle-inspection"
}

export interface VehicleDocs {
  registration?: VehicleDocRegistration
  insurance?: VehicleDocInsurance
  inspection?: VehicleDocInspection
}

export interface Vehicle {
  id: string
  type: string
  vin: string
  brand: string
  model: string
  year: number
  plate: string
  docs: VehicleDoc[]
}
export interface UserProfileInfo {
  name: string
  email: string
  verified: boolean
  phone: string
  picture: string
  picturesGallery: string[] // prepend new ones
}
export interface UserProfile {
  info: UserProfileInfo
  argyle?: UserArgyleInfo
  gigs?: GigExperienceDTO[]
  vehicle?: Vehicle
  vehiclesGallery: Vehicle[] // prepend new Ones
}

class UserStore implements UserProfile {
  isLoggedIn = LocallyPersisted("user.isLoggedIn", false);

  info = LocallyPersisted<UserProfileInfo>("user.info", {
    name: "",
    email: "",
    verified: false,
    phone: "",
    picture: "",
    picturesGallery: [],
  });

  argyle = LocallyPersisted<UserArgyleInfo>("user.argyle", undefined);
  gigs = LocallyPersisted<Array<GigExperienceDTO> | undefined>(
    "user.gigs",
    undefined
  );

  vehicle = LocallyPersisted<Vehicle>("user.vehicle", undefined);
  vehiclesGallery = LocallyPersisted<Array<Vehicle>>("user.vehicleGallery", []);

  firebase?: firebase.auth.UserCredential;

  get firebaseToken(): Promise<string> {
    return (async (): Promise<string> => {
      function askToLogin(): string {
        console.log("Your session expired. Please, login again");
        router.push("/auth/login");
        return "";
      }

      if (!this.isLoggedIn || !this.firebase) {
        return askToLogin();
      }

      try {
        return this.firebase?.user?.getIdToken(true) || "";
      } catch {
        return askToLogin();
      }
    })();
  }

  loadProfile(userProfile: UserProfile) {
    this.info = userProfile.info;
    this.argyle = userProfile.argyle;
    this.gigs = userProfile.gigs;
    this.isLoggedIn = true;
  }

  loadFirebaseUserData(firebaseUserCredentials: firebase.auth.UserCredential){
    this.firebase = firebaseUserCredentials
    this.isLoggedIn = true
    return this.firebase
  }

  argyleRegister(payload: { userId: string; userToken: string; }) {
    this.argyle = payload;
  }
}

export default VueStore.create(new UserStore()) as UserStore;

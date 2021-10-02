export interface SaveUserProfile {
  name: string;
  email: string;
  phone: string;
  picture: string;
  userId: string;
  birthDate: string;
}
export interface Profile {
  info: UserProfile;
  gigs: GigExperience[];
  workPreferences: UserWorkPreferences;
  driver: UserDriver;
}
export type ProfileAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  picture: string;
  address?: ProfileAddress;
  picturesGallery: string[];
};
export type GigExperienceAward = {
  label: string;
  badgeUrl: string;
  description: string;
};

export type GigExperience = {
  id: string;
  employer: string;
  hireDatetime: Date;
  terminationDatetime: Date;
  rating: string;
  trips: number;
  awards: GigExperienceAward[];
};
export type JobPositionType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Seasonal"
  | "Split shifts";

export type WorkAvailability = {
  startsAt: string;
  endsAt: string;
};

export type UserWorkPreferences = {
  uid: string;
  willingToStartAt?: Date;
  availability?: (WorkAvailability | null)[];
  jobPositionTypes?: JobPositionType[];
  workingRadius?: number[]; // [0] minMiles, [1] maxMiles
};
export type UserDriver = {
  uid: string;
  licence?: {
    number: string;
    issuedDate: Date;
    expirationDate: Date;
    frontFileUrl: string;
    backFileUrl: string;
  };
};
interface Field {
  inputType?: string;
  mask: string;
  rule: string[];
  type: string;
  value: string;
}
export interface BasicInformation {
  personalInformationData: {
    birthdate: Field;
    email: Field;
    "first name": Field;
    "last name": Field;
    "phone number": Field;
  };

  addressInformationData: {
    city: Field;
    "line 1": Field;
    "line 2": Field;
    "postal code": Field;
    state: Field;
  };
  availabilityData: {
    endTime: string;
    startTime: string;
    weekDay: string;
  }[];
}
export interface RequirementsInfo {
  [key: string]: string;
}

export interface DriverLicenseData {
  expirationDate: string;
  issuedDate: string;
  number: string;
  backFileUrl: string;
  frontFileUrl: string;
  licenseType: string;
}

export interface DriverResume {
  fileName: string;
  url: string;
}

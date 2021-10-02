import axios, { AxiosResponse, Method } from "axios";
import router from "@/router/router";
import firebase from "firebase/app";
import "firebase/auth";
import userStore, { UserProfile } from "../stores/user.store";

const BASE_URL = process.env.VUE_APP_API_ROOT;

export const tst = console.log(BASE_URL);

export type OAuthProvider = "facebook" | "google";

// Internal Helper Functions
const isRelativeURL = (url: string) =>
  !(url.substring(0, 4) === "http" && url.charAt(6) === "/");

// General Helper Functions that may be used externally
export function getBaseURL() {
  return BASE_URL;
}

export function getURL(urlOrRelativeURL: string): string {
  if (isRelativeURL(urlOrRelativeURL)) {
    const preSlashedRelativeURL =
      urlOrRelativeURL.charAt(0) === "/"
        ? urlOrRelativeURL
        : "/" + urlOrRelativeURL;
    return BASE_URL + preSlashedRelativeURL;
  }
  return urlOrRelativeURL;
}

export async function request<T>(
  urlOrRelativeURL: string,
  method: Method = "get",
  dataArg = {},
  customHeaders = {}
): Promise<AxiosResponse<T>> {
  const token = await userStore.firebaseToken;
  const authorizationHeader = token ? { authorization: token } : {};
  const headers = { ...authorizationHeader, ...customHeaders };
  const data = JSON.parse(JSON.stringify(dataArg));
  const url = getURL(urlOrRelativeURL) + "/";

  const res = await axios(url, {
    responseType: "json",
    method,
    data,
    headers,
  });

  res.data = res.data as T;
  return res;
}

export function GET<T>(urlOrRelativeURL: string, id = "") {
  const finalURL = id ? urlOrRelativeURL + "/" + id : urlOrRelativeURL;
  return request<T>(finalURL, "get");
}

export async function POST<T>(urlOrRelativeURL: string, data: object) {
  return request<T>(urlOrRelativeURL, "post", data);
}

// Specific Helper Functions, used by specific use-cases

function _convertFirebaseRes2UserInfo(
  firebaseRes: firebase.auth.UserCredential
) {
  return {
    name: firebaseRes.user?.displayName ? firebaseRes.user.displayName : "",
    email: firebaseRes.user?.email ? firebaseRes.user.email : "",
    verified: firebaseRes.user?.emailVerified ? true : false,
    phone: firebaseRes.user?.phoneNumber ? firebaseRes.user.phoneNumber : "",
    picture: firebaseRes.user?.photoURL ? firebaseRes.user.photoURL : "", // todo tofix
  };
}

// User/Auth Specific Helpers

export async function _loadProfileInfo(
  firebaseRes?: firebase.auth.UserCredential
) {
  const userProfile = (await GET<UserProfile>("users", "me")).data;

  if (!userProfile.info && firebaseRes) {
    const userInfo = _convertFirebaseRes2UserInfo(firebaseRes);
    POST("profiles/me", userInfo);

    userProfile.info = {
      ...userInfo,
      picturesGallery: [],
    };
  }
  return userProfile;
}

export async function getUserProfile(firebaseRes?: firebase.auth.UserCredential): Promise<UserProfile> {
  const profileAndArgyle = await Promise.all([
    _loadProfileInfo(firebaseRes),
    GET<UserProfile>("/profiles/me"),
  ]);

  const userProfile = profileAndArgyle[0];
  const argyleCredentials = profileAndArgyle[1].data;

  const joinedUserData = { ...argyleCredentials, ...userProfile };
  console.log(joinedUserData)
  return joinedUserData;
}

export async function oauthLogin(
  providerName: OAuthProvider
): Promise<firebase.auth.UserCredential | undefined> {
  const provider = (() => {
    switch (providerName) {
      case "facebook":
        return new firebase.auth.FacebookAuthProvider();
      case "google":
        return new firebase.auth.GoogleAuthProvider();
      default:
        return null;
    }
  })();

  if (!provider) {
    throw new Error(`The provider "${providerName}" is unsupported`);
  }

  try {
    return await firebase.auth().signInWithPopup(provider);
  } catch (error) {
    // Handle Errors here.
    if (error.code === "auth/account-exists-with-different-credential") {
      // ... link with existing account
    } else {
      throw new Error(`Error trying to login with firebase oauth: ${error}`);
    }
  }
}

export const loginWithPhone = {
  confirmationResult: {
    confirm: (verificationCode: string) =>
      Promise.resolve({} as firebase.auth.UserCredential),
  },
  setRecaptcha(
    htmlElmId: string,
    options: { callback?: () => void; "expired-callback"?: () => void; }
  ) {
    // uncomment the line below to skip recaptcha verification
    // firebase.auth().settings.appVerificationDisabledForTesting = true;
    return new firebase.auth.RecaptchaVerifier(htmlElmId, {
      ...options,
      size: "invisible",
    });
  },
  async attemptLogin(
    phoneNumber: string,
    appVerifier: firebase.auth.ApplicationVerifier
  ) {
    this.confirmationResult = await firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier);
  },
  async confirmCode(code: string) {
    try {
      const result = await this.confirmationResult.confirm(code);
      const userToken = await result.user?.getIdToken();

      localStorage.setItem("accessToken", userToken as string);

      return result;
    } catch (error) {
      return error;
    }
  },
};

// Argyle Auth

export type SaveArgyleUser = {
  userId: string
  userToken: string
};

export async function createArgyleUser(data: SaveArgyleUser) {
  try {
    return await POST("/users/me/argyle", data);
  } catch (error) {
    throw new Error(`Error when trying Creating a Argyle User:\n ${error}`);
  }
}

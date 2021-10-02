import userStore from "../stores/user.store";
import { getUserProfile } from "./api";
import router from "../router/router";
import firebase from "firebase";

export async function processLogin(data?: firebase.auth.UserCredential) {
  if (data){
    userStore.loadFirebaseUserData(data)
  }
  const userProfile = await getUserProfile(data);
  userStore.loadProfile(userProfile);
  return router.push("/argyle/link");
}

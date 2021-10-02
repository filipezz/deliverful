import { ActionTree, MutationTree, GetterTree } from "vuex";
import {
  BasicInformation,
  SaveUserProfile,
  Profile,
  DriverLicenseData,
  DriverResume
} from "../types/user";
export const strict = false;

// eslint-disable-next-line
export type RootState = ReturnType<typeof state>;

export const state = () => ({
  profile: {} as Profile,
  user: {},
  userToken: null,
  basicInformation: {} as BasicInformation,
  requirementsInfo: {},
  driverLicenseData: {} as DriverLicenseData,
  driverResume: {} as DriverResume,
  danglingProfileId: null,
  sourceQueryStrings: {},
  argyleData: {},
  companyId: "",
  snackbar: {
    content: "",
    color: "",
    timeout: 1000
  }
});

export const mutations: MutationTree<RootState> = {
  showMessage(state, payload) {
    state.snackbar.content = payload.content;
    state.snackbar.color = payload.color;
    state.snackbar.timeout = payload.timeout;
  },
  setLoggedUser(state, payload) {
    state.profile = payload;
  },
  setUser(state, payload) {
    state.user = payload;
  },
  setUserToken(state, payload) {
    state.userToken = payload;
  },
  saveBasicInfo(state, payload) {
    state.basicInformation = payload;
  },
  saveRequirementsInfo(state, payload) {
    state.requirementsInfo = payload;
  },
  setArgyleData(state, payload) {
    state.argyleData = payload;
  },
  setDriverLicenseData(state, payload) {
    state.driverLicenseData = payload;
  },
  setDriverResume(state, payload) {
    state.driverResume = payload;
  },
  setDanglingProfileId(state, payload) {
    state.danglingProfileId = payload;
  },
  setSourceQueryStrings(state, payload) {
    state.sourceQueryStrings = payload;
  },

  setCompanyId(state, payload) {
    state.companyId = payload;
  }
};

export const actions: ActionTree<RootState, RootState> = {
  async loginWithEmail({ dispatch }, { email, password }) {
    const response = await this.$axios.post("/auth/signin", {
      email,
      password
    });

    const userToken = response.data.user.stsTokenManager.accessToken;

    dispatch("setUserToken", userToken);
    await dispatch("getUser");
    await dispatch("getUserProfile");
  },
  async registerWithEmail({ getters }, { email, password }) {
    const danglingId = getters.getDanglingProfileId;
    await this.$axios.post(
      "/auth/register",
      {
        email,
        password
      },
      {
        headers: {
          "x-dangling-profile-id": danglingId
        }
      }
    );
  },
  async saveUserProfile(_, userInfo: SaveUserProfile) {
    const { email, name, phone, picture, birthDate } = userInfo;
    await this.$axios.post("/profiles/me", {
      email,
      name,
      phone,
      picture,
      birthDate
    });
  },
  async getUserProfile({ commit }) {
    const response = await this.$axios.get("/profiles/me");
    commit("setLoggedUser", response.data);
  },
  async getUser({ commit }) {
    const response = await this.$axios.get("/users/me");
    commit("setUser", response.data);
  },
  async getArgyleData({ commit }) {
    const user = await this.$axios.get("/users/me");
    if (!user.data.argyle) {
      return commit("setArgyleData", null);
    }
    const argyleUserId = user.data?.argyle.userId;
    const query = {
      userId: argyleUserId
    };
    const response = await this.$axios.get("/users/argyle-data", {
      params: query
    });
    commit("setArgyleData", response.data);
  },
  setUserToken({ commit }, userToken) {
    commit("setUserToken", userToken);
  },
  setDanglingProfileId({ commit }, id) {
    commit("setDanglingProfileId", id);
  },

  setCompanyId({ commit }, companyId) {
    commit("setCompanyId", companyId);
  }
};

export const getters: GetterTree<RootState, RootState> = {
  getLoggedUser(state) {
    return state.profile;
  },
  getUser(state) {
    return state.user;
  },
  getArgyleData(state) {
    return state.argyleData;
  },
  getPersonalInformation({ basicInformation }): Object {
    const { personalInformationData } = basicInformation;
    const name =
      personalInformationData["first name"].value +
      " " +
      personalInformationData["last name"].value;
    return {
      email: personalInformationData.email.value,
      name,
      phone: personalInformationData["phone number"].value,
      birthDate: personalInformationData.birthdate.value
    };
  },
  getAddressInformation({ basicInformation }): Object {
    const { addressInformationData } = basicInformation;

    return {
      city: addressInformationData.city.value,
      line1: addressInformationData["line 1"].value,
      line2: addressInformationData["line 2"].value,
      postalCode: addressInformationData["postal code"].value,
      state: addressInformationData.state.value
    };
  },
  getDriverResume({ driverResume }): Object {
    return {
      fileName: driverResume.fileName,
      url: driverResume.url
    };
  },
  getDriverLicense({ driverLicenseData }): Object {
    return {
      number: driverLicenseData.number,
      expirationDate: driverLicenseData.expirationDate,
      licenseType: driverLicenseData.licenseType,
      issuedDate: driverLicenseData.issuedDate,
      backFileUrl: driverLicenseData.backFileUrl,
      frontFileUrl: driverLicenseData.frontFileUrl
    };
  },
  getAvailabilityData({ basicInformation }) {
    const { availabilityData } = basicInformation;

    type Days = {
      [key: string]: number;
    };
    const days: Days = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thrusday: 4,
      Friday: 5,
      Saturday: 6
    };
    const output: Array<Object | null> = [
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ];
    availabilityData.map((item) => {
      output[days[item.weekDay]] = {
        startsAt: item.startTime,
        endsAt: item.endTime
      };
    });
    return output;
  },
  getRequirementForm({ requirementsInfo }) {
    return requirementsInfo;
  },
  getDanglingProfileId({ danglingProfileId }) {
    return danglingProfileId;
  },
  getSourceQueryStrings({ sourceQueryStrings }) {
    return sourceQueryStrings;
  },

  getCompanyId({ companyId }) {
    return companyId;
  },
  getUserToken({ userToken }) {
    return userToken;
  }
};

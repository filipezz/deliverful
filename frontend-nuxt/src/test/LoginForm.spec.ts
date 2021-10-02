import Vue from "vue";
import Vuetify from "vuetify";
import { mount, createLocalVue, Wrapper } from "@vue/test-utils";
// @ts-ignore
import { VueMaskDirective } from "v-mask";
import { expect } from "@jest/globals";

import RegisterForm from "@/components/RegisterForm.vue";

Vue.directive("mask", VueMaskDirective);

Vue.use(Vuetify);

describe("Login Form component", () => {
  const localVue = createLocalVue();
  let wrapper: Wrapper<Vue>;
  beforeEach(() => {
    wrapper = mount(RegisterForm, {
      localVue,
      vuetify: new Vuetify(),
      stubs: {
        NuxtLink: true
      }
    });
  });
  it("should mount as a vue component", () => {
    expect(wrapper.vm).toBeTruthy();
  });
  it("should validate email input correctly when user inputs a VALID email", async () => {
    const emailInput = wrapper.find("form>div:nth-child(1) input");
    await emailInput.setValue("user@gmail.com");
    await Vue.nextTick();
    expect(wrapper.find(".error--text").exists()).toBe(false);
  });
  it("should validate email input correctly when user inputs a INVALID email", async () => {
    const emailInput = wrapper.find("form>div:nth-child(1) input");
    await emailInput.setValue("user");
    await Vue.nextTick();
    expect(wrapper.find(".error--text").text()).toBe("E-mail must be valid");
  });
  it("should validate email input correctly when user leaves it blank", async () => {
    const emailInput = wrapper.find("form>div:nth-child(1) input");
    await emailInput.setValue(" ");
    await emailInput.setValue("");
    await Vue.nextTick();
    expect(wrapper.find(".error--text").text()).toBe("This field is required");
  });
  it("should validate password input correctly when user inputs a VALID password", async () => {
    const passwordInput = wrapper.find("form>div:nth-child(2) input");
    await passwordInput.setValue("123456");

    await Vue.nextTick();
    expect(wrapper.find(".error--text").exists()).toBe(false);
  });
  it("should validate password input correctly when user inputs a password with less than 6 characters", async () => {
    const passwordInput = wrapper.find("form>div:nth-child(2) input");
    await passwordInput.setValue("12345");

    await Vue.nextTick();
    expect(wrapper.find(".error--text").text()).toBe(
      "Must have at least 6 characters"
    );
  });
  it("should validate password input correctly when user leaves input blank", async () => {
    const passwordInput = wrapper.find("form>div:nth-child(2) input");
    await passwordInput.setValue(" ");
    await passwordInput.setValue("");

    await Vue.nextTick();
    expect(wrapper.find(".error--text").text()).toBe("This field is required");
  });
  it("should validate Confirm Password input when user inputs different value as Password field ", async () => {
    const passwordInput = wrapper.find("form>div:nth-child(2) input");
    const confirmPasswordField = wrapper.find("form>div:nth-child(3) input");

    await passwordInput.setValue("123456");
    await confirmPasswordField.setValue("1234566");

    await Vue.nextTick();
    expect(wrapper.find(".error--text").text()).toBe("Passwords must match");
  });
  it("should have the button disabled if the form is empty", () => {
    const submitButton = wrapper.find("form>.login-button");
    expect(submitButton.attributes("disabled")).toBeTruthy();
  });
  it("shouldn't have the button disabled if the form is filled", async () => {
    await wrapper.setData({
      email: "user@gmail.com",
      password: "123456",
      confirmPassword: "123456"
    });

    const submitButton = wrapper.find("form>.login-button");

    await Vue.nextTick();
    expect(submitButton.attributes("disabled")).toBeFalsy();
  });
  it("should have the button disabled if the form is filled wrongly", async () => {
    await wrapper.setData({
      email: "user@gmail.com",
      password: "123456"
    });

    const submitButton = wrapper.find("form>.login-button");

    await Vue.nextTick();
    expect(submitButton.attributes("disabled")).toBeTruthy();
  });
});

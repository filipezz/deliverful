import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export function createRouter(ssrContext, createDefaultRouter, routerOptions) {
  const options = routerOptions || createDefaultRouter(ssrContext).options;
  const hostname = ssrContext ? ssrContext.req.headers.host : location.host;
  return new Router({
    ...options,
    routes: fixRoutes(options.routes, hostname)
  });
}

function fixRoutes(defaultRoutes, hostname) {
  if (hostname.includes("survey")) return rideshareGuyRoutes(defaultRoutes);

  return deliverfulRoutes(defaultRoutes);
}

function deliverfulRoutes(defaultRoutes) {
  return defaultRoutes.filter((r) => r.name !== "survey");
}

function rideshareGuyRoutes(defaultRoutes) {
  const route = defaultRoutes.find((r) => r.name === "survey");
  route.path = "/";
  return [route];
}

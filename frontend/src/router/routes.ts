import { RouteRecordRaw } from 'vue-router';
import { person } from 'ionicons/icons';

type Route = {
  title?: string
  icon?: string
  displayInMenu?: boolean | (() => boolean) // defaults: isMenuRoute ? true : false
}&RouteRecordRaw

export const menuRoutes: Array<Route> = [
  {
    title: 'Register',
    path: '/auth/register', // Login or Register
    icon: person,
    component: () => import ('../views/LoginRegister.vue'),
    props: { action: 'Register' },
  },
  {
    title: 'Login',
    path: '/auth/login', // Login or Register
    icon: person,
    component: () => import ('../views/LoginRegister.vue'),
    props: { action: 'Sign In' },
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: person,
    component: () => import ('../views/Profile.vue'),
  },

]

export const directLinkRoutes: Array<Route> = [
  {
    title: 'Phone Login',
    path: '/auth/phone-login', // Login or Register
    icon: person,
    component: () => import ('../views/LoginRegister.vue'),
    props: { action: 'Sign In' },
  },
  {
    title: 'Register with Phone',
    path: '/auth/phone-register', // Login or Register
    icon: person,
    component: () => import ('../views/LoginRegister.vue'),
    props: { action: 'Register' },
  },
  {
    title: 'Argyle Link',
    path: '/argyle/link',
    component: () => import ('../views/ArgyleLink.vue'),
  },
]

export const redirectRoutes: Array<Route> = [
  {
    path: '',
    redirect: '/auth/login'
  },
  {
    path: '/',
    redirect: ''
  }
]

export const routes = menuRoutes.concat(directLinkRoutes).concat(redirectRoutes)
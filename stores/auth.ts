import { defineStore } from 'pinia'

export const useAuthStore = defineStore({
  id: 'auth',
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,

        // Just persist everything
        //paths: ['authorization'],
      },
    ],
  },
  state: () => ({
    authorization: null,
    loggedin: false,
    id: 0,
    name: '',
    email: '',
    publicsettings: {},
    super: false,
    username: '',
    masquerading: false
  }),
  actions: {
    setToken(authorization: string | null) {
      this.authorization = authorization
    },
    setUser(user: any) {
      if (user != null && user.id !== 0) {
        this.loggedin = true;
        this.id = user.id;
        this.name = user.name
        this.email = user.email
        this.publicsettings = user.publicsettings
        this.super = user.super;
        this.username = user.username;
        this.masquerading = false;
      } else {
        this.logout();
      }
    },
    logout() {
      this.authorization = null;
      this.loggedin = false;
      this.id = 0;
      this.name = ''
      this.email = ''
      this.publicsettings = {};
      this.super = false;
      this.username = '';
      this.masquerading = false;
    }
  },
  getters: {
    /*getToken: (state: { authorization: string | null }) => {
      return state.authorization
    }*/
  },
}
)
export default defineNuxtRouteMiddleware((to, from) => {
  // isAuthenticated() is an example method verifying if an user is authenticated
  console.log('defineNuxtRouteMiddleware')
  // if (isAuthenticated() === false) {
  //  return navigateTo('/login')
  // }
})

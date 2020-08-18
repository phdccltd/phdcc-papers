export default async function ({ $auth, redirect, store }) {
  //console.log('AUTHUSER')
  const user = $auth.user
  if (user) {
    // let the user in
  } else {
    redirect('/login')
  }
}

export default async function ({ $auth, redirect, store }) {
  const user = $auth.user
  if (user) {
    // let the user in
  } else {
    redirect('/login')
  }
}

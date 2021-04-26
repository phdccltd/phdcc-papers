export default async function ({ $auth, redirect, store }) {
  const user = $auth.user
  if (user && user.super) {
    console.log('SUPER USER')
  } else {
    console.log('NOT SUPER')
    redirect('/')
  }
}

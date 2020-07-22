export default async function ({ $auth, redirect, store }) {
  console.log("MIDDLEWARE authsuper")
  let user = $auth.user;
  if (user && user.super) {
    console.log("SUPER USER")
    // let the user in
  } else {
    console.log("NOT SUPER")
    redirect('/')
  }
}

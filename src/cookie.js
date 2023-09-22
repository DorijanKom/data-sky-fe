import Cookies from "js-cookie";

function checkSessionCookie() {
  const sessionCookie = Cookies.get('csrftoken');
  return sessionCookie;
}

export { checkSessionCookie };

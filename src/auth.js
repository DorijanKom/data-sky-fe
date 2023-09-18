import Cookies from "js-cookie";

function checkSessionCookie() {
  const sessionCookie = Cookies.get('data_sky_session');
  return !!sessionCookie;
}

export { checkSessionCookie };

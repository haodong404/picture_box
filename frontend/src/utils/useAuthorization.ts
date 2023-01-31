import { useNavigate } from "@solidjs/router";

const PASSWORD_KEY = "password";

export function getPwd() {
  return localStorage.getItem(PASSWORD_KEY);
}

export function storePwd(pwd: string) {
  localStorage.setItem(PASSWORD_KEY, pwd);
}

export function checkPwd() {
  const navigate = useNavigate();
  if (getPwd() == null) {
    navigate("/");
  }
  return getPwd();
}

export function refresh() {
  const navigate = useNavigate();
  localStorage.removeItem(PASSWORD_KEY);
  navigate("/");
}

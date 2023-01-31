import { useNavigate } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { listPartitions, auth } from "../api/api";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Placeholder from "../components/Placeholder";
import { getPwd, storePwd } from "../utils/useAuthorization";

export default function Login() {
  const navigate = useNavigate();
  if (getPwd() != null) {
    navigate("/partitions");
    return;
  }
  const [pwdInput, setPwdInput] = createSignal(null);
  const [confirmedPwd, setConfirmedPwd] = createSignal(null);
  const [authRes] = createResource(confirmedPwd, auth);

  createEffect(() => {
    try {
      if (authRes.state === "ready" && authRes() !== undefined) {
        navigate("/partitions");
        storePwd(confirmedPwd());
      }
    } catch (_) {}
  });
  return (
    <div
      class="flex justify-center items-center absolute bottom-0 left-0 right-0"
      style={{
        top: "-66px",
      }}
    >
      <ErrorBoundary fallback={(e) => <Placeholder text={e} />}>
        <Card class="p-6">
          <h1 class="text-xl font-bold mt-0 text-blue-900">Password</h1>
          <p
            class="text-sm text-red-500 pb-2 font-light"
            classList={{
              hidden: !authRes.error,
            }}
          >
            Authorization Failed.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setConfirmedPwd(pwdInput());
            }}
          >
            <div class="relative w-70 h-11 inline-block">
              <Input
                name="password"
                autocomplete="on"
                required
                class="absolute top-0 right-0 left-0 right-0"
                value={pwdInput()}
                onChange={(e) => {
                  setPwdInput(e.currentTarget.value);
                }}
                disabled={authRes.loading}
                placeholder="Empty if you don't have password."
                type="password"
              />
              <div
                class="backdrop-blur-[2px] backdrop-brightness-95 rounded-lg inline-block absolute left-0 top-0 right-0 bottom-0"
                classList={{
                  hidden: !authRes.loading,
                }}
              >
                <Loading />
              </div>
            </div>
            <div>
              <Button
                disabled={authRes.loading}
                type="submit"
                class="w-full mt-4"
              >
                Authorization
              </Button>
            </div>
          </form>
        </Card>
      </ErrorBoundary>
    </div>
  );
}

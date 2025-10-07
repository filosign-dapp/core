import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import { Button } from "../../../lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../lib/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletClient } from "wagmi";
import { formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  KeyIcon,
  CheckCircleIcon,
  XIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

export function AuthenticationTest() {
  const { user, login: loginPrivy, logout: logoutPrivy } = usePrivy();
  const queryClient = useQueryClient();

  const login = useFilosignMutation(["login"]);
  const register = useFilosignMutation(["register"]);
  const logout = useFilosignMutation(["logout"]);
  const isRegistered = useFilosignQuery(["isRegistered"], undefined);
  const isLoggedIn = useFilosignQuery(["isLoggedIn"], undefined);

  async function handleRegisterFilosign() {
    try {
      await register.mutateAsync({ pin: "111111" });
      await queryClient.invalidateQueries({
        queryKey: ["filosign", "isRegistered"],
      });
      console.log("register", register.isSuccess, register.isError);
    } catch (error) {
      console.error("Failed to register", error);
    }
  }

  async function handleLoginFilosign() {
    try {
      await login.mutateAsync({ pin: "111111" });
      // Invalidate isLoggedIn query to refetch with new JWT
      await queryClient.invalidateQueries({
        queryKey: ["filosign", "isLoggedIn"],
      });
      console.log("login", login.isSuccess, login.isError);
    } catch (error) {
      console.error("Failed to login", error);
    }
  }

  async function handleLogoutFilosign() {
    try {
      await logout.mutateAsync(undefined);
      // Invalidate isLoggedIn query to refetch with updated state
      await queryClient.invalidateQueries({
        queryKey: ["filosign", "isLoggedIn"],
      });
      console.log("logout", logout.isSuccess, logout.isError);
    } catch (error) {
      console.error("Failed to logout", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Privy Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Privy Authentication
            </CardTitle>
            <CardDescription>
              Connect and disconnect your wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              {!user ? (
                <Button
                  onClick={() => loginPrivy()}
                  className="flex-1"
                  size="lg"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Login with Privy
                </Button>
              ) : (
                <Button
                  onClick={() => logoutPrivy()}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Logout from Privy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filosign Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Filosign Authentication
            </CardTitle>
            <CardDescription>
              Register and authenticate with Filosign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {!isRegistered.data && (
                <Button
                  onClick={handleRegisterFilosign}
                  disabled={register.isPending}
                  className="w-full"
                  size="lg"
                >
                  {register.isPending ? (
                    <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                  )}
                  Register with Filosign
                </Button>
              )}

              {!isLoggedIn.data && isRegistered.data && (
                <Button
                  onClick={handleLoginFilosign}
                  disabled={login.isPending}
                  className="w-full"
                  size="lg"
                >
                  {login.isPending ? (
                    <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <KeyIcon className="w-4 h-4 mr-2" />
                  )}
                  Login to Filosign
                </Button>
              )}

              {isLoggedIn.data && (
                <Button
                  onClick={handleLogoutFilosign}
                  disabled={logout.isPending}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {logout.isPending ? (
                    <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XIcon className="w-4 h-4 mr-2" />
                  )}
                  Logout from Filosign
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

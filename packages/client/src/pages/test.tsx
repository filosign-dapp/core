import { useFilosignMutation } from "@filosign/sdk/react";
import { Button } from "../lib/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useWalletClient } from "wagmi";
import { formatEther } from "viem";

export default function TestPage() {
  const { user, login: loginPrivy, logout: logoutPrivy } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const login = useFilosignMutation(["login"]);
  const register = useFilosignMutation(["register"]);
  const { data: balance } = useBalance({
    address: walletClient?.account.address,
  });

  async function handleRegisterFilosign() {
    try {
      await register.mutateAsync({ pin: "222222" });
      console.log("register", register.isSuccess, register.isError);
      alert("Registered with Filosign");
    } catch (error) {
      console.error("Failed to register", error);
    }
  }

  async function handleLoginFilosign() {
    try {
      await login.mutateAsync({ pin: "222222" });
      console.log("login", login.isSuccess, login.isError);
      alert("Logged in with Filosign");
    } catch (error) {
      console.error("Failed to login", error);
    }
  }

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      {user && (
        <div>
          <p>User: {user?.wallet?.address}</p>
          {walletClient && "Wallet client connected"}
          {!walletClient && "Wallet client not connected"}
          {balance && <p>Balance: {formatEther(balance.value)} tFIL</p>}
          {!balance && <p>No balance</p>}
        </div>
      )}
      {!user && <Button onClick={() => loginPrivy()}>Login with Privy</Button>}
      {user && <Button onClick={() => logoutPrivy()}>Logout with Privy</Button>}
      <Button onClick={handleRegisterFilosign}>Register with Filosign</Button>
      <Button onClick={handleLoginFilosign}>Login with Filosign</Button>
    </div>
  );
}

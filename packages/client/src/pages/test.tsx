import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import { Button } from "../lib/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useWalletClient } from "wagmi";
import { formatEther } from "viem";

export default function TestPage() {
  const { user, login: loginPrivy, logout: logoutPrivy } = usePrivy();
  const { data: walletClient } = useWalletClient();

  const { data: balance } = useBalance({
    address: walletClient?.account.address,
  });

  const login = useFilosignMutation(["login"]);
  const register = useFilosignMutation(["register"]);
  const isRegistered = useFilosignQuery(["isRegistered"], undefined);

  // Sender's side
  const sendShareRequest = useFilosignMutation([
    "shareCapability",
    "sendShareRequest",
  ]);
  const cancelShareRequest = useFilosignMutation([
    "shareCapability",
    "cancelShareRequest",
  ]);
  const sentShareRequests = useFilosignQuery(
    ["shareCapability", "getSentRequests"],
    undefined,
  );
  const allowedListSender = useFilosignQuery(
    ["shareCapability", "getPeopleCanSendTo"],
    undefined,
  );

  // Receiver's side
  const allowSharing = useFilosignMutation(["shareCapability", "allowSharing"]);
  const allowedList = useFilosignQuery(
    ["shareCapability", "getPeopleCanReceiveFrom"],
    undefined,
  );
  const receivedShareRequests = useFilosignQuery(
    ["shareCapability", "getReceivedRequests"],
    undefined,
  );

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
    <div className="h-screen flex flex-col gap-4 items-center justify-center p-4">
      {user && (
        <div>
          <p>User: {user?.wallet?.address}</p>
          {walletClient && <p>Wallet client present</p>}
          {balance && <p>Balance: {formatEther(balance.value)} tFIL</p>}
          {isRegistered && <p>Registered with Filosign</p>}

          <div className="mt-4 space-y-2">
            <div>
              <strong>Sent Requests:</strong>{" "}
              {sentShareRequests.isLoading
                ? "Loading..."
                : JSON.stringify(sentShareRequests.data || [])}
            </div>
            <div>
              <strong>Can Send To:</strong>{" "}
              {allowedListSender.isLoading
                ? "Loading..."
                : JSON.stringify(allowedListSender.data || [])}
            </div>
            <div>
              <strong>Received Requests:</strong>{" "}
              {receivedShareRequests.isLoading
                ? "Loading..."
                : JSON.stringify(receivedShareRequests.data || [])}
            </div>
            <div>
              <strong>Can Receive From:</strong>{" "}
              {allowedList.isLoading
                ? "Loading..."
                : JSON.stringify(allowedList.data || [])}
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        {!user && <Button onClick={() => loginPrivy()}>Login Privy</Button>}
        {user && <Button onClick={() => logoutPrivy()}>Logout Privy</Button>}
        {!isRegistered && (
          <Button onClick={handleRegisterFilosign}>Register</Button>
        )}
        <Button onClick={handleLoginFilosign}>Login Filosign</Button>
      </div>
    </div>
  );
}

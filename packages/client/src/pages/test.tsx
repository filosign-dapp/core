import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import { Button } from "../lib/components/ui/button";
import { Input } from "../lib/components/ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useWalletClient } from "wagmi";
import { formatEther } from "viem";
import { useState } from "react";

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

  // Input states for shareCapability testing
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [requestIdToCancel, setRequestIdToCancel] = useState("");
  const [senderWalletToAllow, setSenderWalletToAllow] = useState("");

  async function handleRegisterFilosign() {
    try {
      await register.mutateAsync({ pin: "111111" });
      console.log("register", register.isSuccess, register.isError);
      alert("Registered with Filosign");
    } catch (error) {
      console.error("Failed to register", error);
    }
  }

  async function handleLoginFilosign() {
    try {
      await login.mutateAsync({ pin: "111111" });
      console.log("login", login.isSuccess, login.isError);
      alert("Logged in with Filosign");
    } catch (error) {
      console.error("Failed to login", error);
    }
  }

  async function handleSendShareRequest() {
    if (!sendToAddress.trim() || !sendMessage.trim()) return;
    try {
      await sendShareRequest.mutateAsync({
        recipientWallet: sendToAddress as `0x${string}`,
        message: sendMessage,
      });
      console.log("Sent share request");
      alert("Share request sent!");
      setSendToAddress("");
      setSendMessage("");
    } catch (error) {
      console.error("Failed to send share request", error);
      alert("Failed to send share request");
    }
  }

  async function handleCancelShareRequest() {
    if (!requestIdToCancel.trim()) return;
    try {
      await cancelShareRequest.mutateAsync({ requestId: requestIdToCancel });
      console.log("Cancelled share request");
      alert("Share request cancelled!");
      setRequestIdToCancel("");
    } catch (error) {
      console.error("Failed to cancel share request", error);
      alert("Failed to cancel share request");
    }
  }

  async function handleAllowSharing() {
    if (!senderWalletToAllow.trim()) return;
    try {
      await allowSharing.mutateAsync({
        senderWallet: senderWalletToAllow as `0x${string}`,
      });
      console.log("Allowed sharing");
      alert("Sharing allowed!");
      setSenderWalletToAllow("");
    } catch (error) {
      console.error("Failed to allow sharing", error);
      alert("Failed to allow sharing");
    }
  }

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center p-4">
      {user && (
        <div>
          <p>User: {user?.wallet?.address}</p>
          {walletClient && <p>Wallet client present</p>}
          {balance && <p>Balance: {formatEther(balance.value)} tFIL</p>}
          {isRegistered.data && <p>Registered with Filosign</p>}

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
      <div className="flex gap-2 flex-wrap">
        {!user && <Button onClick={() => loginPrivy()}>Login Privy</Button>}
        {user && <Button onClick={() => logoutPrivy()}>Logout Privy</Button>}
        {!isRegistered.data && (
          <Button onClick={handleRegisterFilosign}>Register</Button>
        )}
        <Button onClick={handleLoginFilosign}>Login Filosign</Button>
      </div>

      {/* ShareCapability Testing Inputs */}
      {user && (
        <div className="mt-8 p-4 border rounded-lg w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">
            ShareCapability Testing
          </h3>

          <div className="space-y-4">
            {/* Send Share Request */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Recipient wallet address"
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Message"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendShareRequest}
                  disabled={
                    !sendToAddress.trim() ||
                    !sendMessage.trim() ||
                    sendShareRequest.isPending
                  }
                >
                  Send Request
                </Button>
              </div>
            </div>

            {/* Cancel Share Request */}
            <div className="flex gap-2">
              <Input
                placeholder="Request ID to cancel"
                value={requestIdToCancel}
                onChange={(e) => setRequestIdToCancel(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCancelShareRequest}
                disabled={
                  !requestIdToCancel.trim() || cancelShareRequest.isPending
                }
              >
                Cancel Request
              </Button>
            </div>

            {/* Allow Sharing */}
            <div className="flex gap-2">
              <Input
                placeholder="Sender wallet address to allow"
                value={senderWalletToAllow}
                onChange={(e) => setSenderWalletToAllow(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAllowSharing}
                disabled={!senderWalletToAllow.trim() || allowSharing.isPending}
              >
                Allow Sharing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

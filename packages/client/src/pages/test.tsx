import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import { Button } from "../lib/components/ui/button";
import { Input } from "../lib/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../lib/components/ui/card";
import { Badge } from "../lib/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../lib/components/ui/tabs";
import { Separator } from "../lib/components/ui/separator";
import { Label } from "../lib/components/ui/label";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useWalletClient } from "wagmi";
import { formatEther } from "viem";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  WalletIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperPlaneIcon,
  XIcon,
  UserCheckIcon,
  EyeIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

export default function TestPage() {
  const { user, login: loginPrivy, logout: logoutPrivy } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const { data: balance } = useBalance({
    address: walletClient?.account.address,
  });

  const login = useFilosignMutation(["login"]);
  const register = useFilosignMutation(["register"]);
  const logout = useFilosignMutation(["logout"]);
  const isRegistered = useFilosignQuery(["isRegistered"], undefined);
  const isLoggedIn = useFilosignQuery(["isLoggedIn"], undefined);

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

  console.log(
    "sentShareRequests",
    sentShareRequests.data,
    sentShareRequests.status,
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
      // Invalidate isLoggedIn query to refetch with new JWT
      await queryClient.invalidateQueries({
        queryKey: ["filosign", "isLoggedIn"],
      });
      console.log("login", login.isSuccess, login.isError);
      alert("Logged in with Filosign");
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
      alert("Logged out with Filosign");
    } catch (error) {
      console.error("Failed to logout", error);
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

  const StatusBadge = ({
    status,
    label,
  }: {
    status: boolean | undefined;
    label: string;
  }) => {
    if (status === undefined)
      return (
        <Badge variant="outline">
          <ClockIcon className="w-3 h-3 mr-1" />
          Loading
        </Badge>
      );
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? (
          <CheckCircleIcon className="w-3 h-3 mr-1" />
        ) : (
          <XCircleIcon className="w-3 h-3 mr-1" />
        )}
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Filosign Test Suite
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing interface for Filosign functionality
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current authentication and system state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Privy User</span>
                <StatusBadge
                  status={!!user}
                  label={user ? "Connected" : "Disconnected"}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet Client</span>
                <StatusBadge
                  status={!!walletClient}
                  label={walletClient ? "Available" : "Unavailable"}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filosign Registered</span>
                <StatusBadge
                  status={isRegistered.data}
                  label={isRegistered.data ? "Yes" : "No"}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filosign Logged In</span>
                <StatusBadge
                  status={isLoggedIn.data}
                  label={isLoggedIn.data ? "Yes" : "No"}
                />
              </div>
            </div>

            {user && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Wallet Address:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.wallet?.address}
                    </code>
                  </div>
                  {balance && (
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Balance:</span>
                      <Badge variant="outline">
                        {formatEther(balance.value)} tFIL
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Test Interface */}
        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger
              value="share-sender"
              className="flex items-center gap-2"
            >
              <PaperPlaneIcon className="w-4 h-4" />
              Share (Sender)
            </TabsTrigger>
            <TabsTrigger
              value="share-receiver"
              className="flex items-center gap-2"
            >
              <UserCheckIcon className="w-4 h-4" />
              Share (Receiver)
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
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
                          <UserCheckIcon className="w-4 h-4 mr-2" />
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
          </TabsContent>

          {/* Share Sender Tab */}
          <TabsContent value="share-sender" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Send Share Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PaperPlaneIcon className="w-5 h-5" />
                    Send Share Request
                  </CardTitle>
                  <CardDescription>
                    Send a sharing request to another wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="recipient-address">
                        Recipient Wallet Address
                      </Label>
                      <Input
                        id="recipient-address"
                        placeholder="0x..."
                        value={sendToAddress}
                        onChange={(e) => setSendToAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="share-message">Message</Label>
                      <Input
                        id="share-message"
                        placeholder="Enter your message..."
                        value={sendMessage}
                        onChange={(e) => setSendMessage(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleSendShareRequest}
                      disabled={
                        !sendToAddress.trim() ||
                        !sendMessage.trim() ||
                        sendShareRequest.isPending
                      }
                      className="w-full"
                      size="lg"
                    >
                      {sendShareRequest.isPending ? (
                        <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <PaperPlaneIcon className="w-4 h-4 mr-2" />
                      )}
                      Send Request
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Share Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XIcon className="w-5 h-5" />
                    Cancel Share Request
                  </CardTitle>
                  <CardDescription>
                    Cancel a previously sent sharing request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cancel-request-id">Request ID</Label>
                    <Input
                      id="cancel-request-id"
                      placeholder="Enter request ID..."
                      value={requestIdToCancel}
                      onChange={(e) => setRequestIdToCancel(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCancelShareRequest}
                    disabled={
                      !requestIdToCancel.trim() || cancelShareRequest.isPending
                    }
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    {cancelShareRequest.isPending ? (
                      <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XIcon className="w-4 h-4 mr-2" />
                    )}
                    Cancel Request
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sender Data Display */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Sent Requests</CardTitle>
                    <Button
                      onClick={() => sentShareRequests.refetch()}
                      disabled={sentShareRequests.isFetching}
                      variant="outline"
                      size="sm"
                    >
                      {sentShareRequests.isFetching ? (
                        <SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <EyeIcon className="w-3 h-3 mr-1" />
                      )}
                      Refetch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
                    {sentShareRequests.isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(sentShareRequests.data || [], null, 2)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Can Send To</CardTitle>
                    <Button
                      onClick={() => allowedListSender.refetch()}
                      disabled={allowedListSender.isFetching}
                      variant="outline"
                      size="sm"
                    >
                      {allowedListSender.isFetching ? (
                        <SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <EyeIcon className="w-3 h-3 mr-1" />
                      )}
                      Refetch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
                    {allowedListSender.isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(allowedListSender.data || [], null, 2)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Share Receiver Tab */}
          <TabsContent value="share-receiver" className="space-y-6">
            {/* Allow Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheckIcon className="w-5 h-5" />
                  Allow Sharing
                </CardTitle>
                <CardDescription>
                  Allow a sender to share documents with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="allow-sender-address">
                    Sender Wallet Address
                  </Label>
                  <Input
                    id="allow-sender-address"
                    placeholder="0x..."
                    value={senderWalletToAllow}
                    onChange={(e) => setSenderWalletToAllow(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAllowSharing}
                  disabled={
                    !senderWalletToAllow.trim() || allowSharing.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {allowSharing.isPending ? (
                    <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheckIcon className="w-4 h-4 mr-2" />
                  )}
                  Allow Sharing
                </Button>
              </CardContent>
            </Card>

            {/* Receiver Data Display */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Received Requests</CardTitle>
                    <Button
                      onClick={() => receivedShareRequests.refetch()}
                      disabled={receivedShareRequests.isFetching}
                      variant="outline"
                      size="sm"
                    >
                      {receivedShareRequests.isFetching ? (
                        <SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <EyeIcon className="w-3 h-3 mr-1" />
                      )}
                      Refetch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
                    {receivedShareRequests.isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(
                          receivedShareRequests.data || [],
                          null,
                          2,
                        )}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Can Receive From</CardTitle>
                    <Button
                      onClick={() => allowedList.refetch()}
                      disabled={allowedList.isFetching}
                      variant="outline"
                      size="sm"
                    >
                      {allowedList.isFetching ? (
                        <SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <EyeIcon className="w-3 h-3 mr-1" />
                      )}
                      Refetch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
                    {allowedList.isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(allowedList.data || [], null, 2)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

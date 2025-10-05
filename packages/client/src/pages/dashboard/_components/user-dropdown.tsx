import * as React from "react";
import {
  UserIcon,
  GearIcon,
  BellIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/lib/components/ui/dropdown-menu";
import { Button } from "@/src/lib/components/ui/button";
import { Image } from "@/src/lib/components/custom/Image";
import { userData } from "./sidebar/mock";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { useFilosignMutation } from "@filosign/sdk/react";

export function UserDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { logout: logoutPrivy } = usePrivy();
  const logoutFilosign = useFilosignMutation(["logout"]);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logoutFilosign.mutateAsync(undefined);
    logoutPrivy();
    navigate({ to: "/", replace: true });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full transition-all duration-150 hover:bg-accent/50"
        >
          <div className="flex aspect-square size-8 items-center justify-center bg-muted/10 rounded-full">
            <Image
              src={userData.avatar}
              alt={userData.name}
              className="size-8 rounded-full object-cover"
            >
              <UserIcon
                className="size-5 text-muted-foreground"
                weight="bold"
              />
            </Image>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-lg mt-1"
        align="end"
        side="bottom"
      >
        {/* Profile Section */}
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Profile
        </DropdownMenuLabel>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 20,
            delay: 0.05,
          }}
        >
          <DropdownMenuItem className="gap-3 p-3 cursor-default">
            <div className="flex aspect-square size-10 items-center justify-center bg-muted/10 rounded-full">
              <Image
                src={userData.avatar}
                alt={userData.name}
                className="size-10 rounded-full object-cover"
              >
                <UserIcon className="size-6 text-muted-foreground" />
              </Image>
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-sm">{userData.name}</p>
              <p className="text-xs text-muted-foreground">{userData.email}</p>
            </div>
          </DropdownMenuItem>
        </motion.div>

        <DropdownMenuSeparator />

        {/* Actions Section */}
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Actions
        </DropdownMenuLabel>
        {[
          {
            icon: UserIcon,
            label: "Manage Profile",
            action: () => {
              navigate({ to: "/dashboard/settings/profile" });
            },
          },
          {
            icon: GearIcon,
            label: "Preferences",
            action: () => console.log("Preferences"),
          },
          {
            icon: BellIcon,
            label: "Notifications",
            action: () => console.log("Notifications"),
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
              delay: 0.1 + index * 0.03,
            }}
          >
            <DropdownMenuItem
              onClick={item.action}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md">
                <item.icon className="size-5 shrink-0" />
              </div>
              {item.label}
            </DropdownMenuItem>
          </motion.div>
        ))}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 20,
            delay: 0.2,
          }}
        >
          <DropdownMenuItem
            onClick={handleSignOut}
            className="gap-2 p-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <div className="flex size-6 items-center justify-center rounded-md">
              <SignOutIcon className="size-5 shrink-0 text-destructive" />
            </div>
            <div className="font-medium">Sign out</div>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  FileTextIcon,
  FileIcon,
  SignatureIcon,
  UsersIcon,
  ChartBarIcon,
  GearIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"

// This is sample data.
export const userData = {
  name: "Sarah Chen",
  email: "sarah.chen@filosign.com",
  avatar: undefined, // Set to undefined to show fallback icon
}

export const sidebarData = {
  user: userData,
  orgs: [
    {
      name: "Legal Partners LLP",
      logo: ShieldCheckIcon,
      plan: "Enterprise",
    },
    {
      name: "Blockchain Legal Co",
      logo: UsersIcon,
      plan: "Professional",
    },
    {
      name: "Digital Contracts Inc",
      logo: ChartBarIcon,
      plan: "Business",
    },
  ],
  navMain: [
    {
      title: "Documents",
      url: "#",
      icon: FileTextIcon,
      isActive: false,
      items: [
        {
          title: "All Documents",
          url: "/dashboard/document/all",
        },
        {
          title: "All Drafts",
          url: "#",
        },
        {
          title: "Awaiting Signatures",
          url: "#",
        },
        {
          title: "Signed Documents",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Signatures",
      url: "#",
      icon: SignatureIcon,
      items: [
        {
          title: "Create Signature",
          url: "/dashboard/signature/create",
        },
        {
          title: "Signature History",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: ChartBarIcon,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Profile Metrics",
          url: "#",
        },
        {
          title: "Compliance Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: GearIcon,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Security & Keys",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "API & Webhooks",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Q1 Contracts",
      url: "#",
      icon: FileTextIcon,
    },
    {
      name: "Client Agreements",
      url: "#",
      icon: UsersIcon,
    },
    {
      name: "Legal Documents",
      url: "#",
      icon: ShieldCheckIcon,
    },
    {
      name: "Partnership Deals",
      url: "#",
      icon: ChartBarIcon,
    },
  ],
}

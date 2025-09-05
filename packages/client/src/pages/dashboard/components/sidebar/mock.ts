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
export const sidebarData = {
  user: {
    name: "Sarah Chen",
    email: "sarah.chen@filosign.com",
    avatar: "/avatars/sarah-chen.jpg",
  },
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
          url: "#",
        },
        {
          title: "Draft Contracts",
          url: "#",
        },
        {
          title: "Awaiting Signatures",
          url: "#",
        },
        {
          title: "Signed & Verified",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Templates",
      url: "#",
      icon: FileIcon,
      items: [
        {
          title: "Contract Templates",
          url: "#",
        },
        {
          title: "Legal Forms",
          url: "#",
        },
        {
          title: "NDA Templates",
          url: "#",
        },
        {
          title: "Create Template",
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
          title: "Digital Signatures",
          url: "#",
        },
        {
          title: "Create Signature",
          url: "#",
        },
        {
          title: "Initials",
          url: "#",
        },
        {
          title: "Signature History",
          url: "#",
        },
      ],
    },
    {
      title: "Team",
      url: "#",
      icon: UsersIcon,
      items: [
        {
          title: "Team Members",
          url: "#",
        },
        {
          title: "Client Access",
          url: "#",
        },
        {
          title: "Signing Permissions",
          url: "#",
        },
        {
          title: "Audit Trail",
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
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Signing Analytics",
          url: "#",
        },
        {
          title: "Document Metrics",
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
          url: "#",
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

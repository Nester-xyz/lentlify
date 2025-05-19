import { lazy } from "react";

export const RouteList = [
  {
    pathName: "Home",
    path: "/",
    location: lazy(async () => await import("../pages/home")),
    exact: true,
  },
  {
    pathName: "Home",
    path: "/create-ad",
    location: lazy(async () => await import("../pages/create-ad")),
    exact: true,
  },
  {
    pathName: "CreateCampaign",
    path: "/create",
    location: lazy(async () => await import("../pages/create-campaign")),
    exact: true,
  },
  {
    pathName: "Campaign",
    path: "/campaign/:campaignId",
    location: lazy(async () => await import("../pages/campaign")),
    exact: true,
  },
  {
    pathName: "CampaignPost",
    path: "/campaign-post/:pId",
    location: lazy(async () => await import("../pages/campaign-post")),
    exact: true,
  },
  {
    pathName: "Campaign",
    path: "/campaign",
    location: lazy(async () => await import("../pages/campaign")),
    exact: true,
  },
  {
    pathName: "Campaign",
    path: "/campaign/new",
    location: lazy(async () => await import("../pages/create-campaign")),
    exact: true,
  },
  {
    pathName: "SingleCampaign",
    path: "/campaign/single",
    location: lazy(
      async () => await import("../pages/campaign/SingleCampaign")
    ),
    exact: true,
  },
  {
    pathName: "Wallet",
    path: "/wallet",
    location: lazy(async () => await import("../pages/wallet")),
    exact: true,
  },
  {
    pathName: "Profile",
    path: "/profile",
    location: lazy(async () => await import("../pages/profile")),
    exact: true,
  },
  {
    pathName: "CampaignGroup",
    path: "/campaign-group/:id",
    location: lazy(async () => await import("../pages/campaign-group")),
    exact: true,
  },
  {
    pathName: "page-not-found",
    path: "/",
    location: lazy(async () => await import("../pages/errors/404")),
    exact: true,
  },
];

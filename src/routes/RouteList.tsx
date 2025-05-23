import { lazy, type JSX, type LazyExoticComponent } from "react";
import React from "react";

type RouteItem = {
  pathName: string;
  path: string;
  location: LazyExoticComponent<React.FC>;
  exact?: boolean;
};

export const RouteList: RouteItem[] = [
  {
    pathName: "Home",
    path: "/",
    location: lazy(async () => await import("../pages/home")),
    exact: true,
  },
  {
    pathName: "Campaign",
    path: "/campaign",
    location: lazy(async () => await import("../pages/campaign")),
    exact: true,
  },
  {
    pathName: "Create Campaign",
    path: "/create",
    location: lazy(async () => await import("../pages/create-campaign")),
    exact: true,
  },
  {
    pathName: "SingleCampaign",
    path: "/campaign/:campaignId",
    location: lazy(
      async () => await import("../pages/campaign/SingleCampaign")
    ),
    exact: true,
  },
  {
    pathName: "Profile",
    path: "/profile",
    location: lazy(async () => await import("../pages/profile")),
    exact: true,
  },
  {
    pathName: "page-not-found",
    path: "*",
    location: lazy(async () => await import("../pages/errors/404")),
    exact: true,
  },
];

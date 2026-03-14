"use client";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { LogoVisibilityContext } from "./ClientRootLayout";
import { useCart } from "./CartContext";
import { usePathname } from "next/navigation";

export default function CartBar() {
  // CartBar is disabled for survey/testing mode
  return null;
}

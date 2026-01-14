"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_VIDEO_SRC = process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_SRC || "https://cdn.jsdelivr.net/gh/Shreyasswamy9/FruitstandNY/Videos/homevideo.mp4";

export default function BackgroundVideo({ src = DEFAULT_VIDEO_SRC }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | undefined>();
  const [duration, setDuration] = useState<number>(0);
  const [allowMotion, setAllowMotion] = useState<boolean>(true);
  const pathname = usePathname();

  const syncToScroll = (overrideDuration?: number) => {
    const video = videoRef.current;
    if (!video) return;
    const activeDuration = overrideDuration ?? duration ?? video.duration;
    if (!activeDuration || Number.isNaN(activeDuration)) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
    const nextTime = progress * activeDuration;
    if (!Number.isFinite(nextTime)) return;
    video.currentTime = Math.min(activeDuration, Math.max(0, nextTime));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handlePreference = () => setAllowMotion(!media.matches);
    handlePreference();
    media.addEventListener("change", handlePreference);
    return () => media.removeEventListener("change", handlePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowMotion) return;
    const handleMetadata = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      setDuration(video.duration);
      video.pause();
      syncToScroll(video.duration);
    };
    const handleLoaded = () => syncToScroll(video.duration);
    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("loadeddata", handleLoaded);
    if (video.readyState >= 1) {
      handleMetadata();
    }
    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("loadeddata", handleLoaded);
    };
  }, [allowMotion]);

  useEffect(() => {
    if (!allowMotion) return;
    syncToScroll();
  }, [pathname, allowMotion]);

  useEffect(() => {
    if (!allowMotion || !duration) return;
    const handleScroll = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(syncToScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [duration, allowMotion]);

  if (!src || !allowMotion) {
    return null;
  }

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          filter: "brightness(0.75)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}

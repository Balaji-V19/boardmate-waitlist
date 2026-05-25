'use client';

import { useEffect, useRef } from 'react';

type MascotVideoProps = {
  webm: string;
  mp4: string;
  ariaLabel: string;
  className?: string;
  /** Start playback when this flips true (e.g. success overlay opened). */
  active?: boolean;
  /** Defer autoplay until the element is on screen (below-the-fold clips). */
  playWhenVisible?: boolean;
};

/**
 * Decorative mascot loops must stay muted and inline so browsers allow autoplay.
 * HTML `autoplay` alone is flaky: with preload="metadata" the first play() often
 * runs before enough data is buffered, leaving a paused frame and the native
 * play overlay — especially on iOS Safari and after async UI (modals).
 */
export default function MascotVideo({
  webm,
  mp4,
  ariaLabel,
  className,
  active = true,
  playWhenVisible = false,
}: MascotVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !active) return;

    const prime = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
    };

    const tryPlay = () => {
      prime();
      if (playWhenVisible && !videoIsVisible(video)) return;
      const attempt = video.play();
      if (attempt !== undefined) {
        attempt.catch(() => {
          /* Autoplay blocked or not ready yet — event/interaction retries handle it. */
        });
      }
    };

    prime();
    tryPlay();

    const onReady = () => tryPlay();
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);

    let visObserver: IntersectionObserver | undefined;
    if (playWhenVisible) {
      visObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) tryPlay();
        },
        { threshold: 0.2, rootMargin: '40px' },
      );
      visObserver.observe(video);
    }

    const onInteract = () => tryPlay();
    document.addEventListener('pointerdown', onInteract, { passive: true });
    document.addEventListener('touchstart', onInteract, { passive: true });
    document.addEventListener('keydown', onInteract);

    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      visObserver?.disconnect();
      document.removeEventListener('pointerdown', onInteract);
      document.removeEventListener('touchstart', onInteract);
      document.removeEventListener('keydown', onInteract);
    };
  }, [active, playWhenVisible]);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-label={ariaLabel}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

function videoIsVisible(video: HTMLVideoElement): boolean {
  const r = video.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

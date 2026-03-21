'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ArtIcon from '@/components/ui/ArtIcon';
import ArtButton from '@/components/ui/ArtButton';
import ArtIconButton from '@/components/ui/ArtIconButton';
import ArtSlider from '@/components/ui/ArtSlider';

/* ─── helpers ─── */
function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* ─── VolumeControl ────────────────────────────────────────────────────────
   Listens to the native `volumechange` DOM event — re-renders only this subtree.
───────────────────────────────────────────────────────────────────────────── */
function VolumeControl({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const sync = () => { setVolume(v.volume); setMuted(v.muted); };
    v.addEventListener('volumechange', sync);
    return () => v.removeEventListener('volumechange', sync);
  }, [videoRef]);

  const handleSlider = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  };

  return (
    <>
      <ArtIconButton
        icon={{ name: muted || volume === 0 ? 'VolumeMuted' : 'Volume', size: 20 }}
        label={muted ? 'Unmute (m)' : 'Mute (m)'}
        onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}
      />
      <ArtSlider value={muted ? 0 : volume} onChange={handleSlider} className="w-15" />
    </>
  );
}

/* ─── VideoProgressBar ─────────────────────────────────────────────────────
   Fully DOM-based — zero React state, zero React re-renders at any rate.
   Updates fill/thumb positions directly on refs inside native event handlers.
   This breaks the re-render cascade that useSyncExternalStore would propagate
   to all useQuery consumers (CommentSection, SimilarVideos) on every timeupdate.
───────────────────────────────────────────────────────────────────────────── */
function VideoProgressBar({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const track = trackRef.current;
    if (!v || !track) return;

    const dur = { current: 0 };
    const dragging = { current: false };

    const setPos = (time: number) => {
      const pct = dur.current > 0 ? (time / dur.current) * 100 : 0;
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      if (thumbRef.current) thumbRef.current.style.left = `${pct}%`;
    };

    const resolve = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * dur.current;
    };

    const onTime = () => { if (!v.seeking && !dragging.current) setPos(v.currentTime); };
    const onMeta = () => { dur.current = v.duration; setPos(v.currentTime); };
    const onSeeked = () => setPos(v.currentTime);

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const val = resolve(e.clientX);
      setPos(val);
      v.currentTime = val;
    };
    const onUp = () => { dragging.current = false; };
    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const val = resolve(e.clientX);
      setPos(val);
      v.currentTime = val;
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('seeked', onSeeked);
    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('seeked', onSeeked);
      track.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [videoRef]);

  return (
    <div ref={trackRef} className="art-slider art-danger w-full">
      <div ref={fillRef} className="art-slider-fill" style={{ width: '0%' }} />
      <div ref={thumbRef} className="art-slider-thumb" style={{ left: '0%' }} />
    </div>
  );
}

/* ─── TimeDisplay ──────────────────────────────────────────────────────────
   DOM mutation only — zero React re-renders at timeupdate rate.
───────────────────────────────────────────────────────────────────────────── */
function TimeDisplay({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const update = () => {
      if (spanRef.current)
        spanRef.current.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration || 0)}`;
    };
    v.addEventListener('timeupdate', update);
    v.addEventListener('loadedmetadata', update);
    return () => {
      v.removeEventListener('timeupdate', update);
      v.removeEventListener('loadedmetadata', update);
    };
  }, [videoRef]);

  return (
    <span ref={spanRef} className="text-[13px] text-muted tabular-nums whitespace-nowrap select-none">
      0:00 / 0:00
    </span>
  );
}

/* ─── VideoPlayer ─── */
interface VideoPlayerProps {
  src: string;
  theaterMode: boolean;
  onToggleTheater: () => void;
}

export default function VideoPlayer({ src, theaterMode, onToggleTheater }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const pauseHintRef = useRef<HTMLDivElement>(null);

  // Only state that drives JSX — all visual transitions below use DOM refs
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vid = () => videoRef.current!;

  /* ─── Controls opacity via DOM ─── */
  const showCtrl = () => { if (controlsRef.current) controlsRef.current.style.opacity = '1'; };
  const hideCtrl = () => { if (controlsRef.current) controlsRef.current.style.opacity = '0'; };

  const scheduleHide = useCallback(() => {
    showCtrl();
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) hideCtrl();
    }, 2500);
  }, []);

  /* ─── Pause hint opacity via DOM ─── */
  const showHint = () => {
    const el = pauseHintRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '1';
  };
  const hideHint = () => {
    const el = pauseHintRef.current;
    if (!el) return;
    el.style.transition = 'opacity 700ms';
    el.style.opacity = '0';
  };

  /* ─── play / pause ─── */
  const togglePlay = useCallback(() => {
    if (vid().paused) { vid().play(); setPlaying(true); }
    else { vid().pause(); setPlaying(false); }
  }, []);

  /* ─── ended ─── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => setPlaying(false);
    v.addEventListener('ended', onEnd);
    return () => v.removeEventListener('ended', onEnd);
  }, []);

  /* ─── Controls + pause hint tied to playing ─── */
  useEffect(() => {
    if (playing) {
      scheduleHide();
      hideHint();
      if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current);
    } else {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      showCtrl();
      showHint();
      if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current);
      // Auto-hide hint after 7 s with CSS fade (transition-opacity on the element)
      pauseHintTimer.current = setTimeout(hideHint, 7000);
    }
    return () => { if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current); };
  }, [playing, scheduleHide]);

  /* ─── speed ─── */
  const setPlaybackSpeed = (s: number) => { setSpeed(s); vid().playbackRate = s; setShowSpeed(false); };

  /* ─── fullscreen ─── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ─── keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'm': e.preventDefault(); vid().muted = !vid().muted; break;
        case 't': e.preventDefault(); onToggleTheater(); break;
        case 'ArrowLeft': e.preventDefault(); vid().currentTime -= 5; break;
        case 'ArrowRight': e.preventDefault(); vid().currentTime += 5; break;
        case 'ArrowUp': e.preventDefault(); vid().volume = Math.min(1, vid().volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); vid().volume = Math.max(0, vid().volume - 0.1); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen, onToggleTheater]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full bg-black overflow-hidden select-none ${theaterMode && !isFullscreen ? 'rounded-none aspect-21/9 max-h-[calc(100vh-3.5rem)]' : 'aspect-video rounded-xl'}`}
      onMouseMove={scheduleHide}
      onMouseLeave={() => { if (videoRef.current && !videoRef.current.paused) hideCtrl(); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Pause hint — always in DOM, fades in/out via CSS transition */}
      <div
        ref={pauseHintRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 1 }}
      >
        <div className="bg-black/55 rounded-full w-16 h-16 flex items-center justify-center">
          <ArtIcon name="Play" size={32} />
        </div>
      </div>

      {/* Controls — two rows, opacity managed via DOM ref */}
      <div
        ref={controlsRef}
        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/85 to-transparent text-white z-10 transition-opacity"
        style={{ opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row 1: seek bar */}
        <div className="px-2.5 pt-2 pb-1">
          <VideoProgressBar videoRef={videoRef} />
        </div>

        {/* Row 2: playback controls */}
        <div className="flex items-center gap-2 px-2.5 pb-1.5">
          <ArtIconButton
            icon={{ name: playing ? 'Pause' : 'Play', size: 20 }}
            label={playing ? 'Pause (k)' : 'Play (k)'}
            onClick={togglePlay}
          />

          <VolumeControl videoRef={videoRef} />
          <TimeDisplay videoRef={videoRef} />

          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <ArtButton
                variant="ghost"
                onClick={() => setShowSpeed(s => !s)}
                title="Playback speed"
                className="text-[13px] font-semibold"
              >
                {speed}x
              </ArtButton>
              {showSpeed && (
                <div
                  className="absolute bottom-full right-0 mb-1 bg-muted rounded-lg py-1 min-w-25 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEEDS.map((s) => (
                    <div
                      key={s}
                      className={`px-4 py-1.5 text-[13px] cursor-pointer ${s === speed ? 'bg-(--border) text-white' : 'text-muted hover:bg-(--border)'}`}
                      onClick={() => setPlaybackSpeed(s)}
                    >
                      {s === 1 ? 'Normal' : `${s}x`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ArtIconButton
              icon={{ name: 'Theater', size: 20 }}
              label="Theater mode (t)"
              onClick={onToggleTheater}
            />
            <ArtIconButton
              icon={{ name: isFullscreen ? 'ExitFullscreen' : 'Fullscreen', size: 20 }}
              label="Fullscreen (f)"
              onClick={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

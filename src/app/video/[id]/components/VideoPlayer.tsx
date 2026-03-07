'use client';

import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import ArtIcon from '@/components/ui/ArtIcon';

/* ─── helpers ─── */
function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* ─── styles ─── */
const wrapperStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  background: '#000',
  borderRadius: 12,
  overflow: 'hidden',
  userSelect: 'none',
};

const videoStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  cursor: 'pointer',
};

const controlsBar: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  background: 'linear-gradient(transparent, rgba(0,0,0,.85))',
  transition: 'opacity .25s',
};

const btnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 4,
};

const timeStyle: CSSProperties = {
  fontSize: 13,
  color: '#ddd',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

const progressWrap: CSSProperties = {
  flex: 1,
  height: 4,
  background: 'rgba(255,255,255,.2)',
  borderRadius: 2,
  cursor: 'pointer',
  position: 'relative',
};

const progressFill = (pct: number): CSSProperties => ({
  height: '100%',
  width: `${pct}%`,
  background: '#f00',
  borderRadius: 2,
  pointerEvents: 'none',
  position: 'relative',
});

const progressThumb = (pct: number): CSSProperties => ({
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translate(50%, -50%)',
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: '#f00',
  opacity: 0,
  transition: 'opacity .15s',
});

const speedMenuStyle: CSSProperties = {
  position: 'absolute',
  bottom: 44,
  right: 10,
  background: '#1a1a1a',
  borderRadius: 8,
  padding: '4px 0',
  minWidth: 100,
  zIndex: 10,
};

const speedItemStyle = (active: boolean): CSSProperties => ({
  padding: '6px 16px',
  fontSize: 13,
  color: active ? '#fff' : '#aaa',
  cursor: 'pointer',
  background: active ? '#333' : 'transparent',
});

const volumeSlider: CSSProperties = {
  width: 60,
  height: 4,
  appearance: 'none' as const,
  background: 'rgba(255,255,255,.3)',
  borderRadius: 2,
  cursor: 'pointer',
  outline: 'none',
};

/* ─── component ─── */
export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverProgress, setHoverProgress] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vid = () => videoRef.current!;

  /* ─── play / pause ─── */
  const togglePlay = useCallback(() => {
    if (vid().paused) {
      vid().play();
      setPlaying(true);
    } else {
      vid().pause();
      setPlaying(false);
    }
  }, []);

  /* ─── time update ─── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('ended', onEnd);
    };
  }, []);

  /* ─── progress seek ─── */
  const seek = (e: React.MouseEvent) => {
    const rect = progressRef.current!.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid().currentTime = pct * duration;
  };

  /* ─── volume ─── */
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    vid().volume = v;
    if (v === 0) setMuted(true);
    else setMuted(false);
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    vid().muted = next;
  };

  /* ─── speed ─── */
  const setPlaybackSpeed = (s: number) => {
    setSpeed(s);
    vid().playbackRate = s;
    setShowSpeed(false);
  };

  /* ─── fullscreen ─── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ─── auto-hide controls ─── */
  const resetHide = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2500);
  }, [playing]);

  useEffect(() => {
    resetHide();
  }, [playing, resetHide]);

  /* ─── keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          vid().currentTime -= 5;
          break;
        case 'ArrowRight':
          e.preventDefault();
          vid().currentTime += 5;
          break;
        case 'ArrowUp':
          e.preventDefault();
          vid().volume = Math.min(1, vid().volume + 0.1);
          setVolume(vid().volume);
          break;
        case 'ArrowDown':
          e.preventDefault();
          vid().volume = Math.max(0, vid().volume - 0.1);
          setVolume(vid().volume);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      style={{
        ...wrapperStyle,
        ...(theaterMode && !isFullscreen ? { maxWidth: 'none', borderRadius: 0 } : {}),
      }}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video ref={videoRef} src={src} style={videoStyle} onClick={togglePlay} playsInline />

      {/* Big center play overlay when paused */}
      {!playing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={togglePlay}
        >
          <div
            style={{
              background: 'rgba(0,0,0,.55)',
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArtIcon name="Play" size={32} />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        style={{ ...controlsBar, opacity: showControls || !playing ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Play/Pause */}
        <button style={btnStyle} onClick={togglePlay} title={playing ? 'Pause (k)' : 'Play (k)'}>
          <ArtIcon name={playing ? 'Pause' : 'Play'} size={20} />
        </button>

        {/* Volume */}
        <button style={btnStyle} onClick={toggleMute} title={muted ? 'Unmute (m)' : 'Mute (m)'}>
          <ArtIcon name={muted || volume === 0 ? 'VolumeMuted' : 'Volume'} size={20} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          style={volumeSlider}
        />

        {/* Time */}
        <span style={timeStyle}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        {/* Progress bar */}
        <div
          ref={progressRef}
          style={progressWrap}
          onClick={seek}
          onMouseEnter={() => setHoverProgress(true)}
          onMouseLeave={() => setHoverProgress(false)}
        >
          <div style={progressFill(pct)}>
            <div style={{ ...progressThumb(pct), opacity: hoverProgress ? 1 : 0 }} />
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Speed */}
          <button
            style={{ ...btnStyle, fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowSpeed(!showSpeed)}
            title="Playback speed"
          >
            {speed}x
          </button>

          {/* Theater */}
          <button
            style={btnStyle}
            onClick={() => setTheaterMode(!theaterMode)}
            title="Theater mode"
          >
            <ArtIcon name="Theater" size={20} />
          </button>

          {/* Fullscreen */}
          <button style={btnStyle} onClick={toggleFullscreen} title="Fullscreen (f)">
            <ArtIcon name={isFullscreen ? 'ExitFullscreen' : 'Fullscreen'} size={20} />
          </button>
        </div>
      </div>

      {/* Speed menu */}
      {showSpeed && (
        <div style={speedMenuStyle} onClick={(e) => e.stopPropagation()}>
          {SPEEDS.map((s) => (
            <div
              key={s}
              style={speedItemStyle(s === speed)}
              onClick={() => setPlaybackSpeed(s)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = s === speed ? '#333' : 'transparent')
              }
            >
              {s === 1 ? 'Normal' : `${s}x`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

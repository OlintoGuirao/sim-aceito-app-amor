import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const VIDEO_ID = '-oqAU5VxFWs';
const PLAYLIST_ID = 'RD-oqAU5VxFWs';

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { title: string; video_id: string };
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const loadYouTubeApi = () =>
  new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });

const DEFAULT_VOLUME = 5;

const applyVolume = (player: YouTubePlayer, level = DEFAULT_VOLUME) => {
  player.unMute();
  player.setVolume(level);
};

const tryAutoplay = (player: YouTubePlayer) => {
  applyVolume(player);
  player.playVideo();
};

const MusicPlayer: React.FC = () => {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const isSeekingRef = useRef(false);
  const userMutedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState('Trilha sonora');
  const [videoId, setVideoId] = useState(VIDEO_ID);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(true);

  const syncTrackInfo = useCallback((player: YouTubePlayer) => {
    const data = player.getVideoData();
    if (data.video_id) setVideoId(data.video_id);
    if (data.title) setTitle(data.title);
    const total = player.getDuration();
    if (total > 0) setDuration(total);
  }, []);

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const startProgressPolling = (player: YouTubePlayer) => {
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        if (!mounted || isSeekingRef.current) return;
        const state = player.getPlayerState();
        const isPlaying = state === window.YT?.PlayerState.PLAYING;
        setPlaying(isPlaying);
        setCurrentTime(player.getCurrentTime());
        const total = player.getDuration();
        if (total > 0) setDuration(total);
      }, 500);
    };

    const initPlayer = async () => {
      await loadYouTubeApi();
      if (!mounted || !playerHostRef.current || !window.YT?.Player) return;

      const player = new window.YT.Player(playerHostRef.current, {
        height: '1',
        width: '1',
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          list: PLAYLIST_ID,
          listType: 'playlist',
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            playerRef.current = event.target;
            syncTrackInfo(event.target);
            setReady(true);
            tryAutoplay(event.target);
          },
          onStateChange: (event) => {
            if (!mounted) return;
            const state = event.data;
            const isPlaying = state === window.YT?.PlayerState.PLAYING;
            setPlaying(isPlaying);
            syncTrackInfo(event.target);

            if (isPlaying) {
              startProgressPolling(event.target);
              setMuted(event.target.isMuted());
            } else if (state === window.YT?.PlayerState.ENDED) {
              setCurrentTime(0);
            }
          },
        },
      });

      playerRef.current = player;
    };

    initPlayer();

    return () => {
      mounted = false;
      if (progressInterval) clearInterval(progressInterval);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [syncTrackInfo]);

  useEffect(() => {
    if (!ready) return;

    const unlockAudio = () => {
      const player = playerRef.current;
      if (!player || userMutedRef.current) return;

      const isPlaying = player.getPlayerState() === window.YT?.PlayerState.PLAYING;
      if (!isPlaying || player.isMuted()) {
        applyVolume(player, volume > 0 ? volume : DEFAULT_VOLUME);
        setMuted(false);
        player.playVideo();
      }
    };

    document.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => document.removeEventListener('pointerdown', unlockAudio);
  }, [ready, volume]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (playing) {
      player.pauseVideo();
      setPlaying(false);
    } else {
      userMutedRef.current = false;
      applyVolume(player, volume > 0 ? volume : DEFAULT_VOLUME);
      setMuted(false);
      player.playVideo();
      setPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const player = playerRef.current;
    if (!player || !ready) return;
    player.seekTo(value[0], true);
    setCurrentTime(value[0]);
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (muted || volume === 0) {
      const restored = volume > 0 ? volume : DEFAULT_VOLUME;
      userMutedRef.current = false;
      setMuted(false);
      setVolume(restored);
      applyVolume(player, restored);
    } else {
      userMutedRef.current = true;
      setMuted(true);
      player.mute();
    }
  };

  const handleClose = () => {
    const player = playerRef.current;
    if (player) {
      player.pauseVideo();
      setPlaying(false);
    }
    setVisible(false);
  };

  const remaining = Math.max(0, duration - currentTime);

  const sliderClass =
    '[&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:border-white [&_[role=slider]]:bg-white [&>span:first-child]:h-0.5 [&>span:first-child]:bg-white/50 [&_[data-orientation=horizontal]>.bg-primary]:bg-white/90';

  return (
    <div
      className={`fixed top-2 right-2 sm:top-3 sm:right-3 z-50 w-[min(calc(100vw-1rem),14rem)] sm:w-[min(calc(100vw-1.5rem),16rem)] ${!visible ? 'hidden' : ''}`}
    >
      <div className="relative rounded-xl px-2.5 py-2 bg-white/30 backdrop-blur-md border border-white/50 shadow-md">
        <button
          type="button"
          onClick={handleClose}
          className="sm:hidden absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-md hover:bg-gray-900"
          aria-label="Fechar player e parar música"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt=""
            className="w-9 h-7 rounded object-cover shrink-0 bg-white/40"
          />
          <p className="flex-1 min-w-0 text-[11px] font-medium text-gray-800 truncate">
            {title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => playerRef.current?.previousVideo()}
              disabled={!ready}
              className="text-gray-900 hover:opacity-70 disabled:opacity-40 p-0.5"
              aria-label="Música anterior"
            >
              <SkipBack className="w-3.5 h-3.5" fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!ready}
              className="text-gray-900 hover:opacity-70 disabled:opacity-40 p-0.5"
              aria-label={playing ? 'Pausar' : 'Reproduzir'}
            >
              {playing ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              onClick={() => playerRef.current?.nextVideo()}
              disabled={!ready}
              className="text-gray-900 hover:opacity-70 disabled:opacity-40 p-0.5"
              aria-label="Próxima música"
            >
              <SkipForward className="w-3.5 h-3.5" fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              disabled={!ready}
              className="text-gray-800 hover:opacity-70 disabled:opacity-40 p-0.5"
              aria-label={muted ? 'Ativar som' : 'Silenciar'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-700 w-7 shrink-0">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration > 0 ? duration : 100}
            step={1}
            disabled={!ready || duration <= 0}
            onValueChange={(value) => {
              isSeekingRef.current = true;
              setCurrentTime(value[0]);
            }}
            onValueCommit={(value) => {
              handleSeek(value);
              isSeekingRef.current = false;
            }}
            className={`flex-1 ${sliderClass}`}
          />
          <span className="text-[10px] text-gray-700 w-7 shrink-0 text-right">-{formatTime(remaining)}</span>
        </div>
      </div>

      <div
        ref={playerHostRef}
        className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
        aria-hidden
      />
    </div>
  );
};

export default MusicPlayer;

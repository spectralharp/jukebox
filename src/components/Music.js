import { useRef, useEffect, useState } from "react";
import tracks from '../data/music.json'
import './Music.scss';
import MusicControl from "./MusicControl";

let audioInstance = null;

export default function Music() {

  const [trackIndex, setTrackIndex] = useState(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalRef = useRef(null);
  const isReady = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);

  function playSong(music) {
    if (audioInstance) {
      audioInstance.pause();
    }
    else {
      audioInstance = new Audio('/sound/' + music.fileName);
    }
    audioInstance.src = '/sound/' + music.fileName;

    if (audioInstance) {
      setTrackDuration(audioInstance.duration);
      setTrackProgress(audioInstance.currentTime);
      startUpdateTimer();

      // setup media session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: music.title,
          artist: 'Chao',
          album: "Chao's Collection",
          artwork: [
            { src: '/images/player-96.png', sizes: '96x96', type: 'image/png' },
            { src: '/images/player-128.png', sizes: '128x128', type: 'image/png' },
            { src: '/images/player-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/images/player-256.png', sizes: '256x256', type: 'image/png' },
            { src: '/images/player-384.png', sizes: '384x384', type: 'image/png' },
            { src: '/images/player-512.png', sizes: '512x512', type: 'image/png' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', mediaPlay);
        navigator.mediaSession.setActionHandler('pause', mediaPause);
        navigator.mediaSession.setActionHandler('seekforward', seekForward);
        navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
        navigator.mediaSession.setActionHandler('previoustrack', prev);
        navigator.mediaSession.setActionHandler('nexttrack', next);
      }

      setIsPlaying(true);
      audioInstance.play();
    }
  }

  function prev() {
    if (trackIndex - 1 < 0) {
      setTrackIndex(tracks.length - 1);
    } else {
      setTrackIndex(trackIndex - 1);
    }
  }

  function next() {
    if (trackIndex < tracks.length - 1) {
      setTrackIndex(trackIndex + 1);
    } else {
      setTrackIndex(0);
    }
  }

  function mediaPlay() {
    audioInstance.play();
    setIsPlaying(true);
  }

  function mediaPause() {
    audioInstance.pause();
    setIsPlaying(false);
  }

  function seekForward(skipTime) {
    audioInstance.currentTime = Math.min(audioInstance.currentTime + skipTime, audioInstance.duration);
  }

  function seekBackward(skipTime) {
    audioInstance.currentTime = Math.max(audioInstance.currentTime - skipTime, 0);
  }

  function seek(value) {
    audioInstance.currentTime = value;
    setTrackProgress(audioInstance.currentTime);
  }

  function seekEnd() {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }

  function playPause() {
    if (!audioInstance) {
      audioInstance = new Audio('/sound/' + tracks[0].fileName);
      setTrackIndex(0);
    }
    setIsPlaying(!isPlaying);
  }

  function startUpdateTimer() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (audioInstance.ended) {
        next();
      } else {
        setTrackDuration(Math.ceil(audioInstance.duration));
        setCurrentTime(Math.floor(audioInstance.currentTime));
      }
    }, 100);
  }

  // On play state change
  useEffect(() => {
    if (!audioInstance) {return};
    if (isPlaying) {
      audioInstance.play();
      startUpdateTimer();
    } else {
      clearInterval(intervalRef.current);
      audioInstance.pause();
    }
  }, [isPlaying]);

  // On track update
  useEffect(() => {
    // Don't play on mount
    if (!isReady.current) {
      isReady.current = true;
    } else {
      playSong(tracks[trackIndex]);
    }
  }, [trackIndex]);

  // On unmount, cleanup
  useEffect(() => {
    if (audioInstance) {
      startUpdateTimer();
    }
    return () => {
      clearInterval(intervalRef.current);
    }
  }, []);

  const currentPercentage = trackDuration ? `${(trackProgress / trackDuration) * 100}%` : '0%';
  const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #ff004a), color-stop(${currentPercentage}, #777))
  `;

  return (
    <section className="container">
      <div className="music-player">
        <img className="album-cover" alt="Album cover" src="/images/player-512.png" />
        <div className="controlPanel">
          <div className="time-slider">
            <span>{formatMMSS(currentTime)}</span>
            <input
              type="range"
              value={trackProgress}
              min="0"
              max={trackDuration ? trackDuration : `${trackDuration}`}
              step="1"
              onChange={(e) => seek(e.target.value)}
              onMouseUp={seekEnd}
              onKeyUp={seekEnd}
              onTouchEnd={seekEnd}
              style={{ background: trackStyling }}
            />
            <span>{trackDuration ? '-' + formatMMSS(trackDuration - currentTime) : '--:--'}</span>
          </div>
          <MusicControl
            isPlaying={isPlaying}
            playPause={playPause}
            prev={prev}
            next={next}
          />
        </div>
      </div>
      <table className="music-table">
        <thead>
          <tr>
            <th>#</th>
            <th className="th">Title</th>
            <th className="th">Length</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((m, index) => {
            return (
              <tr key={m.title + m.track} className={index === trackIndex ? 'active-track' : undefined}>
                <td
                  className="track-play"
                  onClick={() => {
                    if (!audioInstance) {
                      audioInstance = new Audio('/sound/' + m.fileName);
                    }
                    setTrackIndex(index);
                  }}
                >
                  {m.track}
                </td>
                <td>{m.title}</td>
                <td>{m.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function formatMMSS(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')} : ${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}
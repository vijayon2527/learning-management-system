import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CSpinner } from '@coreui/react';
import { BsChevronLeft } from 'react-icons/bs';
import Header from '../../pages/layout/partials/Header';
import Footer from '../../pages/layout/partials/Footer';
import SideBar from './SideBar';
import Tabs from './Tabs';
import axiosInstance from '../../utils/axiosInstance';

const DESKTOP_BREAKPOINT = 980;
const SKIP_SECONDS = 10;
const SPEEDS = [0.5, 1, 1.25, 1.5, 2];
const LS_RATE_KEY = 'playerRate';
const AUTO_HIDE_MS = 2500;
const USE_GLOBAL_SPEED = true;

const fmt = (t) => {
  if (!Number.isFinite(t) || t < 0) return '0:00';
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const getMediaDuration = (v, fallback = 0) => {
  if (!v) return fallback;
  const d = v.duration;
  if (Number.isFinite(d) && d > 0) return d;
  try {
    if (v.seekable && v.seekable.length > 0) {
      return v.seekable.end(v.seekable.length - 1);
    }
  } catch {}
  return fallback;
};

const CourseVideoPage = () => {
  const { courseSlug, sectionSlug, lectureSlug } = useParams();
  const navigate = useNavigate();

  /* ---------------- Data ---------------- */
  const [lecture, setLecture] = useState(null);
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Auth/User ---------------- */
  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  /* ---------------- Layout ---------------- */
  const initialIsDesktop = () => window.innerWidth > DESKTOP_BREAKPOINT;
  const [isDesktop, setIsDesktop] = useState(initialIsDesktop);
  const [showSidebar, setShowSidebar] = useState(initialIsDesktop);
  const [activeTab, setActiveTab] = useState(() =>
    initialIsDesktop() ? 'notes' : 'coursecontent'
  );
  const tabsRef = useRef(null);

  /* ---------------- Video refs & state ---------------- */
  const videoRef = useRef(null);
  const videoShellRef = useRef(null); // wrapper for FS

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(() => {
    if (!USE_GLOBAL_SPEED) return 1;
    const stored = Number(localStorage.getItem(LS_RATE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 1;
  });
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [curTime, setCurTime] = useState(0);
  const [durTime, setDurTime] = useState(0);
  const [progress, setProgress] = useState(0); // 0-100
  const lastDurRef = useRef(0);

  /* ---------------- Overlay visibility ---------------- */
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayTimerRef = useRef(null);
  const clearOverlayTimer = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
  };
  const showOverlayNow = useCallback(() => {
    setOverlayVisible(true);
    clearOverlayTimer();
    const v = videoRef.current;
    if (v && !v.paused) {
      overlayTimerRef.current = setTimeout(() => {
        setOverlayVisible(false);
      }, AUTO_HIDE_MS);
    }
  }, []);

  /* Reset minimal UI when lecture changes */
  useEffect(() => {
    setCurTime(0);
    setDurTime(0);
    setProgress(0);
    setOverlayVisible(true);
    clearOverlayTimer();
    if (!USE_GLOBAL_SPEED) setPlaybackRate(1);
  }, [lectureSlug]);

  /* Playback rate */
  const applyRate = useCallback((r) => {
    const v = videoRef.current;
    if (v) v.playbackRate = r;
    setPlaybackRate(r);
    if (USE_GLOBAL_SPEED) {
      localStorage.setItem(LS_RATE_KEY, String(r));
    }
  }, []);
  const handleRateChange = (r) => {
    applyRate(r);
    showOverlayNow();
  };

  /* Play / Pause */
  const safePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const p = v.play();
      if (p?.then) await p;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };
  const safePause = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setIsPlaying(false);
  };
  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) safePlay();
    else safePause();
    showOverlayNow();
  };

  /* Volume & Mute */
  const handleVolume = (e) => {
    const val = Number(e.target.value);
    const v = videoRef.current;
    if (v) {
      v.volume = val;
      v.muted = val === 0;
    }
    setVolume(val);
    setMuted(val === 0);
    showOverlayNow();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const newMuted = !muted;
    v.muted = newMuted;
    if (!newMuted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
    setMuted(newMuted);
    showOverlayNow();
  };

  /* Seek */
  const handleSeek = (e) => {
    const pct = Number(e.target.value);
    const v = videoRef.current;
    if (!v) return;
    const dur = getMediaDuration(v, lastDurRef.current);
    if (dur <= 0) return;
    const newTime = (pct / 100) * dur;
    v.currentTime = newTime;
    setCurTime(newTime);
    setProgress(pct);
    showOverlayNow();
  };

  /* Sync state */
  const syncFromElement = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const dur = getMediaDuration(v, lastDurRef.current);
    lastDurRef.current = dur;
    const ct = v.currentTime || 0;
    setDurTime(dur);
    setCurTime(ct);
    setProgress(dur ? (ct / dur) * 100 : 0);
    setVolume(v.volume);
    setMuted(v.muted);
    setIsPlaying(!v.paused && !v.ended && v.readyState >= 2);
  }, []);

  /* Skip Feedback */
  const [pulse, setPulse] = useState(null);
  const pulseSkip = (delta, side) => {
    const id = Date.now();
    setPulse({ delta, side, id });
    setTimeout(() => {
      setPulse((p) => (p && p.id === id ? null : p));
    }, 700);
  };
  const skip = useCallback(
    (delta, side) => {
      const v = videoRef.current;
      if (!v) return;
      const dur = getMediaDuration(v, lastDurRef.current);
      const baseCur = v.currentTime || 0;
      const newTime =
        dur > 0 ? Math.min(dur, Math.max(0, baseCur + delta)) : baseCur + delta;
      v.currentTime = newTime;
      setCurTime(newTime);
      setProgress(dur ? (newTime / dur) * 100 : progress);
      pulseSkip(delta, side);
      showOverlayNow();
    },
    [progress, showOverlayNow]
  );

  /* Gesture tap */
  const lastTapRef = useRef(0);
  const lastTapXRef = useRef(0);
  const DOUBLE_TAP_WINDOW = 300;
  const MIN_MOVE_FOR_NEW_TAP = 24;
  const handleWrapperTap = (e) => {
    if (e.target.closest('.cvp-ui-full') || e.target.closest('.cvp-speed-menu')) return;
    const rect = videoShellRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 0;
    const now = performance.now();
    const prev = lastTapRef.current;
    const dx = Math.abs(x - lastTapXRef.current);
    if (now - prev < DOUBLE_TAP_WINDOW && dx < MIN_MOVE_FOR_NEW_TAP) {
      if (rect && x < rect.width / 2) {
        skip(-SKIP_SECONDS, 'left');
      } else {
        skip(SKIP_SECONDS, 'right');
      }
      lastTapRef.current = 0;
      return;
    }
    togglePlayPause();
    lastTapRef.current = now;
    lastTapXRef.current = x;
  };

  /* Prevent native dblclick fullscreen */
  const stopVideoDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* Fullscreen */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    const el = videoShellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };
  useEffect(() => {
    const fsHandler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      showOverlayNow();
    };
    document.addEventListener('fullscreenchange', fsHandler);
    return () => document.removeEventListener('fullscreenchange', fsHandler);
  }, [showOverlayNow]);

  /* Media listeners */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      applyRate(USE_GLOBAL_SPEED ? playbackRate : 1);
      syncFromElement();
      setOverlayVisible(true);
      showOverlayNow();
      requestAnimationFrame(syncFromElement);
    };
    const onLoadedData = syncFromElement;
    const onDurationChange = syncFromElement;
    const onTime = syncFromElement;
    const onSeeked = syncFromElement;
    const onPlaying = () => {
      setIsPlaying(true);
      syncFromElement();
      showOverlayNow();
    };
    const onPlay = onPlaying;
    const onPause = () => {
      setIsPlaying(false);
      syncFromElement();
      setOverlayVisible(true);
      clearOverlayTimer();
    };
    const onEnded = () => {
      setIsPlaying(false);
      syncFromElement();
      setOverlayVisible(true);
    };
    const onRate = () => {
      const r = v.playbackRate;
      setPlaybackRate(r);
      if (USE_GLOBAL_SPEED) {
        localStorage.setItem(LS_RATE_KEY, String(r));
      }
    };

    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('ratechange', onRate);
    v.addEventListener('dblclick', stopVideoDoubleClick);

    if (v.readyState >= 1) onLoaded();

    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('loadeddata', onLoadedData);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('ratechange', onRate);
      v.removeEventListener('dblclick', stopVideoDoubleClick);
    };
  }, [applyRate, playbackRate, showOverlayNow, syncFromElement, lectureSlug]);

  /* Mouse hover overlay */
  const handleMouseMove = () => showOverlayNow();
  const handleMouseEnter = () => showOverlayNow();
  const handleMouseLeave = () => {
    const v = videoRef.current;
    if (v && !v.paused) {
      showOverlayNow();
    } else {
      setOverlayVisible(true);
    }
  };

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || e.target?.isContentEditable) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-SKIP_SECONDS, 'left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(SKIP_SECONDS, 'right');
          break;
        case '.':
        case '>': {
          e.preventDefault();
          const idx = SPEEDS.indexOf(playbackRate);
          const next = SPEEDS[(idx + 1) % SPEEDS.length];
          handleRateChange(next);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlayPause, skip, playbackRate]);

  /* User fetch */
  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token && !axiosInstance.defaults.headers.common.Authorization) {
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        const res = await axiosInstance.get('/api/users/me/');
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setUserChecked(true);
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Course bundle fetch */
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lectureRes, sectionRes, allSectionsRes, courseRes] =
          await Promise.all([
            axiosInstance.get(`/api/courses/lectures/${lectureSlug}/`),
            axiosInstance.get(`/api/courses/sections/${sectionSlug}/`),
            axiosInstance.get(`/api/courses/sections/?course_slug=${courseSlug}`),
            axiosInstance.get(`/api/courses/public-courses/${courseSlug}/`),
          ]);
        if (cancelled) return;
        setLecture(lectureRes.data);
        setSection(sectionRes.data);
        setAllSections(allSectionsRes.data);
        setCourse(courseRes.data);
      } catch (err) {
        if (!cancelled) console.error('Error loading data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (courseSlug && sectionSlug && lectureSlug) {
      fetchData();
    }
    return () => {
      cancelled = true;
    };
  }, [courseSlug, sectionSlug, lectureSlug]);

  /* Responsive */
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth > DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      setShowSidebar(desktop);
      setActiveTab(desktop ? 'notes' : 'coursecontent');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleRestoreSidebar = () => setShowSidebar(true);

  /* Recently Watched */
  useEffect(() => {
    if (lecture && section && courseSlug) {
      const currentLecture = {
        title: lecture.name,
        thumbnail: lecture.thumbnail || '/default-thumbnail.jpg',
        watchedAt: new Date().toISOString(),
        courseSlug,
        sectionId: section.id,
        lectureId: lecture.id,
      };
      let watched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
      watched = watched.filter((item) => item.lectureId !== currentLecture.lectureId);
      watched.unshift(currentLecture);
      watched = watched.slice(0, 4);
      localStorage.setItem('recentlyWatched', JSON.stringify(watched));
    }
  }, [lecture, section, courseSlug]);

  useEffect(() => {
    if (lecture) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lecture]);

  /* Lecture selection */
  const handleLectureSelect = (sectionIndex, lectureIndex) => {
    const selectedSection = allSections[sectionIndex];
    if (!selectedSection) return;
    const selectedLecture = selectedSection.lectures?.[lectureIndex];
    if (!selectedLecture) return;
    navigate(`/course-video/${courseSlug}/${selectedSection.id}/${selectedLecture.id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const authUser = user ? { id: user.id, first_name: user.first_name } : null;

  /* ---------------- Render ---------------- */
  const videoShellClasses = [
    'course-video-shell',
    'position-relative',
    'mb-4',
    !showSidebar && isDesktop ? 'no-sidebar' : '',
    isFullscreen ? 'fs-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Header />

      <CContainer fluid className="py-4">
        <CRow>
          <CCol md={showSidebar && isDesktop ? 9 : 12}>
            {/* ---------------- Video Shell ---------------- */}
            <div
              className={`course-video-shell position-relative mb-4 ${!showSidebar && !isFullscreen ? 'no-sidebar' : ''}`}
              ref={videoShellRef}
              onClick={handleWrapperTap}
              onDoubleClick={handleWrapperTap}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >

              <div className="video-aspect rounded shadow-sm position-relative">
                {lecture?.video && (
                  <video
                    className="cvp-video"
                    ref={videoRef}
                    key={lectureSlug}
                    autoPlay
                    playsInline
                    src={lecture.video}
                  />
                )}

                {loading && (
                  <div className="loading-overlay">
                    <CSpinner color="light" />
                    <div className="mt-3">Loading video...</div>
                  </div>
                )}
                {!loading && !lecture?.video && (
                  <div className="loading-overlay">🎬 No video available.</div>
                )}

                {/* Ghost progress */}
                {lecture?.video && (
                  <div className="cvp-ghost-progress">
                    <div
                      className="cvp-ghost-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Full Overlay Controls */}
                {lecture?.video && (
                  <div
                    className={overlayVisible ? 'cvp-ui-full visible' : 'cvp-ui-full hidden'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="cvp-full-top">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleSeek}
                        className="cvp-full-progress"
                      />
                      <span className="cvp-full-time">
                        {fmt(curTime)} / {fmt(durTime)}
                      </span>
                    </div>

                    <div className="cvp-bar">
                      <div className="cvp-left">
                        <button
                          type="button"
                          className="cvp-btn"
                          onClick={togglePlayPause}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>

                        <button
                          type="button"
                          className="cvp-btn"
                          onClick={toggleMute}
                          aria-label={muted ? 'Unmute' : 'Mute'}
                        >
                          {muted || volume === 0 ? '🔇' : '🔊'}
                        </button>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolume}
                          className="cvp-volume"
                        />
                      </div>

                      <div className="cvp-right">
                        <div className="cvp-speed-dropup">
                          <button
                            type="button"
                            className="cvp-btn cvp-speed-btn"
                            aria-haspopup="true"
                          >
                            {playbackRate}×
                          </button>
                          <div className="cvp-speed-menu">
                            {SPEEDS.map((s) => (
                              <button
                                key={s}
                                type="button"
                                className={`cvp-speed-item ${
                                  s === playbackRate ? 'active' : ''
                                }`}
                                onClick={() => handleRateChange(s)}
                              >
                                {s}×
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="cvp-btn"
                          onClick={toggleFullscreen}
                          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                          {isFullscreen ? '🡼' : '⛶'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skip pulse feedback */}
                {pulse && (
                  <div
                    className={`video-skip-pulse ${
                      pulse.side === 'left' ? 'left' : 'right'
                    }`}
                  >
                    {pulse.delta > 0 ? `+${SKIP_SECONDS}s` : `-${SKIP_SECONDS}s`}
                  </div>
                )}
              </div>

              {/* Restore sidebar button (desktop only) */}
              {!showSidebar && isDesktop && (
                <div className="restore-sidebar-middle">
                  <button className="restore-sidebar-btn" onClick={handleRestoreSidebar}>
                    <BsChevronLeft />
                  </button>
                </div>
              )}
            </div>

            {/* ---------------- Tabs & inline sidebar (mobile) ---------------- */}
            <div ref={tabsRef} className="flex-grow-1">
              <Tabs
                ref={tabsRef}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sections={allSections}
                onLectureSelect={handleLectureSelect}
                lecture={lecture}
                videoRef={videoRef}
                authToken={localStorage.getItem('access_token')}
                course={course}
                currentUser={authUser}
                userChecked={userChecked}
              />

              {activeTab === 'coursecontent' && (
                <div className="mt-3">
                  <SideBar
                    sections={allSections}
                    onLectureSelect={handleLectureSelect}
                    onCloseSidebar={handleCloseSidebar}
                    activeLectureId={Number(lectureSlug)}
                    activeSectionId={Number(sectionSlug)}
                    autoExpandActive={true}
                  />
                </div>
              )}
            </div>
          </CCol>

          {/* ---------------- Persistent sidebar (desktop) ---------------- */}
          {showSidebar && isDesktop && (
            <CCol md={3} className="px-3">
              <SideBar
                sections={allSections}
                onLectureSelect={handleLectureSelect}
                onCloseSidebar={handleCloseSidebar}
                activeLectureId={Number(lectureSlug)}
                activeSectionId={Number(sectionSlug)}
              />
            </CCol>
          )}
        </CRow>
      </CContainer>

      <Footer />
    </>
  );
};

export default CourseVideoPage;

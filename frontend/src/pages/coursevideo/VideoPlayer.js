import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import { BsBadgeCcFill, BsBadgeCc, BsSliders, BsArrowClockwise, 
        BsArrowCounterclockwise } from 'react-icons/bs';
import './VideoPlayer.css';

const VideoPlayer = ({ url, subtitles}) => {
    const [showControls, setShowControls] = useState(false);
    const hideControlsTimeout = useRef(null);

    const handleMouseEnter = () => {
        clearTimeout(hideControlsTimeout.current);
        setShowControls(true);
    };

    const handleMouseLeave = () => {
        hideControlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 2000); // 2 seconds delay
    };
    useEffect(() => {
        return () => {
            clearTimeout(hideControlsTimeout.current);
        };
    }, []);

    const playerRef = useRef(null);
    const playerWrapperRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);
    const playedPercent = played * 100;
    const [loading, setLoading] = useState(true);

    const [showSubtitles, setShowSubtitles] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showRateDropdown, setShowRateDropdown] = useState(false);
    const [showQualityDropdown, setShowQualityDropdown] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlay = () => {
        setPlaying((prev) => !prev);
    };

    const toggleMute = () => setMuted((prev) => !prev);
    const toggleSubtitles = () => setShowSubtitles((prev) => !prev);

    const [currentSubtitle, setCurrentSubtitle] = useState('');
    const [subtitleCues, setSubtitleCues] = useState([]);

    const handlePlayPause = () => {
        togglePlay(); 
        setIsOverlayVisible(!playing); 
    };

    const handleVideoClick = (e) => {
        if (e.target === playerRef.current.getInternalPlayer()) {
            handlePlayPause();
        }
    };

    const handlePlay = () => {
        setPlaying(true);
        setIsOverlayVisible(false); 
    };
    const handlePause = () => {
        setPlaying(false);
        setIsOverlayVisible(true);
    };

    useEffect(() => {
        if (!subtitles) return;

        fetch(subtitles)
            .then((res) => res.text())
            .then((data) => {
                const cues = [];
                const blocks = data.split('\n\n');
                blocks.forEach((block) => {
                    const lines = block.trim().split('\n');
                    const timeLine = lines.find((line) => line.includes('-->'));
                    const textLine = lines.slice(-1)[0];

                    if (timeLine && textLine) {
                        const [start, end] = timeLine.split('-->').map((t) => t.trim());
                        cues.push({
                            start: parseTime(start),
                            end: parseTime(end),
                            text: textLine.trim(),
                        });
                    }
                });
                setSubtitleCues(cues);
            })
            .catch((error) => {
                console.error('Failed to load subtitles:', error);
            });
    }, [subtitles]);

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const [h = '0', m = '0', s = '0'] = timeStr.split(':');
        const [sec = '0', ms = '0'] = s.split('.');
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec) + parseInt(ms) / 1000;
    };

    useEffect(() => {
        if (!showSubtitles || !subtitleCues.length) {
            setCurrentSubtitle('');
            return;
        }

        const cue = subtitleCues.find((c) => currentTime >= c.start && currentTime <= c.end);
        setCurrentSubtitle(cue ? cue.text : '');
    }, [currentTime, showSubtitles, subtitleCues]);

    const toggleFullScreen = () => {
        if (screenfull.isEnabled && playerWrapperRef.current) {
            screenfull.toggle(playerWrapperRef.current);
        }
    };
  
    const handleProgress = (state) => {
        setPlayed(state.played);
        setCurrentTime(state.playedSeconds);
    };
    const handleDuration = (duration) => setDuration(duration);
    const handleSeekChange = (e) => {
        const value = parseFloat(e.target.value);
        setPlayed(value);
        playerRef.current.seekTo(value);
    };

    useEffect(() => {
        if (screenfull.isEnabled) {
            const onChange = () => setIsFullscreen(screenfull.isFullscreen);
            screenfull.on('change', onChange);
            return () => screenfull.off('change', onChange);
        }
    }, []);

    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [loading]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleForward = () => {
        const current = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(current + 5, 'seconds');
    };

    const handleBackward = () => {
        const current = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(Math.max(current - 5, 0), 'seconds');
    };

    const qualityOptions = [
        { label: '1080p', url: url?.['1080p'] },
        { label: '720p', url: url?.['720p'] },
        { label: '480p', url: url?.['480p'] },
        { label: '360p', url: url?.['360p'] },
        { label: '240p', url: url?.['240p'] },
        { label: 'Auto', url: url?.['Auto'] },
    ];
    const [currentQuality, setCurrentQuality] = useState('Auto');
    const [videoUrl, setVideoUrl] = useState(
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    );

    return (
        <div
            className="player-wrapper"
            ref={playerWrapperRef}
            onMouseMove={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleVideoClick}
        >
            {loading && <div className="loading-spinner" />}

            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                playing={playing}
                muted={muted}
                width="100%"
                height="100%"
                playbackRate={playbackRate}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onPlay={handlePlay}
                onPause={handlePause}
                onReady={() => setLoading(false)}
                config={{
                    file: {
                        attributes: { controlsList: 'nodownload' },
                        tracks:
                            subtitles && showSubtitles
                                ? [
                                    {
                                        kind: 'subtitles',
                                        src: subtitles,
                                        srcLang: 'en',
                                        default: true,
                                    }
                                ]
                                : [],
                    },
                }}
            />

            {!loading && isOverlayVisible && !playing && (
                <button className="overlay-play" onClick={handlePlayPause}>
                    {playing ? <FaPause /> : <FaPlay />}
                </button>
            )}

            {showSubtitles && currentSubtitle && (
                <div className="subtitle-box">{currentSubtitle}</div>
            )}

            {showControls && (
                <div className={`controls ${showControls ? 'show' : ''}`}>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={played}
                        onChange={handleSeekChange}
                        onClick={(e) => e.stopPropagation()}
                        className="seekbar"
                        style={{ '--progress': `${playedPercent}%` }}
                    />

                    <div className="bottom-controls">
                        <div className="d-flex flex-col justify-content-center align-items-center gap-2 px-2 left-controls">
                            <div className="tooltip-container">
                                <button onClick={handlePlayPause}>
                                    {playing ? (
                                        <FaPause className="bottom-control-icons" />
                                    ) : (
                                        <FaPlay className="bottom-control-icons" />
                                    )}
                                </button>
                                <span className="tooltip-text">{playing ? "Pause" : "Play"}</span>
                            </div>

                            <div className="tooltip-container">
                                <button onClick={handleBackward}>
                                    <span className="bottom-control-icons">
                                        <BsArrowCounterclockwise />
                                    </span>
                                </button>
                                <span className="tooltip-text">Rewind 5s</span>
                            </div>

                            <div className="rate-selector-wrapper" style={{ position: 'relative' }}>
                                <div className="tooltip-container">
                                    <button onClick={() => setShowRateDropdown((prev) => !prev)}>
                                        <span className="bottom-control-icons">{playbackRate}x</span>
                                    </button>
                                    <span className="tooltip-text">Playback Rate</span>
                                </div>

                                {showRateDropdown && (
                                    <div className="rate-dropdown-float">
                                        {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                            <div
                                                key={rate}
                                                className={`rate-option ${playbackRate === rate ? 'active' : ''
                                                    }`}
                                                onClick={() => {
                                                    setPlaybackRate(rate);
                                                    setShowRateDropdown(false);
                                                }}
                                            >
                                                {rate}x
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="tooltip-container">
                                <button onClick={handleForward}>
                                    <span className="bottom-control-icons">
                                        <BsArrowClockwise />
                                    </span>
                                </button>
                                <span className="tooltip-text">Forward 5s</span>
                            </div>

                            <div className="video-timer">
                                <span>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        <div className="right-controls">
                            <div className="tooltip-container">
                                <button onClick={toggleMute}>
                                    {muted ? (
                                        <FaVolumeMute className="bottom-control-icons" />
                                    ) : (
                                        <FaVolumeUp className="bottom-control-icons" />
                                    )}
                                </button>
                                <span className="tooltip-text">{muted ? "UnMute" : "Mute"}</span>
                            </div>
                            <div className="tooltip-container">
                                <button onClick={toggleSubtitles}>
                                    {showSubtitles ? (
                                        <BsBadgeCcFill className="bottom-control-icons" />
                                    ) : (
                                        <BsBadgeCc className="bottom-control-icons" />
                                    )}
                                </button>
                                <span className="tooltip-text">Subtitles</span>
                            </div>
                            <div className="quality-selector-wrapper" style={{ position: 'relative' }}>
                                <div className="tooltip-container">
                                    <button onClick={() => setShowQualityDropdown((prev) => !prev)}>
                                        <BsSliders className="bottom-control-icons" />
                                    </button>
                                    <span className="tooltip-text">Video Quality</span>
                                </div>

                                {showQualityDropdown && (
                                    <div className="quality-dropdown">
                                        {qualityOptions.map((quality, index) => (
                                            <div
                                                key={index}
                                                className={`quality-option ${currentQuality === quality.label ? 'active' : ''
                                                    }`}
                                                onClick={() => {
                                                    setCurrentQuality(quality.label);
                                                    setVideoUrl(quality.url); 
                                                }}
                                            >
                                                {quality.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="tooltip-container">
                                <button onClick={toggleFullScreen}>
                                    {isFullscreen ? (
                                        <FaCompress className="bottom-control-icons" />
                                    ) : (
                                        <FaExpand className="bottom-control-icons" />
                                    )}
                                </button>
                                <span className="tooltip-text fullscreen">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;

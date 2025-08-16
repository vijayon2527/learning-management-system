import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  CButton,
  CTooltip,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { cilPen, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { FaPlus } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';
import './Notes.css';

/*
 * Accepts:
 *   HH:MM:SS  (00:01:23)
 *   H:MM:SS   (1:01:23)
 *   MM:SS     (01:23)  -> hours=0
 *   M:SS      (1:23)   -> hours=0
 */
const tsPattern = /(?<!\d)(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?!\d)/g; // captures [hrs]? mins secs

const Notes = ({ lecture, videoRef }) => {
  /* ---------------- state ---------------- */
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [note, setNote] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const scrollContainerRef = useRef(null);
  const quillRef = useRef(null);
  const lastSeekTokenRef = useRef(null); // prevent repeat seeks

  const lectureId = lecture?.id;

  /* ---------------- reset when lecture changes ---------------- */
  useEffect(() => {
    setNotes([]);
    setPage(1);
    setHasMore(true);
  }, [lectureId]);

  /* ---------------- fetch notes ---------------- */
  useEffect(() => {
    if (lectureId) loadNotes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lectureId]);

  const loadNotes = async (pageNum) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/courses/notes/', {
        params: { page: pageNum, lecture: lectureId },
      });
      const newNotes = res.data.results || [];
      setNotes((prev) => [...prev, ...newNotes]);
      if (!res.data.next) setHasMore(false);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- infinite scroll up ---------------- */
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || loading) return;
    if (container.scrollTop === 0) {
      const prevScrollHeight = container.scrollHeight;
      setPage((p) => p + 1);
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      }, 100);
    }
  };

  /* ---------------- timestamp helpers ---------------- */
  const formatTimestamp = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return (
      hrs.toString().padStart(2, '0') +
      ':' +
      mins.toString().padStart(2, '0') +
      ':' +
      secs.toString().padStart(2, '0')
    );
  };

  const parseTimestampToSeconds = (token) => {
    // token may be HH:MM:SS or MM:SS
    const parts = token.split(':').map((n) => parseInt(n, 10));
    let hrs = 0,
      mins = 0,
      secs = 0;
    if (parts.length === 3) {
      [hrs, mins, secs] = parts;
    } else if (parts.length === 2) {
      [mins, secs] = parts;
    } else {
      return 0;
    }
    if (isNaN(hrs)) hrs = 0;
    if (isNaN(mins)) mins = 0;
    if (isNaN(secs)) secs = 0;
    return hrs * 3600 + mins * 60 + secs;
  };

  /* ---------------- render saved note HTML clickable ---------------- */
  const renderNoteWithClickableTimestamps = (html) => {
    if (!html) return '';
    return html.replace(tsPattern, (match) => {
      // normalize to HH:MM:SS for data-time
      const seconds = parseTimestampToSeconds(match);
      const full = formatTimestamp(seconds);
      return `<span class="clickable-timestamp" data-time="${full}" style="color:#007bff;text-decoration:underline;cursor:pointer;">${match}</span>`;
    });
  };

  /* ---------------- detect newly typed timestamp & seek ---------------- */
  const detectAndSeek = useCallback((plainText) => {
    if (!plainText) return;
    let match;
    let lastMatch = null;
    tsPattern.lastIndex = 0; // reset regex
    while ((match = tsPattern.exec(plainText)) !== null) {
      // build raw token like user typed (hrs may be undefined)
      const hrs = match[1]; // may be undefined
      const mins = match[2];
      const secs = match[3];
      lastMatch = hrs ? `${hrs}${mins}:${secs}` : `${mins}:${secs}`;
      // wait: above produce wrong pattern if hrs present: match[0] easiest
      lastMatch = match[0]; // just use full matched string
    }
    if (!lastMatch) return;

    // prevent repeated seeks when text unchanged
    if (lastSeekTokenRef.current === lastMatch) return;
    lastSeekTokenRef.current = lastMatch;

    const seconds = parseTimestampToSeconds(lastMatch);
    if (videoRef?.current && !isNaN(seconds)) {
      videoRef.current.currentTime = seconds;
      // do not auto-play? you decide; I'll play to confirm jump
      videoRef.current.play();
    }
  }, [videoRef]);

  /* ---------------- editor change ---------------- */
  const handleEditorChange = (value, delta, source, editor) => {
    setNote(value);

    // word count
    const plainText = editor.getText().trim();
    const words = plainText.split(/\s+/).filter(Boolean);
    setWordCount(words.length);

    // detect timestamp typed
    detectAndSeek(plainText);
  };

  /* ---------------- save note ---------------- */
  const handleSave = async () => {
    if (!lectureId) {
      alert('Lecture ID missing');
      return;
    }
    const currentTime = videoRef?.current?.currentTime || 0;
    const payload = {
      lecture: lectureId,
      timestamp: formatTimestamp(currentTime),
      content: note,
    };
    try {
      setIsSubmitting(true);
      let res;
      if (editingNoteId) {
        res = await axiosInstance.put(
          `/api/courses/notes/${editingNoteId}/`,
          payload
        );
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNoteId ? res.data : n))
        );
      } else {
        res = await axiosInstance.post('/api/courses/notes/', payload);
        setNotes((prev) => [res.data, ...prev]);
      }
      setNote('');
      setWordCount(0);
      setShowEditor(false);
      setEditingNoteId(null);
      lastSeekTokenRef.current = null; // reset
    } catch (err) {
      alert('Failed to save note.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- cancel ---------------- */
  const handleCancel = () => {
    setNote('');
    setWordCount(0);
    setShowEditor(false);
    setEditingNoteId(null);
    lastSeekTokenRef.current = null;
  };

  /* ---------------- edit ---------------- */
  const handleEdit = (noteObj) => {
    setNote(noteObj.content);
    setEditingNoteId(noteObj.id);
    setShowEditor(true);
    const count = noteObj.content
      .replace(/<[^>]+>/g, '')
      .split(/\s+/)
      .filter(Boolean).length;
    setWordCount(count);
    lastSeekTokenRef.current = null;
  };

  /* ---------------- delete ---------------- */
  const confirmDelete = (note) => setNoteToDelete(note);

  const handleDeleteConfirmed = async () => {
    try {
      await axiosInstance.delete(`/api/courses/notes/${noteToDelete.id}/`);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setNoteToDelete(null);
    }
  };

  /* ---------------- click timestamp in saved note ---------------- */
  const handleNoteContentClick = (e) => {
    const el = e.target;
    if (el.classList.contains('clickable-timestamp')) {
      const time = el.getAttribute('data-time');
      const seconds = parseTimestampToSeconds(time);
      if (videoRef?.current) {
        videoRef.current.currentTime = seconds;
        videoRef.current.play();
        videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="notes-wrapper">
      {!showEditor && (
        <div
          className="notes-input-wrapper"
          onClick={() => setShowEditor(true)}
        >
          <input type="text" placeholder="Add a note..." readOnly />
          <FaPlus className="plus-icon" style={{ color: '#199fcc' }} />
        </div>
      )}

      {showEditor && (
        <div className="editor-wrapper">
          {/* Hint only; no button */}
          <div className="timestamp-hint mb-2">
            Type a time like <code>1:23</code> or <code>00:05:10</code> and I'll
            jump the video there automatically.
          </div>

          <ReactQuill
            ref={quillRef}
            value={note}
            onChange={handleEditorChange}
            modules={{
              toolbar: [
                ['bold', 'italic'],
                [{ list: 'ordered' }, { list: 'bullet' }],
              ],
            }}
            formats={['bold', 'italic', 'list', 'bullet']}
            placeholder="Write your note... Type a time to jump video (e.g. 00:01:23)."
          />

          <div className="editor-footer d-flex align-items-center justify-content-between">
            <span>{wordCount} / 1000</span>
            <div>
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                className="me-2"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </CButton>
              <CButton
                type="submit"
                color="success"
                disabled={isSubmitting}
                onClick={handleSave}
              >
                {isSubmitting
                  ? editingNoteId
                    ? 'Updating...'
                    : 'Saving...'
                  : editingNoteId
                  ? 'Update Note'
                  : 'Save Note'}
              </CButton>
            </div>
          </div>
        </div>
      )}

      {/* Saved Notes List */}
      <div
        className="note-list-scroll-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginTop: '1rem',
          scrollbarWidth: 'none',
        }}
      >
        {notes.map((n) => (
          <div key={n.id} className="note-card">
            <div
              className="note-content"
              onClick={handleNoteContentClick}
            >
              {/* show main timestamp at start */}
              <span
                className="clickable-timestamp note-main-timestamp"
                data-time={n.timestamp}
                style={{
                  color: '#199fcc',
                  marginRight: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: renderNoteWithClickableTimestamps(n.content),
                }}
                style={{ wordBreak: 'break-word' }}
              />
            </div>

            <div className="note-actions">
              <CTooltip content="Edit">
                <button
                  className="icon-btn"
                  onClick={() => handleEdit(n)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <CIcon
                    icon={cilPen}
                    style={{ height: 14, width: 14, color: '#199fcc' }}
                  />
                </button>
              </CTooltip>
              <CTooltip content="Delete">
                <button
                  className="icon-btn"
                  onClick={() => confirmDelete(n)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <CIcon
                    icon={cilTrash}
                    style={{ height: 14, width: 14, color: '#dc3545' }}
                  />
                </button>
              </CTooltip>
            </div>
          </div>
        ))}

        {loading && <div className="text-center">Loading more...</div>}
        {!hasMore && (
          <div className="text-center text-muted">No more notes.</div>
        )}
      </div>

      {/* Delete Modal */}
      <CModal visible={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
        <CModalHeader onClose={() => setNoteToDelete(null)}>
          Confirm Delete
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this note?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setNoteToDelete(null)}
          >
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteConfirmed}>
            Yes, Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Notes;

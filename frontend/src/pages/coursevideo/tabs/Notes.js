import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Notes.css';
import { FaPlus, FaChevronDown } from 'react-icons/fa';

const Notes = () => {
    const [showEditor, setShowEditor] = useState(false);
    const [note, setNote] = useState('');
    const [wordCount, setWordCount] = useState(0);

    const handleNoteChange = (value) => {
        const plainText = value.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const words = plainText.split(/\s+/).filter(Boolean);
        if (words.length <= 1000) {
            setNote(value);
            setWordCount(words.length);
        }
    };

    const handleSave = () => {
        console.log("Saved note:", note);
        setShowEditor(false);
    };

    const handleCancel = () => {
        setNote('');
        setShowEditor(false);
        setWordCount(0);
    };

    return (
        <div className="notes-wrapper">
            {!showEditor && (
                <div className="notes-input-wrapper" onClick={() => setShowEditor(true)}>
                    <input
                        type="text"
                        placeholder="Add a note..."
                        readOnly
                    />
                    <FaPlus className="plus-icon" />
                </div>
            )}

            {showEditor && (
                <div className="editor-wrapper">
                    <div className="editor-with-counter">
                        <ReactQuill
                            value={note}
                            onChange={handleNoteChange}
                            modules={{
                                toolbar: [
                                    [{ 'font': [] }],
                                    ['bold', 'italic'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ],
                            }}
                            formats={['font', 'bold', 'italic', 'list', 'bullet']}
                            placeholder="Write your note here..."
                        />
                        <div className="word-counter-top">{wordCount} / 1000</div>
                    </div>

                    <div className="editor-footer">
                        <div className="btn-group">
                            <button className="btn cancel-btn" onClick={handleCancel}>Cancel</button>
                            <button className="btn save-btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="filter-section">
                <div className="custom-dropdown">
                    <select defaultValue="All lectures">
                        <option value="All lectures">All lectures</option>
                        <option value="Option 2">Current lecture</option>
                    </select>
                    <FaChevronDown className="dropdown-icon" />
                </div>

                <div className="custom-dropdown">
                    <select defaultValue="Sort by most recent">
                        <option value="Sort by most recent">Sort by most recent</option>
                        <option value="Option 2">Sort by oldest</option>
                    </select>
                    <FaChevronDown className="dropdown-icon" />
                </div>
            </div>
        </div>
    )
}

export default Notes

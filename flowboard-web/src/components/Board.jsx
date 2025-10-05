import React, { useState, useEffect } from 'react';

// Sample initial data
const initialColumns = [
    { id: 1, title: 'To Do', cards: [{ id: 1, text: 'Sample Task 1' }] },
    { id: 2, title: 'In Progress', cards: [{ id: 2, text: 'Sample Task 2' }] },
    { id: 3, title: 'Done', cards: [{ id: 3, text: 'Sample Task 3' }] },
];

function Board() {
    // Load from localStorage when possible, otherwise use initial data
    const [columns, setColumns] = useState(() => {
        try {
            const raw = typeof window !== 'undefined' && window.localStorage.getItem('flowboard-columns');
            return raw ? JSON.parse(raw) : initialColumns;
        } catch (e) {
            return initialColumns;
        }
    });

    // persist to localStorage whenever columns change
    useEffect(() => {
        try {
            window.localStorage.setItem('flowboard-columns', JSON.stringify(columns));
        } catch (e) {
            // ignore
        }
    }, [columns]);

    // Move card between columns
    const moveCard = (cardId, fromColId, toColId) => {
        setColumns(prev => {
            let movingCard = null;
            const removed = prev.map(col => {
                if (col.id === fromColId) {
                    const newCards = col.cards.filter(c => {
                        if (c.id === cardId) {
                            movingCard = c;
                            return false;
                        }
                        return true;
                    });
                    return { ...col, cards: newCards };
                }
                return col;
            });

            return removed.map(col => {
                if (col.id === toColId && movingCard) {
                    return { ...col, cards: [...col.cards, movingCard] };
                }
                return col;
            });
        });
    };

    // Add new card to a column
    const addCard = (colId, text) => {
        const newCard = { id: Date.now() + Math.random(), text };
        setColumns(prev => prev.map(col => (col.id === colId ? { ...col, cards: [...col.cards, newCard] } : col)));
    };

    const editCard = (colId, cardId, newText) => {
        setColumns(prev => prev.map(col => {
            if (col.id !== colId) return col;
            return { ...col, cards: col.cards.map(c => (c.id === cardId ? { ...c, text: newText } : c)) };
        }));
    };

    const deleteCard = (colId, cardId) => {
        setColumns(prev => prev.map(col => (col.id === colId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col)));
    };

    const addColumn = (title) => {
        const newCol = { id: Date.now() + Math.random(), title: title || 'Untitled', cards: [] };
        setColumns(prev => [...prev, newCol]);
    };

    const deleteColumn = (colId) => {
        if (!window.confirm('Delete this column and all its cards?')) return;
        setColumns(prev => prev.filter(c => c.id !== colId));
    };

    return (
        <div>
            <h2 style={{ marginBottom: 8 }}>Flowboard</h2>
            <AddColumnForm onAdd={addColumn} />
            <div style={{ display: 'flex', gap: '16px', marginTop: 12 }}>
                {columns.map((col) => (
                    <div key={col.id} style={{ background: '#f4f4f4', padding: 16, borderRadius: 8, minWidth: 220, maxWidth: 320 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{col.title}</h3>
                            <button onClick={() => deleteColumn(col.id)} style={{ background: 'transparent', border: 'none', color: '#c00', cursor: 'pointer' }}>✕</button>
                        </div>

                        {col.cards.map(card => (
                            <div key={card.id} style={{ background: '#fff', margin: '8px 0', padding: 8, borderRadius: 4, boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
                                <div>{card.text}</div>
                                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {columns.map(targetCol => (
                                        targetCol.id !== col.id && (
                                            <button
                                                key={targetCol.id}
                                                onClick={() => moveCard(card.id, col.id, targetCol.id)}
                                                style={{ marginRight: 4 }}
                                            >
                                                Move to {targetCol.title}
                                            </button>
                                        )
                                    ))}
                                    <button onClick={() => {
                                        const newText = window.prompt('Edit card text', card.text);
                                        if (newText !== null) editCard(col.id, card.id, newText);
                                    }}>Edit</button>
                                    <button onClick={() => deleteCard(col.id, card.id)} style={{ color: '#900' }}>Delete</button>
                                </div>
                            </div>
                        ))}

                        <AddCardForm onAdd={text => addCard(col.id, text)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple form to add a card
function AddCardForm({ onAdd }) {
    const [text, setText] = useState('');
    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                if (text.trim()) {
                    onAdd(text.trim());
                    setText('');
                }
            }}
            style={{ marginTop: 8 }}
        >
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add card..."
                style={{ width: '70%', padding: '6px 8px' }}
            />
            <button type="submit" style={{ marginLeft: 4 }}>Add</button>
        </form>
    );
}

function AddColumnForm({ onAdd }) {
    const [title, setTitle] = useState('');
    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                if (title.trim()) {
                    onAdd(title.trim());
                    setTitle('');
                }
            }}
            style={{ display: 'flex', gap: 8 }}
        >
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New column title" style={{ padding: '6px 8px' }} />
            <button type="submit">Add Column</button>
        </form>
    );
}

export default Board;
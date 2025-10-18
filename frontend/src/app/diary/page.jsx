'use client';
import React, { useEffect, useMemo, useState } from 'react';
import './page.css';

const samplePhotos = [
    { id: '1', url: '/photo/2025-10-01_1.jpg', date: '2025-10-01', caption: '朝の散歩' },
    { id: '2', url: '/photo/2025-10-01_2.jpg', date: '2025-10-01', caption: '公園' },
    { id: '3', url: '/photo/2025-10-03_1.jpg', date: '2025-10-03', caption: '友達と' },
    { id: '4', url: '/photo/2025-09-28_1.jpg', date: '2025-09-28', caption: '夕焼け' },
];

function formatYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function DiaryPage() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-indexed
    const [photos, setPhotos] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/photos');
                if (!res.ok) throw new Error('no api');
                const data = await res.json();
                if (mounted) setPhotos(data);
            } catch {
                if (mounted) setPhotos(samplePhotos);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const grouped = useMemo(() => {
        const map = {};
        photos.forEach(p => {
            map[p.date] = map[p.date] || [];
            map[p.date].push(p);
        });
        return map;
    }, [photos]);

    const weeks = useMemo(() => {
        const first = new Date(year, month, 1);
        const startWeekday = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const arr = [];
        let week = new Array(startWeekday).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            week.push(new Date(year, month, d));
            if (week.length === 7) {
                arr.push(week);
                week = [];
            }
        }
        if (week.length) {
            while (week.length < 7) week.push(null);
            arr.push(week);
        }
        return arr;
    }, [year, month]);

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    return (
        <div className="diary-root">
            <header className="diary-header">
                <button onClick={prevMonth} aria-label="前の月">◀</button>
                <h2>{year}年 {month + 1}月</h2>
                <button onClick={nextMonth} aria-label="次の月">▶</button>
            </header>

            <table className="calendar">
                <thead>
                    <tr>
                        <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, i) => (
                        <tr key={i}>
                            {week.map((day, j) => {
                                if (!day) return <td key={j} className="empty"></td>;
                                const ymd = formatYMD(day);
                                const dayPhotos = grouped[ymd] || [];
                                return (
                                    <td key={j} className="day-cell">
                                        <div className="day-number">{day.getDate()}</div>
                                        <div className="thumbs">
                                            {dayPhotos.slice(0, 3).map(p => (
                                                <img
                                                    key={p.id}
                                                    src={p.url}
                                                    alt={p.caption || ''}
                                                    className="thumb"
                                                    onClick={() => setSelected(p)}
                                                />
                                            ))}
                                        </div>
                                        {dayPhotos.length > 3 && (
                                            <div className="more-count">+{dayPhotos.length - 3}</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selected && (
                <div className="modal" onClick={() => setSelected(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close" onClick={() => setSelected(null)}>✕</button>
                        <img src={selected.url} alt={selected.caption} />
                        <p className="caption">{selected.caption}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
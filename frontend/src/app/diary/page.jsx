'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import './page.css';

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
    const [error, setError] = useState(null); // 追加
    const [dayComments, setDayComments] = useState([]);
    const [aiComment, setAiComment] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // --- timelapse state ---
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0); // 0..1
    const [timelapseUrl, setTimelapseUrl] = useState(null);
    const videoPreviewRef = useRef(null);

    // pressed state for button press animation
    const [pressed, setPressed] = useState(false);

    // detect if currently displayed month is "month-end" (今日がその月の最終日)
    const isCurrentMonthDisplayed = year === today.getFullYear() && month === today.getMonth();
    const lastDayOfDisplayedMonth = new Date(year, month + 1, 0).getDate();
    const isMonthEnd = isCurrentMonthDisplayed && today.getDate() === lastDayOfDisplayedMonth;

    // add a class name variable for the button
    const timelapseBtnClass = isMonthEnd ? 'timelapse-btn glow' : 'timelapse-btn';

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/photos');
                if (!res.ok) {
                    // APIがエラーを返した場合は例外で落とさずにハンドリングする
                    const text = await res.text().catch(() => null);
                    console.warn('fetch /api/photos failed', res.status, text);
                    if (mounted) {
                        setPhotos([]);
                        setError(text || `API error: ${res.status}`);
                    }
                    return;
                }
                const data = await res.json();
                if (mounted) {
                    setPhotos(data);
                    setError(null);
                }
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setPhotos([]);
                    setError(err.message || 'fetch error');
                }
            }
        })();
        return () => { mounted = false; };
    }, []);

    // helper: load image with CORS handling (may taint canvas if CORS not allowed)
    async function loadImage(url) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error('image load error: ' + url));
            img.src = url;
        });
    }
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // generate timelapse for currently visible month
    async function generateTimelapse() {
        if (generating) return;
        setTimelapseUrl(null);
        setGenerating(true);
        setProgress(0);
        try {
            // collect photos in this month
            const monthPhotos = photos
                .filter(p => {
                    const d = new Date(p.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                })
                .slice() // clone
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (monthPhotos.length === 0) {
                setError('この月の写真がありません。');
                setGenerating(false);
                return;
            }

            if (typeof HTMLCanvasElement === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
                setError('ブラウザが canvas.captureStream をサポートしていません。別のブラウザでお試しください。');
                setGenerating(false);
                return;
            }

            // prepare canvas
            const firstImg = await loadImage(monthPhotos[0].url).catch(() => null);
            const width = firstImg ? Math.max(640, firstImg.naturalWidth) : 1280;
            const height = firstImg ? Math.max(480, firstImg.naturalHeight) : 720;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const fps = 2; // frames per second
            const frameDuration = 1000 / fps; // ms per frame

            const stream = canvas.captureStream(fps);
            const mime = 'video/webm; codecs=vp9';
            let recorder;
            try {
                recorder = new MediaRecorder(stream, { mimeType: mime });
            } catch (e) {
                // try without codec hint
                recorder = new MediaRecorder(stream);
            }
            const chunks = [];
            recorder.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
            const stopPromise = new Promise((resolve) => {
                recorder.onstop = () => resolve();
            });
            recorder.start();

            // draw each photo as a frame (each image shown for frameCountPerPhoto frames)
            // show one frame per photo to keep output short; adjust if you want longer per photo
            for (let i = 0; i < monthPhotos.length; i++) {
                const p = monthPhotos[i];
                try {
                    const img = await loadImage(p.url);
                    // cover canvas (letterbox)
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // compute fit
                    const arImg = img.naturalWidth / img.naturalHeight;
                    const arCanvas = canvas.width / canvas.height;
                    let dw, dh, dx, dy;
                    if (arImg > arCanvas) {
                        dh = canvas.height;
                        dw = dh * arImg;
                        dx = (canvas.width - dw) / 2;
                        dy = 0;
                    } else {
                        dw = canvas.width;
                        dh = dw / arImg;
                        dx = 0;
                        dy = (canvas.height - dh) / 2;
                    }
                    ctx.drawImage(img, dx, dy, dw, dh);
                } catch (err) {
                    // on image load error, leave previous frame / blank
                    console.warn('load image failed for timelapse', p.url, err);
                    ctx.fillStyle = '#444';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                // wait for at least one frameDuration so MediaRecorder captures this frame
                await sleep(frameDuration);
                setProgress((i + 1) / monthPhotos.length);
            }

            recorder.stop();
            await stopPromise;

            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setTimelapseUrl(url);
            // autoplay preview if available
            await sleep(50);
            if (videoPreviewRef.current) {
                videoPreviewRef.current.src = url;
                videoPreviewRef.current.controls = true;
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'タイムラプス作成中にエラーが発生しました。');
        } finally {
            setGenerating(false);
            setProgress(0);
        }
    }

    const grouped = useMemo(() => {
        const map = {};
        photos.forEach(p => {
            map[p.date] = map[p.date] || [];
            map[p.date].push(p);
        });
        return map;
    }, [photos]);

    // selected が変わったら、その日のユーザーコメント一覧を取得し、AI要約を取得（/api/ai-summary があれば利用、なければ簡易要約）
    useEffect(() => {
        if (!selected) {
            setDayComments([]);
            setAiComment(null);
            setAiLoading(false);
            return;
        }
        const ymd = selected.date;
        const comments = (grouped[ymd] || []).map(p => p.caption).filter(Boolean);
        setDayComments(comments);

        (async () => {
            setAiLoading(true);
            // サーバー側でAI要約を行うエンドポイントがあれば呼ぶ（任意）。無ければローカルで簡易要約。
            try {
                const res = await fetch('/api/ai-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: ymd, comments })
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.summary) {
                        setAiComment(json.summary);
                        setAiLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // 無視してローカル要約へフォールバック
            }

            // フォールバックの簡易要約
            let summary;
            if (comments.length === 0) summary = 'この日はコメントがありません。';
            else if (comments.length === 1) summary = `一言でまとめると：${comments[0]}`;
            else {
                const sample = comments.slice(0, 2).join(' / ');
                const rest = Math.max(0, comments.length - 2);
                summary = rest > 0 ? `${sample} …他 ${rest} 件の思い出` : sample;
            }
            setAiComment(summary);
            setAiLoading(false);
        })();
    }, [selected, grouped]);

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
            {/* inject styles here so page.css を触らずにアニメーションを追加 */}
            <style>{`
                .timelapse-btn {
                    padding: 10px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.08);
                    background: #f5f5f5;
                    color: #111;
                    font-size: 15px;
                    font-weight: 600;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 120ms ease, box-shadow 120ms ease, opacity 160ms ease;
                }
                .timelapse-btn:active { transform: scale(0.98); }

                /* 月末のときに光って動くスタイル */
                .glow {
                    background: linear-gradient(90deg, #ff8a00 0%, #e52e71 50%, #8a2be2 100%);
                    color: #fff;
                    border: none;
                    box-shadow: 0 8px 30px rgba(229,46,113,0.28), 0 0 0 rgba(232, 88, 123, 0.35);
                    animation: glowPulse 2.2s infinite ease-in-out, floatUp 3s infinite ease-in-out;
                }

                @keyframes glowPulse {
                    0% {
                        box-shadow: 0 6px 24px rgba(229,46,113,0.18), 0 0 0 rgba(229,46,113,0.10);
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        box-shadow: 0 18px 40px rgba(229,46,113,0.30), 0 0 24px rgba(229,46,113,0.12);
                        transform: translateY(-3px) scale(1.02);
                    }
                    100% {
                        box-shadow: 0 6px 24px rgba(229,46,113,0.18), 0 0 0 rgba(229,46,113,0.10);
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes floatUp {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                    100% { transform: translateY(0); }
                }

                /* カレンダー全体を丸く・余白を与える */
                .calendar {
                    border-collapse: separate;
                    border-spacing: 10px;
                    width: 100%;
                }
                .calendar th {
                    padding: 8px 6px;
                    font-weight: 600;
                    color: #555;
                }

                /* 日セルを丸く、余白と背景を追加 */
                .day-cell {
                    position: relative;
                    overflow: visible;
                    background: rgba(255,255,255,0.92);
                    border-radius: 14px;
                    padding: 10px;
                    transition: box-shadow 180ms ease, transform 180ms ease, background 160ms ease;
                    min-width: 86px;
                    height: 86px;
                    vertical-align: top;
                }
                /* ホバーで浮き上がる感じ */
                .day-cell:hover {
                    box-shadow: 0 14px 36px rgba(12,12,20,0.08);
                    transform: translateY(-4px);
                    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,248,250,0.98));
                }

                .empty {
                    background: transparent;
                }

                .day-number {
                    display: inline-block;
                    padding: 6px 8px;
                    border-radius: 10px;
                    font-size: 13px;
                    color: #333;
                    background: rgba(0,0,0,0.04);
                    margin-bottom: 6px;
                }

                .thumbs {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 6px;
                }

                .thumb {
                    width: 48px;
                    height: 48px;
                    object-fit: cover;
                    border-radius: 10px;
                    transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms ease;
                    display: inline-block;
                    vertical-align: middle;
                }
                .thumb + .thumb {
                    margin-left: 6px;
                }

                /* 日セルにカーソルが乗ったらそのセル内のサムネイルを少し拡大 */
                .day-cell:hover .thumb {
                    transform: scale(1.12);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.16);
                    z-index: 2;
                    position: relative;
                }

                /* 個別のサムネイルに直接ホバーしたときはさらに拡大 */
                .thumb:hover {
                    transform: scale(1.26);
                    box-shadow: 0 18px 30px rgba(0,0,0,0.22);
                    z-index: 3;
                }

                /* カレンダーの角をより丸く見せるためにテーブル自体にも軽い角を付与 */
                .calendar-wrapper {
                    border-radius: 16px;
                    padding: 8px;
                    background: transparent;
                }
            `}</style>

            <header className="diary-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={prevMonth} aria-label="前の月">◀</button>
                <h2 style={{ margin: 0 }}>{year}年 {month + 1}月</h2>
                <button onClick={nextMonth} aria-label="次の月">▶</button>

                {/* timelapse controls */}
                <div style={{ marginLeft: 12 }}>
                    <button
                        onClick={generateTimelapse}
                        disabled={generating}
                        aria-label="毎日投稿して思い出を残そう！"
                        onMouseDown={() => setPressed(true)}
                        onMouseUp={() => setPressed(false)}
                        onMouseLeave={() => setPressed(false)}
                        className={timelapseBtnClass}
                        style={{ cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1 }}
                    >
                        {isMonthEnd ? '月末！リキャプチャをみて一か月を振り返ろう！' : (generating ? '作成中…' : '毎日投稿して思い出を残そう！')}
                    </button>
                </div>
            </header>

            {error && (
                <div className="api-error" style={{ color: 'crimson', padding: 8 }}>
                    サーバーから写真を取得できませんでした: {error}
                </div>
            )}

            {/* progress / preview */}
            {generating && (
                <div style={{ padding: 8 }}>
                    作成中: {(progress * 100).toFixed(0)}%
                </div>
            )}
            {timelapseUrl && (
                <div style={{ padding: 8 }}>
                    <div>タイムラプスをプレビュー・ダウンロードできます:</div>
                    <video ref={videoPreviewRef} src={timelapseUrl} style={{ maxWidth: '100%', display: 'block', marginTop: 8 }} controls />
                    <a href={timelapseUrl} download={`timelapse-${year}-${String(month + 1).padStart(2, '0')}.webm`} style={{ display: 'inline-block', marginTop: 8 }}>
                        ダウンロード (.webm)
                    </a>
                </div>
            )}

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
                        {/* 画像はクリックで新しいタブで開く */}
                        <img
                            src={selected.url}
                            alt={selected.caption}
                            style={{ maxWidth: '100%', cursor: 'zoom-in' }}
                            onClick={() => window.open(selected.url, '_blank')}
                        />
                        <div style={{ marginTop: 12 }}>
                            <strong>ユーザーコメント</strong>
                            {dayComments.length === 0 ? (
                                <div style={{ color: '#666' }}>コメントはありません</div>
                            ) : (
                                <ul style={{ marginTop: 6 }}>
                                    {dayComments.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            )}
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <strong>AIのコメント</strong>
                            <div style={{ color: '#333', marginTop: 6 }}>
                                {aiLoading ? '要約を生成中...' : (aiComment || '—')}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

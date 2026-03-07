import type { CSSProperties } from 'react';

const shimmer: CSSProperties = {
  background: 'linear-gradient(90deg, #1a1a1a 25%, #333 50%, #1a1a1a 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 6,
};

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .video-page{display:flex;gap:24px}
        .video-main{flex:1;min-width:0}
        .video-sidebar{width:400px;min-width:340px}
        @media(max-width:1024px){
          .video-page{flex-direction:column}
          .video-sidebar{width:100%}
        }
      `}</style>
      <div className="video-page">
        <div className="video-main">
          <div style={{ ...shimmer, width: '100%', aspectRatio: '16/9', borderRadius: 12 }} />
          <div style={{ ...shimmer, height: 24, width: '60%', marginTop: 12 }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ ...shimmer, height: 20, width: 60, borderRadius: 12 }} />
            ))}
          </div>
          <div style={{ ...shimmer, height: 14, width: '80%', marginTop: 12 }} />
          <div style={{ ...shimmer, height: 14, width: '40%', marginTop: 8 }} />
        </div>
        <aside className="video-sidebar">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: 4, marginBottom: 8 }}>
              <div
                style={{
                  ...shimmer,
                  width: 168,
                  minWidth: 168,
                  aspectRatio: '16/9',
                  borderRadius: 8,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ ...shimmer, height: 14, width: '90%', marginBottom: 8 }} />
                <div style={{ ...shimmer, height: 11, width: '70%' }} />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}


interface Genre {
  id: string;
  name: string;
}

export default function GenrePopover({ open, genres, selected, onSelect, onClose }: {
  open: boolean;
  genres: Genre[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ccc', padding: 16, zIndex: 1000 }}>
      <h4>Select Genres</h4>
      <div>
        {genres.map(g => (
          <label key={g.id} style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={selected.includes(g.id)}
              onChange={e => {
                if (e.target.checked) onSelect([...selected, g.id]);
                else onSelect(selected.filter(id => id !== g.id));
              }}
            />
            {g.name}
          </label>
        ))}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

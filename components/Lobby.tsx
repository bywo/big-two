export default function Lobby({ createRoom }: { createRoom: () => void }) {
  return (
    <div>
      Lobby
      <button onClick={createRoom}>Create room</button>
    </div>
  );
}

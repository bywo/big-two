export default function Lobby({ createRoom }: { createRoom: () => void }) {
  return (
    <div>
      Lobby
      <button onClick={createRoom}>Create room</button>
      <div>
        Icons made by{" "}
        <a
          href="https://www.flaticon.com/authors/freepik"
          title="Freepik"
          target="_blank"
          rel="noopener"
        >
          Freepik
        </a>{" "}
        from{" "}
        <a
          href="https://www.flaticon.com/"
          title="Flaticon"
          target="_blank"
          rel="noopener"
        >
          {" "}
          www.flaticon.com
        </a>
      </div>
    </div>
  );
}

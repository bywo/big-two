import Button from "./Button";

export default function Lobby({ createRoom }: { createRoom: () => void }) {
  return (
    <div>
      Lobby
      <Button onClick={createRoom}>Create room</Button>
      <div className="attribution">
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
      <style jsx>{`
        .attribution {
          font-size: 12px;
        }

        .attribution a {
          color: #abe2ff;
        }
      `}</style>
    </div>
  );
}

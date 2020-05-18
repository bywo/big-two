import Button from "./Button";
import { darkGray, title, link } from "components/shared";

export default function Lobby({ createRoom }: { createRoom: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        padding: 20,
      }}
    >
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          style={{ width: 80, marginLeft: -18 }}
          src="/icons/two-cards.svg"
        />
        <div style={{ height: 5 }} />
        <h1 style={{ ...title, padding: 0, margin: 0, color: darkGray }}>
          Big 2
        </h1>
        <div style={{ height: 30 }} />
        <Button onClick={createRoom}>Create room</Button>
      </div>
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
          color: ${darkGray};
        }

        .attribution a {
          color: ${link};
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

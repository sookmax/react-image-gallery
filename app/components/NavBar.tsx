import GithubIcon from "./icons/GithubIcon";

export default function NavBar() {
  return (
    <nav
      className="h-16 w-full z-10 flex items-center justify-between mb-1 opacity-90"
      style={{
        position: "sticky",
        top: 0,
        backgroundImage:
          "radial-gradient(rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 1) 1px)",
        backgroundSize: "4px 4px",
        backdropFilter: "blur(4px)",
        // fontFamily: "'Audiowide', sans-serif",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <div
        className="ml-2 font-bold text-xl sm:text-2xl text-gray-100"
        style={{
          textShadow: "-2px -2px 1px #14b8a6, 2px 2px 1px #ec4899",
        }}
      >
        React Image Gallery
      </div>
      <div className="flex justify-center items-center mr-2">
        <a
          className="w-7 h-7 inline-block"
          href="https://github.com/sookmax/react-image-gallery"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon />
        </a>
      </div>
    </nav>
  );
}

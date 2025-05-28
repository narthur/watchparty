import { Link } from "react-router";
import { SignOutButton } from "./SignOutButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
      <Link to="/" className="text-xl font-semibold text-primary">
        Watch Party
      </Link>
      <SignOutButton />
    </header>
  );
}
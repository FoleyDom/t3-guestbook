import { signIn, signOut, useSession } from "next-auth/react";

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  return (
    <>
      <h1>Guestbook</h1>
      {session ? (
        <div>
          <p>hi {session.user?.name}</p>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => signIn("discord")}>Login with discord</button>
        </div>
      )}
    </>
  );
};

export default Home;

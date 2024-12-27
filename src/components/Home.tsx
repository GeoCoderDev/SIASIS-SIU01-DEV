import Image from "next/image";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <p data-testId="desc">This is my description</p>
      <Image
        src="/images/svg/Logo.svg"
        alt="Next.js Logo"
        width={200}
        height={200}
      />
    </div>
  );
};

export default Home;

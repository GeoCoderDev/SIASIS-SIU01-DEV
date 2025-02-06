import Image from "next/image";

const Home = () => {
  return (
    <div>
      <h1 className="text-[2rem] hover:text-azul-principal">REGISTRAR RESPONSABLES</h1>
      <p data-testId="desc">This is my description</p>
      <Image
        src="/images/svg/Logo.svg"
        alt="Colegio Asuncion 8 Logo"
        width={200}
        height={200}
      />
    </div>
  );
};

export default Home;

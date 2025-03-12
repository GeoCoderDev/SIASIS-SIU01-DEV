import UserCard from "../../../components/shared/cards/UserCard";
const MisDatos = () => {
  return (
    <div className="border-2 border-blue-500 w-full max-w-[75rem] h-full grid grid-cols-7 grid-rows-[min-content_1fr]">
      <div className="flex col-span-full border-2">
        <h1 className="font-medium text-[2.5rem]">MIS DATOS</h1>
      </div>
      <div className="col-span-4 border-2">Textos</div>

      <div className="flex w-full h-full justify-center col-span-3">
        <UserCard />
      </div>
    </div>
  );
};

export default MisDatos;

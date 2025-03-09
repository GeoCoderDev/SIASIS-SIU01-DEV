import React from "react";

const Loader = ({className}:{className?:string}) => {
  return (
    <>
      <div className={`loader w-[2.2rem] p-[0.3rem] bg-white ${className}`}></div>
    </>
  );
};

export default Loader;

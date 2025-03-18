import React from "react";

const Loader = ({className}:{className?:string}) => {
  return (
    <>
      <div  className={`loader  bg-white ${className}`}></div>
    </>
  );
};

export default Loader;

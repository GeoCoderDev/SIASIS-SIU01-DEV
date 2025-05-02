"use client"

const NotFound404 = () => {
  return (
    <>
      <div>No encontrado</div>
      <button
        onClick={async () => {
          const res = await fetch("/api/evento", {
            method: "POST",
          });
          if (res.status === 204) {
            console.log("GATILLADO");
          }
        }}
      >
        HOLAAAAAAAAAAA
      </button>
    </>
  );
};

export default NotFound404;

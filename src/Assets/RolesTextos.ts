// Definimos una interfaz para cada entrada de rol
interface RolFormat {
  desktop: string;
  mobile: string;
}

// Definimos una interfaz para el objeto completo de roles
export interface RolesEspañolType {
  D: RolFormat;
  PP: RolFormat;
  A: RolFormat;
  PS: RolFormat;
  T: RolFormat;
  R: RolFormat;
  PA: RolFormat;
}

// Objeto de roles con versiones para desktop y mobile
export const RolesTextos: RolesEspañolType = {
  D: {
    desktop: "Directivo",
    mobile: "Directivo",
  },
  PP: {
    desktop: "Profesor de Primaria",
    mobile: "Prof. Primaria",
  },
  A: {
    desktop: "Auxiliar",
    mobile: "Auxiliar",
  },
  PS: {
    desktop: "Profesor de Secundaria",
    mobile: "Prof. Secundaria",
  },
  T: {
    desktop: "Tutor de Secundaria",
    mobile: "Tutor Sec.",
  },
  R: {
    desktop: "Responsable",
    mobile: "Responsable",
  },
  PA: {
    desktop: "Personal de Limpieza",
    mobile: "P. Limpieza",
  },
};

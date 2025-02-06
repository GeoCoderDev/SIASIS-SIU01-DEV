// src/utils/csvUtils.ts
export const downloadCSVTemplate = (templateType: string) => {
    let columnNames: string[] = [];
  
    switch (templateType) {
      case "admins":
        columnNames = ["Nombre_Usuario", "Contraseña"];
        break;
      case "students":
        columnNames = [
          "Nombres",
          "Apellidos",
          "DNI_Estudiante",
          "Nombre_Usuario",
          "Contraseña",
          "Fecha_Nacimiento",
          "Direccion_Domicilio",
          "Telefono",
          "Nombre_Contacto_Emergencia",
          "Parentezco_Contacto_Emergencia",
          "Telefono_Contacto_Emergencia",
        ];
        break;
      case "teachers":
        columnNames = [
          "DNI_Profesor",
          "Nombres",
          "Apellidos",
          "Fecha_Nacimiento",
          "Nombre_Usuario",
          "Contraseña_Usuario",
          "Direccion_Domicilio",
          "Telefono",
          "Nombre_Contacto_Emergencia",
          "Parentezco_Contacto_Emergencia",
          "Telefono_Contacto_Emergencia",
        ];
        break;
      default:
        columnNames = [];
    }
  
    // const templateData = columnNames.join(",") + "\n";
    // const blob = new Blob([templateData], { type: "text/csv;charset=utf-8;" });
    
    const templateData = columnNames.join(",") + "\n";

    // Asegúrate de que los datos están codificados en UTF-8
    const utf8Bom = "\uFEFF"; // Esto es el Byte Order Mark (BOM) para UTF-8
    const blob = new Blob([utf8Bom + templateData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateType}_plantilla.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
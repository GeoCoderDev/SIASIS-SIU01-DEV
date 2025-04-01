/**
 * Transforma un timestamp ISO 8601 a un formato de hora 12h (por ejemplo: "8:00am", "4:00pm")
 * @param isoTimestamp - String en formato ISO "1970-01-01T08:00:00.000Z"
 * @returns String formateado como "8:00am"
 */
export default function formatearISOaFormato12Horas(
  isoTimestamp: string
): string {
  try {
    // Crear objeto Date a partir del timestamp ISO
    const fecha = new Date(isoTimestamp);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      return "Formato de fecha inválido";
    }

    // Obtener horas y minutos
    let horas = fecha.getUTCHours();
    const minutos = fecha.getUTCMinutes();

    // Determinar AM o PM
    const periodo = horas >= 12 ? "pm" : "am";

    // Convertir a formato 12 horas
    horas = horas % 12;
    horas = horas ? horas : 12; // Si es 0, mostrar como 12

    // Formatear minutos con ceros a la izquierda si es necesario
    const minutosFormateados = minutos < 10 ? `0${minutos}` : minutos;

    // Construir la cadena de resultado
    return `${horas}:${minutosFormateados}${periodo}`;
  } catch (error) {
    console.log(error);
    // Error al procesar la fecha
    return "##:##";
  }
}

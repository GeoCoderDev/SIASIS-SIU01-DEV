import { DIA_ESCOLAR_MINIMO_PARA_CONSULTAR_API } from "@/constants/DISPONIBILLIDAD_IDS_RDP02_GENERADOS";
import store from "@/global/store";

/**
 * 🎯 RESPONSABILIDAD: Manejo de fechas y lógica temporal
 * - Obtener fecha actual desde Redux
 * - Calcular días escolares
 * - Validar rangos de fechas
 * - Determinar lógica de consulta a API
 */
export class AsistenciaDePersonalDateHelper {
  /**
   * Obtiene la fecha actual desde el estado de Redux
   * @returns Objeto Date con la fecha actual según el estado global o null si no se puede obtener.
   */
  public obtenerFechaActualDesdeRedux(): Date | null {
    try {
      // Obtenemos el estado actual de Redux
      const state = store.getState();

      // Accedemos a la fecha del estado global
      const fechaHoraRedux = state.others.fechaHoraActualReal.fechaHora;

      // Si tenemos fecha en Redux, la usamos
      if (fechaHoraRedux) {
        return new Date(fechaHoraRedux);
      }

      // Si no se puede obtener la fecha de Redux, retornamos null
      return null;
    } catch (error) {
      console.error(
        "Error al obtener fecha desde Redux en AsistenciaPersonalDateHelper:",
        error
      );
      return null;
    }
  }

  /**
   * Calcula el día escolar del mes (sin contar fines de semana)
   */
  public calcularDiaEscolarDelMes(): number {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // 0-11
    const diaActual = fechaActual.getDate();

    let diaEscolar = 0;

    // Contar solo días hábiles (lunes a viernes) desde el inicio del mes hasta hoy
    for (let dia = 1; dia <= diaActual; dia++) {
      const fecha = new Date(anio, mes, dia);
      const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      // Si es día hábil (lunes a viernes)
      if (diaSemana >= 1 && diaSemana <= 5) {
        diaEscolar++;
      }
    }

    return diaEscolar;
  }

  /**
   * Determina si debemos consultar la API basándose en el día escolar
   */
  public debeConsultarAPI(diaEscolar: number): boolean {
    // Si estamos en el primer día escolar del mes, es seguro que no hay IDs en PostgreSQL
    if (diaEscolar <= 1) {
      return false;
    }

    // A partir del segundo día escolar, es probable que ya tengamos registros con IDs
    return diaEscolar >= DIA_ESCOLAR_MINIMO_PARA_CONSULTAR_API;
  }

  /**
   * Obtiene todos los días laborales anteriores al día actual en el mes (usando fecha Redux)
   */
  public obtenerDiasLaboralesAnteriores(): number[] {
    const fechaActual = this.obtenerFechaActualDesdeRedux();

    if (!fechaActual) {
      console.error("No se pudo obtener la fecha desde Redux");
      return [];
    }

    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // 0-11
    const diaActual = fechaActual.getDate();

    const diasLaborales: number[] = [];

    // Buscar días hábiles (lunes a viernes) desde el inicio del mes hasta AYER
    for (let dia = 1; dia < diaActual; dia++) {
      // Nota: dia < diaActual (no <=)
      const fecha = new Date(anio, mes, dia);
      const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      // Si es día hábil (lunes a viernes)
      if (diaSemana >= 1 && diaSemana <= 5) {
        diasLaborales.push(dia);
      }
    }

    return diasLaborales;
  }

  /**
   * Función para verificar si un día es día escolar (lunes a viernes)
   */
  public esDiaEscolar(dia: string, fechaRef?: Date): boolean {
    const fechaActual = fechaRef || this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    const diaNumero = parseInt(dia);
    if (isNaN(diaNumero)) return false;

    const añoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth(); // 0-11

    const fecha = new Date(añoActual, mesActual, diaNumero);
    const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    return diaSemana >= 1 && diaSemana <= 5; // Solo lunes a viernes
  }

  /**
   * Verifica si es una consulta del mes actual
   */
  public esConsultaMesActual(mes: number): boolean {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    return mes === fechaActual.getMonth() + 1;
  }

  /**
   * Obtiene el mes actual
   */
  public obtenerMesActual(): number | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.getMonth() + 1 : null;
  }

  /**
   * Obtiene el día actual
   */
  public obtenerDiaActual(): number | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.getDate() : null;
  }

  /**
   * Convierte la fecha actual a string formato YYYY-MM-DD
   */
  public obtenerFechaStringActual(): string | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.toISOString().split("T")[0] : null;
  }

  /**
   * Convierte una fecha específica a string formato YYYY-MM-DD
   */
  public convertirFechaAString(fecha: Date): string {
    return fecha.toISOString().split("T")[0];
  }

  /**
   * Genera string de fecha para mes y día específicos
   */
  public generarFechaString(mes: number, dia: number, año?: number): string {
    const añoFinal =
      año ||
      this.obtenerFechaActualDesdeRedux()?.getFullYear() ||
      new Date().getFullYear();

    return `${añoFinal}-${mes.toString().padStart(2, "0")}-${dia
      .toString()
      .padStart(2, "0")}`;
  }
}

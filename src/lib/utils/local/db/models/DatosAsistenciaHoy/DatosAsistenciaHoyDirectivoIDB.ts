import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  DirectivoAsistenciaResponse,
  HorarioTomaAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";
import { DatosBaseAsistenciaHoyIDB } from "./DatosBaseAsistenciaHoyIDB";

export class DatosAsistenciaHoyDirectivoIDB extends DatosBaseAsistenciaHoyIDB<DirectivoAsistenciaResponse> {
  protected rolPrincipal: RolesSistema = RolesSistema.Directivo;

  /**
   * Obtiene la lista completa de personal administrativo
   */
  public async obtenerPersonalAdministrativo(): Promise<
    DirectivoAsistenciaResponse["ListaDePersonalesAdministrativos"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.ListaDePersonalesAdministrativos || null;
    } catch (error) {
      this.handleError(error, "obtenerPersonalAdministrativo");
      return null;
    }
  }

  /**
   * Obtiene un miembro específico del personal administrativo por DNI
   */
  public async obtenerPersonalAdministrativoPorDNI(
    dni: string
  ): Promise<
    DirectivoAsistenciaResponse["ListaDePersonalesAdministrativos"][0] | null
  > {
    try {
      const personal = await this.obtenerPersonalAdministrativo();
      if (!personal) return null;

      const miembro = personal.find(
        (p) => p.DNI_Personal_Administrativo === dni
      );
      return miembro || null;
    } catch (error) {
      this.handleError(error, "obtenerPersonalAdministrativoPorDNI", { dni });
      return null;
    }
  }

  /**
   * Obtiene la lista completa de profesores de primaria
   */
  public async obtenerProfesoresPrimaria(): Promise<
    DirectivoAsistenciaResponse["ListaDeProfesoresPrimaria"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.ListaDeProfesoresPrimaria || null;
    } catch (error) {
      this.handleError(error, "obtenerProfesoresPrimaria");
      return null;
    }
  }

  /**
   * Obtiene un profesor de primaria específico por DNI
   */
  public async obtenerProfesorPrimariaPorDNI(
    dni: string
  ): Promise<
    DirectivoAsistenciaResponse["ListaDeProfesoresPrimaria"][0] | null
  > {
    try {
      const profesores = await this.obtenerProfesoresPrimaria();
      if (!profesores) return null;

      const profesor = profesores.find((p) => p.DNI_Profesor_Primaria === dni);
      return profesor || null;
    } catch (error) {
      this.handleError(error, "obtenerProfesorPrimariaPorDNI", { dni });
      return null;
    }
  }

  /**
   * Obtiene la lista completa de profesores de secundaria
   */
  public async obtenerProfesoresSecundaria(): Promise<
    DirectivoAsistenciaResponse["ListaDeProfesoresSecundaria"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.ListaDeProfesoresSecundaria || null;
    } catch (error) {
      this.handleError(error, "obtenerProfesoresSecundaria");
      return null;
    }
  }

  /**
   * Obtiene un profesor de secundaria específico por DNI
   */
  public async obtenerProfesorSecundariaPorDNI(
    dni: string
  ): Promise<
    DirectivoAsistenciaResponse["ListaDeProfesoresSecundaria"][0] | null
  > {
    try {
      const profesores = await this.obtenerProfesoresSecundaria();
      if (!profesores) return null;

      const profesor = profesores.find(
        (p) => p.DNI_Profesor_Secundaria === dni
      );
      return profesor || null;
    } catch (error) {
      this.handleError(error, "obtenerProfesorSecundariaPorDNI", { dni });
      return null;
    }
  }

  /**
   * Obtiene todos los horarios laborales generales
   */
  public async obtenerHorariosLaboralesGenerales(): Promise<
    DirectivoAsistenciaResponse["HorariosLaboraresGenerales"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorariosLaboraresGenerales || null;
    } catch (error) {
      this.handleError(error, "obtenerHorariosLaboralesGenerales");
      return null;
    }
  }

  /**
   * Obtiene el horario específico para la toma de asistencia de profesores de primaria
   */
  public async obtenerHorarioTomaAsistenciaProfesoresPrimaria(): Promise<HorarioTomaAsistencia | null> {
    try {
      const horarios = await this.obtenerHorariosLaboralesGenerales();
      return horarios?.TomaAsistenciaProfesorPrimaria || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioTomaAsistenciaProfesoresPrimaria");
      return null;
    }
  }

  /**
   * Obtiene el horario específico para la toma de asistencia de auxiliares
   */
  public async obtenerHorarioTomaAsistenciaAuxiliares(): Promise<HorarioTomaAsistencia | null> {
    try {
      const horarios = await this.obtenerHorariosLaboralesGenerales();
      return horarios?.TomaAsistenciaAuxiliares || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioTomaAsistenciaAuxiliares");
      return null;
    }
  }

  /**
   * Obtiene el horario para toma de asistencia general de personal
   */
  public async obtenerHorarioTomaAsistenciaPersonal(): Promise<HorarioTomaAsistencia | null> {
    try {
      const horarios = await this.obtenerHorariosLaboralesGenerales();
      return horarios?.TomaAsistenciaRangoTotalPersonales || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioTomaAsistenciaPersonal");
      return null;
    }
  }

  /**
   * Obtiene todos los horarios escolares por nivel educativo
   */
  public async obtenerHorariosEscolares(): Promise<
    DirectivoAsistenciaResponse["HorariosEscolares"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorariosEscolares || null;
    } catch (error) {
      this.handleError(error, "obtenerHorariosEscolares");
      return null;
    }
  }

  /**
   * Obtiene el horario escolar específico para un nivel educativo
   */
  public async obtenerHorarioEscolarNivel(
    nivel: NivelEducativo
  ): Promise<HorarioTomaAsistencia | null> {
    try {
      const horarios = await this.obtenerHorariosEscolares();
      if (!horarios) return null;

      return horarios[nivel] || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioEscolarNivel", { nivel });
      return null;
    }
  }

  /**
   * Obtiene el horario escolar de primaria
   */
  public async obtenerHorarioEscolarPrimaria(): Promise<HorarioTomaAsistencia | null> {
    return this.obtenerHorarioEscolarNivel(NivelEducativo.PRIMARIA);
  }

  /**
   * Obtiene el horario escolar de secundaria
   */
  public async obtenerHorarioEscolarSecundaria(): Promise<HorarioTomaAsistencia | null> {
    return this.obtenerHorarioEscolarNivel(NivelEducativo.SECUNDARIA);
  }

  /**
   * Verifica si se puede tomar asistencia en primaria en este momento
   */
  public async esMomentoTomaAsistenciaPrimaria(): Promise<boolean> {
    try {
      const horario =
        await this.obtenerHorarioTomaAsistenciaProfesoresPrimaria();
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      return ahora >= inicio && ahora <= fin;
    } catch (error) {
      this.handleError(error, "esMomentoTomaAsistenciaPrimaria");
      return false;
    }
  }

  /**
   * Verifica si se puede tomar asistencia en secundaria en este momento
   */
  public async esMomentoTomaAsistenciaSecundaria(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioTomaAsistenciaAuxiliares();
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      return ahora >= inicio && ahora <= fin;
    } catch (error) {
      this.handleError(error, "esMomentoTomaAsistenciaSecundaria");
      return false;
    }
  }

  /**
   * Verifica si algún profesor secundaria tiene horario configurado para hoy
   */
  public async hayProfesoresSecundariaConHorarioHoy(): Promise<boolean> {
    try {
      const profesores = await this.obtenerProfesoresSecundaria();
      if (!profesores || profesores.length === 0) return false;

      // Verificar si al menos un profesor tiene horario para hoy
      return profesores.some(
        (profesor) =>
          profesor.Hora_Entrada_Dia_Actual && profesor.Hora_Salida_Dia_Actual
      );
    } catch (error) {
      this.handleError(error, "hayProfesoresSecundariaConHorarioHoy");
      return false;
    }
  }

  /**
   * Obtiene el número total de personal administrativo
   */
  public async obtenerTotalPersonalAdministrativo(): Promise<number> {
    try {
      const personal = await this.obtenerPersonalAdministrativo();
      return personal ? personal.length : 0;
    } catch (error) {
      this.handleError(error, "obtenerTotalPersonalAdministrativo");
      return 0;
    }
  }

  /**
   * Obtiene el número total de profesores de primaria
   */
  public async obtenerTotalProfesoresPrimaria(): Promise<number> {
    try {
      const profesores = await this.obtenerProfesoresPrimaria();
      return profesores ? profesores.length : 0;
    } catch (error) {
      this.handleError(error, "obtenerTotalProfesoresPrimaria");
      return 0;
    }
  }

  /**
   * Obtiene el número total de profesores de secundaria
   */
  public async obtenerTotalProfesoresSecundaria(): Promise<number> {
    try {
      const profesores = await this.obtenerProfesoresSecundaria();
      return profesores ? profesores.length : 0;
    } catch (error) {
      this.handleError(error, "obtenerTotalProfesoresSecundaria");
      return 0;
    }
  }
}

// Exportar una instancia singleton
const datosAsistenciaHoyDirectivoIDB = new DatosAsistenciaHoyDirectivoIDB();
export default datosAsistenciaHoyDirectivoIDB;

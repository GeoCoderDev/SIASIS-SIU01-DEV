import {
  DirectivoAsistenciaResponse,
  HorarioTomaAsistencia,
  PersonalAdministrativoParaTomaDeAsistencia,
  ProfesoresPrimariaParaTomaDeAsistencia,
  ProfesorTutorSecundariaParaTomaDeAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { HandlerAsistenciaBase } from "./HandlerDatosAsistenciaBase";
import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";

export class HandlerDirectivoAsistenciaResponse extends HandlerAsistenciaBase {
  private directivoData: DirectivoAsistenciaResponse;

  constructor(asistenciaData: DirectivoAsistenciaResponse) {
    super(asistenciaData);
    this.directivoData = asistenciaData;
  }

  public getPersonalAdministrativo(): PersonalAdministrativoParaTomaDeAsistencia[] {
    return this.directivoData.ListaDePersonalesAdministrativos || [];
  }

  public buscarPersonalAdministrativoPorDNI(
    dni: string
  ): PersonalAdministrativoParaTomaDeAsistencia | null {
    return (
      this.getPersonalAdministrativo().find(
        (personal) => personal.DNI_Personal_Administrativo === dni
      ) || null
    );
  }

  public filtrarPersonalPorCargo(
    cargo: string
  ): PersonalAdministrativoParaTomaDeAsistencia[] {
    return this.getPersonalAdministrativo().filter(
      (personal) => personal.Cargo === cargo
    );
  }

  public getProfesoresPrimaria(): ProfesoresPrimariaParaTomaDeAsistencia[] {
    return this.directivoData.ListaDeProfesoresPrimaria || [];
  }

  public buscarProfesorPrimariaPorDNI(
    dni: string
  ): ProfesoresPrimariaParaTomaDeAsistencia | null {
    return (
      this.getProfesoresPrimaria().find(
        (profesor) => profesor.DNI_Profesor_Primaria === dni
      ) || null
    );
  }

  public getProfesoresSecundaria(): ProfesorTutorSecundariaParaTomaDeAsistencia[] {
    return this.directivoData.ListaDeProfesoresSecundaria || [];
  }

  public buscarProfesorSecundariaPorDNI(
    dni: string
  ): ProfesorTutorSecundariaParaTomaDeAsistencia | null {
    return (
      this.getProfesoresSecundaria().find(
        (profesor) => profesor.DNI_Profesor_Secundaria === dni
      ) || null
    );
  }

  public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
    return this.directivoData.HorariosLaboraresGenerales
      .TomaAsistenciaRangoTotalPersonales;
  }

  public getHorarioTomaAsistenciaPrimaria(): HorarioTomaAsistencia {
    return this.directivoData.HorariosLaboraresGenerales
      .TomaAsistenciaProfesorPrimaria;
  }

  public getHorarioTomaAsistenciaAuxiliares(): HorarioTomaAsistencia {
    return this.directivoData.HorariosLaboraresGenerales
      .TomaAsistenciaAuxiliares;
  }

  public getHorarioEscolar(
    nivel: NivelEducativo
  ): HorarioTomaAsistencia | null {
    return this.directivoData.HorariosEscolares[nivel] || null;
  }

  public estaHorarioActivo(horario: HorarioTomaAsistencia): boolean {
    const ahora = this.getFechaHoraRedux();
    if (!ahora) return false;

    const inicio = new Date(horario.Inicio);
    const fin = new Date(horario.Fin);

    return ahora >= inicio && ahora <= fin;
  }

  public estaActivaTomaAsistenciaGeneral(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaGeneral());
  }

  public estaActivaTomaAsistenciaPrimaria(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaPrimaria());
  }

  public estaActivaTomaAsistenciaAuxiliares(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaAuxiliares());
  }

  public getTotalPersonalAdministrativo(): number {
    return this.getPersonalAdministrativo().length;
  }

  public getTotalProfesoresPrimaria(): number {
    return this.getProfesoresPrimaria().length;
  }

  public getTotalProfesoresSecundaria(): number {
    return this.getProfesoresSecundaria().length;
  }

  public debeEstarPresentePersonalAhora(dni: string): boolean {
    const personal = this.buscarPersonalAdministrativoPorDNI(dni);
    if (!personal) return false;

    const ahora = this.getFechaHoraRedux();

    if (!ahora) return false;
    console.log("AHORA:", ahora);

    const horaEntrada = new Date(ahora);
    const horaSalida = new Date(ahora);
    console.log("AHORA entrada:", horaEntrada);
    console.log("AHORA salida:", horaSalida);

    const [entradaHours, entradaMinutes] = String(
      personal.Horario_Laboral_Entrada
    )
      .split(":")
      .map(Number);
    const [salidaHours, salidaMinutes] = String(personal.Horario_Laboral_Salida)
      .split(":")
      .map(Number);

    horaEntrada.setHours(entradaHours, entradaMinutes, 0, 0);
    horaSalida.setHours(salidaHours, salidaMinutes, 0, 0);

    return ahora >= horaEntrada && ahora <= horaSalida;
  }

  public getDatosCompletosDirectivo(): DirectivoAsistenciaResponse {
    return this.directivoData;
  }
}

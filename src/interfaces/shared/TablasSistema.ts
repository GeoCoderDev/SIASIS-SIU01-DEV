/**
 * Enum que contiene los nombres de las tablas del sistema.
 * Permite referenciar las tablas de la base de datos de manera más intuitiva en el código.
 */
export enum TablasSistema {
    // Usuarios y roles
    Tabla_Directivos = "T_Directivos",
    Tabla_Auxiliares = "T_Auxiliares",
    Tabla_Profesores_Primaria = "T_Profesores_Primaria",
    Tabla_Profesores_Secundaria = "T_Profesores_Secundaria",
    Tabla_Personal_Administrativo = "T_Personal_Administrativo",
    Tabla_Responsables = "T_Responsables",
    
    // Estudiantes y asistencia
    Tabla_Estudiantes = "T_Estudiantes",
    Tabla_Relaciones_E_R = "T_Relaciones_E_R",
    
    // Tablas de asistencia primaria
    Tabla_Asistencia_Primaria_1 = "T_A_E_P_1",
    Tabla_Asistencia_Primaria_2 = "T_A_E_P_2",
    Tabla_Asistencia_Primaria_3 = "T_A_E_P_3",
    Tabla_Asistencia_Primaria_4 = "T_A_E_P_4",
    Tabla_Asistencia_Primaria_5 = "T_A_E_P_5",
    Tabla_Asistencia_Primaria_6 = "T_A_E_P_6",
    
    // Tablas de asistencia secundaria
    Tabla_Asistencia_Secundaria_1 = "T_A_E_S_1",
    Tabla_Asistencia_Secundaria_2 = "T_A_E_S_2",
    Tabla_Asistencia_Secundaria_3 = "T_A_E_S_3",
    Tabla_Asistencia_Secundaria_4 = "T_A_E_S_4",
    Tabla_Asistencia_Secundaria_5 = "T_A_E_S_5",
    
    // Estructura escolar
    Tabla_Aulas = "T_Aulas",
    Tabla_Cursos_Horario = "T_Cursos_Horario",
    Tabla_Eventos = "T_Eventos",
    Tabla_Comunicados = "T_Comunicados",
    
    // Control de asistencia personal
    Tabla_Control_Entrada_Profesores_Primaria = "T_Control_Entrada_Mensual_Profesores_Primaria",
    Tabla_Control_Salida_Profesores_Primaria = "T_Control_Salida_Mensual_Profesores_Primaria",
    Tabla_Control_Entrada_Profesores_Secundaria = "T_Control_Entrada_Mensual_Profesores_Secundaria", 
    Tabla_Control_Salida_Profesores_Secundaria = "T_Control_Salida_Mensual_Profesores_Secundaria",
    Tabla_Control_Entrada_Auxiliar = "T_Control_Entrada_Mensual_Auxiliar",
    Tabla_Control_Salida_Auxiliar = "T_Control_Salida_Mensual_Auxiliar",
    Tabla_Control_Entrada_Personal_Administrativo = "T_Control_Entrada_Mensual_Personal_Administrativo",
    Tabla_Control_Salida_Personal_Administrativo = "T_Control_Salida_Mensual_Personal_Administrativo",
    
    // Configuración y sistema
    Tabla_Fechas_Importantes = "T_Fechas_Importantes",
    Tabla_Horarios_Asistencia = "T_Horarios_Asistencia",
    Tabla_Ajustes_Sistema = "T_Ajustes_Generales_Sistema",
    Tabla_Bloqueo_Roles = "T_Bloqueo_Roles",
    Tabla_Registro_Fallos = "T_Registro_Fallos_Sistema",
    Tabla_Codigos_OTP = "T_Codigos_OTP"
  }
// IndexedDBConnection.ts - Clase singleton para manejar la conexión a IndexedDB

export class IndexedDBConnection {
  private static instance: IndexedDBConnection;
  private db: IDBDatabase | null = null;
  private dbName: string = "AsistenciaSystem";
  private version: number = 1;
  private isInitializing: boolean = false;
  private initPromise: Promise<IDBDatabase> | null = null;

  // Definición de las colecciones y sus configuraciones
  private stores = {
    directivos: {
      keyPath: "Id_Directivo",
      autoIncrement: true,
      indexes: [
        { name: "por_dni", keyPath: "DNI", options: { unique: true } },
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        {
          name: "por_correo",
          keyPath: "Correo_Electronico",
          options: { unique: true },
        },
      ],
    },
    estudiantes: {
      keyPath: "DNI_Estudiante",
      autoIncrement: false,
      indexes: [
        { name: "por_nombres", keyPath: "Nombres", options: { unique: false } },
        {
          name: "por_apellidos",
          keyPath: "Apellidos",
          options: { unique: false },
        },
        { name: "por_aula", keyPath: "Id_Aula", options: { unique: false } },
        { name: "por_estado", keyPath: "Estado", options: { unique: false } },
      ],
    },
    responsables: {
      keyPath: "DNI_Responsable",
      autoIncrement: false,
      indexes: [
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        { name: "por_nombres", keyPath: "Nombres", options: { unique: false } },
        {
          name: "por_apellidos",
          keyPath: "Apellidos",
          options: { unique: false },
        },
      ],
    },
    relaciones_e_r: {
      keyPath: "Id_Relacion",
      autoIncrement: true,
      indexes: [
        {
          name: "por_responsable",
          keyPath: "DNI_Responsable",
          options: { unique: false },
        },
        {
          name: "por_estudiante",
          keyPath: "DNI_Estudiante",
          options: { unique: false },
        },
        { name: "por_tipo", keyPath: "Tipo", options: { unique: false } },
      ],
    },
    profesores_primaria: {
      keyPath: "DNI_Profesor_Primaria",
      autoIncrement: false,
      indexes: [
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        { name: "por_estado", keyPath: "Estado", options: { unique: false } },
      ],
    },
    profesores_secundaria: {
      keyPath: "DNI_Profesor_Secundaria",
      autoIncrement: false,
      indexes: [
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        { name: "por_estado", keyPath: "Estado", options: { unique: false } },
      ],
    },
    aulas: {
      keyPath: "Id_Aula",
      autoIncrement: true,
      indexes: [
        { name: "por_nivel", keyPath: "Nivel", options: { unique: false } },
        { name: "por_grado", keyPath: "Grado", options: { unique: false } },
        { name: "por_seccion", keyPath: "Seccion", options: { unique: false } },
        {
          name: "por_nivel_grado_seccion",
          keyPath: ["Nivel", "Grado", "Seccion"],
          options: { unique: true },
        },
        {
          name: "por_profesor_primaria",
          keyPath: "DNI_Profesor_Primaria",
          options: { unique: false },
        },
        {
          name: "por_profesor_secundaria",
          keyPath: "DNI_Profesor_Secundaria",
          options: { unique: false },
        },
      ],
    },
    cursos_horario: {
      keyPath: "Id_Curso_Horario",
      autoIncrement: true,
      indexes: [
        { name: "por_dia", keyPath: "Dia_Semana", options: { unique: false } },
        {
          name: "por_profesor",
          keyPath: "DNI_Profesor_Secundaria",
          options: { unique: false },
        },
      ],
    },
    asistencias_estudiantes: {
      keyPath: "Id_Asistencia",
      autoIncrement: true,
      indexes: [
        {
          name: "por_estudiante",
          keyPath: "DNI_Estudiante",
          options: { unique: false },
        },
        { name: "por_fecha", keyPath: "Fecha", options: { unique: false } },
        {
          name: "por_estudiante_fecha",
          keyPath: ["DNI_Estudiante", "Fecha"],
          options: { unique: true },
        },
        {
          name: "por_sync_status",
          keyPath: "Sync_Status",
          options: { unique: false },
        },
      ],
    },
    control_entrada_profesores_primaria: {
      keyPath: "Id_C_E_M_P_Profesores_Primaria",
      autoIncrement: true,
      indexes: [
        {
          name: "por_profesor",
          keyPath: "DNI_Profesor_Primaria",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_profesor_mes",
          keyPath: ["DNI_Profesor_Primaria", "Mes"],
          options: { unique: true },
        },
      ],
    },
    control_salida_profesores_primaria: {
      keyPath: "Id_C_E_M_P_Profesores_Primaria",
      autoIncrement: true,
      indexes: [
        {
          name: "por_profesor",
          keyPath: "DNI_Profesor_Primaria",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_profesor_mes",
          keyPath: ["DNI_Profesor_Primaria", "Mes"],
          options: { unique: true },
        },
      ],
    },
    control_entrada_profesores_secundaria: {
      keyPath: "Id_C_E_M_P_Profesores_Secundaria",
      autoIncrement: true,
      indexes: [
        {
          name: "por_profesor",
          keyPath: "DNI_Profesor_Secundaria",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_profesor_mes",
          keyPath: ["DNI_Profesor_Secundaria", "Mes"],
          options: { unique: true },
        },
      ],
    },
    control_salida_profesores_secundaria: {
      keyPath: "Id_C_E_M_P_Profesores_Secundaria",
      autoIncrement: true,
      indexes: [
        {
          name: "por_profesor",
          keyPath: "DNI_Profesor_Secundaria",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_profesor_mes",
          keyPath: ["DNI_Profesor_Secundaria", "Mes"],
          options: { unique: true },
        },
      ],
    },
    auxiliares: {
      keyPath: "DNI_Auxiliar",
      autoIncrement: false,
      indexes: [
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        { name: "por_estado", keyPath: "Estado", options: { unique: false } },
      ],
    },
    control_entrada_auxiliar: {
      keyPath: "Id_C_E_M_P_Auxiliar",
      autoIncrement: true,
      indexes: [
        {
          name: "por_auxiliar",
          keyPath: "DNI_Auxiliar",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_auxiliar_mes",
          keyPath: ["DNI_Auxiliar", "Mes"],
          options: { unique: true },
        },
      ],
    },
    control_salida_auxiliar: {
      keyPath: "Id_C_E_M_P_Auxiliar",
      autoIncrement: true,
      indexes: [
        {
          name: "por_auxiliar",
          keyPath: "DNI_Auxiliar",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_auxiliar_mes",
          keyPath: ["DNI_Auxiliar", "Mes"],
          options: { unique: true },
        },
      ],
    },
    personal_administrativo: {
      keyPath: "DNI_Personal_Administrativo",
      autoIncrement: false,
      indexes: [
        {
          name: "por_nombre_usuario",
          keyPath: "Nombre_Usuario",
          options: { unique: true },
        },
        { name: "por_estado", keyPath: "Estado", options: { unique: false } },
      ],
    },
    control_entrada_personal_administrativo: {
      keyPath: "Id_C_E_M_P_Administrativo",
      autoIncrement: true,
      indexes: [
        {
          name: "por_administrativo",
          keyPath: "DNI_Personal_Administrativo",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_administrativo_mes",
          keyPath: ["DNI_Personal_Administrativo", "Mes"],
          options: { unique: true },
        },
      ],
    },
    control_salida_personal_administrativo: {
      keyPath: "Id_C_E_M_P_Administrativo",
      autoIncrement: true,
      indexes: [
        {
          name: "por_administrativo",
          keyPath: "DNI_Personal_Administrativo",
          options: { unique: false },
        },
        { name: "por_mes", keyPath: "Mes", options: { unique: false } },
        {
          name: "por_administrativo_mes",
          keyPath: ["DNI_Personal_Administrativo", "Mes"],
          options: { unique: true },
        },
      ],
    },
    bloqueo_roles: {
      keyPath: "Id_Bloqueo_Rol",
      autoIncrement: true,
      indexes: [{ name: "por_rol", keyPath: "Rol", options: { unique: true } }],
    },
    ajustes_generales_sistema: {
      keyPath: "Id_Constante",
      autoIncrement: true,
      indexes: [
        { name: "por_nombre", keyPath: "Nombre", options: { unique: true } },
      ],
    },
    horarios_asistencia: {
      keyPath: "Id_Horario",
      autoIncrement: true,
      indexes: [
        { name: "por_nombre", keyPath: "Nombre", options: { unique: true } },
      ],
    },
    eventos: {
      keyPath: "Id_Evento",
      autoIncrement: true,
      indexes: [
        {
          name: "por_fecha_inicio",
          keyPath: "Fecha_Inicio",
          options: { unique: false },
        },
        {
          name: "por_fecha_conclusion",
          keyPath: "Fecha_Conclusion",
          options: { unique: false },
        },
        {
          name: "por_rango_fecha",
          keyPath: ["Fecha_Inicio", "Fecha_Conclusion"],
          options: { unique: false },
        },
      ],
    },
    registro_fallos_sistema: {
      keyPath: "Id_Registro_Fallo_Sistema",
      autoIncrement: true,
      indexes: [
        { name: "por_fecha", keyPath: "Fecha", options: { unique: false } },
        {
          name: "por_componente",
          keyPath: "Componente",
          options: { unique: false },
        },
      ],
    },
    offline_requests: {
      keyPath: "id",
      autoIncrement: true,
      indexes: [
        {
          name: "por_created_at",
          keyPath: "created_at",
          options: { unique: false },
        },
        {
          name: "por_attempts",
          keyPath: "attempts",
          options: { unique: false },
        },
      ],
    },
  };

  private constructor() {
    // Constructor privado para patrón Singleton
  }

  /**
   * Obtiene la instancia única de conexión a IndexedDB
   */
  public static getInstance(): IndexedDBConnection {
    if (!IndexedDBConnection.instance) {
      IndexedDBConnection.instance = new IndexedDBConnection();
    }
    return IndexedDBConnection.instance;
  }

  /**
   * Inicializa la conexión a la base de datos
   */
  public async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.configureDatabase(db);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitializing = false;
        resolve(this.db);
      };

      request.onerror = (event) => {
        this.isInitializing = false;
        this.initPromise = null;
        reject(
          `Error al abrir IndexedDB: ${
            (event.target as IDBOpenDBRequest).error
          }`
        );
      };
    });

    return this.initPromise;
  }

  /**
   * Configura la estructura de la base de datos
   */
  private configureDatabase(db: IDBDatabase): void {
    // Crear los object stores y sus índices
    for (const [storeName, config] of Object.entries(this.stores)) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: config.keyPath,
          autoIncrement: config.autoIncrement,
        });

        // Crear los índices
        for (const index of config.indexes) {
          store.createIndex(index.name, index.keyPath, index.options);
        }
      }
    }
  }

  /**
   * Obtiene la conexión a la base de datos
   */
  public async getConnection(): Promise<IDBDatabase> {
    if (!this.db) {
      return this.init();
    }
    return this.db;
  }

  /**
   * Cierra la conexión a la base de datos
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Obtiene una transacción para un almacén específico
   */
  public async getTransaction(
    storeName: string,
    mode: IDBTransactionMode = "readonly"
  ): Promise<IDBTransaction> {
    const db = await this.getConnection();
    return db.transaction(storeName, mode);
  }

  /**
   * Obtiene un object store para realizar operaciones
   */
  public async getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly"
  ): Promise<IDBObjectStore> {
    const transaction = await this.getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * Ejecuta una operación en la base de datos
   */
  public async executeOperation<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const store = await this.getStore(storeName, mode);

    return new Promise<T>((resolve, reject) => {
      const request = operation(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(`Error en operación: ${(event.target as IDBRequest).error}`);
      };
    });
  }
}

// Exportar la instancia única
export default IndexedDBConnection.getInstance();

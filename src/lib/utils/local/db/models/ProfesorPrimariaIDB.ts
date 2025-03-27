import IndexedDBConnection from "../IndexedDBConnection";

export interface IProfesorPrimaria {
  DNI_Profesor_Primaria: string; // Clave primaria
  Nombres: string;
  Apellidos: string;
  Genero: "M" | "F";
  Nombre_Usuario: string;
  Estado: boolean; // true = ACTIVO, false = INACTIVO
  Correo_Electronico?: string; // Opcional
  Celular: string;
  Contraseña: string;
  Google_Drive_Foto_ID?: string;
  Fecha_Registro?: number; // timestamp para seguimiento local
  Ultima_Actualizacion?: number; // timestamp para seguimiento local
}

export interface IProfesorPrimariaFilter {
  DNI_Profesor_Primaria?: string;
  Nombres?: string;
  Apellidos?: string;
  Estado?: boolean;
}

// export interface IProfesorPrimariaWithAula extends IProfesorPrimaria {
//   Aula?: {
//     Id_Aula: number;
//     Nivel: string;
//     Grado: number;
//     Seccion: string;
//     Color: string;
//   } | null;
// }

export class ProfesorPrimariaIDB {
  private storeName: string = "profesores_primaria";

  /**
   * Obtiene todos los profesores de primaria
   * @param includeInactive Si es true, incluye profesores inactivos
   * @returns Lista de profesores de primaria
   */
  public async getAll(
    includeInactive: boolean = false
  ): Promise<IProfesorPrimaria[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          let result = request.result as IProfesorPrimaria[];
          if (!includeInactive) {
            result = result.filter((profesor) => profesor.Estado === true);
          }
          resolve(result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al obtener profesores:", error);
      throw error;
    }
  }

  /**
   * Obtiene un profesor de primaria por su DNI
   * @param dni DNI del profesor que funciona como ID principal
   * @returns Profesor encontrado o null
   */
  public async getByDNI(dni: string): Promise<IProfesorPrimaria | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(dni); // El DNI es la clave primaria

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al obtener profesor con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un profesor por su nombre de usuario
   * @param nombreUsuario Nombre de usuario del profesor
   * @returns Profesor encontrado o null
   */
  public async getByNombreUsuario(
    nombreUsuario: string
  ): Promise<IProfesorPrimaria | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_nombre_usuario");

      return new Promise((resolve, reject) => {
        const request = index.get(nombreUsuario);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al obtener profesor con nombre de usuario ${nombreUsuario}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene profesores por estado (activo/inactivo)
   * @param estado Estado de los profesores a buscar
   * @returns Lista de profesores con el estado especificado
   */
  public async getByEstado(estado: boolean): Promise<IProfesorPrimaria[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_estado");

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(estado));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al obtener profesores con estado ${estado}:`, error);
      throw error;
    }
  }

  /**
   * Busca profesores que coincidan con los criterios de filtro
   * @param filter Criterios de filtro
   * @returns Lista de profesores que coinciden con los criterios
   */
  public async searchByCriteria(
    filter: IProfesorPrimariaFilter
  ): Promise<IProfesorPrimaria[]> {
    try {
      const allProfesores = await this.getAll(filter.Estado === false);

      return allProfesores.filter((profesor) => {
        let matches = true;

        if (
          filter.DNI_Profesor_Primaria &&
          !profesor.DNI_Profesor_Primaria.includes(filter.DNI_Profesor_Primaria)
        ) {
          matches = false;
        }

        if (
          filter.Nombres &&
          !profesor.Nombres.toLowerCase().includes(filter.Nombres.toLowerCase())
        ) {
          matches = false;
        }

        if (
          filter.Apellidos &&
          !profesor.Apellidos.toLowerCase().includes(
            filter.Apellidos.toLowerCase()
          )
        ) {
          matches = false;
        }

        if (filter.Estado !== undefined && profesor.Estado !== filter.Estado) {
          matches = false;
        }

        return matches;
      });
    } catch (error) {
      console.error("Error al buscar profesores:", error);
      throw error;
    }
  }

  /**
   * Añade un nuevo profesor de primaria
   * @param profesor Datos del profesor (incluyendo DNI_Profesor_Primaria que es la clave)
   * @returns DNI del profesor añadido
   */
  public async add(profesor: IProfesorPrimaria): Promise<string> {
    try {
      // Verificar que el DNI no exista ya
      const existingByDNI = await this.getByDNI(profesor.DNI_Profesor_Primaria);
      if (existingByDNI) {
        throw new Error(
          `Ya existe un profesor con el DNI ${profesor.DNI_Profesor_Primaria}`
        );
      }

      // Verificar que el nombre de usuario no exista
      const existingByUsername = await this.getByNombreUsuario(
        profesor.Nombre_Usuario
      );
      if (existingByUsername) {
        throw new Error(
          `Ya existe un profesor con el nombre de usuario ${profesor.Nombre_Usuario}`
        );
      }

      // Añadir fecha de registro si no existe
      if (!profesor.Fecha_Registro) {
        profesor.Fecha_Registro = Date.now();
      }

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.add(profesor);

        request.onsuccess = () => {
          resolve(profesor.DNI_Profesor_Primaria);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al añadir profesor:", error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un profesor existente
   * @param profesor Datos actualizados del profesor (con DNI_Profesor_Primaria)
   */
  public async update(profesor: IProfesorPrimaria): Promise<void> {
    try {
      // Verificar que el profesor exista
      const existing = await this.getByDNI(profesor.DNI_Profesor_Primaria);
      if (!existing) {
        throw new Error(
          `No existe un profesor con el DNI ${profesor.DNI_Profesor_Primaria}`
        );
      }

      // Verificar nombre de usuario único si ha cambiado
      if (profesor.Nombre_Usuario !== existing.Nombre_Usuario) {
        const existingByUsername = await this.getByNombreUsuario(
          profesor.Nombre_Usuario
        );
        if (
          existingByUsername &&
          existingByUsername.DNI_Profesor_Primaria !==
            profesor.DNI_Profesor_Primaria
        ) {
          throw new Error(
            `Ya existe otro profesor con el nombre de usuario ${profesor.Nombre_Usuario}`
          );
        }
      }

      // Actualizar fecha de última actualización
      profesor.Ultima_Actualizacion = Date.now();

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(profesor);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al actualizar profesor con DNI ${profesor.DNI_Profesor_Primaria}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Cambia el estado de un profesor a inactivo (false)
   * @param dni DNI del profesor
   */
  public async deactivate(dni: string): Promise<void> {
    try {
      const profesor = await this.getByDNI(dni);
      if (!profesor) {
        throw new Error(`No existe un profesor con el DNI ${dni}`);
      }

      profesor.Estado = false;
      profesor.Ultima_Actualizacion = Date.now();

      await this.update(profesor);
    } catch (error) {
      console.error(`Error al desactivar profesor con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un profesor a activo (true)
   * @param dni DNI del profesor
   */
  public async activate(dni: string): Promise<void> {
    try {
      const profesor = await this.getByDNI(dni);
      if (!profesor) {
        throw new Error(`No existe un profesor con el DNI ${dni}`);
      }

      profesor.Estado = true;
      profesor.Ultima_Actualizacion = Date.now();

      await this.update(profesor);
    } catch (error) {
      console.error(`Error al activar profesor con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Asigna un profesor a un aula
   * @param dniProfesor DNI del profesor
   * @param idAula ID del aula
   */
  public async asignarAula(dniProfesor: string, idAula: number): Promise<void> {
    try {
      // Verificar que el profesor exista
      const profesor = await this.getByDNI(dniProfesor);
      if (!profesor) {
        throw new Error(`No existe un profesor con el DNI ${dniProfesor}`);
      }

      // Verificar que el aula exista
      const aulaStore = await IndexedDBConnection.getStore(
        "aulas",
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = aulaStore.get(idAula);

        request.onsuccess = () => {
          if (!request.result) {
            reject(new Error(`No existe un aula con el ID ${idAula}`));
            return;
          }

          // Actualizar el aula asignando este profesor
          const aula = request.result;
          aula.DNI_Profesor_Primaria = dniProfesor;

          const updateRequest = aulaStore.put(aula);

          updateRequest.onsuccess = () => {
            resolve();
          };

          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al asignar aula ${idAula} al profesor ${dniProfesor}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Desasigna un profesor de un aula
   * @param idAula ID del aula
   */
  public async desasignarAula(idAula: number): Promise<void> {
    try {
      const aulaStore = await IndexedDBConnection.getStore(
        "aulas",
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = aulaStore.get(idAula);

        request.onsuccess = () => {
          if (!request.result) {
            reject(new Error(`No existe un aula con el ID ${idAula}`));
            return;
          }

          // Actualizar el aula quitando la asignación
          const aula = request.result;
          aula.DNI_Profesor_Primaria = null;

          const updateRequest = aulaStore.put(aula);

          updateRequest.onsuccess = () => {
            resolve();
          };

          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al desasignar profesor del aula ${idAula}:`, error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un profesor
   * @param dniProfesor DNI del profesor
   * @param nuevaContraseña Nueva contraseña
   */
  public async cambiarContraseña(
    dniProfesor: string,
    nuevaContraseña: string
  ): Promise<void> {
    try {
      const profesor = await this.getByDNI(dniProfesor);
      if (!profesor) {
        throw new Error(`No existe un profesor con el DNI ${dniProfesor}`);
      }

      profesor.Contraseña = nuevaContraseña;
      profesor.Ultima_Actualizacion = Date.now();

      await this.update(profesor);
    } catch (error) {
      console.error(
        `Error al cambiar contraseña del profesor ${dniProfesor}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualiza la foto de perfil del profesor
   * @param dniProfesor DNI del profesor
   * @param googleDriveFotoID ID de la foto en Google Drive
   */
  public async actualizarFoto(
    dniProfesor: string,
    googleDriveFotoID: string
  ): Promise<void> {
    try {
      const profesor = await this.getByDNI(dniProfesor);
      if (!profesor) {
        throw new Error(`No existe un profesor con el DNI ${dniProfesor}`);
      }

      profesor.Google_Drive_Foto_ID = googleDriveFotoID;
      profesor.Ultima_Actualizacion = Date.now();

      await this.update(profesor);
    } catch (error) {
      console.error(
        `Error al actualizar foto del profesor ${dniProfesor}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina un profesor (físicamente de la base de datos)
   * @param dni DNI del profesor
   */
  public async delete(dni: string): Promise<void> {
    try {
      // Primero verificar si tiene aulas asignadas
      const aulaStore = await IndexedDBConnection.getStore("aulas");
      const aulasIndex = aulaStore.index("por_profesor_primaria");

      return new Promise(async (resolve, reject) => {
        const aulasRequest = aulasIndex.getAll(dni);

        aulasRequest.onsuccess = async () => {
          // Si tiene aulas asignadas, primero desasignar
          if (aulasRequest.result && aulasRequest.result.length > 0) {
            for (const aula of aulasRequest.result) {
              try {
                await this.desasignarAula(aula.Id_Aula);
              } catch (error) {
                console.warn(
                  `No se pudo desasignar el aula ${aula.Id_Aula}:`,
                  error
                );
              }
            }
          }

          // Ahora eliminar el profesor
          const store = await IndexedDBConnection.getStore(
            this.storeName,
            "readwrite"
          );
          const deleteRequest = store.delete(dni);

          deleteRequest.onsuccess = () => {
            resolve();
          };

          deleteRequest.onerror = () => {
            reject(deleteRequest.error);
          };
        };

        aulasRequest.onerror = () => {
          reject(aulasRequest.error);
        };
      });
    } catch (error) {
      console.error(`Error al eliminar profesor con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si las credenciales son válidas para inicio de sesión
   * @param nombreUsuario Nombre de usuario
   * @param contraseña Contraseña
   * @returns Profesor si las credenciales son válidas, null en caso contrario
   */
  public async login(
    nombreUsuario: string,
    contraseña: string
  ): Promise<IProfesorPrimaria | null> {
    try {
      const profesor = await this.getByNombreUsuario(nombreUsuario);

      if (!profesor) {
        return null;
      }

      if (profesor.Estado === false) {
        throw new Error(
          "La cuenta está inactiva. Contacte a un administrador."
        );
      }

      if (profesor.Contraseña === contraseña) {
        return profesor;
      }

      return null;
    } catch (error) {
      console.error("Error durante el login:", error);
      throw error;
    }
  }

  /**
   * Obtiene un profesor con la información de su aula
   * @param dniProfesor DNI del profesor
   * @returns Profesor con información del aula o null
   */
  //   public async getWithAula(dniProfesor: string): Promise<IProfesorPrimariaWithAula | null> {
  //     try {
  //       const profesor = await this.getByDNI(dniProfesor);

  //       if (!profesor) {
  //         return null;
  //       }

  //       // Buscar las aulas asignadas a este profesor
  //       const aulaStore = await IndexedDBConnection.getStore('aulas');
  //       const aulasIndex = aulaStore.index('por_profesor_primaria');

  //       return new Promise((resolve, reject) => {
  //         const request = aulasIndex.get(dniProfesor);

  //         request.onsuccess = () => {
  //           if (!request.result) {
  //             resolve({...profesor, Aula: null});
  //             return;
  //           }

  //           const aula = request.result;
  //           resolve({
  //             ...profesor,
  //             Aula: {
  //               Id_Aula: aula.Id_Aula,
  //               Nivel: aula.Nivel,
  //               Grado: aula.Grado,
  //               Seccion: aula.Seccion,
  //               Color: aula.Color
  //             }
  //           });
  //         };

  //         request.onerror = () => {
  //           reject(request.error);
  //         };
  //       });
  //     } catch (error) {
  //       console.error(`Error al obtener profesor con aula, DNI ${dniProfesor}:`, error);
  //       throw error;
  //     }
  //   }

  //   /**
  //    * Obtiene las aulas asignadas a un profesor
  //    * @param dniProfesor DNI del profesor
  //    * @returns Lista de aulas asignadas
  //    */
  //   public async getAulasAsignadas(dniProfesor: string): Promise<any[]> {
  //     try {
  //       const aulaStore = await IndexedDBConnection.getStore('aulas');
  //       const aulasIndex = aulaStore.index('por_profesor_primaria');

  //       return new Promise((resolve, reject) => {
  //         const request = aulasIndex.getAll(dniProfesor);

  //         request.onsuccess = () => {
  //           resolve(request.result || []);
  //         };

  //         request.onerror = () => {
  //           reject(request.error);
  //         };
  //       });
  //     } catch (error) {
  //       console.error(`Error al obtener aulas asignadas al profesor ${dniProfesor}:`, error);
  //       throw error;
  //     }
  //   }

  /**
   * Importa múltiples profesores desde un array (útil para CSV)
   * @param profesores Array de profesores a importar
   * @returns Número de profesores importados con éxito
   */
  public async importBulk(profesores: IProfesorPrimaria[]): Promise<number> {
    let importados = 0;
    const errores: { profesor: IProfesorPrimaria; error: string }[] = [];

    for (const profesor of profesores) {
      try {
        await this.add(profesor);
        importados++;
      } catch (error) {
        let mensaje = "Error desconocido";
        if (error instanceof Error) {
          mensaje = error.message;
        }
        errores.push({ profesor, error: mensaje });
      }
    }

    if (errores.length > 0) {
      console.warn("Algunos profesores no pudieron ser importados:", errores);
    }

    return importados;
  }

  /**
   * Obtiene el total de profesores activos
   * @returns Número total de profesores activos
   */
  public async getTotalActivos(): Promise<number> {
    try {
      const activos = await this.getByEstado(true);
      return activos.length;
    } catch (error) {
      console.error("Error al obtener total de profesores activos:", error);
      throw error;
    }
  }

  /**
   * Obtiene el total de profesores inactivos
   * @returns Número total de profesores inactivos
   */
  public async getTotalInactivos(): Promise<number> {
    try {
      const inactivos = await this.getByEstado(false);
      return inactivos.length;
    } catch (error) {
      console.error("Error al obtener total de profesores inactivos:", error);
      throw error;
    }
  }

  /**
   * Sincroniza los datos locales con el servidor
   * Este método es un ejemplo de cómo podría implementarse
   * @param onProgress Callback para reportar progreso
   */
  public async sincronizarConServidor(
    onProgress?: (mensaje: string, progreso: number) => void
  ): Promise<void> {
    try {
      // Esta implementación es solo un ejemplo
      // En un caso real, harías peticiones a tu API

      // 1. Obtener todos los profesores locales
      const profesoresLocales = await this.getAll(true); // incluir inactivos
      let contador = 0;

      for (const profesor of profesoresLocales) {
        // Simular envío al servidor
        if (onProgress) {
          contador++;
          onProgress(
            `Sincronizando profesor ${profesor.Nombres} ${profesor.Apellidos}...`,
            (contador / profesoresLocales.length) * 100
          );
        }

        // Aquí iría la lógica real de sincronización
        // Por ejemplo: await fetch('/api/profesores/sincronizar', {...})

        // Simular un retraso
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (onProgress) {
        onProgress("Sincronización completada", 100);
      }
    } catch (error) {
      console.error("Error durante la sincronización:", error);
      throw error;
    }
  }
}

// Singleton instance
const profesorPrimariaLocal = new ProfesorPrimariaIDB();
export default profesorPrimariaLocal;

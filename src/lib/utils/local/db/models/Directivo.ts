import dbConnection from "../IndexxedDBConnection";

// Interfaz para el modelo Directivo
export interface IDirectivo {
  Id_Directivo?: number;
  Nombres: string;
  Apellidos: string;
  Genero: string; // 'M' o 'F'
  DNI: string;
  Nombre_Usuario: string;
  Correo_Electronico: string;
  Celular: string;
  Contraseña: string;
  Google_Drive_Foto_ID?: string;
}

export class DirectivoModel {
  private storeName: string = 'directivos';

  /**
   * Obtiene todos los directivos
   */
  public async getAll(): Promise<IDirectivo[]> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          reject(`Error al obtener todos los directivos: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error('Error al obtener todos los directivos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un directivo por su ID
   */
  public async getById(id: number): Promise<IDirectivo | null> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          reject(`Error al obtener directivo por ID: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al obtener directivo con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un directivo por su nombre de usuario
   */
  public async getByUsername(username: string): Promise<IDirectivo | null> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      const index = store.index('por_nombre_usuario');
      
      return new Promise((resolve, reject) => {
        const request = index.get(username);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          reject(`Error al obtener directivo por nombre de usuario: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al obtener directivo con nombre de usuario ${username}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un directivo por su DNI
   */
  public async getByDNI(dni: string): Promise<IDirectivo | null> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      const index = store.index('por_dni');
      
      return new Promise((resolve, reject) => {
        const request = index.get(dni);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          reject(`Error al obtener directivo por DNI: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al obtener directivo con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Agrega un nuevo directivo
   */
  public async add(directivo: Omit<IDirectivo, 'Id_Directivo'>): Promise<number> {
    try {
      // Verificar que no exista otro directivo con el mismo DNI, Nombre_Usuario o Correo_Electronico
      const existingByDNI = await this.getByDNI(directivo.DNI);
      if (existingByDNI) {
        throw new Error(`Ya existe un directivo con el DNI ${directivo.DNI}`);
      }
      
      const existingByUsername = await this.getByUsername(directivo.Nombre_Usuario);
      if (existingByUsername) {
        throw new Error(`Ya existe un directivo con el nombre de usuario ${directivo.Nombre_Usuario}`);
      }
      
      const existingByEmail = await this.getByEmail(directivo.Correo_Electronico);
      if (existingByEmail) {
        throw new Error(`Ya existe un directivo con el correo electrónico ${directivo.Correo_Electronico}`);
      }
      
      const store = await dbConnection.getStore(this.storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.add(directivo);
        
        request.onsuccess = () => {
          resolve(request.result as number);
        };
        
        request.onerror = (event) => {
          reject(`Error al agregar directivo: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error('Error al agregar directivo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un directivo existente
   */
  public async update(directivo: IDirectivo): Promise<void> {
    try {
      if (!directivo.Id_Directivo) {
        throw new Error('No se puede actualizar un directivo sin ID');
      }
      
      // Verificar que exista el directivo
      const existingDirectivo = await this.getById(directivo.Id_Directivo);
      if (!existingDirectivo) {
        throw new Error(`No existe directivo con ID ${directivo.Id_Directivo}`);
      }
      
      // Verificar campos únicos solo si cambiaron
      if (directivo.DNI !== existingDirectivo.DNI) {
        const existingByDNI = await this.getByDNI(directivo.DNI);
        if (existingByDNI && existingByDNI.Id_Directivo !== directivo.Id_Directivo) {
          throw new Error(`Ya existe un directivo con el DNI ${directivo.DNI}`);
        }
      }
      
      if (directivo.Nombre_Usuario !== existingDirectivo.Nombre_Usuario) {
        const existingByUsername = await this.getByUsername(directivo.Nombre_Usuario);
        if (existingByUsername && existingByUsername.Id_Directivo !== directivo.Id_Directivo) {
          throw new Error(`Ya existe un directivo con el nombre de usuario ${directivo.Nombre_Usuario}`);
        }
      }
      
      if (directivo.Correo_Electronico !== existingDirectivo.Correo_Electronico) {
        const existingByEmail = await this.getByEmail(directivo.Correo_Electronico);
        if (existingByEmail && existingByEmail.Id_Directivo !== directivo.Id_Directivo) {
          throw new Error(`Ya existe un directivo con el correo electrónico ${directivo.Correo_Electronico}`);
        }
      }
      
      const store = await dbConnection.getStore(this.storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(directivo);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(`Error al actualizar directivo: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al actualizar directivo con ID ${directivo.Id_Directivo}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un directivo
   */
  public async delete(id: number): Promise<void> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(`Error al eliminar directivo: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al eliminar directivo con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un directivo por su correo electrónico
   */
  public async getByEmail(email: string): Promise<IDirectivo | null> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      const index = store.index('por_correo');
      
      return new Promise((resolve, reject) => {
        const request = index.get(email);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          reject(`Error al obtener directivo por correo: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error(`Error al obtener directivo con correo ${email}:`, error);
      throw error;
    }
  }

  /**
   * Busca directivos por nombre o apellido
   */
  public async search(query: string): Promise<IDirectivo[]> {
    try {
      const allDirectivos = await this.getAll();
      
      const searchLower = query.toLowerCase();
      return allDirectivos.filter(directivo => 
        directivo.Nombres.toLowerCase().includes(searchLower) || 
        directivo.Apellidos.toLowerCase().includes(searchLower) ||
        directivo.DNI.includes(query) ||
        directivo.Nombre_Usuario.toLowerCase().includes(searchLower) ||
        directivo.Correo_Electronico.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error(`Error al buscar directivos con query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Verifica las credenciales para inicio de sesión
   */
  public async login(username: string, password: string): Promise<IDirectivo | null> {
    try {
      const directivo = await this.getByUsername(username);
      
      if (!directivo) {
        return null; // Usuario no encontrado
      }
      
      // En un sistema real deberías usar bcrypt o similar para comparar hashes
      if (directivo.Contraseña !== password) {
        return null; // Contraseña incorrecta
      }
      
      return directivo; // Login exitoso
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza la foto de perfil de un directivo
   */
  public async updateProfilePhoto(id: number, googleDrivePhotoId: string): Promise<void> {
    try {
      const directivo = await this.getById(id);
      if (!directivo) {
        throw new Error(`No existe directivo con ID ${id}`);
      }
      
      directivo.Google_Drive_Foto_ID = googleDrivePhotoId;
      await this.update(directivo);
    } catch (error) {
      console.error(`Error al actualizar foto de perfil del directivo con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta el número total de directivos
   */
  public async count(): Promise<number> {
    try {
      const store = await dbConnection.getStore(this.storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.count();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          reject(`Error al contar directivos: ${(event.target as IDBRequest).error}`);
        };
      });
    } catch (error) {
      console.error('Error al contar directivos:', error);
      throw error;
    }
  }
}

// Exportar una instancia singleton
const directivoModel = new DirectivoModel();
export default directivoModel;
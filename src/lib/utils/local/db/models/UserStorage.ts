
import dbConnection from "../IndexxedDBConnection";
import { SuccessLoginData } from "@/interfaces/SiasisAPIs";



// El tipo UserData puede tener cualquier propiedad adicional
export type UserData = SuccessLoginData & Record<string, string | null>;

class UserStorage {
  private storeName: string = "user_data";

  /**
   * Guarda los datos del usuario en IndexedDB
   * @param userData Datos del usuario a guardar
   * @returns Promise que se resuelve cuando los datos se han guardado
   */
  public async saveUserData(
    userData: Partial<SuccessLoginData>
  ): Promise<void> {
    try {
      // Asegurarnos de que la conexión está inicializada
      await dbConnection.init();

      // Obtener el almacén de datos
      const store = await dbConnection.getStore(this.storeName, "readwrite");

      // Agregamos la marca de tiempo
      const dataToSave = {
        ...userData,
        last_updated: Date.now(),
      };

      // Usamos un ID fijo 'current_user' para siempre sobrescribir los datos
      return new Promise((resolve, reject) => {
        const request = store.put(dataToSave, "current_user");

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(
            `Error al guardar datos de usuario: ${
              (event.target as IDBRequest).error
            }`
          );
        };
      });
    } catch (error) {
      console.error("Error al guardar datos de usuario:", error);
      throw error;
    }
  }

  /**
   * Obtiene los datos del usuario almacenados
   * @returns Promise que se resuelve con los datos del usuario o null si no hay datos
   */
  public async getUserData(): Promise<UserData | null> {
    try {
      // Asegurarnos de que la conexión está inicializada
      await dbConnection.init();

      // Obtener el almacén de datos
      const store = await dbConnection.getStore(this.storeName, "readonly");

      return new Promise((resolve, reject) => {
        const request = store.get("current_user");

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          reject(
            `Error al obtener datos de usuario: ${
              (event.target as IDBRequest).error
            }`
          );
        };
      });
    } catch (error) {
      console.error("Error al obtener datos de usuario:", error);
      throw error;
    }
  }

  /**
   * Actualiza solo el token de autenticación
   * @param token Nuevo token de autenticación
   * @returns Promise que se resuelve cuando el token se ha actualizado
   */
  public async updateAuthToken(token: string): Promise<void> {
    try {
      const userData = await this.getUserData();

      if (!userData) {
        throw new Error("No hay datos de usuario para actualizar el token");
      }

      // Actualizar solo el token
      await this.saveUserData({
        ...userData,
        token: token,
      });
    } catch (error) {
      console.error("Error al actualizar token de autenticación:", error);
      throw error;
    }
  }

  /**
   * Obtiene solo el token de autenticación
   * @returns Promise que se resuelve con el token o null si no hay token
   */
  public async getAuthToken(): Promise<string | null> {
    try {
      const userData = await this.getUserData();
      return userData?.AuthToken || null;
    } catch (error) {
      console.error("Error al obtener token de autenticación:", error);
      throw error;
    }
  }

  /**
   * Elimina todos los datos del usuario
   * @returns Promise que se resuelve cuando los datos se han eliminado
   */
  public async clearUserData(): Promise<void> {
    try {
      // Asegurarnos de que la conexión está inicializada
      await dbConnection.init();

      // Obtener el almacén de datos
      const store = await dbConnection.getStore(this.storeName, "readwrite");

      return new Promise((resolve, reject) => {
        const request = store.delete("current_user");

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(
            `Error al eliminar datos de usuario: ${
              (event.target as IDBRequest).error
            }`
          );
        };
      });
    } catch (error) {
      console.error("Error al eliminar datos de usuario:", error);
      throw error;
    }
  }
}

// Exportar una instancia singleton
const userStorage = new UserStorage();
export default userStorage;

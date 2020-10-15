import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Ruta } from '../model/ruta';
import { Posicion } from '../model/posicion'

@Injectable({
  providedIn: 'root'
})
export class PersistenciaService {

  private path = 'https://puntomapa2.rj.r.appspot.com/api/rutas'

  constructor(private storage: Storage, private httpClient: HttpClient) { }

  // ---------------------------------------------------------------------------------------------------- //

  public async obtenerListaRutas() {
    var promesaLista = new Promise<{ idruta: string, nombre: string }[]>((resolve, reject) => {
      var lista: { idruta: string, nombre: string }[];
      this.httpClient.get<{ idruta: string, nombre: string }[]>(this.path).subscribe((value) => {
        lista = value;
        resolve(lista);
      }, (error) => {
        console.log(error);
        this.obtenerListaRutasLocal_Nombres().then((value) => {
          lista = value;
          resolve(lista);
        });
      });
    });
    return promesaLista;
  }

  public async obtenerListaRutasLocal_Todo() {
    var lista: Array<{ idruta: string, nombre: string, ruta: string }> = [];
    await this.storage.forEach((ruta_str, idruta, i) => {
      var ruta_json = JSON.parse(ruta_str);
      lista.push({ 'idruta': idruta, 'nombre': ruta_json.nombre, 'ruta': JSON.stringify(ruta_json.ruta) });
    });
    return lista;
  }

  public async obtenerListaRutasLocal_Nombres() {
    var lista: Array<{ idruta: string, nombre: string }> = [];
    this.storage.forEach((ruta_str, idruta) => {
      var ruta_json = JSON.parse(ruta_str);
      lista.push({ 'idruta': idruta, 'nombre': ruta_json.nombre });
    });
    return lista;
  }

  public async obtenerRuta(idruta: string) {
    var promesaRuta = new Promise<Ruta>((resolve, rejects) => {
      this.httpClient.get<{ idruta: string, nombre: string, ruta: string }>(`${this.path}/${idruta}`).subscribe((ruta_json) => {
        var ruta = new Ruta();
        ruta.nombre = ruta_json.nombre;
        for (let pos of JSON.parse(ruta_json.ruta)) {
          ruta.extenderRuta(Object.assign(new Posicion(), pos));
        }
        resolve(ruta);
      }, (err) => {
        resolve(this.obtenerRutaLocal(idruta));
      })
    });
    return promesaRuta;
  }

  public async obtenerRutaLocal(idruta: string) {
    let ruta = new Ruta();
    let ruta_str: string = await this.storage.get(idruta);
    let ruta_json = JSON.parse(ruta_str);
    ruta.nombre = ruta_json.nombre;
    for (let pos of ruta_json.ruta) {
      ruta.extenderRuta(Object.assign(new Posicion(), pos));
    }
    return ruta;
  }

  public async guardarRutas() {
    var promesaGuardar = new Promise((resolve, reject) => {
      this.obtenerListaRutasLocal_Todo().then((lista) => {
        if (lista.length > 0) {
          this.httpClient.post<Array<{ idruta: string, nombre: string, ruta: string }>>(this.path, lista).subscribe(
            (res) => {
              this.limpiarCacheLocal();
              resolve(res);
            },
            (err) => {
              console.log("Acá");
              reject(err);
            });
        } else {
          resolve();
        }
      });
    });
    return promesaGuardar;
  }

  public guardarRutaLocal(ruta: Ruta) {
    var promesaGuardar = new Promise((resolve, rejects) => {
      if (ruta.ruta.length > 1) {
        resolve(this.storage.set(ruta.obtenerId(), JSON.stringify(ruta)).then(() => console.log('Ruta guardada'), () => console.log('Error, ruta no guardada')));
      } else {
        rejects(console.log('Ruta nula.'));
      }
    });
    return promesaGuardar;
  }

  public async eliminarRuta(idruta: string) {
    var promesaBorrar = new Promise((resolve, rejects) => {
      this.httpClient.delete(`${this.path}/${idruta}`).subscribe((res) => {
        console.log(res);
        resolve()
      }, (err) => {
        console.log(err);
        this.storage.remove(idruta).then(() => {
          resolve()
        }, () => {
          rejects();
        })
      })
    })
    return promesaBorrar;
  }

  public limpiarCacheLocal() {
    this.storage.clear();
  }

  // ---------------------------------------------------------------------------------------------------- //

  // ---------------------------------------------------------------------------------------------------- //

  public tiempoString(t: number): string {
    const horas: number = Math.floor(t / 36000);
    const minutos: number = Math.floor((t % 36000) / 600);
    const segundos: number = Math.floor(((t % 36000) % 600) / 10);
    const resto: number = (((t % 36000) % 600) % 10);
    return `${this.agregarCerosIzq(horas, 2)}:${this.agregarCerosIzq(minutos, 2)}:${this.agregarCerosIzq(segundos, 2)}.${resto.toFixed(0)}`;
  }

  public agregarCerosIzq(num: number, size: number) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  // ---------------------------------------------------------------------------------------------------- //

}

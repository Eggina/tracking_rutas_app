import { NumericValueAccessor } from '@ionic/angular';
import { Posicion } from '../model/posicion'

export class Ruta {

  nombre: string;
  ruta: Array<Posicion> = [];

  constructor() { };

  // --------------------------------------------- Getters ---------------------------------------------- //

  public obtenerInicio(): Posicion {
    return this.ruta[0];
  }

  public obtenerFin(): Posicion {
    return this.ruta[this.ruta.length - 1];
  }

  public obtenerId(): string {
    return this.obtenerInicio().tiempo.toString();
  }

  // ---------------------------------------------------------------------------------------------------- //

  // ------------------------------------- Métodos públicos --------------------------------------------- //

  public esValida(): boolean {
    return (this.ruta.length > 1);
  }

  public ExtenderRuta(posicion: Posicion) {
    if (this.ruta.length > 0) {
      if (this.obtenerFin().verificarDiferencia(posicion)) {
        this.ruta.push(posicion);
      }
    } else {
      this.ruta.push(posicion);
    }
  }

  public calcularDistancia(i0: number, n: number): number {
    if (this.ruta.length > 1) {
      const i1: number = Math.min(this.ruta.length, i0 + n);
      let pos0: Posicion = this.ruta[i0];
      let distancia: number = 0;
      for (let i = i0 + 1; i < i1; i++) {
        distancia += pos0.calcularDistancia(this.ruta[i]);
        pos0 = this.ruta[i];
      }
      return distancia;
    } else {
      return 0;
    }
  }

  public calcularDistanciaTotal(): number {
    return this.calcularDistancia(0, this.ruta.length);
  }

  public calcularIntervalo(i0: number, n: number): DOMTimeStamp {
    if (this.ruta.length > 1) {
      const i1: number = Math.min(this.ruta.length - 1, i0 + n);
      return this.ruta[i0].calcularIntervalo(this.ruta[i1]);
    } else {
      return 0;
    }
  }

  public calcularIntervaloTotal(): number {
    return this.calcularIntervalo(0, this.ruta.length);
  }

  public calcularRapidez(i0: number, n: number): number {
    if (this.ruta.length > 1) {
      return this.calcularDistancia(i0, n) / this.calcularIntervalo(i0, n);
    } else {
      return 0;
    }
  }

  public calcularRapidezActual(n: number): number {
    return this.calcularRapidez(this.ruta.length - n, n);
  }

  public calcularRapidezMedia(): number {
    return this.calcularRapidez(0, this.ruta.length);
  }

  // ---------------------------------------------------------------------------------------------------- //

}
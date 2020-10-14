import { erf, sqrt, cos, asin, pi, pow, abs } from 'mathjs/number'

export class Posicion {

  latitud: number;
  longitud: number;
  precision: number;
  tiempo: DOMTimeStamp;

  constructor() {
  }

  // --------------------------------------------- Setters ---------------------------------------------- //

  public establecerPosicion(lat: number, lng: number, prc: number, tmp: DOMTimeStamp) {
    this.latitud = lat;
    this.longitud = lng;
    this.precision = prc;
    this.tiempo = tmp;
  }

  // ---------------------------------------------------------------------------------------------------- //

  // ------------------------------------- Métodos públicos --------------------------------------------- //

  public calcularDistancia(punto: Posicion): number {
    return this._calcularDistancia(this.latitud, punto.latitud, this.longitud, punto.longitud);
  }

  public calcularIntervalo(punto: Posicion): DOMTimeStamp {
    return punto.tiempo - this.tiempo;
  }

  public verificarDiferencia(punto: Posicion): boolean {
    // Intervalo de confianza 95% a DevEst
    const c = 1.96;

    // Diferencia en longitud (en metros)
    let u: number = this._calcularDistancia(this.latitud, this.latitud, this.longitud, punto.longitud);

    // Varianza de la distribución de la diferencia (en metros)
    let s: number = (pow(this.precision, 2) + pow(punto.precision, 2)) / pow(c, 2)

    // Valor Z
    let z = u / s;

    // ¿Las mediciones son diferentes? Significancia del 5%
    if (abs(z) > c) {
      return true;
    }

    // Diferencia en latitud (en metros)
    u = this._calcularDistancia(this.latitud, punto.latitud, this.longitud, this.longitud);

    // Valor Z
    z = u / s;

    // ¿Las mediciones son diferentes? Significancia del 5%
    if (abs(z) > c) {
      return true;
    }

    // Las mediciones no son lo suficientemente diferentes
    return false;
  }

  // ---------------------------------------------------------------------------------------------------- //

  // ------------------------------------- Métodos privados --------------------------------------------- //

  private _haversin(x: number): number {
    return (1 - cos(x));
  }

  private _gradosAradianes(grados: number): number {
    return grados * pi / 180;
  }

  private _calcularDistancia(latitud1: number, latitud2: number, lng1: number, lng2: number): number {
    const lat1 = this._gradosAradianes(latitud1);
    const lat2 = this._gradosAradianes(latitud2);

    const R = 6371009;
    let h: number = (this._haversin(lat2 - lat1) +
      cos(lat1) * cos(lat2) * this._haversin(this._gradosAradianes(lng2 - lng1)));
    return 2 * R * asin(sqrt(h));
  }

  // ---------------------------------------------------------------------------------------------------- //

}
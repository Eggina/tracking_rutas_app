import { Component } from '@angular/core';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { Posicion } from '../model/posicion';
import { Ruta } from '../model/ruta';
import { PersistenciaService } from '../services/persistencia.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

declare var cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  private conmutador: boolean = true;
  private nombre: string;
  private inicio: DOMTimeStamp = 0;
  private tiempo: DOMTimeStamp = 0;
  private intervaloCronometro;
  private obsPosition: Subscription;
  private guardar: boolean = false;

  ruta: Ruta;
  distancia: number = 0;
  ritmo: number = 0;

  constructor(private geolocation: Geolocation, private persServ: PersistenciaService, private router: Router) {
    document.addEventListener('deviceready', () => {
      cordova.plugins.backgroundMode.enable();
      cordova.plugins.backgroundMode.overrideBackButton();
      cordova.plugins.backgroundMode.on('activate', () => {
        console.log('Background');
      });
      cordova.plugins.backgroundMode.on('deactivate', () => {
        console.log('Foreground');
      });
    }, false);
  }

  private conmutarBotones() {
    this.conmutador = !this.conmutador;
  }

  private comenzarCronometro() {
    this.inicio = Date.now();
    this.intervaloCronometro = setInterval(() => {
      this.tiempo = Math.ceil((Date.now() - this.inicio) / 100);
    }, 100);
  }

  private pararCronometro() {
    clearInterval(this.intervaloCronometro);
  }

  private comenzarRegistro() {

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity
    };

    // Posición inicial
    let promesaPos: Promise<Geoposition> = this.geolocation.getCurrentPosition(options);
    promesaPos.then((pos) => {
      this.ruta = new Ruta();
      this.ruta.nombre = this.nombre;
      this.registrarPosicion(pos);
      this.obsPosition = this.geolocation.watchPosition(options).subscribe(this.registrarPosicion.bind(this));
    });
    // Parar en caso de falla
    promesaPos.catch(() => {
      this.conmutarBotones();
      this.pararCronometro();
    });
  }

  registrarPosicion(pos: Geoposition): void {
    const posicion: Posicion = new Posicion();
    posicion.establecerPosicion(pos.coords.latitude,
      pos.coords.longitude,
      pos.coords.accuracy,
      pos.timestamp);
    this.ruta.ExtenderRuta(posicion);
    this.distancia = this.ruta.calcularDistanciaTotal() / 1000;
    this.ritmo = 1 / (this.ruta.calcularRapidezMedia() * 60);
    console.log(this.ruta);
  }


  private pararRegistro() {
    this.obsPosition.unsubscribe();
    this.guardar = this.ruta.esValida();
  }

  private guardarRuta() {
    this.persServ.guardarRutaLocal(this.ruta).then(() => {
      this.ruta = null;
      this.tiempo = 0;
      this.distancia = 0;
      this.ritmo = 0;
      this.guardar = false;
    });
  }

  private irAlHistorial() {
    this.router.navigateByUrl('historial');
  }

}

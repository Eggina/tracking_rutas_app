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

  conmutador: boolean = true;
  nombre: string;
  inicio: DOMTimeStamp = 0;
  tiempo: DOMTimeStamp = 0;
  intervaloCronometro;
  subsPosition: Subscription;
  guardar: boolean = false;

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

  private async comenzarRegistro() {

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity
    };

    // Posición inicial
    this.ruta = new Ruta();
    this.ruta.nombre = this.nombre;
    let pos: Geoposition = await this.geolocation.getCurrentPosition(options);
    this.registrarPosicion(pos);
    // Seguimiento
    this.subsPosition = this.geolocation.watchPosition(options).subscribe((pos: Geoposition) => this.registrarPosicion(pos));
  }

  registrarPosicion(pos: Geoposition): void {
    let posicion: Posicion = new Posicion();
    posicion.establecerPosicion(pos.coords.latitude,
      pos.coords.longitude,
      pos.coords.accuracy,
      pos.timestamp);
    this.ruta.extenderRuta(posicion);
    this.distancia = this.ruta.calcularDistanciaTotal() / 1000;
    this.ritmo = 1 / (this.ruta.calcularRapidezMedia() * 60);
    console.log(this.ruta);
  }


  private pararRegistro() {
    this.subsPosition.unsubscribe();
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

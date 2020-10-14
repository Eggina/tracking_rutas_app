import { Component } from '@angular/core';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { Posicion } from 'src/app/model/posicion';
import { Ruta } from 'src/app/model/ruta';
import { PersistenciaService } from '../services/persistencia.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

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

  private ruta: Ruta;
  private intervaloCronometro;

  private obsPosition: Subscription;

  private distancia: number = 0;
  private ritmo: number = 0;

  private guardar: boolean = false;

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
    this.ruta = new Ruta();
    this.ruta.nombre = this.nombre;

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity
    };

    this.obsPosition = this.geolocation.watchPosition(options).subscribe((pos: Geoposition) => {
      const posicion: Posicion = new Posicion();
      posicion.establecerPosicion(pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.accuracy,
        pos.timestamp);
      this.ruta.ExtenderRuta(posicion);
      this.distancia = this.ruta.calcularDistanciaTotal() / 1000;
      this.ritmo = 1 / (this.ruta.calcularRapidezMedia() * 60);
      console.log(this.ruta);
    });

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

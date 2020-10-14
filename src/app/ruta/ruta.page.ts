import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ruta } from '../model/ruta';
import { PersistenciaService } from '../services/persistencia.service';
import { LoadingController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit {

  id: string;
  ruta: Ruta = new Ruta();
  inicio: Date = new Date();
  duracion: number = 0;
  distancia: number = 0;
  rapidez: number = 0;
  ritmo: number = 0;
  map: any;

  constructor(private activatedRoute: ActivatedRoute, private persServ: PersistenciaService, private loading: LoadingController) {
  }

  async ngOnInit() {
    const loading = await this.loading.create();
    loading.present();
    this.activatedRoute.paramMap.subscribe(
      paramMap => {
        // Obtener ruta (del almacenamiento local o de la nube)
        this.persServ.obtenerRuta(paramMap.get('idruta')).then(ruta => {
          this.establecerRuta(ruta);
          loading.dismiss();
          // Creación del mapa
          this.initMap();
          /*           this.init().then((res) => {
                      console.log("Google Maps listo.")
                    }, (err) => {
                      console.log(err);
                    }); */
        });
      });
  }

  public establecerRuta(ruta: Ruta) {
    this.ruta = ruta;
    this.inicio = new Date(this.ruta.obtenerInicio().tiempo);
    this.duracion = this.ruta.calcularIntervaloTotal() / 100;
    this.distancia = this.ruta.calcularDistanciaTotal() / 1000;
    this.rapidez = 36000 * this.distancia / this.duracion;
    if (this.rapidez > 0) {
      this.ritmo = 60 / this.rapidez;
    }
  }

  private initMap() {

    // Tamaño del mapa igual al tamaño del contenedor del mapa, determinado por flex
    document.getElementById('map-canvas').style.height = document.getElementById('body').clientHeight + 'px';

    // El centro del mapa es el inicio de la ruta
    let latLng = new google.maps.LatLng(this.ruta.obtenerInicio().latitud, this.ruta.obtenerInicio().longitud);

    let mapOptions = {
      center: latLng,
      zoom: 15,
    }

    // Creación del mapa
    this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Marcador de inicio
    const pInicio = new google.maps.Marker({
      position: latLng,
      title: "Inicio",
      map: this.map
    });

    // Marcador de fin
    const pFin = new google.maps.Marker({
      position: new google.maps.LatLng(this.ruta.obtenerFin().latitud, this.ruta.obtenerFin().longitud),
      title: "Fin",
      map: this.map
    });

    const coords: { lat: Number, lng: number }[] = [];

    for (let pos of this.ruta.ruta) {
      coords.push({ lat: pos.latitud, lng: pos.longitud });
    }

    // Trayectoria de la ruta
    const camino = new google.maps.Polyline({
      path: coords,
      geodesic: true,
      strokeColor: "black",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map,
    });

  }

}

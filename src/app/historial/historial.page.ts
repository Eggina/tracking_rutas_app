import { Component, OnInit } from '@angular/core';
import { PersistenciaService } from '../services/persistencia.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  private historial: Array<{ idruta, nombre }> = [];
  constructor(private persServ: PersistenciaService, private loading: LoadingController, private alertCtrl: AlertController) { }

  async ngOnInit() {
    const loading = await this.loading.create();
    loading.present();
    const promesaGuardar = this.persServ.guardarRutas();

    promesaGuardar.then((res) => {
      // Se pudo guardar en la nube
      console.log(res);
    }, async (err) => {
      // No se pudo guardar en la nube, mostrar alerta
      console.log("Error" + err);

      const cuerpoAlerta = {
        header: 'Error',
        message: 'No se pudo guardar en la nube',
        buttons: ['Ok']
      };

      const alerta = await this.alertCtrl.create(cuerpoAlerta);
      loading.dismiss();
      await alerta.present();

    });
    promesaGuardar.finally(() => {
      // Independientemente si se pudo guardar o no, pedir lista de rutas
      this.persServ.obtenerListaRutas().then((his) => {
        this.historial = his;
        loading.dismiss();
      });
    });
  }

  public async limpiarCache() {
    // Se limpia el almacenamiento local

    // Alerta preguntando si realmente quiere limpiar el caché
    const cuerpoAlerta = {
      header: 'Limpiar caché',
      message: `¿Desea limpiar el almacenamiento local?`,
      buttons: [{
        text: 'Sí',
        handler: () => {
          this.persServ.limpiarCacheLocal();
          window.location.reload();
        }
      }, 'No']
    }

    const alerta = await this.alertCtrl.create(cuerpoAlerta);
    await alerta.present();

  }

  public async eliminarRuta(idruta: string) {
    var nombreRuta: string;
    for (let ruta of this.historial) {
      if (ruta.idruta == idruta) {
        nombreRuta = ruta.nombre;
        break;
      }
    }

    // Alerta preguntando si realmente quiere eliminar la ruta
    const cuerpoAlerta = {
      header: 'Eliminar ruta',
      message: `¿Desea eliminar la ruta ${nombreRuta}?`,
      buttons: [{
        text: 'Sí',
        handler: () => { this.persServ.eliminarRuta(idruta).then(() => window.location.reload()); }
      }, 'No']
    }

    const alerta = await this.alertCtrl.create(cuerpoAlerta);
    await alerta.present();
  }

}
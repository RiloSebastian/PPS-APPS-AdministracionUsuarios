import { Component, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../servicios/auth/auth.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage {
	public listaUsuarios: Array<any> = [];
	public usuario: any = null;
	public subU: any = null;
	public sub: any = null;

	constructor(private router: Router, private auth: AuthService, private comp: ComplementosService) {
		console.log('accede a usuario');
		this.subU = this.auth.usuario.subscribe(user => {
			if (user !== null) {
				this.usuario = user.email;
				console.log(this.usuario);
				this.sub = this.auth.traerTodos().subscribe(snap => {
					this.listaUsuarios = snap.map(x => {
						const y: any = x.payload.doc.data() as any;
						y['id'] = x.payload.doc.id;
						return { ...y };
					});
				})
			}
		});
	}

	public cerrarSesion() {
		this.auth.logout().then(() => {
			if (this.subU !== null) {
				this.subU.unsubscribe();
				this.sub.unsubscribe();
			}
			this.comp.playAudio('error');
			this.router.navigate([''])
		});
	}

}

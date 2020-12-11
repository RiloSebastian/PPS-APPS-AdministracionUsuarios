import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Validators, FormBuilder, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { ComplementosService } from 'src/app/servicios/complementos.service'
import { AuthService } from 'src/app/servicios/auth/auth.service';

@Component({
	selector: 'app-alta-usuario',
	templateUrl: './alta-usuario.component.html',
	styleUrls: ['./alta-usuario.component.scss'],
})
export class AltaUsuarioComponent implements OnInit {
	public validarMismaContrasenia: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
		const name = control.get('contrasenia');
		const alterEgo = control.get('contraseniaR');
		return name && alterEgo && name.value !== alterEgo.value ? { distintaContrasenia: true } : null;
	};
	public form: FormGroup = this.formBuilder.group({
		nombre: [null, [Validators.required, Validators.pattern('^[a-zA-ZñÑ]{3,25}$')]],
		apellido: [null, [Validators.required, Validators.pattern('^[a-zA-ZñÑ]{3,25}$')]],
		dni: [null, [Validators.required, Validators.pattern('^[0-9]{8}$')]],
		contrasenia: [null, [Validators.required, Validators.pattern('^[a-zA-ZñÑ0-9_-]{6,18}$')]],
		contraseniaR: [null, [Validators.required]],
		correo: [null, [Validators.required, Validators.email]],
		foto: [null, [Validators.required]]
	}, { validators: this.validarMismaContrasenia });
	public barcodeOptions: BarcodeScannerOptions = {
		prompt: "Place a barcode inside the scan area",
		formats: "QR_CODE,PDF_417",
		orientation: "landscape"
	};
	public validation_messages = {
		'nombre': [
			{ type: 'required', message: 'El nombre es requerido.' },
			{ type: 'pattern', message: 'Introduzca un nombre de mínimo 3 a 20 caracteres y no números.' }
		],
		'apellido': [
			{ type: 'required', message: 'El apellido es requerido.' },
			{ type: 'pattern', message: 'Introduzca un apellido de mínimo 3 a 20 caracteres y no números.' }
		],
		'dni': [
			{ type: 'required', message: 'El DNI es requerido.' },
			{ type: 'pattern', message: 'Introduzca un DNI válido(8 caracteres).' }
		],
		'correo': [
			{ type: 'required', message: 'El correo electronico es requerido.' },
			{ type: 'email', message: 'Introduzca un correo electrónico válido.' }
		],
		'contrasenia': [
			{ type: 'required', message: 'La contraseña es requerida.' },
			{ type: 'pattern', message: 'La contraseña debe tener entre 6 y 18 caracteres.' }
		],
		'foto': [
			{ type: 'required', message: 'La foto es requerida.' },
		]
	};
	constructor(private formBuilder: FormBuilder, private auth: AuthService, private qr: BarcodeScanner, private camera: Camera, private comp: ComplementosService) { }


	ngOnInit() { }

	tomarFotografia() {
		const options: CameraOptions = {
			quality: 100,
			targetHeight: 600,
			targetWidth: 600,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true
		}
		this.camera.getPicture(options).then((imageData) => {
			var base64Str = 'data:image/jpeg;base64,' + imageData;
			this.form.controls.foto.setValue(base64Str);
		});
	}

	escanearDni() {
		let auxDni;
		let scanSub = this.qr.scan(this.barcodeOptions).then(dataString => {
			let x: any = [];
			x = dataString.text.split('@');
			if (x.length == 8 || x.length == 9) {
				this.form.controls.apellido.setValue(x[1]);
				this.form.controls.nombre.setValue(x[2]);
				this.form.controls.dni.setValue(x[4]);
			} else {
				this.form.controls.dni.setValue(x[1]);
				this.form.controls.apellido.setValue(x[4]);
				this.form.controls.nombre.setValue(x[5]);
			}
		});
	}

	registrar() {
		//this.splash = true;
		let data: any = {
			nombre: this.form.value.apellido + ' ' + this.form.value.nombre,
			dni: this.form.value.dni,
			correo: this.form.value.correo,
			contrasenia: this.form.value.contrasenia,
			foto: this.form.value.foto
		}
		this.auth.registrarUsuario(data).then(() => {
			this.limpiarCampos();
			this.comp.presentToastConMensajeYColor("El Usuario ha sido registrado.", "success");
		}).catch(err => {
			this.comp.presentToastConMensajeYColor(firebaseErrors(err), "danger");
		}).finally(() => {
			//this.splash = false;
		});
	}

	limpiarCampos() {
		this.form.reset();
	}

}

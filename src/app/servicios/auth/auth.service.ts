import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs'
import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFirestore } from '@angular/fire/firestore'
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public usuario: BehaviorSubject<null | firebase.User> = new BehaviorSubject(null);

  constructor(private auth: AngularFireAuth, private zone: NgZone, private firestore: AngularFirestore, private storage: AngularFireStorage) {
    this.auth.onAuthStateChanged(user => this.zone.run(() => {
      if (user !== null) {
        console.log('encontro usuario');
        this.usuario.next(user);
      } else {
        this.usuario.next(null);
      }
    })
    );
  }


  traerTodos() {
    return this.firestore.collection('baseDeDatos').doc('subcolecciones').collection('usuarios', ref => ref.orderBy('nombre', 'asc')).snapshotChanges();
  }

  registrarUsuario(data) {
    return this.auth.createUserWithEmailAndPassword(data.correo, data.contrasenia).then(userRef => {
        let nombreFoto = "baseDeDatos/usuarios/" + Date.now() + "." + data.dni + ".jpg";
        return this.subirImagen(nombreFoto, data.foto).then(url => {
          data.foto = url;
          return this.crearConId(data, userRef.user.uid);
        });
    }).then(id => {
      this.logout();
      return id;
    });
  }

  public login(email: string, password: string) {
    console.log(email + ' ' + password);
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  public logout() {
    return this.auth.signOut();
  }

  public crearConId(data: any, id: string) {
    return this.firestore.collection('baseDeDatos').doc('subcolecciones').collection('usuarios').doc(id).set(data).then(() => { return id });
  }

  public subirImagen(ruta: string, data: any) {
    return this.storage.ref(ruta).putString(data, 'data_url').then(data => {
      return data.ref.getDownloadURL().then(x => x);
    });
  }

}

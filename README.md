# Coaster Kart — Android (Capacitor)

Game web (Three.js + Rapier) jadi app Android. Landscape terkunci, fullscreen, kontrol sentuh.

## Kontrol sentuh (landscape)
- Kiri bawah: LEFT / RIGHT (steer)
- Kanan bawah: ACCEL / BRAKE
- Tengah bawah: CAM (ganti kamera 1-4), MENU, SOUND
- Multi-touch: steer + gas bersamaan.

## Build APK
Butuh internet saat `npm run build`: model .glb diunduh dari gstatic lalu dibundel ke APK (offline setelah itu).

### Lokal (Node 20+, JDK 21, Android SDK)
```
npm install
npm run build
npm run android:add     # sekali saja
npx cap sync android
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

Atau `npm run android:open` lalu Run di Android Studio.

### Tanpa Android Studio
Push ke GitHub. Tab Actions → "Build Android APK" → Run workflow. Unduh artifact `desk-racer-debug-apk`.

## Web
`npm run dev` tetap jalan. Kontrol sentuh aktif otomatis di perangkat touch landscape.

## Pengaturan (MENU → SETTINGS, di perangkat sentuh)
- QUALITY: LOW (default HP) / MED / HIGH. Berubah = game reload.
- AUTO GAS: gas otomatis, jempol cukup untuk steer + rem.
- VIBRATE: getar saat tabrak, drift, lap.
- TILT: HP sebagai setir (ON / INV kalau arahnya terbalik).
- FPS: overlay FPS, draw call, resolusi. Atau buka dengan `?debug=1`.
- RESTART: tombol di tengah bawah, mulai balapan ulang.

## Catatan performa
- LOW/MED: render langsung ke layar tanpa bokeh/bloom, resolusi adaptif, batas 60 fps.
- Workflow mengecilkan tekstur model ke 1024px dan membuang salinan model ganda.

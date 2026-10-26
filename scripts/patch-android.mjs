// Run once after `cap add android`.
// Locks the activity to landscape, hides system bars (immersive), keeps screen on.
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
const pkg = cfg.appId;
const androidApp = path.resolve('android/app/src/main');

// 1. Manifest: force landscape (both landscape directions, follows sensor)
const manifestPath = path.join(androidApp, 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:screenOrientation')) {
  manifest = manifest.replace(
    /<activity\b/,
    '<activity\n            android:screenOrientation="sensorLandscape"'
  );
  fs.writeFileSync(manifestPath, manifest);
  console.log('Manifest: sensorLandscape set');
}

// 1b. Vibration permission (haptics)
manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android.permission.VIBRATE')) {
  manifest = manifest.replace(
    /<application\b/,
    '<uses-permission android:name="android.permission.VIBRATE" />\n    <application'
  );
  fs.writeFileSync(manifestPath, manifest);
  console.log('Manifest: VIBRATE permission added');
}

// 2. MainActivity: immersive fullscreen, notch support, keep screen on
const javaDir = path.join(androidApp, 'java', ...pkg.split('.'));
const mainPath = path.join(javaDir, 'MainActivity.java');
const java = `package ${pkg};

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      getWindow().getAttributes().layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    }
    hideSystemBars();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) hideSystemBars();
  }

  private void hideSystemBars() {
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    controller.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    controller.hide(WindowInsetsCompat.Type.systemBars());
  }
}
`;
fs.mkdirSync(javaDir, { recursive: true });
fs.writeFileSync(mainPath, java);
console.log('MainActivity.java written');

package com.firesafety.assistant;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

// 뒤로가기는 JS에서 @capacitor/app 의 backButton 리스너로 처리한다(app.js).
// 그래야 Capacitor가 기본 동작(홈에서 액티비티 종료) 대신 우리에게 위임한다.
public class MainActivity extends BridgeActivity {
    private static final long EXIT_WINDOW_MS = 2000L;
    private long lastNativeBackAt = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge == null || bridge.getWebView() == null) {
            installNativeBackFallback();
            return;
        }

        bridge.getWebView().addJavascriptInterface(new AndroidBackBridge(), "AndroidBack");
        installNativeBackFallback();
    }

    private void installNativeBackFallback() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) {
                    handleNativeBackFallback();
                    return;
                }
                bridge.getWebView().evaluateJavascript(
                    "(function(){try{if(typeof window._appHandleBack==='function'){window._appHandleBack();return true;}return false;}catch(e){return false;}})()",
                    handled -> {
                        if (!"true".equals(handled)) handleNativeBackFallback();
                    }
                );
            }
        });
    }

    private void handleNativeBackFallback() {
        long now = System.currentTimeMillis();
        if (now - lastNativeBackAt <= EXIT_WINDOW_MS) {
            finish();
            return;
        }
        lastNativeBackAt = now;
        Toast.makeText(this, "한 번 더 누르면 종료됩니다.", Toast.LENGTH_SHORT).show();
    }

    private class AndroidBackBridge {
        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(MainActivity.this::finish);
        }
    }
}

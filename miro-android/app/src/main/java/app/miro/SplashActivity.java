package app.miro;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Full-screen 2-second splash: rotating chakra rays around a fixed M, then opens MainActivity. */
public class SplashActivity extends Activity {
    static final int SPLASH_MS = 2000;
    static final int FALLBACK_MS = 3500;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean launched = false;
    private final Runnable goMain = this::launchMain;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        WebView w = new WebView(this);
        w.setBackgroundColor(Color.WHITE);
        w.setVerticalScrollBarEnabled(false);
        w.setHorizontalScrollBarEnabled(false);
        w.setOnLongClickListener(v -> true);
        w.getSettings().setAllowFileAccess(true);
        w.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Start the 2s clock once the animation page is actually on screen
                handler.removeCallbacks(goMain);
                handler.postDelayed(goMain, SPLASH_MS);
            }
        });
        setContentView(w, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        w.loadUrl("file:///android_asset/splash.html");
        // Safety net in case the page never finishes loading
        handler.postDelayed(goMain, FALLBACK_MS);
    }

    private void launchMain() {
        if (launched) return;
        launched = true;
        startActivity(new Intent(this, MainActivity.class));
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        finish();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}

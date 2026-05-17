param(
  [string]$InPath = "C:\Users\Kyu\Desktop\claude\supply-fireapp\assets\loading\ilgu_working_animated.original.png",
  [string]$OutPath = "C:\Users\Kyu\Desktop\claude\supply-fireapp\assets\loading\ilgu_working_animated.png",
  [int]$MinBright = 225,
  [int]$MaxSatDiff = 18,
  [int]$BorderWidth = 6,
  [int]$SoftMinBright = 170,
  [int]$SoftMaxSatDiff = 50
)
$cs = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public class BgRm {
  public static void Run(string inP, string outP, int mb, int msd, int bw, int smb, int smsd) {
    using (var src = (Bitmap)Image.FromFile(inP)) {
      int w = src.Width, h = src.Height;
      var rect = new Rectangle(0, 0, w, h);
      var sd = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      int st = sd.Stride;
      byte[] sb = new byte[st * h];
      Marshal.Copy(sd.Scan0, sb, 0, sb.Length);
      src.UnlockBits(sd);

      // bgDist[i]: 0 = hard bg, N = N pixels from bg, 255 = far interior
      byte[] bgDist = new byte[w * h];
      for (int i = 0; i < bgDist.Length; i++) bgDist[i] = 255;

      var q = new Queue<int>();
      Action<int,int> seed = (x, y) => {
        int idx = y * w + x; if (bgDist[idx] == 0) return;
        int si = y * st + x * 3;
        byte b = sb[si], g = sb[si+1], r = sb[si+2];
        int mx = Math.Max(r, Math.Max(g, b)); int mn = Math.Min(r, Math.Min(g, b));
        if (mn >= mb && (mx-mn) <= msd) { bgDist[idx] = 0; q.Enqueue(idx); }
      };
      for (int x = 0; x < w; x++) { seed(x, 0); seed(x, h-1); }
      for (int y = 0; y < h; y++) { seed(0, y); seed(w-1, y); }
      int[] dx = {1,-1,0,0}; int[] dy = {0,0,1,-1};
      while (q.Count > 0) {
        int idx = q.Dequeue(); int x = idx % w, y = idx / w;
        for (int k = 0; k < 4; k++) {
          int nx = x+dx[k], ny = y+dy[k];
          if (nx<0||ny<0||nx>=w||ny>=h) continue;
          int nidx = ny*w+nx; if (bgDist[nidx] == 0) continue;
          int si = ny*st+nx*3;
          byte b = sb[si], g = sb[si+1], r = sb[si+2];
          int mx = Math.Max(r, Math.Max(g, b)); int mn = Math.Min(r, Math.Min(g, b));
          if (mn >= mb && (mx-mn) <= msd) { bgDist[nidx] = 0; q.Enqueue(nidx); }
        }
      }

      // BFS distance from hard bg (only up to bw pixels)
      var dq = new Queue<int>();
      for (int i = 0; i < bgDist.Length; i++) if (bgDist[i] == 0) dq.Enqueue(i);
      while (dq.Count > 0) {
        int idx = dq.Dequeue();
        if (bgDist[idx] >= bw) continue;
        int x = idx % w, y = idx / w;
        byte nd = (byte)(bgDist[idx] + 1);
        for (int k = 0; k < 4; k++) {
          int nx = x+dx[k], ny = y+dy[k];
          if (nx<0||ny<0||nx>=w||ny>=h) continue;
          int nidx = ny*w+nx;
          if (bgDist[nidx] > nd) { bgDist[nidx] = nd; dq.Enqueue(nidx); }
        }
      }

      using (var dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
        var dd = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        int ds = dd.Stride;
        byte[] db = new byte[ds * h];
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
          int idx = y*w+x; int si = y*st+x*3; int di = y*ds+x*4;
          byte b = sb[si], g = sb[si+1], r = sb[si+2];
          byte d = bgDist[idx];
          if (d == 0) {
            // hard bg
            db[di]=0; db[di+1]=0; db[di+2]=0; db[di+3]=0;
          } else if (d <= bw) {
            // border zone: soft alpha by whiteness
            int mx = Math.Max(r, Math.Max(g, b)); int mn = Math.Min(r, Math.Min(g, b));
            if (mn >= smb && (mx-mn) <= smsd) {
              // whitish near bg → fade alpha by distance + whiteness
              double distFactor = (double)d / bw; // 0..1
              double whiteFactor = (double)(mn - smb) / (255 - smb); // 0..1, 0 = char, 1 = white
              whiteFactor = Math.Max(0, Math.Min(1, whiteFactor));
              double alpha = distFactor * (1 - whiteFactor) + (1 - whiteFactor) * 0.5;
              alpha = Math.Max(0, Math.Min(1, alpha));
              int a = (int)(alpha * 255);
              db[di]=b; db[di+1]=g; db[di+2]=r; db[di+3]=(byte)a;
            } else {
              db[di]=b; db[di+1]=g; db[di+2]=r; db[di+3]=255;
            }
          } else {
            db[di]=b; db[di+1]=g; db[di+2]=r; db[di+3]=255;
          }
        }
        Marshal.Copy(db, 0, dd.Scan0, db.Length);
        dst.UnlockBits(dd);
        dst.Save(outP, ImageFormat.Png);
      }
    }
  }
}
"@
Add-Type -TypeDefinition $cs -ReferencedAssemblies System.Drawing
[BgRm]::Run($InPath, $OutPath, $MinBright, $MaxSatDiff, $BorderWidth, $SoftMinBright, $SoftMaxSatDiff)
"Done: border=$BorderWidth, soft=$SoftMinBright/$SoftMaxSatDiff"
